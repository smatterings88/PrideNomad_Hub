import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Trash2, AlertCircle } from 'lucide-react';
import Breadcrumb from '../ui/Breadcrumb';

interface Business {
  id: string;
  businessName: string;
  category: string;
  status: string;
  verified: boolean;
  createdAt: any;
  userId?: string;
}

export default function DeleteBusiness() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const q = query(collection(db, 'businesses'));
        const querySnapshot = await getDocs(q);
        
        // Create a Map with document ID as key to ensure uniqueness
        const businessMap = new Map();
        
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!businessMap.has(doc.id)) {
            businessMap.set(doc.id, {
              id: doc.id,
              businessName: data.businessName || '',
              category: data.category || '',
              status: data.status || 'pending',
              verified: data.verified || false,
              createdAt: data.createdAt,
              userId: data.userId
            });
          }
        });

        // Convert Map to array and sort by business name
        const sortedBusinesses = Array.from(businessMap.values())
          .sort((a, b) => a.businessName.localeCompare(b.businessName));

        setBusinesses(sortedBusinesses);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleDelete = async (business: Business) => {
    if (!auth.currentUser) {
      setError('You must be signed in to delete businesses');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${business.businessName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(business.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const businessRef = doc(db, 'businesses', business.id);
      await deleteDoc(businessRef);
      setBusinesses(prev => prev.filter(b => b.id !== business.id));
      setSuccessMessage(`Successfully deleted "${business.businessName}"`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting business:', err);
      setError(
        err instanceof Error 
          ? err.message === 'permission-denied'
            ? 'You do not have permission to delete this business'
            : err.message
          : 'Failed to delete business'
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'Delete Business' }]} />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb items={[{ label: 'Delete Business' }]} />
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-surface-900">Delete Businesses</h1>
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Warning: Deletions are permanent</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}
        
        {businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-surface-600">No businesses found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {businesses.map((business) => (
              <div 
                key={`business-${business.id}`} 
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-surface-900 mb-2">
                      {business.businessName}
                    </h2>
                    <div className="flex gap-4 text-sm text-surface-600">
                      <span>Category: {business.category}</span>
                      <span>Status: {business.status}</span>
                      <span>Verified: {business.verified ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(business)}
                    disabled={deletingId === business.id}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                      ${deletingId === business.id
                        ? 'bg-surface-200 text-surface-500 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                      }
                    `}
                  >
                    <Trash2 className="h-5 w-5" />
                    {deletingId === business.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}