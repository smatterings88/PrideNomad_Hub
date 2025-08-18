import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { Search, Loader2, AlertTriangle } from 'lucide-react';

interface LocationMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

interface MapStyles {
  container: { width: string; height: string };
  searchBox: { width: string };
}

const mapStyles: MapStyles = {
  container: {
    width: '100%',
    height: '400px'
  },
  searchBox: {
    width: '100%'
  }
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function LocationMap({ onLocationSelect, initialLocation }: LocationMapProps) {
  // Validate API key first
  if (!MAPS_API_KEY) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          <p>Google Maps API key is missing. Please check your environment variables.</p>
        </div>
      </div>
    );
  }

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's current location
  useEffect(() => {
    if (!map) return;

    if (initialLocation) {
      setMarkerPosition(initialLocation);
      setLoading(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMarkerPosition(userLocation);
          map.panTo(userLocation);
          onLocationSelect(userLocation);
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location. Please search or click on the map.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  }, [map, initialLocation, onLocationSelect]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);

  const onPlacesChanged = useCallback(() => {
    if (!searchBox || !map) return;

    const places = searchBox.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const location = place.geometry?.location;
      if (location) {
        const newPosition = {
          lat: location.lat(),
          lng: location.lng()
        };
        map.panTo(newPosition);
        setMarkerPosition(newPosition);
        onLocationSelect({
          ...newPosition,
          address: place.formatted_address
        });
      }
    }
  }, [searchBox, map, onLocationSelect]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarkerPosition(newPosition);
    onLocationSelect(newPosition);
  }, [onLocationSelect]);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarkerPosition(newPosition);
    onLocationSelect(newPosition);
  }, [onLocationSelect]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <StandaloneSearchBox
        onLoad={onSearchBoxLoad}
        onPlacesChanged={onPlacesChanged}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-surface-200 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </StandaloneSearchBox>

      <div className="relative rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-surface-100/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-surface-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading map...</span>
            </div>
          </div>
        )}

        <GoogleMap
          mapContainerStyle={mapStyles.container}
          center={markerPosition || defaultCenter}
          zoom={13}
          onLoad={onMapLoad}
          onClick={onMapClick}
          options={{
            mapTypeId: 'hybrid',
            mapTypeControl: true,
            mapTypeControlOptions: {
              position: 3, // TOP_RIGHT
              style: 1, // HORIZONTAL_BAR
              mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
            },
            fullscreenControl: true,
            fullscreenControlOptions: {
              position: 3 // TOP_RIGHT
            },
            streetViewControl: true,
            streetViewControlOptions: {
              position: 3 // TOP_RIGHT
            },
            zoomControl: true,
            zoomControlOptions: {
              position: 3 // TOP_RIGHT
            }
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </div>

      {markerPosition && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Latitude
            </label>
            <input
              type="text"
              value={markerPosition.lat.toFixed(6)}
              readOnly
              className="w-full p-2 bg-surface-50 border border-surface-200 rounded-md text-surface-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Longitude
            </label>
            <input
              type="text"
              value={markerPosition.lng.toFixed(6)}
              readOnly
              className="w-full p-2 bg-surface-50 border border-surface-200 rounded-md text-surface-700"
            />
          </div>
        </div>
      )}
    </div>
  );
}