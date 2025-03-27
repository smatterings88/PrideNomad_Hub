import React, { useState, useEffect } from 'react';
import { Building2, Save, X, AlertTriangle, Check } from 'lucide-react';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Breadcrumb from '../ui/Breadcrumb';

const TIERS = [
  {
    id: 'essentials',
    name: 'Essentials',
    price: 0,
    maxCategories: 1
  },
  {
    id: 'enhanced',
    name: 'Enhanced',
    price: 9.97,
    maxCategories: 2
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 24.97,
    maxCategories: 5
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 49.97,
    maxCategories: -1 // Unlimited
  }
];

// Define which features should use checkboxes
const CHECKBOX_FEATURES = [
  'Business Name',
  'Address',
  'Phone Number',
  'Website Link',
  'Contact Form',
  'Video Embedding',
  'Sub-Categories',
  'Reviews & Ratings',
  'Custom CTA Button',
  'Google Maps Support',
  'Directions Button'
];

const DEFAULT_FEATURES = [
  {
    name: 'Categories',
    essentials: '1 category',
    enhanced: '2 categories',
    premium: '5 categories',
    elite: 'Unlimited'
  },
  {
    name: 'Business Name',
    essentials: true,
    enhanced: true,
    premium: true,
    elite: true
  },
  {
    name: 'Address',
    essentials: false,
    enhanced: true,
    premium: true,
    elite: true
  },
  {
    name: 'Phone Number',
    essentials: false,
    enhanced: true,
    premium: true,
    elite: true
  },
  {
    name: 'Website Link',
    essentials: false,
    enhanced: true,
    premium: true,
    elite: true
  },
  {
    name: 'Description Length',
    essentials: '100 characters',
    enhanced: '500 characters',
    premium: 'Unlimited',
    elite: 'Unlimited'
  },
  {
    name: 'Images',
    essentials: '1 logo only',
    enhanced: 'Up to 3 images',
    premium: 'Up to 10 images',
    elite: 'Unlimited images'
  },
  {
    name: 'Contact Form',
    essentials: false,
    enhanced: true,
    premium: true,
    elite: true
  },
  {
    name: 'SEO Features',
    essentials: 'Basic URL',
    enhanced: 'Custom meta descriptions',
    premium: 'Full SEO optimization',
    elite: 'Priority SEO optimization'
  },
  {
    name: 'Video Embedding',
    essentials: false,
    enhanced: false,
    premium: true,
    elite: true
  },
  {
    name: 'Sub-Categories',
    essentials: false,
    enhanced: false,
    premium: true,
    elite: true
  },
  {
    name: 'Search Priority',
    essentials: 'Standard',
    enhanced: 'Standard',
    premium: 'Featured placement',
    elite: 'Top placement'
  },
  {
    name: 'Reviews & Ratings',
    essentials: false,
    enhanced: false,
    premium: true,
    elite: true
  },
  {
    name: 'Custom CTA Button',
    essentials: false,
    enhanced: false,
    premium: true,
    elite: true
  },
  {
    name: 'Google Maps Support',
    essentials: false,
    enhanced: true,
    premium: true,
    elite: true
  },
  {
    name: 'Directions Button',
    essentials: false,
    enhanced: true,
    premium: true,
    elite: true
  },
  {
    name: 'Support Level',
    essentials: 'Standard',
    enhanced: 'Priority email',
    premium: 'Priority support',
    elite: 'Dedicated manager'
  },
  {
    name: 'Additional Benefits',
    essentials: 'None',
    enhanced: 'Coupon creation',
    premium: 'No ads',
    elite: 'Event features, spotlight'
  }
];

interface Feature {
  name: string;
  essentials: string | boolean;
  enhanced: string | boolean;
  premium: string | boolean;
  elite: string | boolean;
}

