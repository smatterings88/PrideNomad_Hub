import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { categories } from '../data/categories';
import BusinessTile, { BusinessTileData } from './business/components/BusinessTile';
import Breadcrumb from './ui/Breadcrumb';

export default function CategoryBusinesses() {
  const { categoryName } = useParams();
  const [businesses, setBusinesses] = useState<BusinessTileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!category) {
        setError('Category not found');
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'businesses'),
          where('categories', 'array-contains', category.name)
        );
        
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

        const businessesData = Array.from(businessMap.values())
          .sort((a, b) => a.businessName.localeCompare(b.businessName));

        setBusinesses(businessesData);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [categoryName, category]);

  const getCategoryImage = (categoryName: string): string => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920';
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

  if (error || !category) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-surface-900 mb-4">Category Not Found</h1>
          <p className="text-surface-600">The category you're looking for doesn't exist.</p>
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
              { label: 'Categories', href: '/#categories' },
              { label: category?.name || 'Category' }
            ]}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900">{category.name}</h1>
          <p className="text-surface-600 mt-2">{category.description}</p>
        </div>

        {businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-surface-600">No businesses found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map((business) => (
              <BusinessTile
                key={business.id}
                business={business}
                getCoverImage={getCoverImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}