import React, { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { categories } from '../../../data/categories';
import { useAuth } from '../../../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { censorText } from '../../../utils/censor';
import { validateBusinessName, validateDescription } from '../../../utils/validation';
import { TIER_LIMITS } from '../../../utils/constants';

interface BasicInformationProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubCategoryChange: (categoryName: string, subCategories: string[]) => void;
}

const TIERS = [
  {
    id: 'essentials',
    name: 'Essentials',
    price: 0,
    ...TIER_LIMITS.essentials
  },
  {
    id: 'enhanced',
    name: 'Enhanced',
    price: 9.97,
    ...TIER_LIMITS.enhanced
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 24.97,
    ...TIER_LIMITS.premium
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 49.97,
    ...TIER_LIMITS.elite
  }
];

export default function BasicInformation({ formData, handleChange, handleSubCategoryChange }: BasicInformationProps) {
  const [newSubCategory, setNewSubCategory] = useState<{ [key: string]: string }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if user is admin
  const allowedEmails = ['mgzobel@icloud.com', 'kenergizer@mac.com'];
  const isAdmin = user && allowedEmails.includes(user.email || '');
  
  // Safety check to prevent errors when formData is undefined
  if (!formData) {
    return (
      <div className="p-6 bg-amber-50 rounded-lg">
        <p className="text-amber-800">Loading business information...</p>
      </div>
    );
  }

  const selectedTier = TIERS.find(tier => tier.id === formData.tier);
  const maxCategories = selectedTier?.maxCategories || 1;
  const allowSubCategories = selectedTier?.allowsSubCategories || false;

  // Create a synthetic event with censored value
  const createCensoredEvent = (name: string, value: string) => ({
    target: {
      name,
      value: ['businessName', 'description'].includes(name) ? censorText(value) : value
    }
  } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>);

  const handleCensoredChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleChange(createCensoredEvent(name, value));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const errors = { ...validationErrors };

    switch (name) {
      case 'businessName':
        const nameResult = validateBusinessName(value);
        if (!nameResult.isValid) {
          errors[name] = nameResult.errors[0];
        } else {
          delete errors[name];
        }
        break;
      case 'description':
        const descResult = validateDescription(value, formData.tier);
        if (!descResult.isValid) {
          errors[name] = descResult.errors[0];
        } else {
          delete errors[name];
        }
        break;
      default:
        break;
    }

    setValidationErrors(errors);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedCategories = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCategories.push(options[i].value);
      }
    }

    // Limit selections based on tier
    const limitedCategories = maxCategories === -1 
      ? selectedCategories 
      : selectedCategories.slice(0, maxCategories);

    handleChange(createCensoredEvent('categories', limitedCategories));
  };

  const addSubCategory = (categoryName: string) => {
    if (!newSubCategory[categoryName]?.trim()) return;

    // Apply censorship to sub-category
    const censoredSubCategory = censorText(newSubCategory[categoryName].trim());
    
    const currentSubCategories = formData.subCategories?.[categoryName] || [];
    const updatedSubCategories = [...currentSubCategories, censoredSubCategory];
    
    handleSubCategoryChange(categoryName, updatedSubCategories);
    setNewSubCategory(prev => ({ ...prev, [categoryName]: '' }));
  };

  const removeSubCategory = (categoryName: string, index: number) => {
    const currentSubCategories = formData.subCategories?.[categoryName] || [];
    const updatedSubCategories = currentSubCategories.filter((_: string, i: number) => i !== index);
    
    handleSubCategoryChange(categoryName, updatedSubCategories);
  };

  // Determine if tier selection should be disabled
  const disableTierSelection = !isAdmin;

  // Handle business attributes change
  const handleAttributeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    handleChange({
      target: {
        name,
        value: checked
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">
          Select Your Tier *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {TIERS.map((tier) => (
            <label
              key={tier.id}
              className={`relative flex flex-col p-4 ${disableTierSelection ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} rounded-lg border-2 transition-all ${
                formData.tier === tier.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-surface-200 hover:border-primary-200'
              }`}
            >
              <input
                type="radio"
                name="tier"
                value={tier.id}
                checked={formData.tier === tier.id}
                onChange={handleCensoredChange}
                disabled={disableTierSelection}
                className="sr-only"
              />
              <span className="text-lg font-semibold text-surface-900">
                {tier.name}
              </span>
              <span className="text-surface-600">
                ${tier.price.toFixed(2)}/mo
              </span>
              <span className="text-sm text-surface-500 mt-2">
                {tier.maxCategories === -1 
                  ? 'Unlimited categories' 
                  : `Up to ${tier.maxCategories} ${tier.maxCategories === 1 ? 'category' : 'categories'}`}
              </span>
              {formData.tier === tier.id && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </label>
          ))}
        </div>
        {disableTierSelection && (
          <p className="mt-2 text-sm text-amber-600">
            Your tier is determined by your subscription plan selection.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-surface-700 mb-1">
          Business Name *
        </label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          value={formData.businessName || ''}
          onChange={handleCensoredChange}
          onBlur={handleBlur}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            validationErrors.businessName ? 'border-red-300' : 'border-surface-300'
          }`}
          required
        />
        {validationErrors.businessName && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.businessName}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="listingSource" className="block text-sm font-medium text-surface-700 mb-1">
            Listing Source
          </label>
          <input
            type="text"
            id="listingSource"
            name="listingSource"
            value={formData.listingSource || ''}
            onChange={handleCensoredChange}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="sourceUrl" className="block text-sm font-medium text-surface-700 mb-1">
            Source URL
          </label>
          <input
            type="url"
            id="sourceUrl"
            name="sourceUrl"
            value={formData.sourceUrl || ''}
            onChange={handleCensoredChange}
            className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-3">
          Business Attributes
        </label>
        <div className="bg-surface-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="welcomeLGBTQ"
              name="welcomeLGBTQ"
              checked={formData.welcomeLGBTQ || false}
              onChange={handleAttributeChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
            />
            <label htmlFor="welcomeLGBTQ" className="ml-2 block text-sm text-surface-700">
              We welcome LGBTQ+ customers
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lgbtqFriendlyStaff"
              name="lgbtqFriendlyStaff"
              checked={formData.lgbtqFriendlyStaff || false}
              onChange={handleAttributeChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
            />
            <label htmlFor="lgbtqFriendlyStaff" className="ml-2 block text-sm text-surface-700">
              We have LGBTQ+ friendly staff
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lgbtqOwned"
              name="lgbtqOwned"
              checked={formData.lgbtqOwned || false}
              onChange={handleAttributeChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
            />
            <label htmlFor="lgbtqOwned" className="ml-2 block text-sm text-surface-700">
              We are LGBTQ+ owned and operated
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="safeEnvironment"
              name="safeEnvironment"
              checked={formData.safeEnvironment || false}
              onChange={handleAttributeChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
            />
            <label htmlFor="safeEnvironment" className="ml-2 block text-sm text-surface-700">
              We provide a safe, inclusive environment
            </label>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="categories" className="block text-sm font-medium text-surface-700 mb-1">
          Categories * ({maxCategories === -1 ? 'Unlimited' : `Select up to ${maxCategories}`})
        </label>
        <select
          id="categories"
          name="categories"
          multiple
          value={formData.categories || []}
          onChange={handleCategoryChange}
          className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[200px]"
          required
        >
          {categories.map(category => (
            <option 
              key={category.id} 
              value={category.name}
              disabled={maxCategories !== -1 && formData.categories && formData.categories.length >= maxCategories && !formData.categories.includes(category.name)}
            >
              {category.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-surface-500">
          Hold Ctrl (Windows) or Command (Mac) to select multiple categories
        </p>
      </div>

      {allowSubCategories && formData.categories && formData.categories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-surface-900">Sub-categories</h3>
          <p className="text-sm text-surface-600">
            Add specific sub-categories for each selected category to help customers find your business more easily
          </p>
          
          {formData.categories.map((categoryName: string) => (
            <div key={categoryName} className="bg-surface-50 p-4 rounded-lg">
              <h4 className="font-medium text-surface-900 mb-2">{categoryName}</h4>
              
              <div className="space-y-2">
                {/* Existing sub-categories */}
                {formData.subCategories?.[categoryName]?.map((subCategory: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 bg-white px-3 py-2 rounded-md text-surface-700">
                      {subCategory}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSubCategory(categoryName, index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                
                {/* Add new sub-category */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubCategory[categoryName] || ''}
                    onChange={(e) => setNewSubCategory(prev => ({
                      ...prev,
                      [categoryName]: e.target.value
                    }))}
                    placeholder="Enter a sub-category"
                    className="flex-1 p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => addSubCategory(categoryName)}
                    className="bg-primary-500 text-white p-2 rounded-md hover:bg-primary-600"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-surface-700 mb-1">
          Business Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleCensoredChange}
          rows={6}
          className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
        <p className="mt-1 text-sm text-surface-500">
          Describe your business, services, and what makes you unique.
        </p>
      </div>
    </div>
  );
}