export default function TierRules() {
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTierRules = async () => {
      try {
        const tierRulesRef = doc(db, 'settings', 'tierRules');
        const tierRulesDoc = await getDoc(tierRulesRef);
        
        if (tierRulesDoc.exists()) {
          const firestoreFeatures = tierRulesDoc.data().features;
          // Ensure required features are included
          const requiredFeatures = ['Google Maps Support', 'Directions Button'];
          requiredFeatures.forEach(featureName => {
            if (!firestoreFeatures.some((f: Feature) => f.name === featureName)) {
              firestoreFeatures.push({
                name: featureName,
                essentials: false,
                enhanced: true,
                premium: true,
                elite: true
              });
            }
          });
          setFeatures(firestoreFeatures);
        }
      } catch (err) {
        console.error('Error fetching tier rules:', err);
      }
    };

    fetchTierRules();
  }, []);

  const handleChange = (index: number, tier: string, value: string | boolean) => {
    setFeatures(prev => prev.map((feature, i) => {
      if (i === index) {
        return {
          ...feature,
          [tier]: value
        };
      }
      return feature;
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const tierRulesRef = doc(db, 'settings', 'tierRules');
      await setDoc(tierRulesRef, {
        features,
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving tier rules:', err);
      setError('Failed to save tier rules. Please try again.');
    } finally {
      setLoading(false);
      setShowVerificationModal(false);
    }
  };

  const renderFeatureInput = (feature: Feature, index: number, tier: string) => {
    if (CHECKBOX_FEATURES.includes(feature.name)) {
      const checked = feature[tier as keyof Feature] as boolean;
      return (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleChange(index, tier, !checked)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
              checked 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-surface-200 text-surface-400 hover:bg-surface-300'
            }`}
          >
            {checked && <Check className="w-4 h-4" />}
          </button>
        </div>
      );
    }

    return (
      <input
        type="text"
        value={feature[tier as keyof Feature] as string}
        onChange={(e) => handleChange(index, tier, e.target.value)}
        className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
      />
    );
  };

  const VerificationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold">Verify Tier Rules</h2>
          </div>
          <button
            onClick={() => setShowVerificationModal(false)}
            className="text-surface-500 hover:text-surface-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-surface-600">
            Please review the tier rules carefully before saving. These changes will affect all new and existing business listings.
          </p>

          <div className="bg-surface-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Summary of Changes</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-5 gap-4">
                  <div className="font-medium">{feature.name}</div>
                  {TIERS.map(tier => (
                    <div key={tier.id}>
                      {CHECKBOX_FEATURES.includes(feature.name) 
                        ? (feature[tier.id as keyof Feature] ? '✓' : '✕')
                        : feature[tier.id as keyof Feature]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="px-4 py-2 text-surface-600 hover:text-surface-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚪</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Confirm & Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Tier Rules' }
            ]}
          />
        </div>

        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-900">Tier Rules</h1>
              <p className="text-surface-600">Manage subscription tier rules and permissions</p>
            </div>
          </div>

          <button
            onClick={() => setShowVerificationModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Save className="h-5 w-5" />
            Save Changes
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            Tier rules saved successfully!
          </div>
        )}

        {/* Pricing Header */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-4">
            {TIERS.map((tier) => (
              <div key={tier.id} className="bg-white rounded-lg p-6 text-center shadow-sm">
                <h3 className="text-xl font-semibold text-surface-900 mb-2">{tier.name}</h3>
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  ${tier.price.toFixed(2)}
                  <span className="text-sm text-surface-500">/mo</span>
                </div>
                <p className="text-surface-600 text-sm">
                  {tier.maxCategories === -1 
                    ? 'Unlimited categories' 
                    : `Up to ${tier.maxCategories} ${tier.maxCategories === 1 ? 'category' : 'categories'}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-surface-50 text-left text-sm font-semibold text-surface-900 border border-surface-200">
                  Feature
                </th>
                {TIERS.map((tier) => (
                  <th 
                    key={tier.id}
                    className="px-6 py-3 bg-surface-50 text-left text-sm font-semibold text-surface-900 border border-surface-200"
                  >
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-surface-50' : 'bg-white'}>
                  <td className="px-6 py-4 text-sm text-surface-900 border border-surface-200 font-medium">
                    <input
                      type="text"
                      value={feature.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                      className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                    />
                  </td>
                  {TIERS.map((tier) => (
                    <td key={tier.id} className="px-6 py-4 text-sm text-surface-600 border border-surface-200">
                      {renderFeatureInput(feature, index, tier.id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="bg-white border-t border-surface-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-surface-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {showVerificationModal && <VerificationModal />}
    </div>
  );
}