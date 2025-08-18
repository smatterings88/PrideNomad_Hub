import React from 'react';
import { Phone, Mail, Globe2, MapPin, Navigation } from 'lucide-react';
import { Business } from '../types';
import { GoogleMap, Marker } from '@react-google-maps/api';

interface BusinessContactProps {
  business: Business;
  setShowContactModal: (show: boolean) => void;
  getCountryName: (code: string) => string;
}

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

export default function BusinessContact({ 
  business, 
  setShowContactModal,
  getCountryName 
}: BusinessContactProps) {
  const canShowContactForm = business.tier !== 'essentials';

  const center = business.latitude && business.longitude ? {
    lat: business.latitude,
    lng: business.longitude
  } : undefined;

  const handleGetDirections = () => {
    if (business.latitude && business.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Contact Information</h2>
        {canShowContactForm && (
          <button
            onClick={() => setShowContactModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            <Mail className="h-5 w-5" />
            Contact Us
          </button>
        )}
      </div>

      <div className="space-y-3">
        {business.phone && business.tier !== 'essentials' && (
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary-600" />
            <a href={`tel:${business.phone}`} className="text-surface-700 hover:text-primary-600">
              {business.phone}
            </a>
          </div>
        )}

        {business.email && business.tier !== 'essentials' && (
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary-600" />
            <a href={`mailto:${business.email}`} className="text-surface-700 hover:text-primary-600">
              {business.email}
            </a>
          </div>
        )}

        {business.website && business.tier !== 'essentials' && (
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary-600" />
            <a 
              href={business.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-surface-700 hover:text-primary-600 break-words"
            >
              {business.website}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-600" />
          <span className="text-surface-700">
            {business.tier === 'essentials' 
              ? `${business.city}, ${business.state}, ${getCountryName(business.country)}`
              : `${business.address}, ${business.city}, ${business.state}, ${getCountryName(business.country)}`
            }
          </span>
        </div>
      </div>

      {/* Map Section */}
      {center && (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg overflow-hidden border border-surface-200">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={15}
              options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false
              }}
            >
              <Marker position={center} />
            </GoogleMap>
          </div>
          <button
            onClick={handleGetDirections}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            <Navigation className="h-5 w-5" />
            Get Directions
          </button>
        </div>
      )}
    </div>
  );
}