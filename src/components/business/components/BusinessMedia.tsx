import React from 'react';
import { Video, Image } from 'lucide-react';
import { Business } from '../types';

interface BusinessMediaProps {
  business: Business;
  selectedPhoto: string | null;
  setSelectedPhoto: (url: string | null) => void;
}

export default function BusinessMedia({ 
  business,
  selectedPhoto,
  setSelectedPhoto
}: BusinessMediaProps) {
  const getVideoEmbedUrl = (url: string): string | null => {
    try {
      const videoUrl = new URL(url);
      
      // Handle YouTube URLs
      if (videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be')) {
        let videoId = '';
        
        if (videoUrl.hostname.includes('youtube.com')) {
          videoId = videoUrl.searchParams.get('v') || '';
        } else if (videoUrl.hostname.includes('youtu.be')) {
          videoId = videoUrl.pathname.slice(1);
        }
        
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}${business?.videoAutoplay ? '?autoplay=1' : ''}`;
        }
      }
      
      // Handle Vimeo URLs
      if (videoUrl.hostname.includes('vimeo.com')) {
        const videoId = videoUrl.pathname.split('/').pop();
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}${business?.videoAutoplay ? '?autoplay=1' : ''}`;
        }
      }
    } catch (error) {
      console.error('Error parsing video URL:', error);
    }
    
    return null;
  };

  const renderVideo = () => {
    if (!business?.videoUrl || !['premium', 'elite'].includes(business.tier)) {
      return null;
    }

    const embedUrl = getVideoEmbedUrl(business.videoUrl);
    if (!embedUrl) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Video className="h-6 w-6 text-primary-600" />
          Video
        </h2>
        <div className="relative pt-[56.25%]">
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  };

  const renderPhotos = () => {
    if (!business || !business.photos || business.photos.length === 0) {
      return null;
    }

    // Filter out empty photo URLs
    const validPhotos = business.photos.filter(photo => photo && photo.trim() !== '');
    
    if (validPhotos.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Image className="h-6 w-6 text-primary-600" />
          Photos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {validPhotos.map((photo, index) => (
            <div 
              key={index} 
              className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img 
                src={photo} 
                alt={`${business.businessName} - Photo ${index + 1}`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderVideo()}
      {renderPhotos()}
    </>
  );
}