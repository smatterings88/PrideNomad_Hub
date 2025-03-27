import React from 'react';
import { Business } from '../types';

interface BusinessAttributesProps {
  business: Business;
}

export default function BusinessAttributes({ business }: BusinessAttributesProps) {
  // Check if any attributes are set to true
  const hasAttributes = business.welcomeLGBTQ || business.lgbtqFriendlyStaff || business.lgbtqOwned || business.safeEnvironment;
  
  if (!hasAttributes) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Business Attributes</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {business.welcomeLGBTQ && (
          <div className="flex flex-col items-center">
            <img 
              src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/67c655cc6d2b83342192d48e.png" 
              alt="We welcome LGBTQ+ customers" 
              className="h-20 w-20 object-contain mb-2"
            />
            <span className="text-sm text-center text-surface-700 font-medium">We welcome LGBTQ+ customers</span>
          </div>
        )}
        
        {business.lgbtqFriendlyStaff && (
          <div className="flex flex-col items-center">
            <img 
              src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/67c655cc6d2b83f6cc92d48f.png" 
              alt="We have LGBTQ+ friendly staff" 
              className="h-20 w-20 object-contain mb-2"
            />
            <span className="text-sm text-center text-surface-700 font-medium">We have LGBTQ+ friendly staff</span>
          </div>
        )}
        
        {business.lgbtqOwned && (
          <div className="flex flex-col items-center">
            <img 
              src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/67c655ccb882cc5bf9b1d1a1.png" 
              alt="We are LGBTQ+ owned and operated" 
              className="h-20 w-20 object-contain mb-2"
            />
            <span className="text-sm text-center text-surface-700 font-medium">We are LGBTQ+ owned and operated</span>
          </div>
        )}
        
        {business.safeEnvironment && (
          <div className="flex flex-col items-center">
            <img 
              src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/67c655cc3d59035579503703.png" 
              alt="We provide a safe, inclusive environment" 
              className="h-20 w-20 object-contain mb-2"
            />
            <span className="text-sm text-center text-surface-700 font-medium">We provide a safe, inclusive environment</span>
          </div>
        )}
      </div>
    </div>
  );
}