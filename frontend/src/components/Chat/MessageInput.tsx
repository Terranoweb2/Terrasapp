import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  MicrophoneIcon, 
  PhotoIcon, 
  DocumentIcon, 
  FaceSmileIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import Button from '../UI/Button';

interface MessageInputProps {
  onSendMessage: (message: string, contentType?: string, fileUrl?: string, fileName?: string, fileSize?: number) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
  replyTo?: {
    id: string;
    content: string;
    sender: {
      name: string;
    };
  } | null;
  onCancelReply: () => void;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onFileUpload?: (file: File) => Promise<{ url: string, name: string, size: number }>;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
  replyTo,
  onCancelReply,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  onFileUpload
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle textarea resize as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);
  
  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      onTypingStart();
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing timeout to stop after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop();
    }, 2000);
  };
  
  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() || isRecording) {
      if (isRecording && onStopRecording) {
        onStopRecording();
      } else {
        onSendMessage(message.trim());
        setMessage('');
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
      
      // Stop typing indicator
      setIsTyping(false);
      onTypingStop();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };
  
  // Handle key press (for Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  // Handle file upload triggers
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };
  
  // Handle file change after selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    if (e.target.files && e.target.files[0] && onFileUpload) {
      const file = e.target.files[0];
      
      try {
        // Upload file and get URL
        const { url, name, size } = await onFileUpload(file);
        
        // Send message with file
        const contentType = type === 'image' ? 'image' : 'document';
        onSendMessage(message.trim(), contentType, url, name, size);
        setMessage('');
      } catch (error) {
        console.error('Error uploading file:', error);
        // Show error notification
      }
      
      // Reset file input
      e.target.value = '';
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {`Replying to ${replyTo.sender.name}`}
            </div>
            <div className="text-sm truncate">{replyTo.content}</div>
          </div>
          <button 
            onClick={onCancelReply} 
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Message input form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Emoji picker toggle */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <FaceSmileIcon className="w-6 h-6" />
        </button>
        
        {/* Image upload button */}
        <button
          type="button"
          onClick={handleImageClick}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          disabled={disabled}
        >
          <PhotoIcon className="w-6 h-6" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={imageInputRef}
            onChange={(e) => handleFileChange(e, 'image')}
            disabled={disabled}
          />
        </button>
        
        {/* Document upload button */}
        <button
          type="button"
          onClick={handleFileClick}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          disabled={disabled}
        >
          <DocumentIcon className="w-6 h-6" />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e, 'document')}
            disabled={disabled}
          />
        </button>
        
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none max-h-32"
            rows={1}
            disabled={disabled || isRecording}
          />
          
          {/* Emoji picker (conditionally rendered) */}
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-8 gap-1">
                {['😊', '😂', '❤️', '👍', '👎', '😍', '😢', '😡', '🤔', '👋', '🙏', '🎉', '🔥', '💯', '⭐', '🌟'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Audio recording button or Send button */}
        {onStartRecording && onStopRecording ? (
          <button
            type="button"
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`rounded-full w-10 h-10 flex items-center justify-center ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}
            disabled={disabled}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
        ) : null}
        
        {/* Send button */}
        <button
          type="submit"
          className={`rounded-full w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white ${
            (!message.trim() && !isRecording) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={(!message.trim() && !isRecording) || disabled}
        >
          <PaperAirplaneIcon className="w-5 h-5 transform rotate-90" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
