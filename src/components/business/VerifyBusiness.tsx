import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle, XCircle } from 'lucide-react';
import Breadcrumb from '../ui/Breadcrumb';

interface Business {
  id: string;
  businessName: string;
  category: string;
  status: string;
  verified: boolean;
  createdAt: any;
  userId?: string;
  ownerEmail?: string;
}

export default function VerifyBusiness() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const q = query(
          collection(db, 'businesses'),
          where('status', '==', 'pending')
        );
        
        const querySnapshot = await getDocs(q);
        
        // Use a Map to ensure uniqueness by ID
        const businessMap = new Map<string, Business>();
        
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Only include businesses that have either a userId or ownerEmail (claimed)
          if (data.businessName && 
              data.businessName.trim() !== '' && 
              (data.userId || data.ownerEmail)) {
            businessMap.set(doc.id, {
              id: doc.id,
              businessName: data.businessName,
              category: data.category || 'Uncategorized',
              status: data.status || 'pending',
              verified: data.verified || false,
              createdAt: data.createdAt,
              userId: data.userId,
              ownerEmail: data.ownerEmail
            });
          }
        });

        // Convert Map to array and sort by business name
        const businessesData = Array.from(businessMap.values())
          .sort((a, b) => a.businessName.localeCompare(b.businessName));

        setBusinesses(businessesData);
      } catch (err) {
        setError('Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleVerify = async (businessId: string, verified: boolean) => {
    try {
      const businessRef = doc(db, 'businesses', businessId);
      await updateDoc(businessRef, {
        status: verified ? 'approved' : 'rejected',
        verified
      });

      setBusinesses(prev => prev.filter(b => b.id !== businessId));
    } catch (err) {
      setError('Failed to update business status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'Verify Business' }]} />
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
          <Breadcrumb items={[{ label: 'Verify Business' }]} />
        </div>

        <h1 className="text-3xl font-bold text-surface-900 mb-8">Verify Businesses</h1>
        
        {businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-surface-600">No pending claimed businesses to verify.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {businesses.map((business) => (
              <div 
                key={`verify-business-${business.id}`}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-surface-900 mb-2">
                      {business.businessName}
                    </h2>
                    <div className="space-y-1">
                      <p className="text-surface-600">Category: {business.category}</p>
                      <p className="text-surface-600">
                        Owner: {business.ownerEmail || 'No email provided'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(business.id, true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(business.id, false)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}