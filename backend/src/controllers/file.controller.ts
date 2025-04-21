import { Request, Response } from 'express';
import File from '../models/file.model';
import { imageUpload, audioUpload, videoUpload, documentUpload, deleteFile } from '../services/upload.service';
import { moderateContent, moderateImageContent } from '../services/ai.service';
import path from 'path';

// Upload a file
export const uploadFile = async (req: Request, res: Response) => {
  try {
    // File should now be processed by multer middleware
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const { conversationId } = req.body;
    
    // Extract file information from multer
    // With Cloudinary storage, file object will have cloudinary path and URL
    const file = req.file as Express.Multer.File & { 
      path?: string; 
      filename?: string;
      // Fields added by multer-storage-cloudinary
      cloudinaryPath?: string;
      publicUrl?: string;
      secure_url?: string;
    };
    
    // For Cloudinary, get the secure URL from the response
    // With multer-storage-cloudinary, public URL is stored in field like secure_url
    const publicUrl = file.secure_url || file.publicUrl || file.path || '';
    const cloudinaryPath = file.cloudinaryPath || publicUrl.split('/').slice(-2).join('/');
    
    // Check file type and moderate content if needed
    const mimeType = file.mimetype || '';
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // For images, use AI to check for inappropriate content
    if (mimeType.startsWith('image/')) {
      try {
        // Only proceed with moderation if we have a public URL
        if (publicUrl) {
          console.log(`Moderating image: ${publicUrl}`);
          const moderationResult = await moderateImageContent(publicUrl);
          
          if (!moderationResult.safe) {
            // If we detect unsafe content, delete the file from storage
            try {
              const resourceType = getResourceType(mimeType);
              await deleteFile(cloudinaryPath, resourceType);
            } catch (deleteError) {
              console.error('Error deleting unsafe image:', deleteError);
            }
            
            return res.status(400).json({
              success: false,
              message: 'Image violates community guidelines',
              details: moderationResult.reason || 'Inappropriate content detected'
            });
          }
        }
      } catch (moderationError) {
        console.error('Image moderation error:', moderationError);
        // Log the error but continue, as blocking content incorrectly is worse than letting it through
      }
    }
    
    // Create file record in database
    const newFile = await File.create({
      originalName: file.originalname,
      storagePath: cloudinaryPath,
      publicUrl,
      mimeType,
      size: file.size,
      uploadedBy: req.user.id,
      conversation: conversationId,
    });

    res.status(201).json({
      success: true,
      file: {
        id: newFile._id,
        originalName: newFile.originalName,
        publicUrl: newFile.publicUrl,
        mimeType: newFile.mimeType,
        size: newFile.size,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
    });
  }
};

// Get files for a user or conversation
export const getFiles = async (req: Request, res: Response) => {
  try {
    const { conversationId, type } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {
      isDeleted: false,
    };

    // Filter by conversation if provided
    if (conversationId) {
      query.conversation = conversationId;
    } else {
      // If no conversation ID, get files uploaded by the user
      query.uploadedBy = req.user.id;
    }

    // Filter by file type if provided
    if (type) {
      switch (type) {
        case 'image':
          query.mimeType = { $regex: /^image\// };
          break;
        case 'audio':
          query.mimeType = { $regex: /^audio\// };
          break;
        case 'video':
          query.mimeType = { $regex: /^video\// };
          break;
        case 'document':
          query.mimeType = { 
            $in: [
              'application/pdf', 
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-powerpoint',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'text/plain'
            ] 
          };
          break;
      }
    }

    // Get files
    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalFiles = await File.countDocuments(query);

    res.status(200).json({
      success: true,
      files,
      pagination: {
        page,
        limit,
        totalFiles,
        totalPages: Math.ceil(totalFiles / limit),
      },
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching files',
    });
  }
};

// Delete a file
export const deleteUserFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    // Find file
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Check if user owns the file
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this file',
      });
    }

    // Mark file as deleted in database
    file.isDeleted = true;
    file.deletedAt = new Date();
    await file.save();

    // In a real implementation, you might want to actually delete from storage
    // Example with Cloudinary:
    // try {
    //   // Extract public ID from URL or path
    //   const publicId = file.storagePath;
    //   await deleteFile(publicId, getResourceType(file.mimeType));
    // } catch (error) {
    //   console.error('Error deleting file from storage:', error);
    //   // Still mark as deleted in database even if storage deletion fails
    // }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
    });
  }
};

// Helper to determine Cloudinary resource type based on MIME type
const getResourceType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
    return 'video'; // Cloudinary uses 'video' for both video and audio
  } else {
    return 'raw';
  }
};
