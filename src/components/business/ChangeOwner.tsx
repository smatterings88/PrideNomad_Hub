import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { UserPlus, Loader2, Search } from 'lucide-react';
import Breadcrumb from '../ui/Breadcrumb';

interface Business {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  userId?: string;
  ownerEmail?: string;
}

interface UserData {
  email: string;
  emailVerified: boolean;
}

export default function ChangeOwner() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const businessesRef = collection(db, 'businesses');
        const querySnapshot = await getDocs(businessesRef);
        
        // Use a Map to ensure uniqueness by ID
        const businessMap = new Map<string, Business>();
        
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.businessName && data.businessName.trim() !== '') {
            businessMap.set(doc.id, {
              id: doc.id,
              businessName: data.businessName,
              category: data.category || 'Uncategorized',
              city: data.city || '',
              state: data.state || '',
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
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const verifyUserEmail = async (email: string): Promise<boolean> => {
    try {
      // Query users collection to find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      // Find user with matching email
      const userDoc = querySnapshot.docs.find(doc => {
        const data = doc.data();
        return data.email === email;
      });

      if (!userDoc) {
        setError('User not found. Please ensure the email is registered.');
        return false;
      }

      const userData = userDoc.data() as UserData;
      
      if (!userData.emailVerified) {
        setError('User email is not verified. Please verify the email first.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error verifying user:', err);
      setError('Failed to verify user email');
      return false;
    }
  };

  const handleChangeOwner = async (business: Business) => {
    const currentOwner = business.ownerEmail || 'No current owner';
    const newEmail = window.prompt(`Current owner: ${currentOwner}\nEnter the new owner email address:`, '');
    
    if (!newEmail) return;

    if (!newEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setProcessingId(business.id);
    setError(null);
    setSuccessMessage(null);

    try {
      // Verify the new owner's email
      const isValidUser = await verifyUserEmail(newEmail);
      if (!isValidUser) {
        setProcessingId(null);
        return;
      }

      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, {
        ownerEmail: newEmail,
        userId: null // Reset userId to allow new owner to claim
      });
      
      // Update local state
      setBusinesses(prev => prev.map(b => 
        b.id === business.id 
          ? { ...b, ownerEmail: newEmail, userId: null }
          : b
      ));
      
      setSuccessMessage(`Successfully updated owner for "${business.businessName}" to ${newEmail}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error changing owner:', err);
      setError('Failed to change owner');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBusinesses = businesses.filter(business => 
    business.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${business.city}, ${business.state}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'Change Listing Owner' }]} />
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
          <Breadcrumb items={[{ label: 'Change Listing Owner' }]} />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Change Listing Owner</h1>
            <p className="text-surface-600 mt-2">
              Manage ownership of business listings
            </p>
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

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
            <input
              type="text"
              placeholder="Search by business name, owner email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {filteredBusinesses.map((business) => (
            <div 
              key={business.id}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-surface-900 mb-2">
                    {business.businessName}
                  </h2>
                  <div className="space-y-1">
                    <div className="flex gap-4 text-sm text-surface-600">
                      <span>Category: {business.category}</span>
                      <span>Location: {business.city}, {business.state}</span>
                    </div>
                    <div className="text-sm text-surface-600">
                      Current Owner: {business.ownerEmail || 'No owner assigned'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleChangeOwner(business)}
                  disabled={processingId === business.id}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {processingId === business.id ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Change Owner
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}