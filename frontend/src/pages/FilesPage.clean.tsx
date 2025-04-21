import React, { useState, useEffect } from 'react';
import { FileUploader, FilePreview, FileData, FileSearch } from '../components/FileManagement';
import { fileService, messageService, userService } from '../services/api';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, EllipsisVerticalIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

// Type adapté pour nos besoins internes
interface File {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  publicUrl: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  conversationId?: string;
}

// Interface pour les conversations
interface Conversation {
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

// Interface pour les utilisateurs
interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

// Interface pour les messages
interface Message {
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

// Fonction pour convertir notre format de fichier interne vers le format attendu par les composants
const convertToFileData = (file: File): FileData => ({
  id: file._id,
  originalName: file.originalName,
  mimeType: file.mimeType,
  size: file.size,
  publicUrl: file.publicUrl,
});

const FilesPage: React.FC = () => {
  // États pour les fichiers
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'audio' | 'video' | 'document'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc'>('date_desc');
  
  // États pour les conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // État pour l'utilisateur courant
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // État pour la UI
  const [view, setView] = useState<'unread' | 'all' | 'team'>('all');
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [showStore, setShowStore] = useState(true);

  // Charger les fichiers
  useEffect(() => {
    fetchFiles();
  }, [currentPage, selectedType, searchQuery, sortOption]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10
      };
      
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      
      if (searchQuery) {
        params.query = searchQuery;
      }
      
      params.sort = sortOption;
      
      const response = await fileService.getFiles(params);
      
      // Tri côté client si nécessaire
      let sortedFiles = [...response.files];
      if (sortOption === 'name_asc') {
        sortedFiles.sort((a, b) => a.originalName.localeCompare(b.originalName));
      } else if (sortOption === 'name_desc') {
        sortedFiles.sort((a, b) => b.originalName.localeCompare(a.originalName));
      } else if (sortOption === 'size_asc') {
        sortedFiles.sort((a, b) => a.size - b.size);
      } else if (sortOption === 'size_desc') {
        sortedFiles.sort((a, b) => b.size - a.size);
      } else if (sortOption === 'date_asc') {
        sortedFiles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (sortOption === 'date_desc') {
        sortedFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      setFiles(sortedFiles);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Charger plus de fichiers
  const loadMoreFiles = () => {
    if (!isLoading && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Supprimer un fichier
  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles(prev => prev.filter(file => file._id !== fileId));
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  // Gérer la sélection de fichier
  const handleSelectFile = (file: File) => {
    setSelectedFile(convertToFileData(file));
  };

  // Notification de téléchargement réussi
  const handleFileUploaded = (file: any) => {
    fetchFiles();
  };

  // Gérer les erreurs
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Barre de navigation supérieure */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white mr-2">Terrasapp</h1>
          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md">
            Files
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
          <div className="relative">
            <img
              src="https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff"
              alt="User"
              className="h-8 w-8 rounded-full"
            />
          </div>
        </div>
      </div>
      
      {/* Interface à trois colonnes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Colonne 1: Liste des conversations */}
        <div className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          
          {/* Filtres */}
          <div className="px-2 py-3 border-b border-gray-200 dark:border-gray-700 flex space-x-1">
            <button 
              className={`flex-1 px-2 py-1 text-xs rounded-md ${view === 'all' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => setView('all')}
            >
              Tous
            </button>
            <button 
              className={`flex-1 px-2 py-1 text-xs rounded-md ${view === 'unread' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => setView('unread')}
            >
              Non lus
            </button>
            <button 
              className={`flex-1 px-2 py-1 text-xs rounded-md ${view === 'team' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => setView('team')}
            >
              Équipe
            </button>
          </div>
          
          {/* Liste des chats */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-2">
              <h3 className="px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                MES CHATS
              </h3>
              
              {/* Exemple de chats */}
              <div className="mt-1 space-y-1">
                {[1, 2, 3].map((item) => (
                  <div 
                    key={item}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={`https://ui-avatars.com/api/?name=User+${item}&background=0D8ABC&color=fff`}
                          alt="Contact"
                          className="h-10 w-10 rounded-full"
                        />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">User {item}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Dernier message...</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">10:23</div>
                  </div>
                ))}
              </div>
              
              <h3 className="px-4 mt-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CHATS D'ÉQUIPE
              </h3>
              
              {/* Exemple de chats d'équipe */}
              <div className="mt-1 space-y-1">
                {[1, 2].map((item) => (
                  <div 
                    key={item}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                          T{item}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">Team {item}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">5 membres</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Upload de fichiers */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <FileUploader 
              type="image"
              onFileUploaded={handleFileUploaded}
              onError={handleError}
            />
          </div>
        </div>
        
        {/* Colonne 2: Messages et fichiers principaux */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
          {/* En-tête de conversation */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src="https://ui-avatars.com/api/?name=Joana+Martina&background=4F46E5&color=fff"
                  alt="Contact"
                  className="h-9 w-9 rounded-full"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Joana Martina</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">En ligne</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Détails des fichiers et messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading && files.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Chargement...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 text-center">{error}</div>
            ) : files.length === 0 ? (
              <div className="text-center py-20">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun fichier trouvé</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Téléchargez un fichier pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Messages avec fichiers */}
                <div className="flex items-start space-x-3">
                  <img
                    src="https://ui-avatars.com/api/?name=Joana+Martina&background=4F46E5&color=fff"
                    alt="Contact"
                    className="h-9 w-9 rounded-full mt-1"
                  />
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">Joana Martina</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">10:30 AM</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg rounded-tl-none">
                      <p className="text-gray-800 dark:text-gray-200 mb-2">Bonjour! Pouvez-vous m'aider? J'ai vu une veste rouge sur votre site!</p>
                      
                      {/* Galerie de fichiers */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {files.slice(0, 4).map((file, index) => (
                          <div 
                            key={file._id}
                            className="relative rounded-lg overflow-hidden cursor-pointer h-24 bg-gray-200 dark:bg-gray-600"
                            onClick={() => setSelectedFile(convertToFileData(file))}
                          >
                            {file.mimeType.startsWith('image/') ? (
                              <img 
                                src={file.publicUrl} 
                                alt={file.originalName} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Zone de saisie de message */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Tapez un message..."
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full py-2 px-4 text-gray-700 dark:text-white focus:outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                <PaperAirplaneIcon className="w-5 h-5 rotate-90" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Colonne 3: Détails des fichiers/produits */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-medium text-gray-800 dark:text-white">Boutique Terrasapp</h2>
            <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des produits..."
                className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
            {selectedFile ? (
              <div>
                <FilePreview 
                  file={selectedFile}
                  downloadable={true}
                />
                <div className="mt-4 flex justify-center space-x-2">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg flex items-center transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => selectedFile && handleDeleteFile(selectedFile.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg flex items-center transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Produits recommandés */}
                {files.slice(0, 8).map((file, index) => (
                  <div 
                    key={file._id}
                    className="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="relative h-24 bg-gray-200 dark:bg-gray-700">
                      {file.mimeType.startsWith('image/') ? (
                        <img 
                          src={file.publicUrl} 
                          alt={file.originalName} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      {index === 0 && (
                        <span className="absolute top-1 right-1 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded">PROMO</span>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="text-xs font-medium text-gray-800 dark:text-white truncate">{file.originalName}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-600 dark:text-gray-300">{Math.round(file.size / 1024)} KB</span>
                        <button 
                          className="text-xs px-1.5 py-0.5 bg-blue-500 text-white rounded"
                          onClick={() => setSelectedFile(convertToFileData(file))}
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Téléverser un fichier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesPage;
