import React, { useState, useEffect, useRef } from 'react';
import { messageService, userService } from '../services/api';
import {
  ConversationList,
  MessageItem,
  ConversationHeader,
  MessageInput,
  User,
  Conversation,
  Message
} from '../components/MessageComponents';

// Le fichier utilise maintenant les types importés depuis les composants

const MessagesPage: React.FC = () => {
  // États pour les conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Référence pour le scroll automatique
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Récupérer les conversations au chargement
  useEffect(() => {
    fetchConversations();
    fetchContacts();
    fetchCurrentUser();
  }, []);

  // Scroll automatique quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Récupérer les messages lorsqu'une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCurrentUser = async () => {
    try {
      // Simuler un utilisateur en mode développement
      const mockUser: User = {
        _id: 'current-user-id',
        name: 'Utilisateur Actuel',
        email: 'user@example.com',
        status: 'online'
      };
      setCurrentUser(mockUser);
      
      // Note: Dans une implémentation réelle, utilisez:
      // const user = await userService.getCurrentUser();
      // setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await messageService.getConversations();
      setConversations(response);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await userService.getContacts();
      setContacts(response);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const response = await messageService.getMessages(conversationId);
      setMessages(response);
      // Marquer les messages comme lus
      const unreadMessages = response
        .filter((msg: Message) => !msg.isRead && msg.sender._id !== currentUser?._id)
        .map((msg: Message) => msg._id);
      
      if (unreadMessages.length > 0) {
        // Dans une implémentation réelle, utilisez:
        // await messageService.markAsRead(conversationId, unreadMessages);
        console.log(`Marquage de ${unreadMessages.length} messages comme lus`);
        // Mettre à jour la liste des conversations pour refléter les messages lus
        setConversations(prev => 
          prev.map(conv => 
            conv._id === conversationId ? { ...conv, unread: 0 } : conv
          )
        );
      }
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedConversation) return;

    try {
      const messageData = {
        content,
        contentType: 'text' as const
      };
      
      // Optimistic update
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`,
        sender: currentUser!,
        content,
        contentType: 'text',
        createdAt: new Date().toISOString(),
        isRead: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Envoyer le message au serveur
      // Dans l'API réelle, modifiez selon la signature correcte de la fonction
      await messageService.sendMessage({
        recipientId: selectedConversation.participants.find(p => p._id !== currentUser?._id)?._id || '',
        content: content,
        contentType: 'text',
        conversationId: selectedConversation._id
      });
      
      // Mettre à jour la conversation avec le nouveau dernier message
      setConversations(prev => 
        prev.map(conv => 
          conv._id === selectedConversation._id 
            ? { 
                ...conv, 
                lastMessage: {
                  content,
                  sender: currentUser?._id || '',
                  timestamp: new Date().toISOString()
                } 
              } 
            : conv
        )
      );
      
      // Recharger les messages pour obtenir la version finale du serveur
      fetchMessages(selectedConversation._id);
    } catch (error) {
      console.error('Error sending message:', error);
      // Retirer le message optimiste en cas d'erreur
      setMessages(prev => prev.filter(msg => !msg._id.startsWith('temp-')));
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar des conversations avec le composant ConversationList */}
      <ConversationList 
        conversations={conversations}
        currentUser={currentUser}
        selectedConversation={selectedConversation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectConversation={setSelectedConversation}
      />
      
      {/* Zone de conversation */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Entête avec le composant ConversationHeader */}
          <ConversationHeader 
            conversation={selectedConversation}
            currentUser={currentUser}
          />
          
          {/* Messages avec le composant MessageItem */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <MessageItem 
                key={message._id}
                message={message}
                isCurrentUser={message.sender._id === currentUser?._id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Zone de saisie avec le composant MessageInput */}
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <img 
              src="/chat-placeholder.svg" 
              alt="Select a conversation" 
              className="h-32 w-32 mx-auto opacity-60"
            />
            <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
              Sélectionnez une conversation
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              ou démarrez une nouvelle discussion
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
