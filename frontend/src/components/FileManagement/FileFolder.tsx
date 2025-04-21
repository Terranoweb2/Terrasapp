import React from 'react';
import { 
  FolderIcon, 
  DocumentIcon, 
  ArrowRightIcon, 
  TagIcon, 
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';

export interface FolderData {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
}

interface FileFolderProps {
  folder: FolderData;
  isSelected: boolean;
  onClick: (folder: FolderData) => void;
  onRename?: (folder: FolderData) => void;
  onDelete?: (folder: FolderData) => void;
  onMoveFiles?: (folder: FolderData) => void;
}

const FileFolder: React.FC<FileFolderProps> = ({
  folder,
  isSelected,
  onClick,
  onRename,
  onDelete,
  onMoveFiles
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  // Empêcher le menu de se fermer immédiatement
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(prev => !prev);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onRename) onRename(folder);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) onDelete(folder);
  };

  const handleMoveFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onMoveFiles) onMoveFiles(folder);
  };

  return (
    <div 
      className={`relative flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : ''}`}
      onClick={() => onClick(folder)}
    >
      <div className="flex-shrink-0 mr-3">
        <FolderIcon className="h-8 w-8 text-yellow-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {folder.name}
          </h3>
          {folder.fileCount > 0 && (
            <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
              {folder.fileCount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(folder.updatedAt).toLocaleDateString()}
        </p>
      </div>
      
      <div className="flex-shrink-0 ml-2 relative">
        <button 
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          onClick={handleMenuClick}
        >
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
            <div className="py-1">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleRename}
              >
                <span className="mr-2">✏️</span>
                Renommer
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleMoveFiles}
              >
                <span className="mr-2">📂</span>
                Déplacer les fichiers
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleDelete}
              >
                <span className="mr-2">🗑️</span>
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileFolder;
