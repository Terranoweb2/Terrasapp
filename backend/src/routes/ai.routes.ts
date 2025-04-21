import express from 'express';
import {
  chatWithAI,
  transcribeAudioFile,
  moderateUserContent,
  translateUserText,
  summarizeUserConversation,
  generateSuggestions
} from '../controllers/ai.controller';
import { protect, isVerified } from '../middleware/auth.middleware';
import multer from 'multer';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Chat with AI assistant
router.post('/chat', chatWithAI);

// Transcribe audio file
// In a real implementation, this would use multer middleware
router.post('/transcribe', transcribeAudioFile);

// Moderate content
router.post('/moderate', moderateUserContent);

// Translate text
router.post('/translate', translateUserText);

// Summarize conversation
router.get('/summarize/:conversationId', summarizeUserConversation);

// Generate response suggestions
router.get('/suggest/:conversationId', generateSuggestions);

export default router;
