import express from 'express';
import {
  getUserById,
  searchUsers,
  getContacts,
  addContact,
  removeContact,
  updateAvatar,
  updateStatus
} from '../controllers/user.controller';
import { protect, isVerified } from '../middleware/auth.middleware';
import { avatarUpload } from '../services/upload.service';

const router = express.Router();

// Mode développement - Authentification contournée
// router.use(protect);

// Get user by ID
router.get('/:userId', getUserById);

// Search users
router.get('/search', searchUsers);

// Get user contacts
router.get('/contacts', getContacts);

// Add user to contacts
router.post('/contacts', addContact);

// Remove user from contacts
router.delete('/contacts/:userId', removeContact);

// Update user avatar (with file upload)
router.put('/avatar', updateAvatar);

// Update user status
router.put('/status', updateStatus);

export default router;
