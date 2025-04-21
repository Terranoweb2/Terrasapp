import React from 'react';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { User } from './ConversationList';

export interface Message {
  _id: string;
  sender: User;
  content: string;
  contentType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  isRead: boolean;
}

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isCurrentUser }) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-end">
        {!isCurrentUser && (
          <img 
            src={message.sender.avatar || '/default-avatar.png'} 
            alt={message.sender.name} 
            className="h-8 w-8 rounded-full mr-2 flex-shrink-0"
          />
        )}
        <div
          className={`max-w-md px-4 py-2 rounded-t-lg ${
            isCurrentUser 
              ? 'bg-blue-500 text-white rounded-bl-lg' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-br-lg'
          }`}
        >
          {message.contentType === 'text' ? (
            <p className="text-sm">{message.content}</p>
          ) : message.contentType === 'image' ? (
            <img 
              src={message.fileUrl} 
              alt="Image" 
              className="rounded-md max-h-60 max-w-full" 
            />
          ) : (
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded p-2">
              <PaperClipIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-800 dark:text-white">{message.fileName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {message.fileSize && `${Math.round(message.fileSize / 1024)} KB`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
