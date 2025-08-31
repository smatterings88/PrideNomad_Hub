import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, User, Heart, Calendar, Building2, CalendarCheck, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import md5 from 'md5';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ProfileDropdownProps {
  user: FirebaseUser;
  userRole: string;
  onSignOut: () => void;
}

export default function ProfileDropdown({ user, userRole, onSignOut }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ownsBusinesses, setOwnsBusinesses] = useState(false);
  const [hasPendingClaims, setHasPendingClaims] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkBusinessOwnership = async () => {
      if (!user) return;

      try {
        // Check business ownership
        const businessesRef = collection(db, 'businesses');
        const q = query(businessesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        setOwnsBusinesses(!querySnapshot.empty);

        // Check pending claims
        const pendingClaimsRef = collection(db, 'pendingClaims');
        const pendingQuery = query(
          pendingClaimsRef, 
          where('userId', '==', user.uid),
          where('status', '==', 'pending')
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        setHasPendingClaims(!pendingSnapshot.empty);
      } catch (error) {
        console.error('Error checking business ownership:', error);
      }
    };

    checkBusinessOwnership();
  }, [user]);

  const handleSignOut = () => {
    setIsOpen(false);
    onSignOut();
  };

  const handleListEventClick = () => {
    navigate('/create-event');
  };

  const getGravatarUrl = (email: string) => {
    const hash = md5(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=40`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-surface-200 hover:text-primary-300 transition-colors"
      >
        <img
          src={getGravatarUrl(user.email || '')}
          alt="User avatar"
          className="w-8 h-8 rounded-full"
        />
        <span>{user.displayName || user.email?.split('@')[0]}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-surface-200">
            <div className="flex items-center gap-2 text-surface-600">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{userRole}</span>
            </div>
          </div>
          <Link
            to="/my-listings"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-surface-700 hover:bg-surface-100 transition-colors"
          >
            <Building2 className="h-4 w-4 mr-2" />
            My Listings
          </Link>
          <Link
            to="/favorite-listings"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-surface-700 hover:bg-surface-100 transition-colors"
          >
            <Heart className="h-4 w-4 mr-2" />
            Favorite Listings
          </Link>
          <Link
            to="/my-events"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-surface-700 hover:bg-surface-100 transition-colors"
          >
            <CalendarCheck className="h-4 w-4 mr-2" />
            My Events
          </Link>
          {hasPendingClaims && (
            <Link
              to="/pending-claims"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending Claims
            </Link>
          )}
          <button
            onClick={() => {
              setIsOpen(false);
              handleListEventClick();
            }}
            className="w-full flex items-center px-4 py-2 text-surface-700 hover:bg-surface-100 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Create Event
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-surface-700 hover:bg-surface-100 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}