import React, { useState, useEffect } from 'react';
import countryCodeList from 'country-codes-list';
import { MapPin } from 'lucide-react';
import LocationMap from '../components/LocationMap';
import MapErrorBoundary from '../components/MapErrorBoundary';

interface ContactInformationProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

// Get country list sorted by name, ensuring unique entries
const countryList = Array.from(
  new Map(
    countryCodeList
      .all()
      .map(country => [
        country.countryCode,
        {
          code: country.countryCode,
          name: country.countryNameEn
        }
      ])
  ).values()
).sort((a, b) => a.name.localeCompare(b.name));

export default function ContactInformation({ formData, handleChange }: ContactInformationProps) {
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    formData.latitude && formData.longitude 
      ? { lat: formData.latitude, lng: formData.longitude }
      : null
  );

  // Helper function to create synthetic events
  const createEvent = (name: string, value: string) => ({
    target: { name, value }
  }) as React.ChangeEvent<HTMLInputElement>;

  // Helper function to handle address parsing
  const handleAddressUpdate = (addressParts: string[]) => {
    try {
      if (addressParts.length >= 3) {
        handleChange(createEvent('address', addressParts[0]));
        handleChange(createEvent('city', addressParts[1]));
        const stateZip = addressParts[2].split(' ');
        if (stateZip.length >= 2) {
          handleChange(createEvent('state', stateZip[0]));
          handleChange(createEvent('zipCode', stateZip[1]));
        }
      }
    } catch (error) {
      console.error('Error updating address fields:', error);
      setLocationError('Failed to parse address information');
    }
  };

  // Helper function to update form fields from location data
  const updateFormFields = async (lat: number, lng: number, address?: string) => {
    try {
      // Update latitude and longitude
      handleChange(createEvent('latitude', lat.toString()));
      handleChange(createEvent('longitude', lng.toString()));

      // If we have a pre-formatted address from Places API, use it
      if (address) {
        const addressParts = address.split(',').map(part => part.trim());
        handleAddressUpdate(addressParts);
        return;
      }

      // Fallback to reverse geocoding
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from geocoding service');
      }

      // Update fields if data is available
      if (data.city) handleChange(createEvent('city', data.city));
      if (data.principalSubdivision) handleChange(createEvent('state', data.principalSubdivision));
      if (data.countryCode) handleChange(createEvent('country', data.countryCode));
      if (data.postcode) handleChange(createEvent('zipCode', data.postcode));

      // Construct address from available components
      const addressParts = [
        data.streetNumber,
        data.street,
        data.locality
      ].filter(Boolean);

      if (addressParts.length > 0) {
        handleChange(createEvent('address', addressParts.join(' ')));
      } else {
        // If no address components are available, set a placeholder
        handleChange(createEvent('address', `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`));
      }
    } catch (error) {
      console.error('Error updating location fields:', error);
      // Set a user-friendly error message but keep the coordinates
      setLocationError('Could not retrieve full address details. Please enter manually.');
    }
  };

  const handleLocationSelect = async (location: { lat: number; lng: number; address?: string }) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      setLocationError('Invalid location data received');
      return;
    }

    setLocationError(null);
    setSelectedLocation(location);
    
    try {
      await updateFormFields(location.lat, location.lng, location.address);
    } catch (error) {
      console.error('Location selection error:', error);
      setLocationError('Failed to process location. Please try again or enter details manually.');
    }
  };

  // Effect to update loading state when location is selected
  useEffect(() => {
    if (selectedLocation) {
      setLocationLoading(false);
    }
  }, [selectedLocation]);

  if (!formData) {
    return (
      <div className="p-6 bg-amber-50 rounded-lg">
        <p className="text-amber-800">Loading contact information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-surface-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1">
            Business Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-surface-700 mb-1">
          Website
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website || ''}
          onChange={handleChange}
          className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-surface-700">
            Location Details *
          </label>
          {locationLoading ? (
            <span className="text-sm text-surface-600">
              Detecting your location...
            </span>
          ) : locationError ? (
            <span className="text-sm text-red-600 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {locationError}
            </span>
          ) : (
            <span className="text-sm text-green-600">
              Location detected
            </span>
          )}
        </div>

        <MapErrorBoundary>
          <LocationMap
            onLocationSelect={handleLocationSelect}
            initialLocation={selectedLocation || undefined}
          />
        </MapErrorBoundary>

        <div className="mt-4">
          <label htmlFor="address" className="block text-sm font-medium text-surface-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-surface-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-surface-700 mb-1">
            State/Province *
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state || ''}
            onChange={handleChange}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-surface-700 mb-1">
            Country *
          </label>
          <select
            id="country"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select a country</option>
            {countryList.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-surface-700 mb-1">
            ZIP/Postal Code *
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode || ''}
            onChange={handleChange}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-surface-900 mb-3">Social Media (Optional)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="social.facebook" className="block text-sm font-medium text-surface-700 mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              id="social.facebook"
              name="social.facebook"
              value={formData.socialMedia?.facebook || ''}
              onChange={handleChange}
              className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="social.twitter" className="block text-sm font-medium text-surface-700 mb-1">
              Twitter URL
            </label>
            <input
              type="url"
              id="social.twitter"
              name="social.twitter"
              value={formData.socialMedia?.twitter || ''}
              onChange={handleChange}
              className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="social.instagram" className="block text-sm font-medium text-surface-700 mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              id="social.instagram"
              name="social.instagram"
              value={formData.socialMedia?.instagram || ''}
              onChange={handleChange}
              className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="social.linkedin" className="block text-sm font-medium text-surface-700 mb-1">
              LinkedIn URL
            </label>
            <input
              type="url"
              id="social.linkedin"
              name="social.linkedin"
              value={formData.socialMedia?.linkedin || ''}
              onChange={handleChange}
              className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}