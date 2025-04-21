import { Request, Response } from 'express';
import User from '../models/user.model';
import { avatarUpload } from '../services/upload.service';

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        status: user.status,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
    });
  }
};

// Search users
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    // Search users by name or email
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: req.user.id }, // Exclude current user
    })
      .select('name email avatar status')
      .limit(20);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
    });
  }
};

// Get user contacts
export const getContacts = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id).populate('contacts', 'name avatar status lastSeen');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      contacts: user.contacts,
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
    });
  }
};

// Add user to contacts
export const addContact = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    // Check if user exists
    const contactUser = await User.findById(userId);
    if (!contactUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is already in contacts
    const currentUser = await User.findById(req.user.id);
    if (currentUser?.contacts.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already in your contacts',
      });
    }

    // Add user to contacts
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { contacts: userId },
    });

    res.status(200).json({
      success: true,
      message: 'Contact added successfully',
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding contact',
    });
  }
};

// Remove user from contacts
export const removeContact = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Remove user from contacts
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { contacts: userId },
    });

    res.status(200).json({
      success: true,
      message: 'Contact removed successfully',
    });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing contact',
    });
  }
};

// Update user avatar
export const updateAvatar = async (req: Request, res: Response) => {
  try {
    // This would be handled by multer middleware in a real implementation
    // For this example, we'll assume req.file has the uploaded file info
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file provided',
      });
    }

    // Update user with new avatar URL
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar: (req.file as any).path, // In production, this would be a Cloudinary URL
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      avatar: user?.avatar,
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating avatar',
    });
  }
};

// Update user status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['online', 'offline', 'away', 'busy', 'in-call'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    // Update user status
    await User.findByIdAndUpdate(req.user.id, {
      status,
      lastSeen: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
    });
  }
};
