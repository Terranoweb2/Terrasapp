import { Request, Response } from 'express';
import Message from '../models/message.model';
import Conversation from '../models/conversation.model';
import User from '../models/user.model';
import { moderateContent, transcribeAudio } from '../services/ai.service';

// Get conversations for current user
export const getConversations = async (req: Request, res: Response) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true,
    })
      .populate('participants', 'name avatar status lastSeen')
      .populate({
        path: 'lastMessage',
        select: 'content contentType createdAt readAt',
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
    });
  }
};

// Get messages in a conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate that the user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not part of this conversation',
      });
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get messages
    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: req.user.id },
    })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: req.user.id },
    });

    // Mark as read
    await Message.updateMany(
      {
        conversation: conversationId,
        recipient: req.user.id,
        readAt: { $exists: false },
      },
      {
        readAt: new Date(),
      }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(req.user.id.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Return in ascending order (oldest first)
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limitNum),
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
    });
  }
};

// Send a new message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { recipientId, content, contentType = 'text', conversationId } = req.body;

    // Validate required fields
    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and content are required',
      });
    }

    // Moderate text content
    if (contentType === 'text') {
      try {
        const moderationResult = await moderateContent(content);
        if (moderationResult.flagged) {
          return res.status(400).json({
            success: false,
            message: 'Message contains inappropriate content',
            categories: moderationResult.categories,
          });
        }
      } catch (error) {
        console.error('Content moderation failed:', error);
        // Continue sending message even if moderation fails
      }
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      // Verify user is part of conversation
      if (!conversation.participants.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: 'You are not part of this conversation',
        });
      }
    } else {
      // Check if conversation already exists
      conversation = await Conversation.findOne({
        participants: { $all: [req.user.id, recipientId] },
        isGroup: false,
      });

      if (!conversation) {
        // Create new conversation
        conversation = await Conversation.create({
          participants: [req.user.id, recipientId],
          isGroup: false,
          unreadCount: new Map([[recipientId, 1]]),
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
      sender: req.user.id,
      recipient: recipientId,
      conversation: conversation._id,
      content,
      contentType,
    });

    // Update last message in conversation
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // Populate message with sender info
    const populatedMessage = await Message.findById(newMessage._id).populate(
      'sender',
      'name avatar'
    );

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversation: {
        id: conversation._id,
        isNew: !conversationId,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
    });
  }
};

// Delete a message (mark as deleted)
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is the sender of the message
    if (message.sender.toString() !== req.user.id) {
      // If not sender, just mark as deleted for this user
      message.deletedFor.push(req.user.id);
    } else {
      // If sender, mark as deleted for everyone
      message.isDeleted = true;
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
    });
  }
};

// Transcribe audio message
export const transcribeMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if message is audio type
    if (message.contentType !== 'audio') {
      return res.status(400).json({
        success: false,
        message: 'Message is not an audio message',
      });
    }

    // Check if user has access to this message
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation?.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this message',
      });
    }

    // Get audio file from URL (would need to fetch the file or have the buffer)
    // For this example, we'll assume we have the audio buffer
    // In a real implementation, you would download from message.fileUrl
    
    // Mock transcription for demo purposes
    const transcriptionText = "This is a mock transcription. In production, this would come from the Whisper API.";
    
    res.status(200).json({
      success: true,
      transcription: transcriptionText,
    });
  } catch (error) {
    console.error('Transcribe message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error transcribing message',
    });
  }
};

// Create or update a group conversation
export const createOrUpdateGroup = async (req: Request, res: Response) => {
  try {
    const { groupName, participants, groupId, groupAvatar } = req.body;

    if (!groupName || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: 'Group name and participants array are required',
      });
    }

    // Moderate group name
    try {
      const moderationResult = await moderateContent(groupName);
      if (moderationResult.flagged) {
        return res.status(400).json({
          success: false,
          message: 'Group name contains inappropriate content',
        });
      }
    } catch (error) {
      console.error('Content moderation failed:', error);
    }

    // Make sure all participants exist
    const allParticipantIds = [...participants, req.user.id];
    const uniqueParticipantIds = [...new Set(allParticipantIds)]; // Remove duplicates
    
    const existingUsers = await User.find({ _id: { $in: uniqueParticipantIds } });
    if (existingUsers.length !== uniqueParticipantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more participants do not exist',
      });
    }

    let group;
    if (groupId) {
      // Update existing group
      group = await Conversation.findById(groupId);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }
      
      // Check if user is admin or participant
      if (
        group.groupAdmin?.toString() !== req.user.id &&
        !group.participants.includes(req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this group',
        });
      }
      
      // Update group details
      group.groupName = groupName;
      if (groupAvatar) group.groupAvatar = groupAvatar;
      
      // Only admin can modify participants
      if (group.groupAdmin?.toString() === req.user.id) {
        group.participants = uniqueParticipantIds;
      }
      
      await group.save();
    } else {
      // Create new group
      group = await Conversation.create({
        participants: uniqueParticipantIds,
        isGroup: true,
        groupName,
        groupAvatar,
        groupAdmin: req.user.id,
      });
    }

    // Populate participants info
    const populatedGroup = await Conversation.findById(group._id).populate(
      'participants',
      'name avatar status'
    );

    res.status(200).json({
      success: true,
      group: populatedGroup,
    });
  } catch (error) {
    console.error('Create/update group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating or updating group',
    });
  }
};
