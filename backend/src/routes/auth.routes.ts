import express from 'express';

const router = express.Router();

// Utilisateur statique de développement
const devUser = {
  id: 'dev-user-123',
  name: 'Utilisateur Développement',
  email: 'dev@terrasapp.com',
  verified: true,
  avatar: '',
  bio: 'Compte de développement automatique'
};

// Routes simplifiées pour le mode développement - sans typage fort pour éviter les erreurs

// Login
router.post('/login', function(req, res) {
  res.status(200).json({
    success: true,
    token: 'dev-token-123',
    user: devUser
  });
});

// Register
router.post('/register', function(req, res) {
  res.status(201).json({
    success: true,
    token: 'dev-token-456',
    user: {
      ...devUser,
      name: req.body.name || devUser.name,
      email: req.body.email || devUser.email
    }
  });
});

// Current user
router.get('/me', function(req, res) {
  res.status(200).json({
    success: true,
    user: devUser
  });
});

// Verify email
router.get('/verify-email/:token', function(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'Email verified successfully' 
  });
});

// Request password reset
router.post('/request-password-reset', function(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'Password reset email sent' 
  });
});

// Reset password
router.post('/reset-password', function(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'Password reset successful' 
  });
});

// Update profile
router.put('/update-profile', function(req, res) {
  res.status(200).json({
    success: true,
    user: {
      ...devUser,
      ...req.body
    }
  });
});

// Logout
router.post('/logout', function(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

export default router;
