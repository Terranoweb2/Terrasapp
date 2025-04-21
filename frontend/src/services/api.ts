import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// API base URL, can be replaced by environment variable
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle session expiry
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  // Register new user
  register: async (data: { name: string; email: string; password: string; phoneNumber?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: { name?: string; bio?: string }) => {
    const response = await api.put('/auth/update-profile', data);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Message Services
export const messageService = {
  // Get user conversations
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // Get messages in a conversation
  getMessages: async (conversationId: string, page = 1, limit = 20) => {
    const response = await api.get(`/messages/conversations/${conversationId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (data: { 
    recipientId: string; 
    content: string; 
    contentType?: string; 
    fileUrl?: string; 
    fileName?: string; 
    fileSize?: number; 
    conversationId?: string;
  }) => {
    const response = await api.post('/messages/send', data);
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId: string) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Create or update a group
  createOrUpdateGroup: async (data: { 
    groupName: string; 
    participants: string[]; 
    groupId?: string; 
    groupAvatar?: string;
  }) => {
    const response = await api.post('/messages/group', data);
    return response.data;
  },
};

// User Services
export const userService = {
  // Get user by ID
  getUserById: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Search users
  searchUsers: async (query: string) => {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  },

  // Get user contacts
  getContacts: async () => {
    const response = await api.get('/users/contacts');
    return response.data;
  },

  // Add user to contacts
  addContact: async (userId: string) => {
    const response = await api.post('/users/contacts', { userId });
    return response.data;
  },

  // Remove user from contacts
  removeContact: async (userId: string) => {
    const response = await api.delete(`/users/contacts/${userId}`);
    return response.data;
  },

  // Update user status
  updateStatus: async (status: 'online' | 'offline' | 'away' | 'busy' | 'in-call') => {
    const response = await api.put('/users/status', { status });
    return response.data;
  },
};

// File Services
export const fileService = {
  // Get files
  getFiles: async (params: { 
    conversationId?: string; 
    type?: 'image' | 'audio' | 'video' | 'document'; 
    page?: number; 
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.conversationId) queryParams.append('conversationId', params.conversationId);
    if (params.type) queryParams.append('type', params.type);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/files?${queryParams.toString()}`);
    return response.data;
  },

  // Upload file
  uploadFile: async (file: File, type: 'image' | 'audio' | 'video' | 'document', conversationId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) formData.append('conversationId', conversationId);

    const response = await api.post(`/files/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (fileId: string) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },
};

// AI Services
export const aiService = {
  // Chat with AI assistant
  chatWithAI: async (messages: { role: string; content: string }[], systemPrompt?: string) => {
    const response = await api.post('/ai/chat', { messages, systemPrompt });
    return response.data;
  },

  // Transcribe audio
  transcribeAudio: async (audioFile: File) => {
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await api.post('/ai/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Moderate content
  moderateContent: async (content: string) => {
    const response = await api.post('/ai/moderate', { content });
    return response.data;
  },

  // Translate text
  translateText: async (text: string, targetLanguage: string) => {
    const response = await api.post('/ai/translate', { text, targetLanguage });
    return response.data;
  },

  // Summarize conversation
  summarizeConversation: async (conversationId: string) => {
    const response = await api.get(`/ai/summarize/${conversationId}`);
    return response.data;
  },

  // Generate response suggestions
  generateSuggestions: async (conversationId: string) => {
    const response = await api.get(`/ai/suggest/${conversationId}`);
    return response.data;
  },
};

export default api;
