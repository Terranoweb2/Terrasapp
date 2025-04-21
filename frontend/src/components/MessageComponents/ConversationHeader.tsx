import React from 'react';
import { 
  PhoneIcon, 
  VideoCameraIcon, 
  InformationCircleIcon, 
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { Conversation, User } from './ConversationList';

interface ConversationHeaderProps {
  conversation: Conversation;
  currentUser: User | null;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ 
  conversation, 
  currentUser 
}) => {
  // Obtenir le nom de la conversation
  const getConversationName = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.groupName || 'Groupe sans nom';
    } else {
      const otherParticipant = conversation.participants.find(p => p._id !== currentUser?._id);
      return otherParticipant?.name || 'Conversation';
    }
  };

  // Obtenir l'avatar de la conversation
  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.groupAvatar || '/default-group.png';
    } else {
      const otherParticipant = conversation.participants.find(p => p._id !== currentUser?._id);
      return otherParticipant?.avatar || '/default-avatar.png';
    }
  };

  // Obtenir le statut de la conversation
  const getConversationStatus = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return `${conversation.participants.length} participants`;
    } else {
      const otherParticipant = conversation.participants.find(p => p._id !== currentUser?._id);
      return otherParticipant?.status === 'online' ? 'En ligne' : 'Hors ligne';
    }
  };

  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="flex items-center">
        <img
          src={getConversationAvatar(conversation)}
          alt={getConversationName(conversation)}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            {getConversationName(conversation)}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getConversationStatus(conversation)}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
          <PhoneIcon className="h-5 w-5" />
        </button>
        <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
          <VideoCameraIcon className="h-5 w-5" />
        </button>
        <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
          <InformationCircleIcon className="h-5 w-5" />
        </button>
        <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ConversationHeader;
