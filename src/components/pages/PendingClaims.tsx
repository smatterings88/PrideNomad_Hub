import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Clock, CreditCard, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../ui/Breadcrumb';

interface PendingClaim {
  id: string;
  userId: string;
  userEmail: string;
  selectedPlan: string;
  isYearly: boolean;
  planSelectionTimestamp: any;
  businessData: any;
  status: string;
}

export default function PendingClaims() {
  const navigate = useNavigate();
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingClaims = async () => {
      if (!auth.currentUser) {
        setError('You must be signed in to view pending claims');
        setLoading(false);
        return;
      }

      try {
        const pendingClaimsRef = collection(db, 'pendingClaims');
        const q = query(
          pendingClaimsRef,
          where('userId', '==', auth.currentUser.uid),
          where('status', '==', 'pending')
        );
        
        const querySnapshot = await getDocs(q);
        const claims = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PendingClaim[];

        setPendingClaims(claims);
      } catch (err) {
        console.error('Error fetching pending claims:', err);
        setError('Failed to load pending claims');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingClaims();
  }, []);

  const handleDeleteClaim = async (claimId: string) => {
    if (!confirm('Are you sure you want to cancel this claim?')) return;

    setDeletingId(claimId);
    try {
      await deleteDoc(doc(db, 'pendingClaims', claimId));
      setPendingClaims(prev => prev.filter(claim => claim.id !== claimId));
    } catch (err) {
      console.error('Error deleting claim:', err);
      setError('Failed to delete claim');
    } finally {
      setDeletingId(null);
    }
  };

  const handleContinuePayment = (claim: PendingClaim) => {
    // Navigate to payment page with the claim data
    navigate('/payment', {
      state: { 
        businessData: claim.businessData,
        selectedPlan: claim.selectedPlan,
        isYearly: claim.isYearly,
        fromPendingClaim: true
      }
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getPlanDisplayName = (plan: string, isYearly: boolean) => {
    const planNames: Record<string, string> = {
      'essentials': 'Essentials',
      'enhanced': 'Enhanced',
      'premium': 'Premium',
      'elite': 'Elite'
    };
    
    const billing = isYearly ? 'Annual' : 'Monthly';
    return `${planNames[plan] || plan} (${billing})`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-2 text-surface-600">Loading pending claims...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Pending Claims' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 mb-2">
            Pending Claims
          </h1>
          <p className="text-surface-600">
            Complete your payment to claim these business listings
          </p>
        </div>

        {pendingClaims.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Clock className="h-16 w-16 text-surface-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-surface-700 mb-2">
              No Pending Claims
            </h3>
            <p className="text-surface-500 mb-6">
              You don't have any pending business claims at the moment.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Businesses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-lg shadow-sm border border-surface-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        <span className="text-sm text-surface-500">
                          Created: {formatDate(claim.planSelectionTimestamp)}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                        Pending Payment
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-surface-900 mb-2">
                      {claim.businessData?.businessName || 'Business Claim'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Plan</p>
                        <p className="font-medium text-surface-900">
                          {getPlanDisplayName(claim.selectedPlan, claim.isYearly)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Business Location</p>
                        <p className="font-medium text-surface-900">
                          {claim.businessData?.city && claim.businessData?.state 
                            ? `${claim.businessData.city}, ${claim.businessData.state}`
                            : 'Location not specified'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleContinuePayment(claim)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <CreditCard className="h-4 w-4" />
                        Continue Payment
                      </button>
                      <button
                        onClick={() => handleDeleteClaim(claim.id)}
                        disabled={deletingId === claim.id}
                        className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {deletingId === claim.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        Cancel Claim
                      </button>
                    </div>
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
