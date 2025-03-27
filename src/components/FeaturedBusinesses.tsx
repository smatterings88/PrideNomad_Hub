import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { categories } from '../data/categories';
import BusinessTile, { BusinessTileData } from './business/components/BusinessTile';

export default function FeaturedBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessTileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const businessesRef = collection(db, 'businesses');
        const q = query(
          businessesRef,
          orderBy('createdAt', 'desc'),
          limit(30)
        );
        
        const querySnapshot = await getDocs(q);
        const businessMap = new Map<string, BusinessTileData>();

        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          
          if (data.businessName && 
              data.businessName.trim() !== '' && 
              !businessMap.has(doc.id)) {
            businessMap.set(doc.id, {
              id: doc.id,
              businessName: data.businessName || '',
              categories: Array.isArray(data.categories) ? data.categories : [data.category || 'Uncategorized'],
              description: data.description || '',
              city: data.city || 'Location',
              state: data.state || 'Unknown',
              coverImage: data.coverImage || '',
              rating: typeof data.rating === 'number' ? data.rating : undefined,
              ratingCount: typeof data.ratingCount === 'number' ? data.ratingCount : undefined,
              verified: data.verified || false,
              // Include business attributes
              welcomeLGBTQ: data.welcomeLGBTQ || false,
              lgbtqFriendlyStaff: data.lgbtqFriendlyStaff || false,
              lgbtqOwned: data.lgbtqOwned || false,
              safeEnvironment: data.safeEnvironment || false
            });
          }
        });

        const businessesData = Array.from(businessMap.values());

        // Sort by creation date
        const sortedBusinesses = businessesData.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        // Take only the first 6 businesses
        setBusinesses(sortedBusinesses.slice(0, 6));
        setError(null);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses');
        
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * (retryCount + 1));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [retryCount]);

  const getCategoryImage = (categoryName: string): string => {
    const category = categories.find(c => c.name === categoryName);
    return category?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920';
  };

  const getCoverImage = (business: BusinessTileData): string => {
    if (business.coverImage) return business.coverImage;
    if (business.categories && business.categories.length > 0) {
      return getCategoryImage(business.categories[0]);
    }
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920';
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-surface-200 rounded animate-pulse mx-auto mb-4" />
            <div className="h-6 w-64 bg-surface-200 rounded animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-48 bg-surface-200 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-surface-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-surface-200 rounded animate-pulse" />
                  <div className="h-16 bg-surface-200 rounded animate-pulse" />
                  <div className="h-4 w-1/3 bg-surface-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-amber-600 mb-4">
              <AlertCircle className="h-6 w-6" />
              <p>{error}</p>
            </div>
            {retryCount < 3 && (
              <p className="text-surface-600">Retrying to load businesses...</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (businesses.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-surface-600">No businesses found. Be the first to list your business!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-8 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">Latest Business Listings</h2>
          <p className="text-lg text-surface-600">Browse our newest businesses serving the community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businesses.map((business) => (
            <BusinessTile
              key={business.id}
              business={business}
              getCoverImage={getCoverImage}
            />
          ))}
        </div>
      </div>
    </section>
  );
}