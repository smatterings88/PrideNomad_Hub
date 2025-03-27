import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { MapPin, Star, ExternalLink, Heart } from 'lucide-react';
import { getCategoryColor, categories } from '../../data/categories';
import { generateSlug } from '../../utils/slug';
import Breadcrumb from '../ui/Breadcrumb';

interface Business {
  id: string;
  businessName: string;
  categories: string[];
  description: string;
  rating?: number;
  reviews?: number;
  city: string;
  state: string;
  coverImage: string;
  verified?: boolean;
}

export default function FavoriteListings() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikedBusinesses = async () => {
      if (!auth.currentUser) return;

      try {
        // Get user's liked businesses
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          setBusinesses([]);
          return;
        }

        const likedBusinessIds = userDoc.data().likedBusinesses || [];
        
        if (likedBusinessIds.length === 0) {
          setBusinesses([]);
          return;
        }

        // Fetch all liked businesses
        const businessesRef = collection(db, 'businesses');
        const q = query(businessesRef, where('__name__', 'in', likedBusinessIds));
        const querySnapshot = await getDocs(q);
        
        // Use a Map to ensure uniqueness by ID
        const businessMap = new Map<string, Business>();
        
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Only add if the business has a name and it hasn't been added yet
          if (data.businessName && 
              data.businessName.trim() !== '' && 
              !businessMap.has(doc.id)) {
            businessMap.set(doc.id, {
              id: doc.id,
              ...data
            } as Business);
          }
        });

        // Convert Map to array and sort by business name
        const businessesData = Array.from(businessMap.values())
          .sort((a, b) => a.businessName.localeCompare(b.businessName));
        
        setBusinesses(businessesData);
      } catch (err) {
        console.error('Error fetching favorite businesses:', err);
        setError('Failed to load favorite businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedBusinesses();
  }, []);

  const getCategoryImage = (categoryName: string): string => {
    const category = categories.find(c => c.name === categoryName);
    return category?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920';
  };

  const getCoverImage = (business: Business): string => {
    if (business.coverImage) return business.coverImage;
    if (business.categories && business.categories.length > 0) {
      return getCategoryImage(business.categories[0]);
    }
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={`loading-skeleton-${i}`} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-48 bg-surface-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-surface-200 rounded" />
                  <div className="h-4 w-1/2 bg-surface-200 rounded" />
                  <div className="h-16 bg-surface-200 rounded" />
                  <div className="h-4 w-1/3 bg-surface-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Favorite Listings' }
            ]}
          />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Favorite Listings</h1>
            <p className="text-surface-600 mt-2">
              {businesses.length === 0 
                ? 'You haven\'t favorited any businesses yet.'
                : `You have favorited ${businesses.length} business${businesses.length === 1 ? '' : 'es'}`
              }
            </p>
          </div>
        </div>

        {businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Heart className="h-12 w-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600">
              When you find businesses you like, they'll appear here.
            </p>
            <Link 
              to="/" 
              className="mt-4 inline-block text-primary-600 hover:text-primary-700"
            >
              Browse Businesses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map((business) => (
              <Link 
                key={`favorite-${business.id}`}
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
                          key={`category-${business.id}-${index}`}
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
                  {business.rating && (
                    <div className="flex items-center mb-4">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-surface-700">{business.rating}</span>
                      {business.reviews && (
                        <>
                          <span className="mx-1 text-surface-400">•</span>
                          <span className="text-surface-600">{business.reviews} reviews</span>
                        </>
                      )}
                    </div>
                  )}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}