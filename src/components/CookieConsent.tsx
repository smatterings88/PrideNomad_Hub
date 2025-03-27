import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookieConsent');
    if (hasAccepted) {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-900 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm md:text-base">
          We use cookies to improve your experience. By continuing to use this site, you agree to our use of cookies and our{' '}
          <Link to="/privacy" className="text-primary-300 hover:text-primary-200 underline">
            Privacy Policy
          </Link>.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-md text-sm transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => setAccepted(true)}
            className="text-surface-300 hover:text-white"
            aria-label="Close cookie consent"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}