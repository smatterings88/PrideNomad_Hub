import React from 'react';
import { MapPin, Globe2, Heart, ExternalLink } from 'lucide-react';
import { Business } from '../types';
import BusinessRating from './BusinessRating';

interface BusinessHeaderProps {
  business: Business;
  isLiked: boolean;
  likeLoading: boolean;
  handleLikeClick: () => void;
}

export default function BusinessHeader({ 
  business, 
  isLiked, 
  likeLoading, 
  handleLikeClick 
}: BusinessHeaderProps) {
  // Function to validate URL
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 w-full">
        {business.logo && (
          <div className="w-24 h-24 sm:w-40 sm:h-40 bg-white rounded-lg shadow-lg overflow-hidden flex-shrink-0 mt-4 sm:mt-0">
            <img
              src={business.logo}
              alt={`${business.businessName} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="text-white pb-2 flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {business.categories.map((category, index) => (
              <span key={index} className="px-3 py-1 rounded-full text-sm bg-primary-500 text-white">
                {category}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <h1 className="text-2xl sm:text-4xl font-bold">{business.businessName}</h1>
            <div className="flex items-center gap-4">
              <img 
                src={business.verified 
                  ? "https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6799a50d601845b6bcd83d87.png"
                  : "https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6799a50d9dbb37b2d6047f03.png"
                }
                alt={business.verified ? "Verified Business" : "Unverified Business"}
                className="h-8 w-auto"
              />
              <button
                onClick={handleLikeClick}
                disabled={likeLoading}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                  isLiked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                }`}
              >
                <Heart 
                  className={`h-5 w-5 ${isLiked ? 'fill-current' : ''} ${
                    likeLoading ? 'animate-pulse' : ''
                  }`} 
                />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <BusinessRating 
              businessId={business.id}
              initialRating={business.rating}
              totalRatings={business.ratingCount}
              isUnclaimed={!business.userId}
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{`${business.city}, ${business.state}, ${business.country}`}</span>
              </div>
            </div>
            {business.website && business.tier !== 'essentials' && (
              <div className="flex items-center gap-1 text-primary-200">
                <Globe2 className="h-4 w-4" />
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[250px] sm:max-w-full">
                  {business.website}
                </a>
              </div>
            )}
            {business.listingSource && (
              <div className="flex items-center gap-1 text-sm mt-2">
                <span className="text-white">Source:</span>
                {business.sourceUrl && isValidUrl(business.sourceUrl) ? (
                  <a 
                    href={business.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white flex items-center gap-1 hover:text-primary-200"
                  >
                    {business.listingSource}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-white">{business.listingSource}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}