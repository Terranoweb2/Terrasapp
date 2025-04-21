import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  verified: boolean;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; bio?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Utilisateur factice pour le mode développement sans authentification
  const defaultUser: User = {
    id: 'dev-user-123',
    name: 'Utilisateur Développement',
    email: 'dev@terrasapp.com',
    verified: true,
    avatar: '',
    bio: 'Compte de développement automatique'
  };
  
  const [user, setUser] = useState<User | null>(defaultUser); // Utilisateur par défaut
  const [token, setToken] = useState<string | null>('dev-token-123'); // Token factice
  const [isLoading, setIsLoading] = useState(false); // Pas de chargement initial

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        try {
          // Verify token validity by fetching current user
          const { user: currentUser } = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // If token is invalid, clear everything
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user } = await authService.login({ email, password });
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (name: string, email: string, password: string, phoneNumber?: string) => {
    setIsLoading(true);
    try {
      const { token, user } = await authService.register({ 
        name, 
        email, 
        password, 
        phoneNumber 
      });
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: { name?: string; bio?: string }) => {
    try {
      const { user: updatedUser } = await authService.updateProfile(data);
      
      // Update user data in state and localStorage
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : null);
      if (user) {
        localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
