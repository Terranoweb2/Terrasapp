import React from 'react';
// Utilisation de notre utilitaire personnalisé de formatage de date
import { format, isSameDay, subtractDays, isWithinLastDays } from '../../utils/dateUtils';
import Avatar from '../UI/Avatar';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    timestamp: Date;
    contentType?: string;
  };
  unreadCount: number;
  isGroup: boolean;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'away' | 'busy' | 'in-call';
  }>;
  isActive?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelect: (conversationId: string) => void;
  onNewChat: () => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelect,
  onNewChat,
  onSearch,
  isLoading = false,
}) => {
  // Format last message timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // Today
    if (isSameDay(messageDate, now)) {
      return format(messageDate, 'HH:mm');
    }
    
    // Within a week
    if (isWithinLastDays(messageDate, 7)) {
      return format(messageDate, 'EEE');
    }
    
    // Earlier than a week
    return format(messageDate, 'dd/MM/yyyy');
  };

  // Format last message preview
  const formatMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const { content, contentType } = conversation.lastMessage;
    
    switch (contentType) {
      case 'image':
        return '📷 Image';
      case 'audio':
        return '🎤 Voice message';
      case 'video':
        return '🎬 Video';
      case 'document':
        return '📄 Document';
      case 'location':
        return '📍 Location';
      default:
        return content.length > 40 ? `${content.substring(0, 40)}...` : content;
    }
  };

  // Get conversation name and avatar
  const getConversationDetails = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return {
        name: conversation.name,
        avatar: conversation.avatar,
      };
    }
    
    // For 1:1 conversations, get the other participant
    const otherParticipant = conversation.participants.find(p => 
      p.id !== localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : ''
    );
    
    return {
      name: otherParticipant?.name || 'Unknown User',
      avatar: otherParticipant?.avatar,
      status: otherParticipant?.status,
    };
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Messages
        </h2>
      </div>
      
      {/* Search and New Chat */}
      <div className="p-3 space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-full py-2 pl-10 pr-4 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={(e) => onSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 flex items-center justify-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Chat</span>
        </button>
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No conversations yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation) => {
              const { name, avatar, status } = getConversationDetails(conversation);
              const isSelected = selectedConversationId === conversation.id;
              
              return (
                <li
                  key={conversation.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => onSelect(conversation.id)}
                >
                  <div className="relative px-4 py-3 flex items-center cursor-pointer">
                    <Avatar 
                      name={name} 
                      src={avatar} 
                      status={status}
                      size="md"
                    />
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {name}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {formatMessagePreview(conversation)}
                      </div>
                    </div>
                    
                    {conversation.unreadCount > 0 && (
                      <div className="ml-2 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
