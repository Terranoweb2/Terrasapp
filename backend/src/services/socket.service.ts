import { Server as SocketIOServer, Socket } from 'socket.io';
import User from '../models/user.model';
import Message from '../models/message.model';
import Conversation from '../models/conversation.model';
import jwt from 'jsonwebtoken';

// Map to store online users and their socket IDs
const onlineUsers = new Map<string, string>();
// Map to store active calls
const activeCalls = new Map<string, string[]>();

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Middleware to authenticate users via token
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };

      // Verify user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user ID to socket
      socket.userId = decoded.id;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);
    
    if (socket.userId) {
      // Store user in online users map
      onlineUsers.set(socket.userId, socket.id);
      
      // Update user status in database
      await User.findByIdAndUpdate(socket.userId, {
        status: 'online',
        lastSeen: new Date()
      });
      
      // Notify user's contacts about status change
      const user = await User.findById(socket.userId);
      if (user && user.contacts.length > 0) {
        for (const contactId of user.contacts) {
          const contactSocketId = onlineUsers.get(contactId.toString());
          if (contactSocketId) {
            io.to(contactSocketId).emit('user:status', {
              userId: socket.userId,
              status: 'online'
            });
          }
        }
      }
    }

    // MESSAGING HANDLERS
    
    // Handle new message
    socket.on('message:send', async (data) => {
      try {
        const { recipientId, content, contentType, fileUrl, fileName, fileSize, conversationId } = data;
        
        // Validate required fields
        if (!recipientId || !content) {
          socket.emit('error', { message: 'Recipient and content are required' });
          return;
        }
        
        // Get or create conversation
        let conversation;
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            socket.emit('error', { message: 'Conversation not found' });
            return;
          }
        } else {
          // Check if conversation already exists
          conversation = await Conversation.findOne({
            participants: { $all: [socket.userId, recipientId] },
            isGroup: false
          });
          
          if (!conversation) {
            // Create new conversation
            conversation = await Conversation.create({
              participants: [socket.userId, recipientId],
              isGroup: false,
              unreadCount: new Map([[recipientId, 1]])
            });
          } else {
            // Update unread count for recipient
            const currentCount = conversation.unreadCount.get(recipientId) || 0;
            conversation.unreadCount.set(recipientId, currentCount + 1);
            await conversation.save();
          }
        }
        
        // Create new message
        const newMessage = await Message.create({
          sender: socket.userId,
          recipient: recipientId,
          conversation: conversation._id,
          content,
          contentType: contentType || 'text',
          fileUrl,
          fileName,
          fileSize
        });
        
        // Update last message in conversation
        conversation.lastMessage = newMessage._id;
        await conversation.save();
        
        // Populate message with sender info
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'name avatar')
          .populate('recipient', 'name avatar');
        
        // Send message to recipient if online
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message:receive', populatedMessage);
        }
        
        // Confirm message sent to sender
        socket.emit('message:sent', populatedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });
    
    // Mark messages as read
    socket.on('message:read', async (data) => {
      try {
        const { conversationId } = data;
        
        // Update unread count for user in conversation
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.unreadCount.set(socket.userId as string, 0);
          await conversation.save();
          
          // Update read status for messages
          await Message.updateMany(
            {
              conversation: conversationId,
              recipient: socket.userId,
              readAt: { $exists: false }
            },
            {
              readAt: new Date()
            }
          );
          
          // Notify sender that messages were read
          const participants = conversation.participants;
          const otherParticipant = participants.find(
            p => p.toString() !== socket.userId
          );
          
          if (otherParticipant) {
            const otherParticipantSocketId = onlineUsers.get(otherParticipant.toString());
            if (otherParticipantSocketId) {
              io.to(otherParticipantSocketId).emit('message:read', {
                conversationId,
                readBy: socket.userId
              });
            }
          }
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // CALL HANDLERS
    
    // Initiate a call
    socket.on('call:initiate', async (data) => {
      try {
        const { recipientId, callType } = data;
        
        // Check if recipient is online
        const recipientSocketId = onlineUsers.get(recipientId);
        if (!recipientSocketId) {
          socket.emit('call:error', { message: 'User is offline' });
          return;
        }
        
        // Check if recipient is already in a call
        let recipientInCall = false;
        activeCalls.forEach((participants) => {
          if (participants.includes(recipientId)) {
            recipientInCall = true;
          }
        });
        
        if (recipientInCall) {
          socket.emit('call:error', { message: 'User is already in a call' });
          return;
        }
        
        // Store call in active calls
        const callId = `${socket.userId}-${recipientId}-${Date.now()}`;
        activeCalls.set(callId, [socket.userId as string, recipientId]);
        
        // Update user statuses
        await User.findByIdAndUpdate(socket.userId, { status: 'in-call' });
        
        // Send call request to recipient
        io.to(recipientSocketId).emit('call:incoming', {
          callId,
          callerId: socket.userId,
          callerName: (await User.findById(socket.userId))?.name,
          callType
        });
        
        // Confirm call initiated to caller
        socket.emit('call:outgoing', {
          callId,
          recipientId
        });
      } catch (error) {
        console.error('Error initiating call:', error);
        socket.emit('call:error', { message: 'Error initiating call' });
      }
    });
    
    // Accept a call
    socket.on('call:accept', async (data) => {
      try {
        const { callId } = data;
        
        const callParticipants = activeCalls.get(callId);
        if (!callParticipants) {
          socket.emit('call:error', { message: 'Call not found' });
          return;
        }
        
        // Get the other participant
        const otherParticipantId = callParticipants.find(
          id => id !== socket.userId
        );
        
        if (!otherParticipantId) {
          socket.emit('call:error', { message: 'Call participant not found' });
          return;
        }
        
        // Update recipient status
        await User.findByIdAndUpdate(socket.userId, { status: 'in-call' });
        
        // Notify caller that call was accepted
        const callerSocketId = onlineUsers.get(otherParticipantId);
        if (callerSocketId) {
          io.to(callerSocketId).emit('call:accepted', {
            callId,
            recipientId: socket.userId
          });
        }
      } catch (error) {
        console.error('Error accepting call:', error);
        socket.emit('call:error', { message: 'Error accepting call' });
      }
    });
    
    // Reject a call
    socket.on('call:reject', async (data) => {
      try {
        const { callId } = data;
        
        const callParticipants = activeCalls.get(callId);
        if (!callParticipants) {
          socket.emit('call:error', { message: 'Call not found' });
          return;
        }
        
        // Get the other participant
        const otherParticipantId = callParticipants.find(
          id => id !== socket.userId
        );
        
        if (!otherParticipantId) {
          socket.emit('call:error', { message: 'Call participant not found' });
          return;
        }
        
        // Remove call from active calls
        activeCalls.delete(callId);
        
        // Notify caller that call was rejected
        const callerSocketId = onlineUsers.get(otherParticipantId);
        if (callerSocketId) {
          io.to(callerSocketId).emit('call:rejected', {
            callId,
            recipientId: socket.userId
          });
        }
        
        // Update user statuses
        await User.findByIdAndUpdate(otherParticipantId, { status: 'online' });
      } catch (error) {
        console.error('Error rejecting call:', error);
        socket.emit('call:error', { message: 'Error rejecting call' });
      }
    });
    
    // End a call
    socket.on('call:end', async (data) => {
      try {
        const { callId } = data;
        
        const callParticipants = activeCalls.get(callId);
        if (!callParticipants) {
          socket.emit('call:error', { message: 'Call not found' });
          return;
        }
        
        // Remove call from active calls
        activeCalls.delete(callId);
        
        // Notify all participants that call has ended
        for (const participantId of callParticipants) {
          // Skip the current user (who ended the call)
          if (participantId === socket.userId) continue;
          
          const participantSocketId = onlineUsers.get(participantId);
          if (participantSocketId) {
            io.to(participantSocketId).emit('call:ended', {
              callId,
              endedBy: socket.userId
            });
          }
          
          // Update user status
          await User.findByIdAndUpdate(participantId, { status: 'online' });
        }
        
        // Update current user's status
        await User.findByIdAndUpdate(socket.userId, { status: 'online' });
      } catch (error) {
        console.error('Error ending call:', error);
        socket.emit('call:error', { message: 'Error ending call' });
      }
    });
    
    // WebRTC signaling events
    socket.on('webrtc:offer', (data) => {
      const { recipientId, offer } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('webrtc:offer', {
          callerId: socket.userId,
          offer
        });
      }
    });
    
    socket.on('webrtc:answer', (data) => {
      const { callerId, answer } = data;
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('webrtc:answer', {
          recipientId: socket.userId,
          answer
        });
      }
    });
    
    socket.on('webrtc:ice-candidate', (data) => {
      const { recipientId, candidate } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('webrtc:ice-candidate', {
          senderId: socket.userId,
          candidate
        });
      }
    });

    // TYPING INDICATORS
    
    socket.on('typing:start', (data) => {
      const { conversationId, recipientId } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing:start', {
          conversationId,
          userId: socket.userId
        });
      }
    });
    
    socket.on('typing:stop', (data) => {
      const { conversationId, recipientId } = data;
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing:stop', {
          conversationId,
          userId: socket.userId
        });
      }
    });
    
    // USER STATUS UPDATES
    
    socket.on('user:update-status', async (data) => {
      try {
        const { status } = data;
        
        // Update user status in database
        await User.findByIdAndUpdate(socket.userId, {
          status,
          lastSeen: new Date()
        });
        
        // Notify user's contacts about status change
        const user = await User.findById(socket.userId);
        if (user && user.contacts.length > 0) {
          for (const contactId of user.contacts) {
            const contactSocketId = onlineUsers.get(contactId.toString());
            if (contactSocketId) {
              io.to(contactSocketId).emit('user:status', {
                userId: socket.userId,
                status
              });
            }
          }
        }
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      if (socket.userId) {
        // Remove user from online users map
        onlineUsers.delete(socket.userId);
        
        // Update user status in database
        await User.findByIdAndUpdate(socket.userId, {
          status: 'offline',
          lastSeen: new Date()
        });
        
        // End any active calls
        activeCalls.forEach((participants, callId) => {
          if (participants.includes(socket.userId)) {
            // Remove call from active calls
            activeCalls.delete(callId);
            
            // Notify other participant that call has ended
            const otherParticipantId = participants.find(
              id => id !== socket.userId
            );
            
            if (otherParticipantId) {
              const otherParticipantSocketId = onlineUsers.get(otherParticipantId);
              if (otherParticipantSocketId) {
                io.to(otherParticipantSocketId).emit('call:ended', {
                  callId,
                  endedBy: socket.userId,
                  reason: 'disconnected'
                });
              }
              
              // Update other participant's status
              User.findByIdAndUpdate(otherParticipantId, { status: 'online' }).catch(
                err => console.error('Error updating user status:', err)
              );
            }
          }
        });
        
        // Notify user's contacts about status change
        const user = await User.findById(socket.userId);
        if (user && user.contacts.length > 0) {
          for (const contactId of user.contacts) {
            const contactSocketId = onlineUsers.get(contactId.toString());
            if (contactSocketId) {
              io.to(contactSocketId).emit('user:status', {
                userId: socket.userId,
                status: 'offline'
              });
            }
          }
        }
      }
    });
  });
};
