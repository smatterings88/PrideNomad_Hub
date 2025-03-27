import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './auth/AuthModal';
import ListBusinessModal from './business/ListBusinessModal';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../lib/firebase';
import ProfileDropdown from './ui/ProfileDropdown';
import { exportUnclaimedListings, exportClaimedListings } from '../lib/export';
import { ADMIN_EMAILS } from '../utils/constants';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isListBusinessModalOpen, setIsListBusinessModalOpen] = useState(false);
  const [showAuthWithRedirect, setShowAuthWithRedirect] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const { user, loading, userRole } = useAuth();

  const isHomePage = location.pathname === '/';
  const isOnboardingPage = location.pathname === '/list-business';
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleListBusinessClick = () => {
    if (!user) {
      setShowAuthWithRedirect(true);
      setIsAuthModalOpen(true);
      return;
    }
    navigate('/payment');
  };

  const handleGetStarted = () => {
    setIsListBusinessModalOpen(false);
    setShowAuthWithRedirect(true);
    setIsAuthModalOpen(true);
  };

  const handleExportUnclaimed = async () => {
    try {
      setExportError(null);
      const blob = await exportUnclaimedListings();
      
      // Create filename with current date and time
      const date = new Date();
      const timestamp = date.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('.')[0];
      const filename = `PNH_Unclaimed_Listings_${timestamp}.csv`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting unclaimed listings:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export listings');
      
      // Show error message in an alert
      alert(error instanceof Error ? error.message : 'Failed to export listings');
    }
  };

  const handleExportClaimed = async () => {
    try {
      setExportError(null);
      const blob = await exportClaimedListings();
      
      // Create filename with current date and time
      const date = new Date();
      const timestamp = date.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('.')[0];
      const filename = `PNH_Claimed_Listings_${timestamp}.csv`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting claimed listings:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export listings');
      
      // Show error message in an alert
      alert(error instanceof Error ? error.message : 'Failed to export listings');
    }
  };

  const renderAdminDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
        className="flex items-center gap-1 text-surface-200 hover:text-primary-300"
      >
        Admin Actions
        <ChevronDown className={`h-4 w-4 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {isAdminDropdownOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-surface-800 rounded-lg shadow-lg py-1 z-50">
          <Link
            to="/edit-business"
            className="block px-4 py-2 text-surface-200 hover:bg-surface-700"
            onClick={() => setIsAdminDropdownOpen(false)}
          >
            Edit Business
          </Link>
          <Link
            to="/verify-business"
            className="block px-4 py-2 text-surface-200 hover:bg-surface-700"
            onClick={() => setIsAdminDropdownOpen(false)}
          >
            Verify Business
          </Link>
          <Link
            to="/delete-business"
            className="block px-4 py-2 text-surface-200 hover:bg-surface-700"
            onClick={() => setIsAdminDropdownOpen(false)}
          >
            Delete Business
          </Link>
          <Link
            to="/delete-unclaimed"
            className="block px-4 py-2 text-surface-200 hover:bg-surface-700"
            onClick={() => setIsAdminDropdownOpen(false)}
          >
            Delete Unclaimed Listings
          </Link>
          <Link
            to="/change-owner"
            className="block px-4 py-2 text-surface-200 hover:bg-surface-700"
            onClick={() => setIsAdminDropdownOpen(false)}
          >
            Change Listing Owner
          </Link>
          <Link
            to="/view-claimed"
            className="block px-4 py-2 text-surface-200 hover:bg-surface-700"
            onClick={() => setIsAdminDropdownOpen(false)}
          >
            View Claimed Listings
          </Link>
          <Link
            to="/update-categories"
            className="block px-4 py-2 text-surface-200 hover:bg-surface-700"
            onClick={() => setIsAdminDropdownOpen(false)}
          >
            Update Listing Categories
          </Link>
          <Link
            to="/tier-rules"
            className="block px-4 py-2 text-surface-200 hover:bg-surface-700"
            onClick={() => setIsAdminDropdownOpen(false)}
          >
            Tier Rules
          </Link>
          <Link
            to="/csv-import"
            className="block px-4 py-2 text-surface-200 hover:bg-surface-700"
            onClick={() => setIsAdminDropdownOpen(false)}
          >
            CSV Import
          </Link>
          <Link
            to="/manage-admins"
            className="block px-4 py-2 text-surface-200 hover:bg-surface-700"
            onClick={() => setIsAdminDropdownOpen(false)}
          >
            Manage Admins
          </Link>
          {isAdmin && (
            <button
              onClick={() => {
                handleExportUnclaimed();
                setIsAdminDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-surface-200 hover:bg-surface-700"
            >
              Export Unclaimed Listings
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                handleExportClaimed();
                setIsAdminDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-surface-200 hover:bg-surface-700"
            >
              Export Claimed Listings
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderMenuLinks = () => (
    <>
      <Link to="/" className="text-surface-200 hover:text-primary-300">
        Home
      </Link>
      {isHomePage && (
        <button 
          onClick={() => {
            const categoriesSection = document.querySelector('#categories');
            if (categoriesSection) {
              categoriesSection.scrollIntoView({ behavior: 'smooth' });
              setIsMenuOpen(false);
            }
          }}
          className="text-surface-200 hover:text-primary-300"
        >
          Categories
        </button>
      )}
      {user && isAdmin && (
        <Link to="/list-business" className="text-surface-200 hover:text-primary-300">
          List Business
        </Link>
      )}
      {isAdmin && renderAdminDropdown()}
    </>
  );

  return (
    <header className="fixed w-full bg-surface-900 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/677fafb9f30fd15d312fcafd.png" 
                alt="Logo"
                className="h-8 w-auto"
              />
              <span className="ml-2 text-white text-xs px-2 py-1 bg-primary-600 rounded-md">Beta</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {renderMenuLinks()}
          </nav>

          <div className="flex items-center space-x-4">
            {!isOnboardingPage && (
              <button 
                onClick={handleListBusinessClick}
                className="hidden md:block bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
              >
                Get Listed (FREE)
              </button>
            )}
            {user ? (
              <ProfileDropdown 
                user={user} 
                userRole={userRole}
                onSignOut={handleSignOut} 
              />
            ) : (
              <>
                <button 
                  onClick={() => {
                    setShowAuthWithRedirect(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="hidden md:flex text-surface-200 hover:text-primary-300 items-center"
                >
                  <LogIn className="h-5 w-5 mr-1" />
                  <span>Sign In</span>
                </button>
                {!isOnboardingPage && (
                  <button 
                    onClick={handleListBusinessClick}
                    className="md:hidden bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
                  >
                    Get Listed (FREE)
                  </button>
                )}
              </>
            )}
            <button 
              className="md:hidden text-surface-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-surface-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderMenuLinks()}
            {user ? (
              <button 
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 text-surface-200 hover:text-primary-300"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => {
                  setShowAuthWithRedirect(false);
                  setIsAuthModalOpen(true);
                }}
                className="block w-full text-left px-3 py-2 text-surface-200 hover:text-primary-300"
              >
                Sign In
              </button>
            )}
            {!isOnboardingPage && (
              <button 
                onClick={handleListBusinessClick}
                className="w-full text-left px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
              >
                Get Listed (FREE)
              </button>
            )}
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setShowAuthWithRedirect(false);
        }}
        redirectToPayment={showAuthWithRedirect}
      />

      <ListBusinessModal
        isOpen={isListBusinessModalOpen}
        onClose={() => setIsListBusinessModalOpen(false)}
        onGetStarted={handleGetStarted}
      />
    </header>
  );
}