import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, MapPin, ExternalLink, CheckCircle, UserPlus, Loader2, Hash } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../ui/Breadcrumb';

interface Business {
  id: string;
  businessName: string;
  categories: string[];
  city: string;
  state: string;
  userId?: string;
  ownerEmail?: string;
  tier: string;
  verified: boolean;
}

export default function ViewClaimed() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaimedBusinesses = async () => {
      try {
        const businessesRef = collection(db, 'businesses');
        const querySnapshot = await getDocs(businessesRef);
        
        // Use a Map to ensure uniqueness by ID
        const businessMap = new Map<string, Business>();
        
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Only add if the business has a name and is claimed (has userId or ownerEmail)
          if (data.businessName && 
              data.businessName.trim() !== '' && 
              (data.userId || data.ownerEmail) &&
              !businessMap.has(doc.id)) {
            businessMap.set(doc.id, {
              id: doc.id,
              businessName: data.businessName,
              categories: Array.isArray(data.categories) ? data.categories : [data.category || 'Uncategorized'],
              city: data.city || '',
              state: data.state || '',
              userId: data.userId,
              ownerEmail: data.ownerEmail,
              tier: data.tier || 'essentials',
              verified: data.verified || false
            });
          }
        });

        // Convert Map to array and sort by business name
        const businessesData = Array.from(businessMap.values())
          .sort((a, b) => a.businessName.localeCompare(b.businessName));
        
        setBusinesses(businessesData);
      } catch (err) {
        console.error('Error fetching claimed businesses:', err);
        setError('Failed to load claimed businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchClaimedBusinesses();
  }, []);

  const handleVerify = async (business: Business) => {
    setProcessingId(business.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, {
        status: 'approved',
        verified: true
      });

      // Update local state
      setBusinesses(prev => prev.map(b => 
        b.id === business.id 
          ? { ...b, verified: true }
          : b
      ));

      setSuccessMessage(`Successfully verified "${business.businessName}"`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error verifying business:', err);
      setError('Failed to verify business');
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangeTier = async (business: Business) => {
    const tiers = ['essentials', 'enhanced', 'premium', 'elite'];
    const currentIndex = tiers.indexOf(business.tier);
    const nextTier = tiers[(currentIndex + 1) % tiers.length];

    setProcessingId(business.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const businessRef = doc(db, 'businesses', business.id);
      await updateDoc(businessRef, {
        tier: nextTier
      });

      // Update local state
      setBusinesses(prev => prev.map(b => 
        b.id === business.id 
          ? { ...b, tier: nextTier }
          : b
      ));

      setSuccessMessage(`Updated "${business.businessName}" to ${nextTier} tier`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error changing tier:', err);
      setError('Failed to change tier');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBusinesses = businesses.filter(business => 
    business.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${business.city}, ${business.state}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'View Claimed Listings' }]} />
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
          <Breadcrumb items={[{ label: 'View Claimed Listings' }]} />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Claimed Listings</h1>
            <p className="text-surface-600 mt-2">
              {businesses.length === 0 
                ? 'No claimed businesses found.'
                : `Found ${businesses.length} claimed business${businesses.length === 1 ? '' : 'es'}`
              }
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
              placeholder="Search by business name, owner email, location, ID, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {filteredBusinesses.map((business) => (
            <div 
              key={`claimed-business-${business.id}`}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-surface-900">
                      {business.businessName}
                    </h2>
                    <div className="flex items-center gap-1 px-2 py-1 bg-surface-100 rounded text-sm text-surface-600">
                      <Hash className="h-4 w-4" />
                      <span className="font-mono">{business.id}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-4 text-sm text-surface-600">
                      <div className="flex flex-wrap gap-2">
                        {business.categories.map((category, index) => (
                          <span key={`${business.id}-category-${index}`} className="px-2 py-1 bg-surface-100 rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{business.city}, {business.state}</span>
                      </div>
                    </div>
                    <div className="text-sm text-surface-600">
                      Owner: {business.ownerEmail || 'No email provided'}
                    </div>
                    <div className="flex gap-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                        {business.tier.charAt(0).toUpperCase() + business.tier.slice(1)} Tier
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        business.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {business.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/business/${business.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-100 text-surface-700 rounded-md hover:bg-surface-200"
                  >
                    <ExternalLink className="h-5 w-5" />
                    View Details
                  </Link>
                  {!business.verified && (
                    <button
                      onClick={() => handleVerify(business)}
                      disabled={processingId === business.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                    >
                      {processingId === business.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      )}
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleChangeTier(business)}
                    disabled={processingId === business.id}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    Change Tier
                  </button>
                  <button
                    onClick={() => navigate('/change-owner', { state: { businessId: business.id } })}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                  >
                    <UserPlus className="h-5 w-5" />
                    Change Owner
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}