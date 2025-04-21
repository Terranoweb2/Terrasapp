import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ConversationHeader from './ConversationHeader';
import MessageInput from './MessageInput';
import Message from './Message';
import { fileService } from '../../services/api';

const ChatContainer: React.FC = () => {
  const { 
    currentConversation, 
    messages, 
    sendMessage, 
    loadMoreMessages, 
    deleteMessage,
    socket
  } = useChat();
  
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Detect when not scrolled to bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isScrolledToBottom);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Scroll to bottom button handler
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Infinite scroll for loading more messages
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && !isLoading) {
      setIsLoading(true);
      const initialHeight = e.currentTarget.scrollHeight;
      
      await loadMoreMessages();
      
      // Maintain scroll position after loading more messages
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const newHeight = messagesContainerRef.current.scrollHeight;
          messagesContainerRef.current.scrollTop = newHeight - initialHeight;
        }
        setIsLoading(false);
      }, 100);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = (
    content: string, 
    contentType: string = 'text', 
    fileUrl?: string, 
    fileName?: string, 
    fileSize?: number
  ) => {
    // Add reply info if replying
    const replyData = replyTo ? { replyTo: replyTo.id } : undefined;
    
    // Send message
    sendMessage(content, contentType, fileUrl, fileName, fileSize);
    
    // Clear reply
    setReplyTo(null);
  };
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      // Determine file type
      const fileType = file.type.startsWith('image/') 
        ? 'image' 
        : file.type.startsWith('audio/') 
          ? 'audio' 
          : file.type.startsWith('video/') 
            ? 'video' 
            : 'document';
      
      // Upload to server
      const { file: uploadedFile } = await fileService.uploadFile(
        file, 
        fileType as any, 
        currentConversation?._id
      );
      
      return {
        url: uploadedFile.publicUrl,
        name: uploadedFile.originalName,
        size: uploadedFile.size
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  };
  
  // Handle typing indicators
  const handleTypingStart = () => {
    if (socket && currentConversation) {
      const otherParticipant = currentConversation.participants.find(
        p => p._id !== user?.id
      );
      
      if (otherParticipant) {
        socket.emit('typing:start', {
          conversationId: currentConversation._id,
          recipientId: otherParticipant._id
        });
      }
    }
  };
  
  const handleTypingStop = () => {
    if (socket && currentConversation) {
      const otherParticipant = currentConversation.participants.find(
        p => p._id !== user?.id
      );
      
      if (otherParticipant) {
        socket.emit('typing:stop', {
          conversationId: currentConversation._id,
          recipientId: otherParticipant._id
        });
      }
    }
  };
  
  // Audio recording handlers
  const handleStartRecording = () => {
    setIsRecording(true);
    // In a real app, this would start recording audio
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
    // In a real app, this would stop recording, get the audio file, and upload it
  };
  
  // Call handlers
  const handleAudioCall = (recipientId: string) => {
    if (socket) {
      socket.emit('call:initiate', {
        recipientId,
        callType: 'audio'
      });
    }
  };
  
  const handleVideoCall = (recipientId: string) => {
    if (socket) {
      socket.emit('call:initiate', {
        recipientId,
        callType: 'video'
      });
    }
  };
  
  // Handle showing user/group info
  const handleShowInfo = () => {
    // This would open a sidebar or modal with user/group info
    console.log('Show info for conversation:', currentConversation?._id);
  };
  
  // If no conversation is selected
  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Select a conversation or start a new chat
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your messages will appear here
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Conversation header */}
      <ConversationHeader
        conversationId={currentConversation._id}
        participants={currentConversation.participants.map(p => ({
          id: p._id,
          name: p.name,
          avatar: p.avatar,
          status: p.status,
          lastSeen: p.lastSeen
        }))}
        isGroup={currentConversation.isGroup}
        groupName={currentConversation.groupName}
        onAudioCall={handleAudioCall}
        onVideoCall={handleVideoCall}
        onShowInfo={handleShowInfo}
        currentUserId={user?.id || ''}
      />
      
      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
        onScroll={handleScroll}
      >
        {/* Loading indicator for older messages */}
        {isLoading && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>No messages yet</p>
              <p className="text-sm mt-1">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message._id}
              id={message._id}
              content={message.content}
              contentType={message.contentType}
              sender={{
                id: message.sender._id,
                name: message.sender.name,
                avatar: message.sender.avatar
              }}
              timestamp={new Date(message.createdAt)}
              isCurrentUser={message.sender._id === user?.id}
              fileUrl={message.fileUrl}
              fileName={message.fileName}
              fileSize={message.fileSize}
              isRead={!!message.readAt}
              replyTo={message.replyTo}
              onDelete={deleteMessage}
              onReply={setReplyTo}
              onImageClick={(url) => window.open(url, '_blank')}
            />
          ))
        )}
        
        {/* Dummy div for scrolling to bottom */}
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <button
            className="fixed bottom-20 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
};

export default ChatContainer;
