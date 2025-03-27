import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset, auth } from '../../lib/firebase';

// Types
type ActionStatus = 'verifying' | 'success' | 'error' | 'resetPassword';

interface ContentConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
}

// Constants
const LOGO_URL = "https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/677fafb9db11b108e795f5ad.png";
const MIN_PASSWORD_LENGTH = 6;
const REDIRECT_DELAY = 3000;

export default function EmailVerificationHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ActionStatus>('verifying');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleAction();
  }, [searchParams]);

  const handleAction = async () => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (!oobCode) {
      setStatus('error');
      setError('Invalid verification link');
      return;
    }

    try {
      if (mode === 'resetPassword') {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
        setStatus('resetPassword');
      } else if (mode === 'verifyEmail') {
        await applyActionCode(auth, oobCode);
        setStatus('success');
      } else {
        setStatus('error');
        setError('Invalid action mode');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Action failed');
      console.error('Action error:', err);
    }
  };

  const validatePasswords = (): string | null => {
    if (newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return `Password should be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    return null;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationError = validatePasswords();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setError('Invalid reset code');
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setTimeout(() => navigate('/', { replace: true }), REDIRECT_DELAY);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (!(error instanceof Error)) return 'Failed to reset password';

    const errorMessages: Record<string, string> = {
      'Firebase: Error (auth/expired-action-code).': 'This password reset link has expired. Please request a new one.',
      'Firebase: Error (auth/invalid-action-code).': 'This password reset link is invalid. Please request a new one.',
      'Firebase: Error (auth/weak-password).': `Password should be at least ${MIN_PASSWORD_LENGTH} characters`
    };

    return errorMessages[error.message] || error.message;
  };

  const renderLogo = () => (
    <img 
      src={LOGO_URL}
      alt="Logo"
      className="h-16 mx-auto mb-6"
    />
  );

  const renderPasswordResetForm = () => (
    <div className="min-h-screen flex items-center justify-center bg-surface-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {renderLogo()}
        <h2 className="text-2xl font-bold text-surface-900 mb-4">Reset Your Password</h2>
        <p className="text-surface-600 mb-6">Enter a new password for {email}</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={loading}
              minLength={MIN_PASSWORD_LENGTH}
            />
          </div>
          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={loading}
              minLength={MIN_PASSWORD_LENGTH}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );

  const getContentConfig = (): ContentConfig => {
    const configs: Record<ActionStatus, ContentConfig> = {
      verifying: {
        icon: <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4" />,
        title: "Verifying",
        message: "Please wait while we process your request..."
      },
      error: {
        icon: (
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ),
        title: "Action Failed",
        message: error
      },
      success: {
        icon: (
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ),
        title: "Success!",
        message: searchParams.get('mode') === 'resetPassword'
          ? "Your password has been reset successfully. You will be redirected to sign in..."
          : "Your action has been completed successfully. You can now sign in to your account."
      },
      resetPassword: {
        icon: <div />,
        title: "",
        message: ""
      }
    };

    return configs[status];
  };

  const renderContent = () => {
    if (status === 'resetPassword') {
      return renderPasswordResetForm();
    }

    const content = getContentConfig();

    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          {renderLogo()}
          {content.icon}
          <h2 className="text-2xl font-bold text-surface-900 mb-2">{content.title}</h2>
          <p className="text-surface-600 mb-4">{content.message}</p>
          {status !== 'verifying' && (
            <button
              onClick={() => navigate('/', { replace: true })}
              className={`${status === 'success' ? 'bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600' : 'text-primary-500 hover:text-primary-600'} 
                transition-colors`}
            >
              {status === 'success' ? 'Continue to Sign In' : 'Return to Home'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return renderContent();
}