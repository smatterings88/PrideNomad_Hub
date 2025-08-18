import React from 'react';
import { censorText } from '../../../utils/censor';

interface BusinessDetailsStepProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleArrayChange: (index: number, value: string, field: 'services' | 'amenities' | 'photos') => void;
  addArrayItem: (field: 'services' | 'amenities' | 'photos') => void;
  removeArrayItem: (index: number, field: 'services' | 'amenities' | 'photos') => void;
}

export default function BusinessDetailsStep({ 
  formData, 
  handleChange, 
  handleArrayChange, 
  addArrayItem, 
  removeArrayItem 
}: BusinessDetailsStepProps) {
  // Safety check to prevent errors when formData is undefined
  if (!formData) {
    return (
      <div className="p-6 bg-amber-50 rounded-lg">
        <p className="text-amber-800">Loading business details...</p>
      </div>
    );
  }

  // Wrap handleArrayChange to apply censorship
  const handleCensoredArrayChange = (index: number, value: string, field: 'services' | 'amenities' | 'photos') => {
    // Only apply censorship to services and amenities, not photo URLs
    const censoredValue = field !== 'photos' ? censorText(value) : value;
    handleArrayChange(index, censoredValue, field);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="yearEstablished" className="block text-sm font-medium text-surface-700 mb-1">
            Year Established
          </label>
          <input
            type="number"
            id="yearEstablished"
            name="yearEstablished"
            value={formData.yearEstablished || ''}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="employeeCount" className="block text-sm font-medium text-surface-700 mb-1">
            Number of Employees
          </label>
          <select
            id="employeeCount"
            name="employeeCount"
            value={formData.employeeCount || ''}
            onChange={handleChange}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select range</option>
            <option value="1-5">1-5</option>
            <option value="6-20">6-20</option>
            <option value="21-50">21-50</option>
            <option value="51-200">51-200</option>
            <option value="201+">201+</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Services Offered
        </label>
        {(formData.services || []).map((service: string, index: number) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={service || ''}
              onChange={(e) => handleCensoredArrayChange(index, e.target.value, 'services')}
              className="flex-1 p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter a service"
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'services')}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('services')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          + Add Service
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Amenities
        </label>
        {(formData.amenities || []).map((amenity: string, index: number) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={amenity || ''}
              onChange={(e) => handleCensoredArrayChange(index, e.target.value, 'amenities')}
              className="flex-1 p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter an amenity"
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'amenities')}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('amenities')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          + Add Amenity
        </button>
      </div>
    </div>
  );
}