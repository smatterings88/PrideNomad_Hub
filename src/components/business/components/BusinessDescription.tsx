import React from 'react';
import { truncateDescription } from '../../../utils/tierRules';
import { Business } from '../types';

interface BusinessDescriptionProps {
  business: Business;
}

export default function BusinessDescription({ business }: BusinessDescriptionProps) {
  const truncatedDesc = truncateDescription(business.description, business.tier);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-4">About</h2>
      <div className="space-y-4">
        <p className="text-surface-600 whitespace-pre-line">
          {truncatedDesc}
        </p>
      </div>
    </div>
  );
}