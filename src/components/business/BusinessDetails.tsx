import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, limit, getDocs, doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Heart, X } from 'lucide-react';
import { categories } from '../../data/categories';
import { generateSlug } from '../../utils/slug';
import Breadcrumb from '../ui/Breadcrumb';
import ContactModal from './ContactModal';
import AuthModal from '../auth/AuthModal';
import BusinessHeader from './components/BusinessHeader';
import BusinessAttributes from './components/BusinessAttributes';
import BusinessDescription from './components/BusinessDescription';
import BusinessMedia from './components/BusinessMedia';
import BusinessContact from './components/BusinessContact';
import BusinessComments from './components/BusinessComments';
import BusinessTile, { BusinessTileData } from './components/BusinessTile';
import { Business } from './types';
import countryCodeList from 'country-codes-list';

const getCountryName = (code: string) => {
  const countries = countryCodeList.customList('countryCode', '{countryNameEn}');
  return countries[code] || code;
};

const initialState = {
  business: null as Business | null,
  relatedBusinesses: [] as BusinessTileData[],
  loading: true,
  error: null as string | null,
  showContactModal: false,
  showAuthModal: false,
  businessForClaim: null as Business | null,
  selectedPhoto: null as string | null,
  isLiked: false,
  likeLoading: false
};

