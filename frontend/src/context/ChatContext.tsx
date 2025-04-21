import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { messageService } from '../services/api';
import { useAuth } from './AuthContext';
import { io, Socket } from 'socket.io-client';

// Types
interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  contentType: 'text' | 'audio' | 'image' | 'video' | 'document' | 'location';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileThumbnail?: string;
  readAt?: Date;
  createdAt: Date;
  conversation: string;
  replyTo?: Message;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away' | 'busy' | 'in-call';
    lastSeen: Date;
  }>;
  lastMessage?: {
    _id: string;
    content: string;
    contentType: string;
    createdAt: Date;
    readAt?: Date;
  };
  unreadCount: Map<string, number>;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmin?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, contentType?: string, fileUrl?: string, fileName?: string, fileSize?: number) => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  startConversation: (recipientId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  createGroup: (groupName: string, participants: string[]) => Promise<void>;
  typingUsers: Map<string, string>;
  socket: Socket | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  // Initialize socket
  useEffect(() => {
    if (isAuthenticated && token) {
      const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      const newSocket = io(SOCKET_URL, {
        auth: { token },
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Handle incoming messages
    socket.on('message:receive', (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      
      // Update conversations if the message belongs to the current conversation
      if (currentConversation && newMessage.conversation === currentConversation._id) {
        // Mark message as read
        socket.emit('message:read', { conversationId: currentConversation._id });
      }
      
      // Update conversation list
      updateConversationWithNewMessage(newMessage);
    });

    // Handle message read status
    socket.on('message:read', ({ conversationId, readBy }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.conversation === conversationId && !msg.readAt ? { ...msg, readAt: new Date() } : msg
        )
      );
    });

    // Handle typing indicators
    socket.on('typing:start', ({ conversationId, userId }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, conversationId);
        return newMap;
      });
    });

    socket.on('typing:stop', ({ conversationId, userId }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        if (newMap.get(userId) === conversationId) {
          newMap.delete(userId);
        }
        return newMap;
      });
    });

    // Handle user status changes
    socket.on('user:status', ({ userId, status }) => {
      // Update user status in conversations
      setConversations((prevConversations) =>
        prevConversations.map((conv) => {
          const updatedParticipants = conv.participants.map((p) =>
            p._id === userId ? { ...p, status } : p
          );
          return { ...conv, participants: updatedParticipants };
        })
      );
    });

    return () => {
      socket.off('message:receive');
      socket.off('message:read');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('user:status');
    };
  }, [socket, currentConversation]);

  // Load conversations
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  const loadConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { conversations } = await messageService.getConversations();
      setConversations(conversations);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Select a conversation
  const selectConversation = async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);
    
    try {
      // Find the conversation in the list
      const conversation = conversations.find((c) => c._id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
      }

      // Load messages
      const { messages: loadedMessages, pagination } = await messageService.getMessages(conversationId, 1, 20);
      setMessages(loadedMessages || []);
      setHasMore(pagination.page < pagination.totalPages);

      // Mark messages as read
      if (socket) {
        socket.emit('message:read', { conversationId });
      }

      // Update unread count in conversation list
      setConversations((prevConversations) =>
        prevConversations.map((conv) => {
          if (conv._id === conversationId) {
            const unreadCount = new Map(conv.unreadCount);
            if (user) {
              unreadCount.set(user.id, 0);
            }
            return { ...conv, unreadCount };
          }
          return conv;
        })
      );

    } catch (err) {
      console.error('Error selecting conversation:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new conversation
  const startConversation = async (recipientId: string) => {
    // Check if conversation already exists
    const existingConversation = conversations.find((c) => 
      !c.isGroup && c.participants.some((p) => p._id === recipientId)
    );

    if (existingConversation) {
      await selectConversation(existingConversation._id);
      return;
    }

    // Create a new conversation by sending the first message
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, just create an empty state - the actual conversation
      // will be created on the server when the first message is sent
      setCurrentConversation({
        _id: 'temp',
        participants: [], // This will be populated after the first message
        unreadCount: new Map(),
        isGroup: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      setMessages([]);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (
    content: string,
    contentType: string = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number
  ) => {
    if (!content && contentType === 'text') {
      return;
    }

    try {
      let conversationId = currentConversation?._id;
      let recipientId: string;

      if (conversationId === 'temp' || !conversationId) {
        // New conversation
        if (!currentConversation || currentConversation.participants.length === 0) {
          throw new Error('No recipient selected');
        }
        recipientId = currentConversation.participants[0]._id;
        conversationId = undefined;
      } else if (currentConversation) {
        // Existing conversation
        recipientId = currentConversation.participants.find((p) => p._id !== user?.id)?._id || '';
      } else {
        throw new Error('No conversation selected');
      }

      // Optimistic update - add message to UI immediately
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        _id: tempId,
        sender: {
          _id: user?.id || '',
          name: user?.name || '',
          avatar: user?.avatar,
        },
        content,
        contentType: contentType as any,
        fileUrl,
        fileName,
        fileSize,
        createdAt: new Date(),
        conversation: conversationId || 'temp',
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Send message through socket
      if (socket) {
        socket.emit('message:send', {
          recipientId,
          content,
          contentType,
          fileUrl,
          fileName,
          fileSize,
          conversationId,
        });
      } else {
        // Fallback to REST API if socket isn't connected
        const { message, conversation } = await messageService.sendMessage({
          recipientId,
          content,
          contentType,
          fileUrl,
          fileName,
          fileSize,
          conversationId,
        });

        // If this was a new conversation, update the conversation ID
        if (conversationId === 'temp' || !conversationId) {
          setCurrentConversation((prev) => 
            prev ? { ...prev, _id: conversation.id } : null
          );
          
          // Update messages with correct conversation ID
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === tempId
                ? { ...msg, _id: message._id, conversation: conversation.id }
                : msg.conversation === 'temp'
                ? { ...msg, conversation: conversation.id }
                : msg
            )
          );
          
          // Load the full conversation data
          loadConversations();
        } else {
          // Update the temporary message with the real one
          setMessages((prev) =>
            prev.map((msg) => (msg._id === tempId ? message : msg))
          );
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message
      setMessages((prev) => prev.filter((msg) => !msg._id.startsWith('temp-')));
      setError('Failed to send message');
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!currentConversation || !hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const { messages: olderMessages, pagination } = await messageService.getMessages(
        currentConversation._id,
        nextPage,
        20
      );

      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev]);
        setPage(nextPage);
        setHasMore(pagination.page < pagination.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
      setError('Failed to load more messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
      
      // Update messages list
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      
      // Update last message in conversation if needed
      if (currentConversation && currentConversation.lastMessage?._id === messageId) {
        // Get the new last message
        const newLastMessage = messages
          .filter((msg) => msg._id !== messageId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        setCurrentConversation((prev) => 
          prev ? { ...prev, lastMessage: newLastMessage } : null
        );
        
        // Update in conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === currentConversation._id
              ? { ...conv, lastMessage: newLastMessage }
              : conv
          )
        );
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  // Create a group conversation
  const createGroup = async (groupName: string, participants: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const { group } = await messageService.createOrUpdateGroup({
        groupName,
        participants,
      });
      
      // Add to conversations and select it
      setConversations((prev) => [group, ...prev]);
      setCurrentConversation(group);
      setMessages([]);
      
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to update conversations with a new message
  const updateConversationWithNewMessage = (newMessage: Message) => {
    setConversations((prevConversations) => {
      const conversationIndex = prevConversations.findIndex(
        (c) => c._id === newMessage.conversation
      );
      
      if (conversationIndex === -1) {
        // This is a message from a new conversation, reload conversations
        loadConversations();
        return prevConversations;
      }
      
      const updatedConversations = [...prevConversations];
      const conversation = { ...updatedConversations[conversationIndex] };
      
      // Update last message
      conversation.lastMessage = {
        _id: newMessage._id,
        content: newMessage.content,
        contentType: newMessage.contentType,
        createdAt: new Date(newMessage.createdAt),
      };
      
      // Update unread count if not current conversation
      if (
        !currentConversation || 
        currentConversation._id !== newMessage.conversation
      ) {
        const unreadCount = new Map(conversation.unreadCount);
        const currentCount = unreadCount.get(user?.id || '') || 0;
        unreadCount.set(user?.id || '', currentCount + 1);
        conversation.unreadCount = unreadCount;
      }
      
      // Remove from current position
      updatedConversations.splice(conversationIndex, 1);
      // Add to front of array (most recent)
      updatedConversations.unshift(conversation);
      
      return updatedConversations;
    });
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    sendMessage,
    selectConversation,
    startConversation,
    loadMoreMessages,
    deleteMessage,
    createGroup,
    typingUsers,
    socket,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
