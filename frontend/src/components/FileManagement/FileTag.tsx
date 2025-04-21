import React from 'react';
import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface TagData {
  id: string;
  name: string;
  color: string;
}

interface FileTagProps {
  tag: TagData;
  onRemove?: () => void;
  onClick?: () => void;
  removable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FileTag: React.FC<FileTagProps> = ({
  tag,
  onRemove,
  onClick,
  removable = false,
  size = 'md'
}) => {
  // Définir les tailles
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5'
  };

  // Définir les couleurs disponibles
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
    red: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300',
    green: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
    pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300',
    indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300',
  };

  // Utiliser la couleur spécifiée ou une couleur par défaut
  const colorClass = colorClasses[tag.color] || colorClasses.gray;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    if (onRemove) {
      e.stopPropagation();
      onRemove();
    }
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium transition-colors ${colorClass} ${sizeClasses[size]} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <TagIcon className={`mr-1 ${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />
      {tag.name}
      {removable && onRemove && (
        <button
          type="button"
          className={`ml-1 flex-shrink-0 rounded-full inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`}
          onClick={handleRemove}
        >
          <XMarkIcon className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </button>
      )}
    </span>
  );
};

export default FileTag;
