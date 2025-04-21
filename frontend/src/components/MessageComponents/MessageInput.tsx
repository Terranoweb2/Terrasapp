import React, { useState } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, FaceSmileIcon } from '@heroicons/react/24/outline';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button 
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          title="Ajouter un emoji"
        >
          <FaceSmileIcon className="h-5 w-5" />
        </button>
        <input
          type="text"
          placeholder="Tapez un message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-1 bg-transparent py-2 px-3 outline-none text-gray-800 dark:text-white"
        />
        <button 
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          title="Joindre un fichier"
        >
          <PaperClipIcon className="h-5 w-5" />
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!message.trim()}
          className={`p-2 rounded-r-lg ${
            message.trim() 
              ? 'text-blue-500 hover:text-blue-600' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Envoyer"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
