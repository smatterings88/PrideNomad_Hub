import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import BusinessOnboarding from './BusinessOnboarding';
import { Search, MapPin, Building2 } from 'lucide-react';
import Breadcrumb from '../ui/Breadcrumb';

interface Business {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  status: string;
  verified: boolean;
  logo?: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  zipCode: string;
  yearEstablished: string;
  employeeCount: string;
  services: string[];
  amenities: string[];
  photos: string[];
  coverImage: string;
  hours: Array<{
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }>;
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  metaImage?: string;
  metaDescription?: string;
}

export default function EditBusiness() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        if (!auth.currentUser) {
          setError('You must be signed in to view businesses');
          navigate('/');
          return;
        }

        // Only fetch businesses owned by the current user
        const q = query(
          collection(db, 'businesses'),
          where('userId', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const businessesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Business[];

        setBusinesses(businessesData);
      } catch (err) {
        setError('Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };

    if (!id) {
      fetchBusinesses();
    } else {
      const fetchSingleBusiness = async () => {
        try {
          const businessRef = doc(db, 'businesses', id);
          const businessDoc = await getDoc(businessRef);

          if (businessDoc.exists()) {
            const businessData = {
              id: businessDoc.id,
              ...businessDoc.data()
            } as Business;

            // Check if user is authorized to edit this business
            if (!auth.currentUser) {
              setError('You must be signed in to edit a business');
              navigate('/');
              return;
            }

            // Allow editing if user owns the business or is an admin
            const isOwner = businessData.userId === auth.currentUser.uid;
            const isAdmin = auth.currentUser.email === 'mgzobel@icloud.com' || 
                           auth.currentUser.email === 'kenergizer@mac.com';

            if (!isOwner && !isAdmin) {
              setError('You are not authorized to edit this business');
              navigate('/');
              return;
            }

            // Ensure all required fields exist with default values
            const defaultedBusiness = {
              services: [],
              amenities: [],
              photos: [],
              hours: [
                { day: 'Monday', open: '09:00', close: '17:00', closed: false },
                { day: 'Tuesday', open: '09:00', close: '17:00', closed: false },
                { day: 'Wednesday', open: '09:00', close: '17:00', closed: false },
                { day: 'Thursday', open: '09:00', close: '17:00', closed: false },
                { day: 'Friday', open: '09:00', close: '17:00', closed: false },
                { day: 'Saturday', open: '10:00', close: '15:00', closed: true },
                { day: 'Sunday', open: '10:00', close: '15:00', closed: true }
              ],
              socialMedia: {
                facebook: '',
                twitter: '',
                instagram: '',
                linkedin: ''
              },
              ...businessData
            };

            setSelectedBusiness(defaultedBusiness);
          } else {
            setError('Business not found');
          }
        } catch (err) {
          setError('Failed to load business details');
        } finally {
          setLoading(false);
        }
      };

      fetchSingleBusiness();
    }
  }, [id]);

  const filteredBusinesses = businesses.filter(business =>
    business.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (business.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    `${business.city}, ${business.state}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectBusiness = (business: Business) => {
    navigate(`/edit-business/${business.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-100 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900 mb-2">{error}</h2>
          <p className="text-surface-600">Unable to load business details.</p>
        </div>
      </div>
    );
  }

  if (selectedBusiness) {
    return <BusinessOnboarding initialData={selectedBusiness} mode="edit" />;
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Edit Business' }
            ]}
          />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Edit Business</h1>
            <p className="text-surface-600 mt-2">Select a business to edit its details</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Building2 className="h-12 w-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600">
              {searchTerm ? 'No businesses found matching your search.' : 'No businesses available.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBusinesses.map((business, index) => (
              <div
                key={`edit-business-${business.id}-${index}`}
                onClick={() => handleSelectBusiness(business)}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  {business.logo ? (
                    <img
                      src={business.logo}
                      alt={business.businessName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-surface-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-surface-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-surface-900 mb-1">
                      {business.businessName}
                    </h2>
                    <div className="flex gap-4 text-sm text-surface-600">
                      <span>Category: {business.category}</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{`${business.city}, ${business.state}`}</span>
                      </div>
                      <span>Status: {business.status}</span>
                      <span>Verified: {business.verified ? 'Yes' : 'No'}</span>
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