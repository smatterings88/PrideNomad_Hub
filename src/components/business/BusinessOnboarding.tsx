import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, doc, deleteDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Building2, ArrowLeft, ArrowRight, Check, Save, Home } from 'lucide-react';
import Breadcrumb from '../ui/Breadcrumb';
import { BusinessOnboardingProps } from './types';
import { defaultFormData, STEPS } from './constants';
import BasicInformation from './steps/BasicInformation';
import BusinessDetailsStep from './steps/BusinessDetails';
import ContactInformation from './steps/ContactInformation';
import MediaPhotos from './steps/MediaPhotos';
import BusinessHours from './steps/BusinessHours';

// Set this to true to show debug messages
const SHOW_DEBUG = false;

export default function BusinessOnboarding({ initialData, mode = 'create' }: BusinessOnboardingProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [formData, setFormData] = useState(() => {
    // Check for business data in location state
    const locationState = location.state as { businessData?: any };
    const businessData = locationState?.businessData;

    if (mode === 'edit' && initialData) {
      return {
        ...defaultFormData,
        ...initialData,
        socialMedia: {
          ...defaultFormData.socialMedia,
          ...(initialData.socialMedia || {})
        },
        services: initialData.services || defaultFormData.services,
        amenities: initialData.amenities || defaultFormData.amenities,
        photos: initialData.photos || defaultFormData.photos,
        hours: initialData.hours || defaultFormData.hours,
        videoUrl: initialData.videoUrl || '',
        videoAutoplay: initialData.videoAutoplay || false,
        subCategories: initialData.subCategories || {},
        welcomeLGBTQ: initialData.welcomeLGBTQ || false,
        lgbtqFriendlyStaff: initialData.lgbtqFriendlyStaff || false,
        lgbtqOwned: initialData.lgbtqOwned || false,
        safeEnvironment: initialData.safeEnvironment || false,
        latitude: initialData.latitude || null,
        longitude: initialData.longitude || null
      };
    }

    // If we have business data from claiming, use it
    if (businessData) {
      return {
        ...defaultFormData,
        ...businessData,
        socialMedia: {
          ...defaultFormData.socialMedia,
          ...(businessData.socialMedia || {})
        },
        services: businessData.services || defaultFormData.services,
        amenities: businessData.amenities || defaultFormData.amenities,
        photos: businessData.photos || defaultFormData.photos,
        hours: businessData.hours || defaultFormData.hours,
        videoUrl: businessData.videoUrl || '',
        videoAutoplay: businessData.videoAutoplay || false,
        subCategories: businessData.subCategories || {},
        welcomeLGBTQ: businessData.welcomeLGBTQ || false,
        lgbtqFriendlyStaff: businessData.lgbtqFriendlyStaff || false,
        lgbtqOwned: businessData.lgbtqOwned || false,
        safeEnvironment: businessData.safeEnvironment || false,
        latitude: businessData.latitude || null,
        longitude: businessData.longitude || null
      };
    }

    return {
      ...defaultFormData,
      subCategories: {},
      latitude: null,
      longitude: null
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const social = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [social]: value
        }
      }));
    } else if (name.startsWith('hours.')) {
      const [_, index, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        hours: prev.hours.map((hour, i) => {
          if (i === parseInt(index)) {
            if (field === 'closed') {
              return { ...hour, closed: !hour.closed };
            }
            return { ...hour, [field]: value };
          }
          return hour;
        })
      }));
    } else if (name === 'latitude' || name === 'longitude') {
      // Handle coordinate updates
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubCategoryChange = (categoryName: string, subCategories: string[]) => {
    setFormData(prev => ({
      ...prev,
      subCategories: {
        ...prev.subCategories,
        [categoryName]: subCategories
      }
    }));
  };

  const handleArrayChange = (index: number, value: string, field: 'services' | 'amenities' | 'photos') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'services' | 'amenities' | 'photos') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'services' | 'amenities' | 'photos') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      setError('You must be signed in to manage business listings');
      return;
    }

    setLoading(true);
    setError(null);
    if (SHOW_DEBUG) setDebugInfo(null);

    try {
      const businessData = {
        ...formData,
        userId: auth.currentUser.uid,
        ownerEmail: auth.currentUser.email,
        updatedAt: serverTimestamp(),
        // Initialize rating fields if not present
        rating: formData.rating || 0,
        ratingCount: formData.ratingCount || 0
      };

      // Check if we're claiming an existing business
      const locationState = location.state as { businessData?: any };
      const originalBusiness = locationState?.businessData;

      if (originalBusiness?.id) {
        try {
          if (SHOW_DEBUG) setDebugInfo(`Attempting to handle original business with ID: ${originalBusiness.id}`);
          
          // First check if the business exists
          const originalRef = doc(db, 'businesses', originalBusiness.id);
          const businessDoc = await getDoc(originalRef);
          
          if (!businessDoc.exists()) {
            if (SHOW_DEBUG) setDebugInfo(`Business with ID ${originalBusiness.id} does not exist`);
          } else {
            const businessData = businessDoc.data();
            if (SHOW_DEBUG) setDebugInfo(`Business exists. userId: ${businessData.userId || 'null'}, ownerEmail: ${businessData.ownerEmail || 'null'}`);
            
            // Update the existing business and automatically set it as verified
            try {
              // Get the user's current role to determine business tier
              const userRef = doc(db, 'users', auth.currentUser.uid);
              const userDoc = await getDoc(userRef);
              let businessTier = 'essentials'; // Default tier
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const userRole = userData.role || 'Regular User';
                
                // Map user role to business tier
                const roleToTier: Record<string, string> = {
                  'Regular User': 'essentials',
                  'Enhanced User': 'enhanced',
                  'Premium User': 'premium',
                  'Elite User': 'elite'
                };
                
                businessTier = roleToTier[userRole] || 'essentials';
              }
              
              await updateDoc(originalRef, {
                ...formData,
                userId: auth.currentUser.uid,
                ownerEmail: auth.currentUser.email,
                updatedAt: serverTimestamp(),
                createdAt: businessData.createdAt || serverTimestamp(),
                status: 'approved', // Set status to approved
                verified: true, // Automatically verify the business
                tier: businessTier, // Set tier based on user's subscription
                // Preserve existing rating data
                rating: businessData.rating || 0,
                ratingCount: businessData.ratingCount || 0
              });
              
              if (SHOW_DEBUG) setDebugInfo(prev => `${prev || ''}\nSuccessfully updated and verified original business`);
              
              // Navigate after successful update
              setTimeout(() => {
                navigate('/');
              }, 2000);
              
              // Exit early since we've updated the existing business
              setLoading(false);
              return;
            } catch (updateErr) {
              const errorMessage = updateErr instanceof Error ? updateErr.message : 'Unknown error';
              if (SHOW_DEBUG) setDebugInfo(`Error updating original business: ${errorMessage}`);
              
              // If update fails, continue with the create new approach
              if (SHOW_DEBUG) setDebugInfo(prev => `${prev || ''}\nFalling back to creating new business record`);
            }
          }
        } catch (checkErr) {
          const errorMessage = checkErr instanceof Error ? checkErr.message : 'Unknown error';
          if (SHOW_DEBUG) setDebugInfo(`Error checking original business: ${errorMessage}`);
        }
      }

      // Create new record if we didn't successfully update an existing one
      // Get the user's current role to determine business tier
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      let businessTier = 'essentials'; // Default tier
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role || 'Regular User';
        
        // Map user role to business tier
        const roleToTier: Record<string, string> = {
          'Regular User': 'essentials',
          'Enhanced User': 'enhanced',
          'Premium User': 'premium',
          'Elite User': 'elite'
        };
        
        businessTier = roleToTier[userRole] || 'essentials';
      }
      
      businessData.createdAt = serverTimestamp();
      businessData.status = 'pending';
      businessData.verified = false;
      businessData.tier = businessTier; // Set tier based on user's subscription
      const newDocRef = await addDoc(collection(db, 'businesses'), businessData);
      if (SHOW_DEBUG) setDebugInfo(prev => `${prev || ''}\nCreated new business with ID: ${newDocRef.id}`);

      // Wait a moment to ensure the debug info is visible before navigating
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error saving business:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save business listing';
      setError(errorMessage);
      
      if (err instanceof Error && SHOW_DEBUG) {
        setDebugInfo(`Error details: ${err.stack || 'No stack trace available'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < STEPS.length - 1) {
      handleNext();
      return;
    }

    handleSave();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInformation 
            formData={formData}
            handleChange={handleChange}
            handleSubCategoryChange={handleSubCategoryChange}
          />
        );
      case 1:
        return (
          <BusinessDetailsStep
            formData={formData}
            handleChange={handleChange}
            handleArrayChange={handleArrayChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 2:
        return (
          <ContactInformation
            formData={formData}
            handleChange={handleChange}
          />
        );
      case 3:
        return (
          <MediaPhotos
            formData={formData}
            handleChange={handleChange}
            handleArrayChange={handleArrayChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
            setFormData={setFormData}
            setError={setError}
          />
        );
      case 4:
        return (
          <BusinessHours
            formData={formData}
            handleChange={handleChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: mode === 'create' ? 'Onboard Business' : 'Edit Business' }
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-surface-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-surface-900">
                  {mode === 'edit' ? 'Edit Business' : 'Onboard New Business'}
                </h1>
                <p className="text-surface-600">
                  {mode === 'edit' ? 'Update business information' : 'Add a new business listing'}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index < currentStep
                          ? 'bg-primary-600 text-white'
                          : index === currentStep
                          ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                          : 'bg-surface-100 text-surface-400'
                      }`}
                    >
                       {index < currentStep ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs mt-1 text-surface-600">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-full h-0.5 mx-2 ${
                        index < currentStep ? 'bg-primary-600' : 'bg-surface-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {error && (
                <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              {SHOW_DEBUG && debugInfo && (
                <div className="mb-6 p-3 bg-blue-100 text-blue-700 rounded-md text-sm whitespace-pre-line">
                  <strong>Debug Info:</strong>
                  <br />
                  {debugInfo}
                </div>
              )}

              {renderStepContent()}
            </div>

            <div className="border-t border-surface-200 p-6 flex justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 text-surface-600 hover:text-surface-900 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save & Exit
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-4 py-2 text-surface-600 hover:text-surface-900"
                >
                  <Home className="h-4 w-4" />
                  Cancel
                </button>
              </div>
              
              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⚪</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      {mode === 'edit' ? 'Save Changes' : 'Submit Listing'}
                      <Save className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}