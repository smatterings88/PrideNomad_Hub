import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Loader2, Circle } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import ListBusinessModal from './business/ListBusinessModal';

export default function Hero() {
  const navigate = useNavigate();
  const { city, loading: locationLoading, error: locationError } = useGeolocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isListBusinessModalOpen, setIsListBusinessModalOpen] = useState(false);

  React.useEffect(() => {
    if (city) {
      setLocation(city);
    }
  }, [city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    // Construct the search query parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (location) params.append('location', location);

    // Navigate to search results page
    navigate(`/search?${params.toString()}`);
    setIsSearching(false);
  };

  return (
    <div className="relative bg-primary-600 pt-24">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover opacity-20"
          src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/67a2f644d3d09475ab28136e.webp"
          alt="Pride background"
        />
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8">
          PrideNomad Hub:<br />
          Your Global LGBTQ+ Guide to Everything
        </h1>
        <p className="text-xl text-primary-100 text-center mb-4 max-w-3xl mx-auto">
          Connecting You to Safe, Welcoming Businesses & Experiences<br />
          —Anywhere You Go.
        </p>
        <div className="flex items-center justify-center gap-3 text-primary-100 mb-12">
          <span>Travel</span>
          <Circle className="h-2 w-2 fill-current" />
          <span>Business</span>
          <Circle className="h-2 w-2 fill-current" />
          <span>Lifestyle</span>
          <Circle className="h-2 w-2 fill-current" />
          <span>Community</span>
        </div>
        
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-surface-200">
                <Search className="h-5 w-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Business type or name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 p-2 focus:outline-none"
                />
              </div>
              <div className="flex-1 flex items-center px-4 relative">
                <MapPin className="h-5 w-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 p-2 focus:outline-none"
                />
                {locationLoading && (
                  <Loader2 className="h-5 w-5 text-primary-600 animate-spin absolute right-4" />
                )}
                {locationError && (
                  <div className="absolute -bottom-8 left-0 text-sm text-red-500">
                    {locationError}
                  </div>
                )}
              </div>
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </form>

        <ListBusinessModal
          isOpen={isListBusinessModalOpen}
          onClose={() => setIsListBusinessModalOpen(false)}
          onGetStarted={() => {}}
        />
      </div>
    </div>
  );
}