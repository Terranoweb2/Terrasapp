import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface pour le contexte mode hors ligne
interface OfflineContextType {
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
}

// Création du contexte
const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: ReactNode;
}

// Provider du mode hors ligne
export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  // Par défaut, nous activons le mode hors ligne
  const [isOfflineMode, setIsOfflineMode] = useState(true);

  const toggleOfflineMode = () => {
    setIsOfflineMode(prev => !prev);
  };

  // Valeur du contexte
  const value = {
    isOfflineMode,
    toggleOfflineMode,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};
