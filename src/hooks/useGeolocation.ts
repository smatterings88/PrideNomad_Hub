import { useState, useEffect } from 'react';

interface Location {
  city: string;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [location, setLocation] = useState<Location>({
    city: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fallbackToIP = async () => {
      try {
        // Fallback to IP-based geolocation
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (isMounted && data.city && data.region) {
          setLocation({
            city: `${data.city}, ${data.region}`,
            loading: false,
            error: null,
          });
        } else {
          throw new Error('Location data unavailable');
        }
      } catch (error) {
        if (isMounted) {
          setLocation({
            city: '',
            loading: false,
            error: 'Unable to determine location',
          });
        }
      }
    };

    const getLocation = () => {
      if (!navigator.geolocation) {
        fallbackToIP();
        return;
      }

      const timeoutId = setTimeout(() => {
        if (isMounted && location.loading) {
          fallbackToIP();
        }
      }, 5000); // 5 second timeout

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId);
          if (!isMounted) return;

          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            if (data.city && data.principalSubdivision) {
              setLocation({
                city: `${data.city}, ${data.principalSubdivision}`,
                loading: false,
                error: null,
              });
            } else {
              throw new Error('Location data unavailable');
            }
          } catch (error) {
            fallbackToIP();
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          if (!isMounted) return;
          
          // If geolocation fails, fall back to IP-based location
          fallbackToIP();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return location;
}