import React, { useState } from 'react';
import { X } from 'lucide-react';
import { auth, setUserRole } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectToPayment?: boolean;
}

export default function AuthModal({ isOpen, onClose, redirectToPayment = false }: AuthModalProps) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`.trim()
        });
        await setUserRole(user.uid, 'Regular User');
        await sendEmailVerification(user);
        setVerificationSent(true);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        if (redirectToPayment) {
          // Don't navigate here - let the parent component handle it
          onClose();
        } else {
          onClose();
        }
      }
    } catch (err) {
      let errorMessage = 'An error occurred';
      if (err instanceof Error) {
        switch (err.message) {
          case 'Firebase: Error (auth/user-not-found).':
            errorMessage = 'No account found with this email address';
            break;
          case 'Firebase: Error (auth/wrong-password).':
            errorMessage = 'Incorrect password';
            break;
          case 'Firebase: Error (auth/invalid-email).':
            errorMessage = 'Invalid email address';
            break;
          case 'Firebase: Error (auth/email-already-in-use).':
            errorMessage = 'An account already exists with this email';
            break;
          case 'Firebase: Password should be at least 6 characters (auth/weak-password).':
            errorMessage = 'Password should be at least 6 characters';
            break;
          default:
            errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err) {
      let errorMessage = 'Failed to send reset email';
      if (err instanceof Error) {
        switch (err.message) {
          case 'Firebase: Error (auth/user-not-found).':
            errorMessage = 'No account found with this email address';
            break;
          case 'Firebase: Error (auth/invalid-email).':
            errorMessage = 'Invalid email address';
            break;
          default:
            errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setVerificationSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    }
  };

  if (resetEmailSent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-surface-500 hover:text-surface-700"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-surface-900">Check Your Email</h2>
            <p className="text-surface-600 mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <button
              onClick={onClose}
              className="text-primary-500 hover:text-primary-600"
            >
              Return to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (verificationSent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-surface-500 hover:text-surface-700"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-surface-900">Verify Your Email</h2>
            <p className="text-surface-600 mb-6">
              We've sent a verification link to <strong>{email}</strong>. 
              Please check your inbox and click the link to verify your email address.
            </p>
            <button
              onClick={handleResendVerification}
              className="text-primary-500 hover:text-primary-600"
            >
              Resend verification email
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-surface-500 hover:text-surface-700"
          >
            <X className="h-6 w-6" />
          </button>
          
          <h2 className="text-2xl font-bold mb-6 text-surface-900">Reset Password</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="text-primary-500 hover:text-primary-600 text-sm"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-surface-500 hover:text-surface-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-surface-900">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-surface-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required={isSignUp}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-surface-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required={isSignUp}
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Forgot password?
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setFirstName('');
              setLastName('');
              setVerificationSent(false);
            }}
            className="text-primary-500 hover:text-primary-600 text-sm"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}