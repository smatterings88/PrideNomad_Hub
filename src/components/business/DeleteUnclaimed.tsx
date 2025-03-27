import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';
import Breadcrumb from '../ui/Breadcrumb';

interface Business {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  createdAt: any;
  userId?: string | null;
  ownerEmail?: string | null;
}

export default function DeleteUnclaimed() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    const fetchUnclaimedBusinesses = async () => {
      try {
        // Get all businesses first
        const businessesRef = collection(db, 'businesses');
        const querySnapshot = await getDocs(businessesRef);
        
        // Filter for truly unclaimed businesses (no userId AND no ownerEmail)
        const unclaimedBusinesses = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Business))
          .filter(business => !business.userId && !business.ownerEmail)
          .sort((a, b) => a.businessName.localeCompare(b.businessName));
        
        setBusinesses(unclaimedBusinesses);
      } catch (err) {
        console.error('Error fetching unclaimed businesses:', err);
        setError('Failed to load unclaimed businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchUnclaimedBusinesses();
  }, []);

  const handleDelete = async (business: Business) => {
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
      setError('Failed to delete business');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBusinesses.size === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedBusinesses.size} selected businesses? This action cannot be undone.`)) {
      return;
    }

    setBulkDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const deletePromises = Array.from(selectedBusinesses).map(async (businessId) => {
        const businessRef = doc(db, 'businesses', businessId);
        await deleteDoc(businessRef);
      });

      await Promise.all(deletePromises);
      
      setBusinesses(prev => prev.filter(b => !selectedBusinesses.has(b.id)));
      setSelectedBusinesses(new Set());
      setSuccessMessage(`Successfully deleted ${selectedBusinesses.size} businesses`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting businesses:', err);
      setError('Failed to delete selected businesses');
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedBusinesses.size === businesses.length) {
      // If all are selected, clear selection
      setSelectedBusinesses(new Set());
    } else {
      // Otherwise, select all
      setSelectedBusinesses(new Set(businesses.map(b => b.id)));
    }
  };

  const toggleBusinessSelection = (businessId: string) => {
    const newSelected = new Set(selectedBusinesses);
    if (newSelected.has(businessId)) {
      newSelected.delete(businessId);
    } else {
      newSelected.add(businessId);
    }
    setSelectedBusinesses(newSelected);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'Delete Unclaimed Listings' }]} />
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
          <Breadcrumb items={[{ label: 'Delete Unclaimed Listings' }]} />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Delete Unclaimed Listings</h1>
            <p className="text-surface-600 mt-2">
              {businesses.length === 0 
                ? 'No unclaimed businesses found.'
                : `Found ${businesses.length} unclaimed business${businesses.length === 1 ? '' : 'es'}`
              }
            </p>
          </div>
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
            <p className="text-surface-600">No unclaimed businesses found.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBusinesses.size === businesses.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
                    />
                    <span className="text-surface-700">Select All</span>
                  </label>
                  <span className="text-surface-600">
                    {selectedBusinesses.size} selected
                  </span>
                </div>
                {selectedBusinesses.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                  >
                    {bulkDeleting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-5 w-5" />
                        Delete Selected ({selectedBusinesses.size})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-6">
              {businesses.map((business) => (
                <div 
                  key={business.id}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedBusinesses.has(business.id)}
                        onChange={() => toggleBusinessSelection(business.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-surface-900 mb-2">
                          {business.businessName}
                        </h2>
                        <div className="flex gap-4 text-sm text-surface-600">
                          <span>Category: {business.category}</span>
                          <span>Location: {business.city}, {business.state}</span>
                          <span>Created: {business.createdAt?.toDate().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(business)}
                      disabled={deletingId === business.id || bulkDeleting}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                        ${(deletingId === business.id || bulkDeleting)
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
          </>
        )}
      </div>
    </div>
  );
}