export default function BusinessDetails() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(initialState);

  // Reset state when component unmounts or business ID changes
  useEffect(() => {
    setState(initialState);
    
    return () => {
      setState(initialState);
    };
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchBusinessAndLikeStatus = async () => {
      if (!id) return;

      try {
        const businessRef = doc(db, 'businesses', id);
        const businessDoc = await getDoc(businessRef);

        if (businessDoc.exists()) {
          const businessData = {
            id: businessDoc.id,
            ...businessDoc.data()
          } as Business;

          const correctSlug = generateSlug(businessData.businessName);
          if (slug !== correctSlug) {
            navigate(`/business/${id}/${correctSlug}`, { replace: true });
            return;
          }

          setState(prev => ({
            ...prev,
            business: businessData,
            businessForClaim: businessData
          }));

          // Check if the current user has liked this business
          if (auth.currentUser) {
            const userLikesRef = doc(db, 'users', auth.currentUser.uid);
            const userDoc = await getDoc(userLikesRef);
            if (userDoc.exists()) {
              const likedBusinesses = userDoc.data().likedBusinesses || [];
              setState(prev => ({ ...prev, isLiked: likedBusinesses.includes(id) }));
            }
          }

          // Fetch related businesses
          if (!['premium', 'elite'].includes(businessData.tier)) {
            const relatedQuery = query(
              collection(db, 'businesses'),
              where('categories', 'array-contains-any', businessData.categories),
              where('__name__', '!=', id),
              limit(3)
            );

            const relatedSnapshot = await getDocs(relatedQuery);
            const relatedData = relatedSnapshot.docs.map(doc => ({
              id: doc.id,
              businessName: doc.data().businessName,
              categories: Array.isArray(doc.data().categories) ? doc.data().categories : [doc.data().category || 'Uncategorized'],
              description: doc.data().description || '',
              city: doc.data().city || '',
              state: doc.data().state || '',
              coverImage: doc.data().coverImage || '',
              rating: typeof doc.data().rating === 'number' ? doc.data().rating : undefined,
              ratingCount: typeof doc.data().ratingCount === 'number' ? doc.data().ratingCount : undefined,
              verified: doc.data().verified || false,
              // Include business attributes for related businesses
              welcomeLGBTQ: doc.data().welcomeLGBTQ || false,
              lgbtqFriendlyStaff: doc.data().lgbtqFriendlyStaff || false,
              lgbtqOwned: doc.data().lgbtqOwned || false,
              safeEnvironment: doc.data().safeEnvironment || false
            }));

            setState(prev => ({ ...prev, relatedBusinesses: relatedData }));
          }
        } else {
          setState(prev => ({ ...prev, error: 'Business not found' }));
        }
      } catch (err) {
        console.error('Error fetching business:', err);
        setState(prev => ({ ...prev, error: 'Failed to load business details' }));
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchBusinessAndLikeStatus();
  }, [id, slug, navigate]);

  const handleLikeClick = async () => {
    if (!auth.currentUser) {
      setState(prev => ({ ...prev, showAuthModal: true }));
      return;
    }

    if (!state.business) return;

    setState(prev => ({ ...prev, likeLoading: true }));
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          likedBusinesses: [state.business.id]
        });
      } else {
        await updateDoc(userRef, {
          likedBusinesses: state.isLiked 
            ? arrayRemove(state.business.id)
            : arrayUnion(state.business.id)
        });
      }

      setState(prev => ({ ...prev, isLiked: !prev.isLiked }));
    } catch (err) {
      console.error('Error updating likes:', err);
    } finally {
      setState(prev => ({ ...prev, likeLoading: false }));
    }
  };

  const getCategoryImage = (categoryName: string): string => {
    const category = categories.find(c => c.name === categoryName);
    return category?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920';
  };

  const getCoverImage = (business: Business | BusinessTileData): string => {
    if (business.coverImage) return business.coverImage;
    if (business.categories && business.categories.length > 0) {
      return getCategoryImage(business.categories[0]);
    }
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920';
  };

  const handleClaimBusiness = () => {
    if (!auth.currentUser) {
      setState(prev => ({ ...prev, showAuthModal: true }));
    } else {
      navigate('/payment', {
        state: { businessData: state.businessForClaim }
      });
    }
  };

  const handleAuthModalClose = () => {
    setState(prev => ({ ...prev, showAuthModal: false }));
    
    if (auth.currentUser && state.businessForClaim) {
      navigate('/payment', {
        state: { businessData: state.businessForClaim }
      });
    }
  };

  const renderClaimButton = () => {
    if (!state.business || state.business.userId) return null;

    return (
      <div className="bg-amber-50 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              Is this your business?
            </h3>
            <p className="text-amber-700">
              Claim this listing to manage your business information and reach more customers.
            </p>
          </div>
          <button
            onClick={handleClaimBusiness}
            className="flex items-center gap-2 bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors w-full sm:w-auto justify-center"
          >
            <Heart className="h-5 w-5" />
            Claim Business
          </button>
        </div>
      </div>
    );
  };

  const renderPhotoModal = () => {
    if (!state.selectedPhoto) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="relative max-w-4xl max-h-[90vh]">
          <button
            onClick={() => setState(prev => ({ ...prev, selectedPhoto: null }))}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={state.selectedPhoto} 
            alt="Enlarged view" 
            className="max-w-full max-h-[85vh] object-contain"
          />
        </div>
      </div>
    );
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-16">
        <div className="h-[400px] bg-surface-200 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 -mt-20">
          <div className="w-40 h-40 bg-surface-300 animate-pulse rounded-lg" />
          <div className="mt-4 space-y-4">
            <div className="h-8 w-64 bg-surface-200 animate-pulse rounded" />
            <div className="h-4 w-48 bg-surface-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (state.error || !state.business) {
    return (
      <div className="min-h-screen bg-surface-100 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900 mb-2">
            {state.error || 'Business not found'}
          </h2>
          <p className="text-surface-600">
            The business you're looking for might have been removed or is temporarily unavailable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-16">
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb
              items={[
                { label: 'Categories', href: '/#categories' },
                { label: state.business.categories[0], href: `/category/${encodeURIComponent(state.business.categories[0].toLowerCase())}` },
                { label: state.business.businessName }
              ]}
            />
          </div>
        </div>

        <div className="relative h-[300px] sm:h-[400px]">
          <div className="absolute inset-0">
            <img
              src={getCoverImage(state.business)}
              alt={state.business.businessName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920';
              }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <BusinessHeader 
            business={state.business}
            isLiked={state.isLiked}
            likeLoading={state.likeLoading}
            handleLikeClick={handleLikeClick}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {renderClaimButton()}
          <BusinessAttributes business={state.business} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <BusinessDescription business={state.business} />
              <BusinessMedia 
                business={state.business}
                selectedPhoto={state.selectedPhoto}
                setSelectedPhoto={(photo) => setState(prev => ({ ...prev, selectedPhoto: photo }))}
              />
            </div>
            <div className="space-y-6">
              <BusinessContact 
                business={state.business}
                setShowContactModal={(show) => setState(prev => ({ ...prev, showContactModal: show }))}
                getCountryName={getCountryName}
              />
            </div>
          </div>

          <div className="mt-8">
            <BusinessComments businessId={state.business.id} />
          </div>
        </div>

        {!['premium', 'elite'].includes(state.business.tier) && state.relatedBusinesses.length > 0 && (
          <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-surface-900 mb-8">Related Businesses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {state.relatedBusinesses.map((business) => (
                  <BusinessTile
                    key={business.id}
                    business={business}
                    getCoverImage={getCoverImage}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <ContactModal
          isOpen={state.showContactModal}
          onClose={() => setState(prev => ({ ...prev, showContactModal: false }))}
          businessName={state.business.businessName}
          businessEmail={state.business.email}
          ownerEmail={state.business.ownerEmail || ''}
        />

        <AuthModal 
          isOpen={state.showAuthModal}
          onClose={handleAuthModalClose}
        />

        {renderPhotoModal()}
      </div>
    </div>
  );
}