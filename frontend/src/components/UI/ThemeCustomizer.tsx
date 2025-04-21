import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MoonIcon, SunIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ThemeOptionProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: () => void;
  children?: React.ReactNode;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ id, name, checked, onChange, children }) => {
  return (
    <div className="flex items-center space-x-3 mb-3">
      <input
        type="radio"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-terra-500 focus:ring-terra-500 border-gray-300"
      />
      <label
        htmlFor={id}
        className="flex items-center cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {children}
      </label>
    </div>
  );
};

interface ColorSwatchProps {
  color: string;
  name: string;
  active: boolean;
  onClick: () => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, name, active, onClick }) => {
  let bgColor = '';
  
  switch (color) {
    case 'default':
      bgColor = 'bg-terra-500';
      break;
    case 'blue':
      bgColor = 'bg-blue-500';
      break;
    case 'green':
      bgColor = 'bg-green-600';
      break;
    case 'neutral':
      bgColor = 'bg-gray-500';
      break;
    default:
      bgColor = 'bg-terra-500';
  }

  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center ${
        active ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''
      }`}
      title={name}
      aria-label={`Thème couleur ${name}`}
    >
      {active && (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
};

// Constantes pour les options de thème
const colorOptions = [
  { value: 'default', label: 'Violet-Bleu', className: 'bg-terra-500' },
  { value: 'blue', label: 'Blue', className: 'bg-blue-500' },
  { value: 'green', label: 'Green', className: 'bg-green-600' },
  { value: 'neutral', label: 'Neutral', className: 'bg-gray-500' },
];

const ThemeCustomizer: React.FC = () => {
  const { theme, toggleThemeMode, setColorScheme, setFontSize, setRadius, resetTheme } = useTheme();

  const handleColorChange = (color: 'default' | 'blue' | 'green' | 'neutral') => {
    setColorScheme(color);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-terra p-4 w-72">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personnalisation</h3>
        <button
          onClick={resetTheme}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Réinitialiser le thème"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Mode clair/sombre */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Mode d'affichage</h4>
        <div className="flex space-x-2">
          <button
            onClick={toggleThemeMode}
            className={`flex items-center justify-center px-3 py-2 rounded-md ${
              theme.mode === 'light'
                ? 'bg-terra-100 text-terra-600 font-medium'
                : 'bg-transparent text-gray-500 dark:text-gray-400'
            }`}
          >
            <SunIcon className="h-5 w-5 mr-1.5" />
            Clair
          </button>
          <button
            onClick={toggleThemeMode}
            className={`flex items-center justify-center px-3 py-2 rounded-md ${
              theme.mode === 'dark'
                ? 'bg-gray-700 text-white font-medium'
                : 'bg-transparent text-gray-500 dark:text-gray-400'
            }`}
          >
            <MoonIcon className="h-5 w-5 mr-1.5" />
            Sombre
          </button>
        </div>
      </div>

      {/* Couleurs du thème */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Scheme</h3>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.value}
              className={`flex justify-center items-center rounded-lg p-2 transition-all ${option.className} ${
                theme.colorScheme === option.value ? 'ring-2 ring-black dark:ring-white ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => handleColorChange(option.value as 'default' | 'blue' | 'green' | 'neutral')}
              title={option.label}
              aria-label={`Set color scheme to ${option.label}`}
            >
              <span className="sr-only">{option.label}</span>
              <div className="w-6 h-6 rounded-full bg-white/90"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Taille de police */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Taille de texte</h4>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFontSize('small')}
            className={`px-3 py-1.5 rounded text-xs ${
              theme.fontSize === 'small'
                ? 'bg-terra-100 text-terra-600 font-medium dark:bg-terra-900 dark:text-terra-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            Petit
          </button>
          <button
            onClick={() => setFontSize('medium')}
            className={`px-3 py-1.5 rounded text-sm ${
              theme.fontSize === 'medium'
                ? 'bg-terra-100 text-terra-600 font-medium dark:bg-terra-900 dark:text-terra-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            Moyen
          </button>
          <button
            onClick={() => setFontSize('large')}
            className={`px-3 py-1.5 rounded text-base ${
              theme.fontSize === 'large'
                ? 'bg-terra-100 text-terra-600 font-medium dark:bg-terra-900 dark:text-terra-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            Grand
          </button>
        </div>
      </div>

      {/* Bordures arrondies */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Coins arrondis</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setRadius('none')}
            className={`flex items-center justify-center p-2 border ${
              theme.radius === 'none'
                ? 'border-terra-500 bg-terra-50 text-terra-600 dark:bg-terra-900/30 dark:text-terra-400'
                : 'border-gray-200 dark:border-gray-700'
            }`}
            style={{ borderRadius: '0' }}
          >
            <span className="text-sm">Aucun</span>
          </button>
          <button
            onClick={() => setRadius('small')}
            className={`flex items-center justify-center p-2 border ${
              theme.radius === 'small'
                ? 'border-terra-500 bg-terra-50 text-terra-600 dark:bg-terra-900/30 dark:text-terra-400'
                : 'border-gray-200 dark:border-gray-700'
            }`}
            style={{ borderRadius: '0.25rem' }}
          >
            <span className="text-sm">Petit</span>
          </button>
          <button
            onClick={() => setRadius('medium')}
            className={`flex items-center justify-center p-2 border ${
              theme.radius === 'medium'
                ? 'border-terra-500 bg-terra-50 text-terra-600 dark:bg-terra-900/30 dark:text-terra-400'
                : 'border-gray-200 dark:border-gray-700'
            }`}
            style={{ borderRadius: '0.375rem' }}
          >
            <span className="text-sm">Moyen</span>
          </button>
          <button
            onClick={() => setRadius('large')}
            className={`flex items-center justify-center p-2 border ${
              theme.radius === 'large'
                ? 'border-terra-500 bg-terra-50 text-terra-600 dark:bg-terra-900/30 dark:text-terra-400'
                : 'border-gray-200 dark:border-gray-700'
            }`}
            style={{ borderRadius: '0.5rem' }}
          >
            <span className="text-sm">Grand</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
