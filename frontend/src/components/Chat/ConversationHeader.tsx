import React, { useState } from 'react';
import Avatar from '../UI/Avatar';
import { 
  PhoneIcon, 
  VideoCameraIcon, 
  InformationCircleIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/solid';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy' | 'in-call';
  lastSeen?: Date;
}

interface ConversationHeaderProps {
  conversationId: string;
  participants: Participant[];
  isGroup: boolean;
  groupName?: string;
  onAudioCall: (recipientId: string) => void;
  onVideoCall: (recipientId: string) => void;
  onShowInfo: () => void;
  currentUserId: string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversationId,
  participants,
  isGroup,
  groupName,
  onAudioCall,
  onVideoCall,
  onShowInfo,
  currentUserId
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Get other participant for 1:1 conversations
  const otherParticipant = !isGroup
    ? participants.find(p => p.id !== currentUserId)
    : null;

  // Format participant status
  const formatStatus = (participant: Participant) => {
    if (!participant) return '';
    
    if (participant.status === 'online') return 'Online';
    if (participant.status === 'in-call') return 'In a call';
    if (participant.status === 'away') return 'Away';
    if (participant.status === 'busy') return 'Busy';
    
    if (participant.lastSeen) {
      const lastSeen = new Date(participant.lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
    
    return 'Offline';
  };

  // Get name to display
  const displayName = isGroup 
    ? groupName || `Group (${participants.length})` 
    : otherParticipant?.name || 'Unknown User';

  // Get status to display
  const displayStatus = isGroup
    ? `${participants.length} participants`
    : formatStatus(otherParticipant as Participant);

  // Handle call actions
  const handleAudioCall = () => {
    if (otherParticipant) {
      onAudioCall(otherParticipant.id);
    }
  };

  const handleVideoCall = () => {
    if (otherParticipant) {
      onVideoCall(otherParticipant.id);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* User/Group info */}
      <div className="flex items-center">
        {isGroup ? (
          <Avatar 
            name={groupName || 'Group'} 
            size="md" 
          />
        ) : (
          <Avatar 
            name={otherParticipant?.name || 'User'} 
            src={otherParticipant?.avatar}
            status={otherParticipant?.status}
            size="md"
          />
        )}
        
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {displayName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {displayStatus}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-2">
        {!isGroup && (
          <>
            <button 
              onClick={handleAudioCall}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Audio call"
              disabled={otherParticipant?.status === 'offline' || otherParticipant?.status === 'in-call'}
            >
              <PhoneIcon className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleVideoCall}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Video call"
              disabled={otherParticipant?.status === 'offline' || otherParticipant?.status === 'in-call'}
            >
              <VideoCameraIcon className="w-5 h-5" />
            </button>
          </>
        )}
        
        <button 
          onClick={onShowInfo}
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Conversation info"
        >
          <InformationCircleIcon className="w-5 h-5" />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
            aria-label="More options"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
              <div className="py-1">
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => {
                    onShowInfo();
                    setShowMenu(false);
                  }}
                >
                  View profile
                </button>
                {isGroup && (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => {
                      // Handle group settings
                      setShowMenu(false);
                    }}
                  >
                    Group settings
                  </button>
                )}
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                  onClick={() => {
                    // Handle block or leave group
                    setShowMenu(false);
                  }}
                >
                  {isGroup ? 'Leave group' : 'Block user'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;
