import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ExternalLink } from 'lucide-react';
import { getCategoryColor } from '../../../data/categories';
import { generateSlug } from '../../../utils/slug';

export interface BusinessTileData {
  id: string;
  businessName: string;
  categories: string[];
  description: string;
  rating?: number;
  ratingCount?: number;
  city: string;
  state: string;
  coverImage: string;
  verified?: boolean;
  // Business attributes
  welcomeLGBTQ?: boolean;
  lgbtqFriendlyStaff?: boolean;
  lgbtqOwned?: boolean;
  safeEnvironment?: boolean;
}

interface BusinessTileProps {
  business: BusinessTileData;
  getCoverImage: (business: BusinessTileData) => string;
}

export default function BusinessTile({ business, getCoverImage }: BusinessTileProps) {
  const renderRating = () => {
    if (typeof business.rating !== 'number' || typeof business.ratingCount !== 'number' || business.ratingCount === 0) {
      return <span className="text-surface-600">No ratings yet</span>;
    }

    const rating = Math.round(business.rating); // Round to nearest whole number
    const stars = [];

    // Create array of 5 stars
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i}
          className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-surface-300'}`}
        />
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {stars}
        </div>
        <span className="text-surface-700">{business.rating.toFixed(1)}</span>
        <span className="text-surface-400">•</span>
        <span className="text-surface-600">{business.ratingCount} {business.ratingCount === 1 ? 'rating' : 'ratings'}</span>
      </div>
    );
  };

  const renderAttributes = () => {
    const attributes = [];
    
    if (business.welcomeLGBTQ) {
      attributes.push(
        <img 
          key="welcome"
          src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/67c655cc6d2b83342192d48e.png" 
          alt="We welcome LGBTQ+ customers" 
          className="h-6 w-6"
          title="We welcome LGBTQ+ customers"
        />
      );
    }
    
    if (business.lgbtqFriendlyStaff) {
      attributes.push(
        <img 
          key="staff"
          src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/67c655cc6d2b83f6cc92d48f.png" 
          alt="We have LGBTQ+ friendly staff" 
          className="h-6 w-6"
          title="We have LGBTQ+ friendly staff"
        />
      );
    }
    
    if (business.lgbtqOwned) {
      attributes.push(
        <img 
          key="owned"
          src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/67c655ccb882cc5bf9b1d1a1.png" 
          alt="We are LGBTQ+ owned and operated" 
          className="h-6 w-6"
          title="We are LGBTQ+ owned and operated"
        />
      );
    }
    
    if (business.safeEnvironment) {
      attributes.push(
        <img 
          key="safe"
          src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/67c655cc3d59035579503703.png" 
          alt="We provide a safe, inclusive environment" 
          className="h-6 w-6"
          title="We provide a safe, inclusive environment"
        />
      );
    }

    if (attributes.length === 0) return null;

    return (
      <div className="flex items-center gap-2 mb-4">
        {attributes}
      </div>
    );
  };

  return (
    <Link 
      to={`/business/${business.id}/${generateSlug(business.businessName)}`}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={getCoverImage(business)} 
          alt={business.businessName}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920';
          }}
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-surface-900">{business.businessName}</h3>
          <div className="flex flex-wrap gap-2 justify-end">
            {business.categories.slice(0, 2).map((category, index) => (
              <span 
                key={`${business.id}-category-${index}`}
                className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(category)}`}
              >
                {category}
              </span>
            ))}
            {business.categories.length > 2 && (
              <span className="px-3 py-1 rounded-full text-sm bg-surface-100 text-surface-600">
                +{business.categories.length - 2}
              </span>
            )}
          </div>
        </div>
        <p className="text-surface-600 mb-4 line-clamp-2">{business.description}</p>
        {renderAttributes()}
        <div className="mb-4">
          {renderRating()}
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-8 w-[180px] flex items-start">
            <img 
              src={business.verified 
                ? "https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6799a50d601845b6bcd83d87.png"
                : "https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6799a50d9dbb37b2d6047f03.png"
              }
              alt={business.verified ? "Verified Business" : "Unverified Business"}
              className="h-full w-full object-contain object-left"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-surface-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{`${business.city}, ${business.state}`}</span>
            </div>
            <div className="flex items-center text-primary-600 hover:text-primary-700">
              <span className="text-sm font-medium">View Details</span>
              <ExternalLink className="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}