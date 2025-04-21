import axios from '../axios';
import { FolderData } from '../../components/FileManagement/FileFolder';

// Service pour la gestion des dossiers
const folderService = {
  // Récupérer tous les dossiers
  getFolders: async (params = {}) => {
    try {
      const response = await axios.get('/api/folders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  },

  // Récupérer un dossier par son ID
  getFolder: async (folderId: string) => {
    try {
      const response = await axios.get(`/api/folders/${folderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching folder ${folderId}:`, error);
      throw error;
    }
  },

  // Créer un nouveau dossier
  createFolder: async (data: { name: string, parentId?: string | null }) => {
    try {
      const response = await axios.post('/api/folders', data);
      return response.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  // Mettre à jour un dossier
  updateFolder: async (folderId: string, data: { name?: string, parentId?: string | null }) => {
    try {
      const response = await axios.put(`/api/folders/${folderId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating folder ${folderId}:`, error);
      throw error;
    }
  },

  // Supprimer un dossier
  deleteFolder: async (folderId: string) => {
    try {
      const response = await axios.delete(`/api/folders/${folderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting folder ${folderId}:`, error);
      throw error;
    }
  },

  // Déplacer des fichiers vers un dossier
  moveFilesToFolder: async (folderId: string, fileIds: string[]) => {
    try {
      const response = await axios.post(`/api/folders/${folderId}/move-files`, { fileIds });
      return response.data;
    } catch (error) {
      console.error(`Error moving files to folder ${folderId}:`, error);
      throw error;
    }
  },

  // Récupérer les fichiers d'un dossier
  getFolderFiles: async (folderId: string, params = {}) => {
    try {
      const response = await axios.get(`/api/folders/${folderId}/files`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching files for folder ${folderId}:`, error);
      throw error;
    }
  }
};

export default folderService;
