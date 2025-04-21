import React from 'react';
// Utilisation de notre utilitaire personnalisé de formatage de date
import { format } from '../../utils/dateUtils';
import Avatar from '../UI/Avatar';
import { 
  DocumentIcon, 
  PlayIcon, 
  PhotoIcon, 
  FilmIcon, 
  TrashIcon, 
  ArrowUturnLeftIcon as ReplyIcon 
} from '@heroicons/react/24/outline';

interface MessageProps {
  id: string;
  content: string;
  contentType: 'text' | 'audio' | 'image' | 'video' | 'document' | 'location';
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  isCurrentUser: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead?: boolean;
  replyTo?: any;
  onDelete?: (id: string) => void;
  onReply?: (message: any) => void;
  onDownload?: (fileUrl: string, fileName: string) => void;
  onTranscribe?: (id: string) => void;
  onImageClick?: (url: string) => void;
}

const Message: React.FC<MessageProps> = ({
  id,
  content,
  contentType,
  sender,
  timestamp,
  isCurrentUser,
  fileUrl,
  fileName,
  fileSize,
  isRead,
  replyTo,
  onDelete,
  onReply,
  onDownload,
  onTranscribe,
  onImageClick,
}) => {
  // Format timestamp
  const formattedTime = format(new Date(timestamp), 'HH:mm');
  
  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <div className="mr-2 self-end mb-1">
          <Avatar name={sender.name} src={sender.avatar} size="sm" />
        </div>
      )}
      
      <div className={`max-w-[70%]`}>
        {/* Replied message */}
        {replyTo && (
          <div className={`mb-1 p-2 rounded-lg text-xs ${
            isCurrentUser 
              ? 'bg-gray-100 dark:bg-gray-700 mr-2' 
              : 'bg-gray-100 dark:bg-gray-700 ml-2'
          }`}>
            <div className="text-gray-500 dark:text-gray-400">
              {isCurrentUser && replyTo.sender.id === sender.id 
                ? 'You replied to yourself' 
                : `Reply to ${replyTo.sender.name}`}
            </div>
            <div className="truncate">{replyTo.content}</div>
          </div>
        )}
        
        {/* Main message content */}
        <div className={`group relative ${isCurrentUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block rounded-lg p-3 ${
            isCurrentUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
          }`}>
            {/* Sender name for group chats (not for current user) */}
            {!isCurrentUser && (
              <div className="text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                {sender.name}
              </div>
            )}
            
            {/* Message content based on type */}
            {contentType === 'text' && <div className="text-sm">{content}</div>}
            
            {contentType === 'image' && (
              <div>
                <div className="rounded-md overflow-hidden cursor-pointer mb-1" onClick={() => onImageClick && fileUrl && onImageClick(fileUrl)}>
                  <img src={fileUrl} alt={fileName || 'Image'} className="max-w-full h-auto" />
                </div>
                {content && <div className="text-sm mt-1">{content}</div>}
              </div>
            )}
            
            {contentType === 'audio' && (
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <button 
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center"
                    onClick={() => fileUrl && window.open(fileUrl)}
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                  
                  <div className="flex-1">
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full w-0"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span>{fileName || 'Audio message'}</span>
                  <button 
                    className="text-blue-400 dark:text-blue-300 hover:underline"
                    onClick={() => onTranscribe && onTranscribe(id)}
                  >
                    Transcribe
                  </button>
                </div>
                
                {content && <div className="text-sm mt-1">{content}</div>}
              </div>
            )}
            
            {contentType === 'video' && (
              <div>
                <div className="rounded-md overflow-hidden bg-gray-800 relative mb-1">
                  <div className="aspect-w-16 aspect-h-9">
                    <video 
                      src={fileUrl} 
                      controls 
                      className="w-full h-full object-cover"
                    ></video>
                  </div>
                </div>
                {content && <div className="text-sm mt-1">{content}</div>}
              </div>
            )}
            
            {contentType === 'document' && (
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-600 flex items-center justify-center mr-3">
                  <DocumentIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{fileName || 'Document'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(fileSize)}
                  </div>
                  <button 
                    className="text-xs text-blue-400 dark:text-blue-300 hover:underline"
                    onClick={() => onDownload && fileUrl && fileName && onDownload(fileUrl, fileName)}
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Message timestamp */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-1">
            {formattedTime} {isRead && isCurrentUser && '✓'}
          </div>
          
          {/* Actions */}
          <div className={`absolute top-0 ${isCurrentUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1`}>
            <button 
              className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => onReply && onReply({ id, content, sender })}
            >
              <ReplyIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {isCurrentUser && (
              <button 
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900"
                onClick={() => onDelete && onDelete(id)}
              >
                <TrashIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="ml-2 self-end mb-1">
          <Avatar name={sender.name} src={sender.avatar} size="sm" />
        </div>
      )}
    </div>
  );
};

export default Message;
