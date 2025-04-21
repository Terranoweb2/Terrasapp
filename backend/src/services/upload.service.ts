import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define allowed file types and their folder destinations
const fileTypes = {
  image: {
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    folder: 'terrasapp/images',
    resourceType: 'image',
  },
  audio: {
    allowedFormats: ['mp3', 'wav', 'ogg', 'm4a'],
    folder: 'terrasapp/audio',
    resourceType: 'video', // Cloudinary uses 'video' resource type for audio
  },
  video: {
    allowedFormats: ['mp4', 'webm', 'mov'],
    folder: 'terrasapp/videos',
    resourceType: 'video',
  },
  document: {
    allowedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    folder: 'terrasapp/documents',
    resourceType: 'raw',
  },
  avatar: {
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    folder: 'terrasapp/avatars',
    resourceType: 'image',
  },
};

// Function to create storage engines for different file types
const createStorage = (type: keyof typeof fileTypes) => {
  const { folder, resourceType } = fileTypes[type];
  
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      resource_type: resourceType,
      allowed_formats: fileTypes[type].allowedFormats,
      // Add transformation for images
      ...(type === 'image' && {
        transformation: [{ width: 1200, crop: 'limit' }],
      }),
      ...(type === 'avatar' && {
        transformation: [{ width: 500, height: 500, crop: 'fill' }],
      }),
    } as any,
  });
};

// Create multer upload instances for each file type
export const imageUpload = multer({
  storage: createStorage('image'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedFormats = fileTypes.image.allowedFormats;
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedFormats.join(', ')} files are allowed`) as any);
    }
  },
});

export const audioUpload = multer({
  storage: createStorage('audio'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedFormats = fileTypes.audio.allowedFormats;
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedFormats.join(', ')} files are allowed`) as any);
    }
  },
});

export const videoUpload = multer({
  storage: createStorage('video'),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedFormats = fileTypes.video.allowedFormats;
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedFormats.join(', ')} files are allowed`) as any);
    }
  },
});

export const documentUpload = multer({
  storage: createStorage('document'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedFormats = fileTypes.document.allowedFormats;
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedFormats.join(', ')} files are allowed`) as any);
    }
  },
});

export const avatarUpload = multer({
  storage: createStorage('avatar'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedFormats = fileTypes.avatar.allowedFormats;
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedFormats.join(', ')} files are allowed`) as any);
    }
  },
});

// Helper function to delete a file from Cloudinary
export const deleteFile = async (publicId: string, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};
