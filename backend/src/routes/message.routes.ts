import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  transcribeMessage,
  createOrUpdateGroup
} from '../controllers/message.controller';
import { protect, isVerified } from '../middleware/auth.middleware';

const router = express.Router();

// Mode développement - Authentification contournée
// router.use(protect);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get messages in a conversation
router.get('/conversations/:conversationId', getMessages);

// Send a new message
router.post('/send', sendMessage);

// Delete a message
router.delete('/:messageId', deleteMessage);

// Transcribe an audio message
router.get('/transcribe/:messageId', transcribeMessage);

// Create or update a group conversation
router.post('/group', createOrUpdateGroup);

export default router;
