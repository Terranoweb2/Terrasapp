import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../UI/Avatar';
import { 
  ChatBubbleLeftRightIcon, 
  PhoneIcon, 
  UserGroupIcon, 
  FolderIcon, 
  BoltIcon,
  MoonIcon,
  SunIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleThemeMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // User menu toggle
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-20 block md:hidden p-4">
        <button
          className="text-[#8b5cf6] hover:text-[#7c3aed] dark:text-[#a78bfa] dark:hover:text-[#c4b5fd]"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Left sidebar navigation */}
      <div 
        className={`fixed md:static inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-300 ease-in-out`}
      >
        {/* App branding */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-[#8b5cf6] dark:bg-[#6d28d9] terrasapp-nav">
          <h1 className="text-xl font-bold text-white">
            Terrasapp
          </h1>
          <p className="text-sm text-[#ede9fe] opacity-80">
            Connect with anyone, anywhere
          </p>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg ${
                isActive
                  ? 'bg-terra-100 text-terra-700 dark:bg-terra-900/50 dark:text-terra-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3" />
            <span>Messages</span>
          </NavLink>

          <NavLink
            to="/calls"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg ${
                isActive
                  ? 'bg-terra-100 text-terra-700 dark:bg-terra-900/50 dark:text-terra-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <PhoneIcon className="w-5 h-5 mr-3" />
            <span>Calls</span>
          </NavLink>

          <NavLink
            to="/contacts"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg ${
                isActive
                  ? 'bg-terra-100 text-terra-700 dark:bg-terra-900/50 dark:text-terra-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <UserGroupIcon className="w-5 h-5 mr-3" />
            <span>Contacts</span>
          </NavLink>

          <NavLink
            to="/files"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg ${
                isActive
                  ? 'bg-terra-100 text-terra-700 dark:bg-terra-900/50 dark:text-terra-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <FolderIcon className="w-5 h-5 mr-3" />
            <span>Files</span>
          </NavLink>

          <NavLink
            to="/assistant"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg ${
                isActive
                  ? 'bg-terra-100 text-terra-700 dark:bg-terra-900/50 dark:text-terra-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <BoltIcon className="w-5 h-5 mr-3" />
            <span>AI Assistant</span>
          </NavLink>
        </nav>

        {/* Bottom section with theme toggle and user profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Theme toggle */}
          <button
            onClick={toggleThemeMode}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg mb-2"
          >
            {theme.mode === 'dark' ? (
              <>
                <SunIcon className="w-5 h-5 mr-3 text-yellow-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <MoonIcon className="w-5 h-5 mr-3 text-indigo-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* User profile */}
          <div className="relative">
            <button
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
              onClick={toggleUserMenu}
            >
              <Avatar
                name={user?.name || 'User'}
                src={user?.avatar}
                size="sm"
                className="mr-3 terrasapp-avatar"
              />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">{user?.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </div>
              </div>
            </button>

            {/* User dropdown menu */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-terra border border-gray-200 dark:border-gray-700">
                <NavLink
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-t-lg"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setMobileMenuOpen(false);
                  }}
                >
                  Profile Settings
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-terra-500 focus:ring-opacity-50"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <Outlet />
      </div>
      
      {/* Bottom navigation bar for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-[#8b5cf6] dark:bg-[#6d28d9] border-t border-gray-200 dark:border-gray-700 terrasapp-nav">
        <div className="flex justify-around">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`
            }
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Messages</span>
          </NavLink>
          
          <NavLink
            to="/calls"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`
            }
          >
            <PhoneIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Calls</span>
          </NavLink>
          
          <div className="relative flex items-center justify-center">
            <button className="bg-[#3b82f6] w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transform -translate-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <NavLink
            to="/contacts"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`
            }
          >
            <UserGroupIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Contacts</span>
          </NavLink>
          
          <NavLink
            to="/files"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`
            }
          >
            <FolderIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Files</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
