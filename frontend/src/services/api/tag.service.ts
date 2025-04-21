import axios from '../axios';
import { TagData } from '../../components/FileManagement/FileTag';

// Service pour la gestion des étiquettes (tags)
const tagService = {
  // Récupérer toutes les étiquettes
  getTags: async () => {
    try {
      const response = await axios.get('/api/tags');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  // Créer une nouvelle étiquette
  createTag: async (data: { name: string, color: string }) => {
    try {
      const response = await axios.post('/api/tags', data);
      return response.data;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  },

  // Mettre à jour une étiquette
  updateTag: async (tagId: string, data: { name?: string, color?: string }) => {
    try {
      const response = await axios.put(`/api/tags/${tagId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating tag ${tagId}:`, error);
      throw error;
    }
  },

  // Supprimer une étiquette
  deleteTag: async (tagId: string) => {
    try {
      const response = await axios.delete(`/api/tags/${tagId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting tag ${tagId}:`, error);
      throw error;
    }
  },

  // Attacher une étiquette à un fichier
  attachTagToFile: async (tagId: string, fileId: string) => {
    try {
      const response = await axios.post(`/api/tags/${tagId}/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error(`Error attaching tag ${tagId} to file ${fileId}:`, error);
      throw error;
    }
  },

  // Détacher une étiquette d'un fichier
  detachTagFromFile: async (tagId: string, fileId: string) => {
    try {
      const response = await axios.delete(`/api/tags/${tagId}/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error(`Error detaching tag ${tagId} from file ${fileId}:`, error);
      throw error;
    }
  },

  // Récupérer les fichiers avec une étiquette spécifique
  getFilesByTag: async (tagId: string, params = {}) => {
    try {
      const response = await axios.get(`/api/tags/${tagId}/files`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching files for tag ${tagId}:`, error);
      throw error;
    }
  }
};

export default tagService;
