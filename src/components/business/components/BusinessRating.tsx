import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { Star } from 'lucide-react';
import AuthModal from '../../auth/AuthModal';

interface BusinessRatingProps {
  businessId: string;
  initialRating?: number;
  totalRatings?: number;
  isUnclaimed?: boolean;
}

export default function BusinessRating({ 
  businessId, 
  initialRating = 0, 
  totalRatings = 0,
  isUnclaimed = false 
}: BusinessRatingProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(totalRatings);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  useEffect(() => {
    // Don't fetch ratings for unclaimed businesses
    if (isUnclaimed) {
      setLoading(false);
      return;
    }

    const fetchRatings = async () => {
      try {
        // Fetch all ratings for the business
        const ratingsRef = collection(db, `businesses/${businessId}/ratings`);
        const ratingsSnapshot = await getDocs(query(ratingsRef, orderBy('timestamp', 'desc')));
        
        // Calculate average rating
        let total = 0;
        let count = ratingsSnapshot.size;
        
        ratingsSnapshot.forEach(doc => {
          total += doc.data().rating;
          // If user is logged in, check if they have rated
          if (auth.currentUser && doc.id === auth.currentUser.uid) {
            setUserRating(doc.data().rating);
          }
        });

        const average = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
        setAverageRating(average);
        setRatingCount(count);
      } catch (error) {
        // Set default values on error
        setAverageRating(0);
        setRatingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [businessId, isUnclaimed]);

  const handleRatingChange = async (newRating: number) => {
    if (isUnclaimed) {
      return;
    }

    if (!auth.currentUser) {
      setShowAuthModal(true);
      return;
    }

    const oldRating = userRating;
    const userId = auth.currentUser.uid;
    
    try {
      const ratingRef = doc(db, `businesses/${businessId}/ratings/${userId}`);

      // Save the new rating
      await setDoc(ratingRef, {
        userId,
        rating: newRating,
        timestamp: new Date()
      });

      // Update local state
      setUserRating(newRating);
      setRatingCount(prev => oldRating ? prev : prev + 1);
      
      // Recalculate average
      const total = (averageRating * ratingCount) - (oldRating || 0) + newRating;
      const newCount = oldRating ? ratingCount : ratingCount + 1;
      const newAverage = Math.round((total / newCount) * 10) / 10;
      
      setAverageRating(newAverage);
      setShowRatingModal(false);
    } catch (error) {
      console.error('Error saving rating:', error);
      // Revert UI state on error
      setUserRating(oldRating);
    }
  };

  const renderStars = (interactive: boolean = false) => {
    const stars = [];
    const displayRating = interactive 
      ? (hoveredRating ?? userRating ?? 0)
      : averageRating;

    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => handleRatingChange(i)}
            onMouseEnter={() => setHoveredRating(i)}
            onMouseLeave={() => setHoveredRating(null)}
            className="focus:outline-none"
            disabled={isUnclaimed}
          >
            <Star 
              className={`w-6 h-6 ${i <= displayRating ? 'fill-current text-yellow-400' : 'text-surface-400'}`}
            />
          </button>
        );
      } else {
        stars.push(
          <Star 
            key={i}
            className={`w-6 h-6 ${i <= displayRating ? 'fill-current text-yellow-400' : 'text-white'}`}
          />
        );
      }
    }

    return stars;
  };

  const RatingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-surface-900 mb-6">Rate this Business</h2>
        
        <div className="flex justify-center mb-8">
          <div className="flex">
            {renderStars(true)}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowRatingModal(false)}
            className="px-4 py-2 text-surface-600 hover:text-surface-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 text-surface-300" />
          ))}
        </div>
        <span className="text-white">Loading ratings...</span>
      </div>
    );
  }

  if (isUnclaimed) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 text-surface-300" />
          ))}
        </div>
        <span className="text-white">Cannot rate unclaimed businesses</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex">
        {renderStars(false)}
      </div>
      {ratingCount > 0 ? (
        <span className="text-white">
          {averageRating} ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
        </span>
      ) : (
        <span className="text-white">No ratings yet</span>
      )}
      <button
        onClick={() => auth.currentUser ? setShowRatingModal(true) : setShowAuthModal(true)}
        className="text-white hover:text-primary-300 transition-colors underline"
      >
        Rate this
      </button>
      
      {auth.currentUser && userRating && (
        <span className="text-sm text-white">
          Your rating: {userRating}/5
        </span>
      )}

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {showRatingModal && <RatingModal />}
    </div>
  );
}