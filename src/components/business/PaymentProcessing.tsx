import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Building2, Globe2, Heart, CreditCard, ArrowRight, Loader2, X } from 'lucide-react';
import { auth, setUserRole } from '../../lib/firebase';
import { initiateGHLPayment, validateGHLResponse } from '../../lib/ghl-payments';
import { v4 as uuidv4 } from 'uuid';

const PLANS = [
  {
    id: 'essentials',
    name: 'Essentials',
    price: 0,
    yearlyTotal: 0,
    features: [
      'Business Name',
      'Address (no clickable website link)',
      'Listing in one category',
      'No phone number displayed',
      'Basic description (up to 100 characters)',
      'Standard SEO-friendly URL'
    ]
  },
  {
    id: 'enhanced',
    name: 'Enhanced',
    price: 9.97,
    yearlyTotal: 97,
    features: [
      'Everything in Essential plus:',
      'Clickable website link',
      'Phone number displayed',
      'Full description (up to 500 characters)',
      'Listing in up to 2 categories',
      'Add up to 3 images',
      'Contact form for inquiries',
      'SEO optimized with user defined meta descriptions',
      'Priority email support',
      'Coupon creation feature'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 24.97,
    yearlyTotal: 247,
    featured: true,
    features: [
      'Everything in Enhanced plus:',
      'Listing in up to 5 categories',
      'Embed video (YouTube, Vimeo)',
      'Sub-category refinement',
      'Searchable by sub-category',
      'Up to 10 images',
      'Featured placement in search results',
      'Geo-location',
      'User reviews and comments',
      'Customizable call-to-action button',
      'Priority listing on relevant pages',
      'Featured placement on relevant categories',
      'No ads on the page'
    ]
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 49.97,
    yearlyTotal: 497,
    features: [
      'Everything in Premium plus:',
      'Listing in unlimited categories',
      'Custom category groups for advanced customization',
      'Priority placement on the homepage and category pages',
      'Highlighted listing with custom colors/badges',
      'Dedicated account manager',
      'Feature in PrideNomad Letter (spotlight feature)',
      'Access to exclusive PrideNomad events and webinars',
      'Top-tier support with a direct contact line',
      'Full coupon and deals package access'
    ]
  }
];

export default function PaymentProcessing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<'enhanced' | 'premium' | 'elite' | 'enhanced-annual' | null>(null);

  useEffect(() => {
    // Handle payment response
    const status = searchParams.get('status');
    if (status) {
      const result = validateGHLResponse(searchParams);
      if (result.success) {
        setSuccess(true);
        handlePaymentSuccess();
      } else {
        setError(result.message);
      }
    }
  }, [searchParams]);

  const handlePaymentSuccess = async () => {
    if (!auth.currentUser) return;

    try {
      const planToRole = {
        essentials: 'Regular User',
        enhanced: 'Enhanced User',
        premium: 'Premium User',
        elite: 'Elite User'
      };

      const newRole = planToRole[selectedPlan as keyof typeof planToRole];
      await setUserRole(auth.currentUser.uid, newRole);
      setDebugInfo(`User role updated to: ${newRole}`);
      
      // Pass the business data from location state to the onboarding page
      const businessData = location.state?.businessData;
      setDebugInfo(prev => `${prev || ''}\nBusiness data from state: ${businessData ? JSON.stringify(businessData.id) : 'None'}`);
      
      setTimeout(() => navigate('/list-business', { 
        state: { businessData } 
      }), 2000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
      setDebugInfo(`Error updating user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleContinue = async () => {
    if (!auth.currentUser) {
      setError('Please sign in to continue');
      return;
    }

    // Check if Monthly Enhanced plan is selected
    if (selectedPlan === 'enhanced' && !isYearly) {
      setShowModal('enhanced');
      return;
    }

    // Check if Annual Enhanced plan is selected
    if (selectedPlan === 'enhanced' && isYearly) {
      setShowModal('enhanced-annual');
      return;
    }

    // Check if Monthly Premium plan is selected
    if (selectedPlan === 'premium' && !isYearly) {
      setShowModal('premium');
      return;
    }

    // Check if Monthly Elite plan is selected
    if (selectedPlan === 'elite' && !isYearly) {
      setShowModal('elite');
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      const plan = PLANS.find(p => p.id === selectedPlan);
      if (!plan) throw new Error('Invalid plan selected');

      const amount = isYearly ? plan.yearlyTotal : plan.price;
      
      // For free plan, skip payment and proceed directly
      if (amount === 0) {
        setDebugInfo('Free plan selected, skipping payment');
        await handlePaymentSuccess();
        return;
      }

      const paymentUrl = await initiateGHLPayment({
        amount,
        orderId: uuidv4(),
        planId: selectedPlan,
        customerEmail: auth.currentUser.email || ''
      });

      setDebugInfo(`Payment URL generated: ${paymentUrl}`);
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError('Failed to initiate payment. Please try again.');
      setDebugInfo(`Payment error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyPrice = (yearlyTotal: number) => {
    return (yearlyTotal / 12).toFixed(2);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-4">Payment Successful!</h2>
          <p className="text-surface-600 mb-6">
            Thank you for your payment. You will be redirected to complete your business listing.
          </p>
          {debugInfo && (
            <div className="mb-6 p-3 bg-blue-100 text-blue-700 rounded-md text-sm text-left whitespace-pre-line">
              <strong>Debug Info:</strong>
              <br />
              {debugInfo}
            </div>
          )}
          <div className="animate-pulse">
            <Globe2 className="h-6 w-6 text-primary-600 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-surface-900 mb-4">
            Choose Your Listing Plan
          </h1>
          <p className="text-lg text-surface-600 max-w-2xl mx-auto">
            Select the plan that best fits your business needs and start reaching the LGBTQ+ community today
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <span className={`text-sm ${!isYearly ? 'text-primary-600 font-semibold' : 'text-surface-600'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                isYearly ? 'bg-primary-600' : 'bg-surface-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-primary-600 font-semibold' : 'text-surface-600'}`}>
              Annual
            </span>
            {isYearly && (
              <span className="text-sm text-green-600 font-medium">
                Save up to 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
                plan.featured ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className={`p-6 ${plan.featured ? 'bg-primary-50' : ''}`}>
                {plan.featured && (
                  <span className="inline-block px-3 py-1 text-sm text-primary-700 bg-primary-100 rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-surface-900 mb-2">{plan.name}</h3>
                <div className="flex flex-col mb-4">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold text-surface-900">Free</span>
                  ) : isYearly ? (
                    <>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-surface-900">
                          ${getMonthlyPrice(plan.yearlyTotal)}
                        </span>
                        <span className="text-surface-600 ml-2">/month</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        <span className="text-sm text-surface-500">
                          ${plan.yearlyTotal} billed annually
                        </span>
                        <span className="text-sm text-green-600">
                          Save ${((plan.price * 12) - plan.yearlyTotal).toFixed(2)}/year
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-surface-900">
                        ${plan.price.toFixed(2)}
                      </span>
                      <span className="text-surface-600 ml-2">/month</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 px-4 rounded-lg transition-all transform duration-200 ${
                    selectedPlan === plan.id
                      ? 'bg-primary-600 text-white shadow-lg scale-105 hover:bg-primary-700'
                      : 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 hover:scale-105'
                  }`}
                >
                  {selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center">
                      <Heart className="w-5 h-5 mr-2" />
                      Selected
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Select Plan
                    </span>
                  )}
                </button>
              </div>
              <div className="p-6 border-t border-surface-200">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-surface-600">
                      <Heart className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 whitespace-pre-line">
              <strong>Debug Info:</strong>
              <br />
              {debugInfo}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Continue to Payment
              </>
            )}
          </button>
          <p className="text-sm text-surface-500 text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Enhanced Monthly Modal */}
      {showModal === 'enhanced' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <h3 className="text-xl font-semibold text-surface-900">
                Complete Your Enhanced Monthly Subscription
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="w-full h-[600px]">
                <iframe
                  src="https://api.leadconnectorhq.com/widget/form/76w8gDbB9tIqqquy8eX1"
                  style={{width:'100%',height:'100%',border:'none',borderRadius:'3px'}}
                  id="inline-76w8gDbB9tIqqquy8eX1" 
                  data-layout="{'id':'INLINE'}"
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-deactivation-type="neverDeactivate"
                  data-deactivation-value=""
                  data-form-name="PNH Enhanced Monthly"
                  data-height="863"
                  data-layout-iframe-id="inline-76w8gDbB9tIqqquy8eX1"
                  data-form-id="76w8gDbB9tIqqquy8eX1"
                  title="PNH Enhanced Monthly"
                >
                </iframe>
                <script src="https://link.msgsndr.com/js/form_embed.js"></script>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Annual Modal */}
      {showModal === 'enhanced-annual' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <h3 className="text-xl font-semibold text-surface-900">
                Complete Your Enhanced Annual Subscription
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="w-full h-[600px]">
                                 <iframe
                   src="https://api.leadconnectorhq.com/widget/form/tchR4XYrDJys2IWf2jfp"
                   style={{width:'100%',height:'100%',border:'none',borderRadius:'3px'}}
                   id="inline-tchR4XYrDJys2IWf2jfp" 
                   data-layout="{'id':'INLINE'}"
                   data-trigger-type="alwaysShow"
                   data-trigger-value=""
                   data-activation-type="alwaysActivated"
                   data-activation-value=""
                   data-deactivation-type="neverDeactivate"
                   data-deactivation-value=""
                   data-form-name="PNH Enhanced Annual"
                   data-height="859"
                   data-layout-iframe-id="inline-tchR4XYrDJys2IWf2jfp"
                   data-form-id="tchR4XYrDJys2IWf2jfp"
                   title="PNH Enhanced Annual"
                 >
                </iframe>
                <script src="https://link.msgsndr.com/js/form_embed.js"></script>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Monthly Modal */}
      {showModal === 'premium' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <h3 className="text-xl font-semibold text-surface-900">
                Complete Your Premium Monthly Subscription
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="w-full h-[600px]">
                <iframe
                  src="https://api.leadconnectorhq.com/widget/form/GcGS1K6TlSefkrzBlLgf"
                  style={{width:'100%',height:'100%',border:'none',borderRadius:'3px'}}
                  id="inline-GcGS1K6TlSefkrzBlLgf" 
                  data-layout="{'id':'INLINE'}"
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-deactivation-type="neverDeactivate"
                  data-deactivation-value=""
                  data-form-name="PNH Premium Monthly"
                  data-height="861"
                  data-layout-iframe-id="inline-GcGS1K6TlSefkrzBlLgf"
                  data-form-id="GcGS1K6TlSefkrzBlLgf"
                  title="PNH Premium Monthly"
                >
                </iframe>
                <script src="https://link.msgsndr.com/js/form_embed.js"></script>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Elite Monthly Modal */}
      {showModal === 'elite' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <h3 className="text-xl font-semibold text-surface-900">
                Complete Your Elite Monthly Subscription
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="w-full h-[600px]">
                <iframe
                  src="https://api.leadconnectorhq.com/widget/form/XzGBbFvFm1sFPaj59fpq"
                  style={{width:'100%',height:'100%',border:'none',borderRadius:'3px'}}
                  id="inline-XzGBbFvFm1sFPaj59fpq" 
                  data-layout="{'id':'INLINE'}"
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-deactivation-type="neverDeactivate"
                  data-deactivation-value=""
                  data-form-name="PNH Elite Monthly"
                  data-height="861"
                  data-layout-iframe-id="inline-XzGBbFvFm1sFPaj59fpq"
                  data-form-id="XzGBbFvFm1sFPaj59fpq"
                  title="PNH Elite Monthly"
                >
                </iframe>
                <script src="https://link.msgsndr.com/js/form_embed.js"></script>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}