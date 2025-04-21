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
  const { theme, toggleTheme } = useTheme();
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-20 block md:hidden p-4">
        <button
          className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Terrasapp
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
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
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
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
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
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
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
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
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
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
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
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
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg mb-2"
          >
            {theme === 'dark' ? (
              <>
                <SunIcon className="w-5 h-5 mr-3" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <MoonIcon className="w-5 h-5 mr-3" />
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
                className="mr-3"
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
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
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
                  className="flex items-center w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700 rounded-b-lg"
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
