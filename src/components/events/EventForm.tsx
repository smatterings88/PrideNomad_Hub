import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Calendar, MapPin, Clock, Users, Image as ImageIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ImageUpload from '../ui/ImageUpload';
import Breadcrumb from '../ui/Breadcrumb';

interface Business {
  id: string;
  businessName: string;
  address: string;
  city: string;
  state: string;
}

export default function EventForm() {
  const navigate = useNavigate();
  const [userBusinesses, setUserBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    businessId: '',
    businessName: '',
    title: '',
    description: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    location: '',
    city: '',
    state: '',
    capacity: '',
    price: '',
    imageUrl: '',
    category: 'Community and Events'
  });

  useEffect(() => {
    const fetchUserBusinesses = async () => {
      if (!auth.currentUser) return;

      try {
        const businessesRef = collection(db, 'businesses');
        const q = query(
          businessesRef,
          where('userId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const businesses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          businessName: doc.data().businessName,
          address: doc.data().address,
          city: doc.data().city,
          state: doc.data().state
        }));

        setUserBusinesses(businesses);

        // If there's only one business, auto-select it
        if (businesses.length === 1) {
          const business = businesses[0];
          setFormData(prev => ({
            ...prev,
            businessId: business.id,
            businessName: business.businessName,
            location: business.address,
            city: business.city,
            state: business.state
          }));
        }
      } catch (err) {
        console.error('Error fetching user businesses:', err);
        setError('Failed to load your businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBusinesses();
  }, []);

  const handleBusinessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const businessId = e.target.value;
    const selectedBusiness = userBusinesses.find(b => b.id === businessId);
    
    if (selectedBusiness) {
      setFormData(prev => ({
        ...prev,
        businessId: selectedBusiness.id,
        businessName: selectedBusiness.businessName,
        location: selectedBusiness.address,
        city: selectedBusiness.city,
        state: selectedBusiness.state
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        businessId: '',
        businessName: '',
        location: '',
        city: '',
        state: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSubmitting(true);
    setError(null);

    try {
      const eventData = {
        ...formData,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
        date: formData.date.toISOString()
      };

      await addDoc(collection(db, 'events'), eventData);
      navigate('/');
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-surface-200 rounded" />
            <div className="h-12 bg-surface-200 rounded" />
            <div className="h-40 bg-surface-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Create Event' }
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-surface-900 mb-6">Create New Event</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="businessId" className="block text-sm font-medium text-surface-700 mb-1">
                Select Business *
              </label>
              <select
                id="businessId"
                value={formData.businessId}
                onChange={handleBusinessChange}
                className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select a business</option>
                {userBusinesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.businessName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-surface-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-surface-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Date *
                </label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                  className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  minDate={new Date()}
                  required
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-surface-700 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  id="capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  min="1"
                  className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-surface-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-surface-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-surface-700 mb-1">
                Price (leave empty if free)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">$</span>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-surface-700 mb-1">
                Event Image
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="flex-1 p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter image URL"
                />
                <ImageUpload
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                  onError={setError}
                />
              </div>
              <p className="text-sm text-surface-500 mt-1">
                Upload an image or provide a URL. Recommended size: 1920x960px, maximum file size: 1MB
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-surface-600 hover:text-surface-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin">⚪</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}