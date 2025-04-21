import { Request, Response } from 'express';
import {
  chatWithAssistant,
  transcribeAudio,
  moderateContent,
  translateText,
  summarizeConversation,
  generateResponseSuggestions
} from '../services/ai.service';
import Message from '../models/message.model';
import Conversation from '../models/conversation.model';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);

// Chat with AI assistant
export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required',
      });
    }

    // Format messages for OpenAI
    const formattedMessages = messages.map(msg => ({
      role: msg.role || 'user',
      content: msg.content,
    }));

    // Chat with assistant
    const response = await chatWithAssistant(formattedMessages, systemPrompt);

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error communicating with AI assistant',
    });
  }
};

// Transcribe audio file
export const transcribeAudioFile = async (req: Request, res: Response) => {
  try {
    // This would be handled by multer middleware in a real implementation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided',
      });
    }

    // Get file information
    const file = req.file as Express.Multer.File;
    const fileExtension = path.extname(file.originalname).slice(1);
    
    // Read file buffer (in a real implementation)
    // const fileBuffer = await readFileAsync(file.path);
    
    // For this example, we'll mock the transcription
    // const transcription = await transcribeAudio(fileBuffer, fileExtension);
    const transcription = "This is a mock transcription. In a real app, this would be the output from the Whisper API.";

    res.status(200).json({
      success: true,
      transcription,
    });
  } catch (error) {
    console.error('Audio transcription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error transcribing audio',
    });
  }
};

// Moderate content
export const moderateUserContent = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    // Moderate content
    const result = await moderateContent(content);

    res.status(200).json({
      success: true,
      moderation: result,
    });
  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating content',
    });
  }
};

// Translate text
export const translateUserText = async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Text and target language are required',
      });
    }

    // Translate text
    const translation = await translateText(text, targetLanguage);

    res.status(200).json({
      success: true,
      translation,
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error translating text',
    });
  }
};

// Summarize conversation
export const summarizeUserConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

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

    // Get messages from conversation
    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: req.user.id },
    })
      .populate('sender', 'name')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages for better summaries

    if (messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No messages found to summarize',
      });
    }

    // Format messages for summarization
    const formattedMessages = messages.map(msg => ({
      sender: msg.sender.name,
      content: msg.content,
    }));

    // Get summary
    const summary = await summarizeConversation(formattedMessages);

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Conversation summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error summarizing conversation',
    });
  }
};

// Generate response suggestions
export const generateSuggestions = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

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

    // Get recent messages from conversation
    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: req.user.id },
    })
      .sort({ createdAt: -1 })
      .limit(10) // Get the 10 most recent messages
      .populate('sender', 'name');

    if (messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No messages found to generate suggestions',
      });
    }

    // Format messages for suggestion generation
    const messageHistory = messages
      .reverse() // Put in chronological order
      .map(msg => `${msg.sender.name}: ${msg.content}`);

    // Generate suggestions
    const suggestions = await generateResponseSuggestions(messageHistory);

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Response suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating response suggestions',
    });
  }
};
