import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Verify JWT token middleware
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Mode développement - accès sans authentification
  const DEV_MODE = process.env.NODE_ENV === 'development' || true;
  
  if (DEV_MODE) {
    console.log('Mode développement - Authentification contournée');
    
    // Créer un utilisateur de développement fictif
    req.user = {
      _id: 'dev-user-123',
      name: 'Utilisateur Développement',
      email: 'dev@terrasapp.com',
      verified: true,
      status: 'online',
      lastSeen: new Date(),
    };
    
    return next();
  }
  
  // Code d'authentification normal (désactivé temporairement)
  try {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Middleware to check if user is verified
export const isVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // User should be attached by the protect middleware
    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your account to access this route',
      });
    }
    next();
  } catch (error) {
    console.error('Verification middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
