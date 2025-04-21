import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage: {
    content: string;
    sender: string;
    timestamp: string;
  };
  unread: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  currentUser: User | null;
  selectedConversation: Conversation | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUser,
  selectedConversation,
  searchQuery,
  setSearchQuery,
  onSelectConversation
}) => {
  // Formater le temps du dernier message
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'HH:mm');
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: fr });
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

  // Filtrer les conversations en fonction de la recherche
  const filterConversations = () => {
    if (!searchQuery) return conversations;
    
    return conversations.filter(conv => {
      if (conv.isGroup && conv.groupName) {
        return conv.groupName.toLowerCase().includes(searchQuery.toLowerCase());
      } else {
        // Filtrer par noms des participants (hors utilisateur courant)
        return conv.participants.some(
          p => p._id !== currentUser?._id && 
               p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    });
  };

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

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Messages</h1>
        <div className="mt-2 relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filterConversations().map((conversation) => (
          <div
            key={conversation._id}
            onClick={() => onSelectConversation(conversation)}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
              selectedConversation?._id === conversation._id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={getConversationAvatar(conversation)}
                alt={getConversationName(conversation)}
                className="h-12 w-12 rounded-full object-cover"
              />
              {conversation.participants.some(p => p.status === 'online' && p._id !== currentUser?._id) && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getConversationName(conversation)}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatMessageTime(conversation.lastMessage.timestamp)}
                </span>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {conversation.lastMessage.sender === currentUser?._id ? 'Vous: ' : ''}
                  {conversation.lastMessage.content}
                </p>
                {conversation.unread > 0 && (
                  <span className="flex-shrink-0 ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                    {conversation.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          Nouvelle conversation
        </button>
      </div>
    </div>
  );
};

export default ConversationList;
