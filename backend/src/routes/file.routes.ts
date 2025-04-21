import express, { Request, Response, NextFunction } from 'express';
import {
  uploadFile,
  getFiles,
  deleteUserFile
} from '../controllers/file.controller';
import { protect, isVerified } from '../middleware/auth.middleware';
import { imageUpload, audioUpload, videoUpload, documentUpload } from '../services/upload.service';

const router = express.Router();

// All routes require authentication
router.use(protect as express.RequestHandler);

// Get files for a user or conversation
router.get('/', getFiles as express.RequestHandler);

// Upload file routes with proper multer configurations

// Upload image - imageUpload.single('file') middleware will process the file
// before passing to the controller
router.post('/upload/image', 
  imageUpload.single('file'), 
  uploadFile as express.RequestHandler
);

// Upload audio
router.post('/upload/audio', 
  audioUpload.single('file'), 
  uploadFile as express.RequestHandler
);

// Upload video
router.post('/upload/video', 
  videoUpload.single('file'), 
  uploadFile as express.RequestHandler
);

// Upload document
router.post('/upload/document', 
  documentUpload.single('file'), 
  uploadFile as express.RequestHandler
);

// Delete a file
router.delete('/:fileId', deleteUserFile as express.RequestHandler);

export default router;
