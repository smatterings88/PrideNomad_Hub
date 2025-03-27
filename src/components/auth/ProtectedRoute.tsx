import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from './AuthModal';
import { ADMIN_EMAILS } from '../../utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedEmail?: string;
}

export default function ProtectedRoute({ children, allowedEmail }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // If no user is logged in, show auth modal instead of redirecting
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-surface-100 pt-16 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <h2 className="text-2xl font-bold text-surface-900 mb-4">Authentication Required</h2>
            <p className="text-surface-600 mb-6">
              You need to sign in to access this page.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  // If allowedEmail is specified, check if the user's email is in the admin list
  if (allowedEmail) {
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}