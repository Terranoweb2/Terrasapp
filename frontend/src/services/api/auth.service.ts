import axios from '../axios';

// Service pour l'authentification
const authService = {
  // Inscription d'un utilisateur
  register: async (data: { name: string; email: string; password: string; phoneNumber?: string }) => {
    try {
      const response = await axios.post('/api/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Connexion d'un utilisateur
  login: async (data: { email: string; password: string }) => {
    try {
      const response = await axios.post('/api/auth/login', data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      const response = await axios.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Récupérer l'utilisateur courant
  getCurrentUser: async () => {
    try {
      const response = await axios.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Vérifier l'email
  verifyEmail: async (token: string) => {
    try {
      const response = await axios.get(`/api/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  },

  // Demander un reset de mot de passe
  requestPasswordReset: async (email: string) => {
    try {
      const response = await axios.post('/api/auth/request-password-reset', { email });
      return response.data;
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  },

  // Réinitialiser le mot de passe
  resetPassword: async (data: { token: string; password: string }) => {
    try {
      const response = await axios.post('/api/auth/reset-password', data);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Mettre à jour le profil
  updateProfile: async (data: { name?: string; bio?: string }) => {
    try {
      const response = await axios.put('/api/auth/update-profile', data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

export default authService;
