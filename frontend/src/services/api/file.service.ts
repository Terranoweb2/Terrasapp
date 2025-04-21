import axios from '../axios';

// Service pour la gestion des fichiers
const fileService = {
  // Récupérer tous les fichiers avec filtre, pagination et tri
  getFiles: async (params = {}) => {
    try {
      const response = await axios.get('/api/files', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },

  // Récupérer un fichier par son ID
  getFile: async (fileId: string) => {
    try {
      const response = await axios.get(`/api/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching file ${fileId}:`, error);
      throw error;
    }
  },

  // Télécharger un fichier
  uploadFile: async (formData: FormData, onProgress?: (progress: number) => void) => {
    try {
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Supprimer un fichier
  deleteFile: async (fileId: string) => {
    try {
      const response = await axios.delete(`/api/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting file ${fileId}:`, error);
      throw error;
    }
  },

  // Renommer un fichier
  renameFile: async (fileId: string, newName: string) => {
    try {
      const response = await axios.put(`/api/files/${fileId}/rename`, { name: newName });
      return response.data;
    } catch (error) {
      console.error(`Error renaming file ${fileId}:`, error);
      throw error;
    }
  },

  // Déplacer un fichier vers un dossier
  moveFile: async (fileId: string, folderId: string | null) => {
    try {
      const response = await axios.put(`/api/files/${fileId}/move`, { folderId });
      return response.data;
    } catch (error) {
      console.error(`Error moving file ${fileId} to folder ${folderId}:`, error);
      throw error;
    }
  },

  // Partager un fichier
  shareFile: async (fileId: string, userId: string) => {
    try {
      const response = await axios.post(`/api/files/${fileId}/share`, { userId });
      return response.data;
    } catch (error) {
      console.error(`Error sharing file ${fileId} with user ${userId}:`, error);
      throw error;
    }
  }
};

export default fileService;
