import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { OfflineProvider } from './context/OfflineContext';

// Composant de personnalisation du thème
import ThemePanel from './components/UI/ThemePanel';

// Layouts
import AppLayout from './components/Layout/AppLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import FilesPage from './pages/FilesPage';
import MessagesPage from './pages/MessagesPage';

// Protected Route component - Toujours autorisé en mode développement
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  console.log('Mode développement activé - Accès sans authentification');
  return <>{element}</>;
};

function App() {
  return (
    <Router>
      <OfflineProvider>
        <AuthProvider>
          <ThemeProvider>
            <ChatProvider>
              {/* Panneau de configuration du thème */}
              <ThemePanel />
            <Routes>
              {/* Redirection directe vers l'application principale au lieu de la page de connexion */}
              <Route path="/login" element={<Navigate to="/files" />} />
              <Route path="/register" element={<Navigate to="/files" />} />
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute element={<AppLayout />} />}>
                <Route index element={<Navigate to="/messages" />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="calls" element={<div>Calls Page</div>} />
                <Route path="contacts" element={<div>Contacts Page</div>} />
                <Route path="files" element={<FilesPage />} />
                <Route path="assistant" element={<div>AI Assistant Page</div>} />
                <Route path="profile" element={<div>Profile Page</div>} />
              </Route>
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            </ChatProvider>
          </ThemeProvider>
        </AuthProvider>
      </OfflineProvider>
    </Router>
  );
}

export default App;
