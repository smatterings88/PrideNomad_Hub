import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { CreditCard, Calendar, Building2, DollarSign, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../ui/Breadcrumb';

interface PaymentRecord {
  id: string;
  userId: string;
  email: string;
  planId: string;
  isYearly: boolean;
  businessData: any;
  timestamp: any;
  status: string;
}

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterYearly, setFilterYearly] = useState<string>('all');

  useEffect(() => {
    const fetchPayments = async () => {
      if (!auth.currentUser) {
        setError('You must be signed in to view payment history');
        setLoading(false);
        return;
      }

      try {
        const paymentsRef = collection(db, 'payments');
        const q = query(
          paymentsRef,
          where('userId', '==', auth.currentUser.uid),
          orderBy('timestamp', sortOrder === 'desc' ? 'desc' : 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        const paymentRecords = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PaymentRecord[];

        setPayments(paymentRecords);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [sortOrder]);

  const filteredPayments = payments.filter(payment => {
    if (filterPlan !== 'all' && payment.planId !== filterPlan) return false;
    if (filterYearly !== 'all') {
      const isYearly = filterYearly === 'true';
      if (payment.isYearly !== isYearly) return false;
    }
    return true;
  });

  const getPlanDisplayName = (plan: string) => {
    const planNames: Record<string, string> = {
      'essentials': 'Essentials',
      'enhanced': 'Enhanced',
      'premium': 'Premium',
      'elite': 'Elite'
    };
    return planNames[plan] || plan;
  };

  const getPlanPrice = (plan: string, isYearly: boolean) => {
    const planPrices: Record<string, { monthly: number; yearly: number }> = {
      'essentials': { monthly: 0, yearly: 0 },
      'enhanced': { monthly: 29, yearly: 290 },
      'premium': { monthly: 49, yearly: 490 },
      'elite': { monthly: 99, yearly: 990 }
    };
    
    const prices = planPrices[plan] || { monthly: 0, yearly: 0 };
    return isYearly ? prices.yearly : prices.monthly;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTotalSpent = () => {
    return filteredPayments.reduce((total, payment) => {
      return total + getPlanPrice(payment.planId, payment.isYearly);
    }, 0);
  };

  const getPaymentCount = () => {
    return filteredPayments.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-surface-600">Loading payment history...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Payment History' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 mb-2">
            Payment History
          </h1>
          <p className="text-surface-600">
            View your subscription payments and business claims
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm text-surface-500">Total Payments</p>
                <p className="text-2xl font-bold text-surface-900">{getPaymentCount()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-surface-500">Total Spent</p>
                <p className="text-2xl font-bold text-surface-900">${getTotalSpent()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-surface-500">Businesses Claimed</p>
                <p className="text-2xl font-bold text-surface-900">
                  {filteredPayments.filter(p => p.businessData).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-surface-500" />
                <span className="text-sm text-surface-600">Filter:</span>
              </div>
              
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="border border-surface-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Plans</option>
                <option value="essentials">Essentials</option>
                <option value="enhanced">Enhanced</option>
                <option value="premium">Premium</option>
                <option value="elite">Elite</option>
              </select>
              
              <select
                value={filterYearly}
                onChange={(e) => setFilterYearly(e.target.value)}
                className="border border-surface-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Billing</option>
                <option value="false">Monthly</option>
                <option value="true">Yearly</option>
              </select>
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 text-surface-600 hover:text-surface-900 transition-colors"
            >
              {sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              <span className="text-sm">
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </span>
            </button>
          </div>
        </div>

        {/* Payment List */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <CreditCard className="h-16 w-16 text-surface-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-surface-700 mb-2">
              No Payments Found
            </h3>
            <p className="text-surface-500 mb-6">
              {payments.length === 0 
                ? "You haven't made any payments yet."
                : "No payments match your current filters."
              }
            </p>
            {payments.length === 0 && (
              <button
                onClick={() => navigate('/')}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Businesses
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-lg shadow-sm border border-surface-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-surface-400" />
                        <span className="text-sm text-surface-500">
                          {formatDate(payment.timestamp)}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Completed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Plan</p>
                        <p className="font-medium text-surface-900">
                          {getPlanDisplayName(payment.planId)} ({payment.isYearly ? 'Annual' : 'Monthly'})
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Amount</p>
                        <p className="font-medium text-surface-900">
                          ${getPlanPrice(payment.planId, payment.isYearly)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Business Claimed</p>
                        <p className="font-medium text-surface-900">
                          {payment.businessData?.businessName || 'No business data'}
                        </p>
                      </div>
                    </div>

                    {payment.businessData && (
                      <div className="bg-surface-50 rounded-lg p-4">
                        <h4 className="font-medium text-surface-900 mb-2">Business Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-surface-500">Name:</span>
                            <span className="ml-2 text-surface-900">{payment.businessData.businessName}</span>
                          </div>
                          {payment.businessData.city && payment.businessData.state && (
                            <div>
                              <span className="text-surface-500">Location:</span>
                              <span className="ml-2 text-surface-900">
                                {payment.businessData.city}, {payment.businessData.state}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
