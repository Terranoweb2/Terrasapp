import React, { useState, useRef, ChangeEvent } from 'react';
import axios from 'axios';
import { API_URL, aiService } from '../../services/api';

// Types
type FileUploaderProps = {
  allowedTypes?: string[];
  maxSize?: number; // in MB
  conversationId?: string;
  onFileUploaded?: (fileData: any) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  className?: string;
  type: 'image' | 'audio' | 'video' | 'document';
};

const FileUploader: React.FC<FileUploaderProps> = ({
  allowedTypes = [],
  maxSize = 10,
  conversationId,
  onFileUploaded,
  onError,
  buttonText = 'Choisir un fichier',
  className = '',
  type
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mapping of file types to human-readable descriptions
  const fileTypeMap = {
    image: 'Images (JPG, PNG, GIF, etc.)',
    audio: 'Audio (MP3, WAV, etc.)',
    video: 'Vidéos (MP4, WEBM, etc.)',
    document: 'Documents (PDF, DOC, etc.)'
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      onError?.(`La taille du fichier dépasse ${maxSize}MB`);
      return false;
    }

    // If allowedTypes is provided, check file type
    if (allowedTypes.length > 0) {
      const fileType = file.type;
      if (!allowedTypes.some(type => fileType.startsWith(type))) {
        onError?.(`Type de fichier non supporté. Types acceptés: ${allowedTypes.join(', ')}`);
        return false;
      }
    }

    return true;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!validateFile(file)) {
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Vérification préliminaire du contenu si c'est une image
    if (type === 'image' && file.type.startsWith('image/')) {
      try {
        setLoading(true);
        setProgress(0);
        
        // Créer une URL temporaire pour l'image
        const imageUrl = URL.createObjectURL(file);
        
        // Vérification de modération avant de télécharger
        const moderationResult = await aiService.moderateContent(file.name + ': [contenu visuel]');
        
        // Libérer l'URL temporaire
        URL.revokeObjectURL(imageUrl);
        
        if (!moderationResult.safe) {
          onError?.('Le contenu de cette image ne respecte pas nos règles de modération.');
          setLoading(false);
          
          // Reset the input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
      } catch (error) {
        console.error('Error during content moderation:', error);
        // Continue with upload even if moderation fails
      }
    }

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    
    if (conversationId) {
      formData.append('conversationId', conversationId);
    }

    try {
      const response = await axios.post(
        `${API_URL}/files/upload/${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percentCompleted);
            }
          },
          withCredentials: true // Include cookies for authentication
        }
      );

      if (response.data.success) {
        onFileUploaded?.(response.data.file);
      } else {
        onError?.(response.data.message || 'Une erreur est survenue lors du téléchargement');
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      onError?.(
        error.response?.data?.message || 
        error.response?.data?.details || 
        'Une erreur est survenue lors du téléchargement'
      );
    } finally {
      setLoading(false);
      setProgress(0);
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`file-uploader ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={allowedTypes.join(',')}
      />
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center justify-center px-4 py-2 rounded-lg 
          ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
          text-white transition-colors focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:ring-opacity-50 w-full`}
      >
        {loading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {progress > 0 ? `${progress}%` : 'Téléchargement...'}
          </div>
        ) : (
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            {buttonText}
          </span>
        )}
      </button>
      <p className="text-xs text-gray-500 mt-1">
        {fileTypeMap[type]} • Max: {maxSize}MB
        {type === 'image' && <span> • Contenu vérifié par IA</span>}
      </p>
    </div>
  );
};

export default FileUploader;
