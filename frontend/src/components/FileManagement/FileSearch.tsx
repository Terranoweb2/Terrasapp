import React, { useState } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface FileSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (type: 'all' | 'image' | 'audio' | 'video' | 'document') => void;
  onSortChange?: (sort: 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc') => void;
  selectedType: 'all' | 'image' | 'audio' | 'video' | 'document';
}

const FileSearch: React.FC<FileSearchProps> = ({
  onSearch,
  onFilterChange,
  onSortChange,
  selectedType
}) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc'>('date_desc');
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc';
    setSortBy(value);
    onSortChange && onSortChange(value);
  };
  
  return (
    <div className="mb-6">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher des fichiers..."
          value={query}
          onChange={handleQueryChange}
          className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Advanced options */}
      {showAdvanced && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4">
            {/* File type filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de fichier
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'image', 'document', 'audio', 'video'].map((type) => (
                  <button
                    key={type}
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => onFilterChange(type as any)}
                  >
                    {type === 'all' ? 'Tous' : 
                     type === 'image' ? 'Images' :
                     type === 'document' ? 'Documents' :
                     type === 'audio' ? 'Audio' : 'Vidéos'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sort options */}
            <div className="flex-1">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trier par
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={handleSortChange}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-md px-3 py-1 w-full"
              >
                <option value="date_desc">Plus récent</option>
                <option value="date_asc">Plus ancien</option>
                <option value="name_asc">Nom (A-Z)</option>
                <option value="name_desc">Nom (Z-A)</option>
                <option value="size_desc">Taille (décroissante)</option>
                <option value="size_asc">Taille (croissante)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSearch;
