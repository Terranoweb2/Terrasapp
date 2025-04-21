import { Request, Response } from 'express';
import User from '../models/user.model';
import crypto from 'crypto';
import { moderateContent } from '../services/ai.service';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Moderate username for inappropriate content
    try {
      console.log('Attempting content moderation for:', name);
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OPENAI_API_KEY not configured, skipping moderation');
      } else {
        const moderationResult = await moderateContent(name);
        if (moderationResult.flagged) {
          return res.status(400).json({
            success: false,
            message: 'Username contains inappropriate content',
          });
        }
      }
    } catch (error) {
      // Continue registration even if moderation fails
      console.error('Content moderation failed:', error);
      // Do not block registration due to moderation failure
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      verified: false, // Require verification
    });

    // Generate verification token (for email verification)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // In a real app, we would store this token and send an email
    // For this example, we'll auto-verify the user
    user.verified = true;
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        verified: user.verified,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    // More detailed error logging
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }
    // Log more detailed error information
    console.error('Error details:', error.message);
    
    // Send more specific error message if available
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating user',
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Update user status to online
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User is attached to request by auth middleware
    const user = await User.findById(req.user.id);
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
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        bio: user.bio,
        status: user.status,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
    });
  }
};

// Verify user email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // In a real app, find the user with this verification token
    // For this example, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
    });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // In a real app, store the reset token and expiry
    // and send an email with the reset link

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request',
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // In a real app, find user with this reset token and validate expiry
    // For this example, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, bio } = req.body;
    
    // Moderate content if provided
    if (name) {
      try {
        const moderationResult = await moderateContent(name);
        if (moderationResult.flagged) {
          return res.status(400).json({
            success: false,
            message: 'Name contains inappropriate content',
          });
        }
      } catch (error) {
        console.error('Content moderation failed:', error);
      }
    }
    
    if (bio) {
      try {
        const moderationResult = await moderateContent(bio);
        if (moderationResult.flagged) {
          return res.status(400).json({
            success: false,
            message: 'Bio contains inappropriate content',
          });
        }
      } catch (error) {
        console.error('Content moderation failed:', error);
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name && { name }),
        ...(bio && { bio }),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser?._id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        avatar: updatedUser?.avatar,
        bio: updatedUser?.bio,
        verified: updatedUser?.verified,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    // Update user status to offline
    await User.findByIdAndUpdate(req.user.id, {
      status: 'offline',
      lastSeen: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
    });
  }
};
