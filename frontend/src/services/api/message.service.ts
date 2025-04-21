import axios from '../axios';

// Service pour la gestion des messages
const messageService = {
  // Récupérer les conversations
  getConversations: async () => {
    try {
      const response = await axios.get('/api/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Récupérer une conversation par ID
  getConversation: async (conversationId: string) => {
    try {
      const response = await axios.get(`/api/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching conversation ${conversationId}:`, error);
      throw error;
    }
  },

  // Créer une nouvelle conversation
  createConversation: async (participants: string[]) => {
    try {
      const response = await axios.post('/api/conversations', { participants });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Récupérer les messages d'une conversation
  getMessages: async (conversationId: string, params = {}) => {
    try {
      const response = await axios.get(`/api/conversations/${conversationId}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error);
      throw error;
    }
  },

  // Envoyer un message
  sendMessage: async (conversationId: string, data: { content: string, attachments?: string[] }) => {
    try {
      const response = await axios.post(`/api/conversations/${conversationId}/messages`, data);
      return response.data;
    } catch (error) {
      console.error(`Error sending message to conversation ${conversationId}:`, error);
      throw error;
    }
  },

  // Marquer les messages comme lus
  markAsRead: async (conversationId: string, messageIds: string[]) => {
    try {
      const response = await axios.put(`/api/conversations/${conversationId}/messages/read`, { messageIds });
      return response.data;
    } catch (error) {
      console.error(`Error marking messages as read in conversation ${conversationId}:`, error);
      throw error;
    }
  },

  // Supprimer un message
  deleteMessage: async (conversationId: string, messageId: string) => {
    try {
      const response = await axios.delete(`/api/conversations/${conversationId}/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting message ${messageId} from conversation ${conversationId}:`, error);
      throw error;
    }
  }
};

export default messageService;
