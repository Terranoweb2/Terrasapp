import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  originalName: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  conversation?: mongoose.Types.ObjectId;
  message?: mongoose.Types.ObjectId;
  thumbnail?: string;
  duration?: number; // For audio/video files
  isDeleted: boolean;
  deletedAt?: Date;
}

const fileSchema = new Schema<IFile>(
  {
    originalName: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    publicUrl: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    thumbnail: {
      type: String,
    },
    duration: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ conversation: 1 });
fileSchema.index({ isDeleted: 1 });
fileSchema.index({ mimeType: 1 });

export default mongoose.model<IFile>('File', fileSchema);
