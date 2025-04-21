import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../services/api';
import FilePreview, { FileData } from './FilePreview';

// Types
type FileListProps = {
  conversationId?: string;
  fileType?: 'image' | 'audio' | 'video' | 'document' | 'all';
  limit?: number;
  className?: string;
  emptyMessage?: string;
};

const FileList: React.FC<FileListProps> = ({
  conversationId,
  fileType = 'all',
  limit = 20,
  className = '',
  emptyMessage = 'Aucun fichier disponible'
}) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFiles = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${API_URL}/files?page=${pageNumber}&limit=${limit}`;
      
      if (conversationId) {
        url += `&conversationId=${conversationId}`;
      }
      
      if (fileType !== 'all') {
        url += `&type=${fileType}`;
      }
      
      const response = await axios.get(url, {
        withCredentials: true // Include cookies for authentication
      });
      
      if (response.data.success) {
        setFiles(response.data.files);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.data.message || 'Une erreur est survenue lors du chargement des fichiers');
      }
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError(err.response?.data?.message || 'Impossible de charger les fichiers');
    } finally {
      setLoading(false);
    }
  };

  // Load files on component mount or when props change
  useEffect(() => {
    fetchFiles(1);
    setPage(1);
  }, [conversationId, fileType, limit]);

  // Load more files when page changes
  useEffect(() => {
    if (page > 1) {
      fetchFiles(page);
    }
  }, [page]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  if (loading && files.length === 0) {
    return (
      <div className={`file-list-loading flex justify-center items-center p-4 ${className}`}>
        <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`file-list-error p-4 bg-red-100 text-red-700 rounded-md ${className}`}>
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={`file-list-empty p-4 text-gray-500 ${className}`}>
        <p className="text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`file-list ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((file) => (
          <div key={file.id} className="file-item">
            <FilePreview file={file} />
          </div>
        ))}
      </div>
      
      {page < totalPages && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
          >
            Charger plus de fichiers
          </button>
        </div>
      )}
    </div>
  );
};

export default FileList;
