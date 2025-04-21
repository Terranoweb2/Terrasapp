import React, { useState } from 'react';
import { Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ThemeCustomizer from './ThemeCustomizer';

/**
 * Panneau de configuration du thème qui peut être ouvert/fermé
 * Ce composant peut être placé n'importe où dans l'application
 */
const ThemePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton pour ouvrir/fermer le panneau */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-full p-3 shadow-[0_6px_20px_0_rgba(139,92,246,0.2)] transition-all"
        aria-label={isOpen ? "Fermer le panneau de thème" : "Ouvrir le panneau de thème"}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Cog6ToothIcon className="h-6 w-6" />
        )}
      </button>

      {/* Panneau de personnalisation */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 transform transition-all duration-300 ease-in-out shadow-[0_10px_30px_0_rgba(139,92,246,0.25)]">
          <ThemeCustomizer />
        </div>
      )}
    </div>
  );
};

export default ThemePanel;
