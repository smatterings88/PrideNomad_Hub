import React from 'react';
import { LoadScript } from '@react-google-maps/api';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Define libraries array outside component to prevent recreation on each render
const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"];

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

export default function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  if (!MAPS_API_KEY) {
    console.warn('Google Maps API key is missing');
    return <>{children}</>;
  }

  return (
    <LoadScript 
      googleMapsApiKey={MAPS_API_KEY}
      libraries={libraries}
    >
      {children}
    </LoadScript>
  );
}