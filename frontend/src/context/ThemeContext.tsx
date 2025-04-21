import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Modes de base - clair ou sombre
type ThemeMode = 'light' | 'dark';

// Options de couleur principale
type ColorScheme = 'default' | 'blue' | 'green' | 'neutral';

// Structure complète du thème
interface ThemeSettings {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  fontSize: 'small' | 'medium' | 'large';
  radius: 'none' | 'small' | 'medium' | 'large';
}

interface ThemeContextType {
  theme: ThemeSettings;
  toggleThemeMode: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setRadius: (radius: 'none' | 'small' | 'medium' | 'large') => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Thème par défaut pour Terrasapp
const DEFAULT_THEME: ThemeSettings = {
  mode: 'light',
  colorScheme: 'default', // Violet-Bleu est maintenant la valeur par défaut
  fontSize: 'medium',
  radius: 'medium'
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialiser le thème depuis localStorage ou les valeurs par défaut
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    const savedTheme = localStorage.getItem('terrasapp-theme');
    if (savedTheme) {
      try {
        return JSON.parse(savedTheme) as ThemeSettings;
      } catch (e) {
        console.error('Erreur lors du parsing du thème sauvegardé:', e);
      }
    }
    
    // Vérifier la préférence système pour le mode clair/sombre
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      ...DEFAULT_THEME,
      mode: prefersDark ? 'dark' : 'light'
    };
  });

  // Mettre à jour les classes CSS et sauvegarder le thème quand il change
  useEffect(() => {
    // Appliquer le mode clair/sombre
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme.mode);
    
    // Appliquer les attributs de données pour les autres paramètres
    document.documentElement.setAttribute('data-color-scheme', theme.colorScheme);
    document.documentElement.setAttribute('data-font-size', theme.fontSize);
    document.documentElement.setAttribute('data-radius', theme.radius);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('terrasapp-theme', JSON.stringify(theme));
  }, [theme]);

  // Fonctions pour modifier le thème
  const toggleThemeMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light'
    }));
  };
  
  const setColorScheme = (colorScheme: ColorScheme) => {
    setTheme(prev => ({ ...prev, colorScheme }));
  };
  
  const setFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    setTheme(prev => ({ ...prev, fontSize }));
  };
  
  const setRadius = (radius: 'none' | 'small' | 'medium' | 'large') => {
    setTheme(prev => ({ ...prev, radius }));
  };
  
  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleThemeMode, 
        setColorScheme, 
        setFontSize, 
        setRadius, 
        resetTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
