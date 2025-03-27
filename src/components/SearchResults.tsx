import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { categories } from '../data/categories';
import BusinessTile, { BusinessTileData } from './business/components/BusinessTile';
import Breadcrumb from './ui/Breadcrumb';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<BusinessTileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocationFallback, setIsLocationFallback] = useState(false);

  const searchTerm = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      setIsLocationFallback(false);

      try {
        const q = query(collection(db, 'businesses'));
        const querySnapshot = await getDocs(q);
        const businessMap = new Map<string, BusinessTileData>();
        
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.businessName && data.businessName.trim() !== '') {
            businessMap.set(doc.id, {
              id: doc.id,
              businessName: data.businessName,
              categories: Array.isArray(data.categories) ? data.categories : [data.category || 'Uncategorized'],
              description: data.description || '',
              city: data.city || '',
              state: data.state || '',
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
        
        let results = Array.from(businessMap.values());

        if (searchTerm || location) {
          results = results.filter(business => {
            let matchesSearch = !searchTerm;
            
            if (searchTerm) {
              const term = searchTerm.toLowerCase();
              const searchFields = [
                business.businessName.toLowerCase(),
                ...business.categories.map(c => c.toLowerCase()),
                business.description.toLowerCase()
              ];
              
              matchesSearch = searchFields.some(field => field.includes(term));
            }

            const matchesLocation = !location ||
              `${business.city}, ${business.state}`.toLowerCase().includes(location.toLowerCase());

            return matchesSearch && matchesLocation;
          });

          if (results.length === 0 && location && searchTerm) {
            results = Array.from(businessMap.values()).filter(business => {
              const term = searchTerm.toLowerCase();
              const searchFields = [
                business.businessName.toLowerCase(),
                ...business.categories.map(c => c.toLowerCase()),
                business.description.toLowerCase()
              ];
              
              return searchFields.some(field => field.includes(term));
            });

            if (results.length > 0) {
              setIsLocationFallback(true);
            }
          }
        }

        results.sort((a, b) => a.businessName.localeCompare(b.businessName));
        setBusinesses(results);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm, location]);

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
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
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
              { label: 'Search Results' }
            ]}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 mb-4">
            Search Results
          </h1>
          <div className="space-y-2">
            {(searchTerm || location) && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    Search: {searchTerm}
                  </span>
                )}
                {location && !isLocationFallback && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    Location: {location}
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <p className="text-surface-600">
                {businesses.length === 0 ? (
                  'No businesses found matching your search criteria.'
                ) : (
                  `Found ${businesses.length} business${businesses.length === 1 ? '' : 'es'}`
                )}
              </p>
              {isLocationFallback && location && (
                <p className="text-amber-600 text-sm">
                  No results found in {location}. Showing all matching businesses.
                </p>
              )}
            </div>
          </div>
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
    </div>
  );
}