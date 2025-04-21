import React from 'react';

// Types
export type FileData = {
  id: string;
  originalName: string;
  publicUrl: string;
  mimeType: string;
  size: number;
};

type FilePreviewProps = {
  file: FileData;
  className?: string;
  height?: string;
  width?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  downloadable?: boolean;
};

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  className = '',
  height = 'auto',
  width = '100%',
  controls = true,
  autoPlay = false,
  loop = false,
  muted = true,
  downloadable = true,
}) => {
  const { mimeType, publicUrl, originalName } = file;

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render based on file type
  const renderFilePreview = () => {
    // Image files
    if (mimeType.startsWith('image/')) {
      return (
        <img 
          src={publicUrl} 
          alt={originalName} 
          style={{ height, width, objectFit: 'contain' }}
          className={`rounded-lg ${className}`}
        />
      );
    }
    
    // Audio files
    if (mimeType.startsWith('audio/')) {
      return (
        <div className={`audio-preview ${className}`}>
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
            <svg className="w-8 h-8 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{originalName}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <audio 
            src={publicUrl} 
            controls={controls} 
            autoPlay={autoPlay} 
            loop={loop}
            className="w-full mt-2" 
          />
        </div>
      );
    }
    
    // Video files
    if (mimeType.startsWith('video/')) {
      return (
        <video 
          src={publicUrl} 
          controls={controls} 
          autoPlay={autoPlay} 
          loop={loop}
          muted={muted}
          style={{ height, width }}
          className={`rounded-lg ${className}`}
        />
      );
    }
    
    // PDF files
    if (mimeType === 'application/pdf') {
      return (
        <div className={`pdf-preview ${className}`}>
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 mb-2">
            <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            <div>
              <p className="text-sm font-medium truncate">{originalName}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <iframe 
            src={`${publicUrl}#view=FitH`} 
            style={{ height: height !== 'auto' ? height : '500px', width }}
            className="border rounded-lg"
            title={originalName}
          />
        </div>
      );
    }
    
    // Default for other file types - display a generic file icon and info
    return (
      <div className={`file-preview flex items-center bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="file-icon mr-3">
          {
            // Document icon for common document types
            mimeType.includes('document') || mimeType.includes('sheet') || mimeType.includes('presentation') || mimeType === 'text/plain' ? (
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            ) : (
              // Generic file icon for other types
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            )
          }
        </div>
        <div className="file-info">
          <p className="text-sm font-medium truncate">{originalName}</p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="file-preview-container">
      {renderFilePreview()}
      
      {downloadable && (
        <div className="mt-2 text-right">
          <a 
            href={publicUrl} 
            download={originalName}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-end"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Télécharger
          </a>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
