import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  type: NotificationType;
  message: string;
  duration?: number; // En millisecondes
  onClose?: () => void;
  show: boolean;
}

const Notification: React.FC<NotificationProps> = ({ 
  type, 
  message, 
  duration = 5000, 
  onClose,
  show 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  // Types d'icônes en fonction du type de notification
  const icons = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
    error: <XCircleIcon className="h-6 w-6 text-red-500" />,
    warning: <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />,
    info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />
  };

  // Couleurs en fonction du type de notification
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  // Fermer la notification
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  // Effet pour gérer la durée d'affichage
  useEffect(() => {
    setIsVisible(show);
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  // Animation de transition pour l'entrée/sortie
  const enterClass = 'transform translate-y-0 opacity-100';
  const exitClass = 'transform -translate-y-4 opacity-0 pointer-events-none';

  if (!isVisible && !show) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${isVisible ? enterClass : exitClass}`}
    >
      <div className={`flex items-center p-4 rounded-lg shadow-md border ${colors[type]} max-w-md`}>
        <div className="flex-shrink-0 mr-3">
          {icons[type]}
        </div>
        <div className="flex-1 mr-2">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button 
          onClick={handleClose}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
