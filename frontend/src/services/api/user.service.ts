import axios from '../axios';

// Service pour la gestion des utilisateurs
const userService = {
  // Récupérer tous les utilisateurs
  getUsers: async (params = {}) => {
    try {
      const response = await axios.get('/api/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par son ID
  getUser: async (userId: string) => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  // Mettre à jour une photo de profil
  updateProfilePicture: async (formData: FormData) => {
    try {
      const response = await axios.post('/api/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  },

  // Rechercher des utilisateurs
  searchUsers: async (query: string) => {
    try {
      const response = await axios.get('/api/users/search', { params: { query } });
      return response.data;
    } catch (error) {
      console.error(`Error searching users with query '${query}':`, error);
      throw error;
    }
  },

  // Ajouter un contact
  addContact: async (userId: string) => {
    try {
      const response = await axios.post(`/api/users/contacts/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error adding user ${userId} to contacts:`, error);
      throw error;
    }
  },

  // Supprimer un contact
  removeContact: async (userId: string) => {
    try {
      const response = await axios.delete(`/api/users/contacts/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing user ${userId} from contacts:`, error);
      throw error;
    }
  },

  // Récupérer la liste des contacts
  getContacts: async () => {
    try {
      const response = await axios.get('/api/users/contacts');
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }
};

export default userService;
