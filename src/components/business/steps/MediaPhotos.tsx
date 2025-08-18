import React from 'react';
import ImageUpload from '../../ui/ImageUpload';
import { Video, ToggleLeft, ToggleRight } from 'lucide-react';
import { validateUrl } from '../../../utils/validation';
import { TIER_LIMITS } from '../../../utils/constants';

interface MediaPhotosProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleArrayChange: (index: number, value: string, field: 'services' | 'amenities' | 'photos') => void;
  addArrayItem: (field: 'services' | 'amenities' | 'photos') => void;
  removeArrayItem: (index: number, field: 'services' | 'amenities' | 'photos') => void;
  setFormData: (data: any) => void;
  setError: (error: string | null) => void;
}

export default function MediaPhotos({ 
  formData, 
  handleChange, 
  handleArrayChange, 
  addArrayItem, 
  removeArrayItem,
  setFormData,
  setError
}: MediaPhotosProps) {
  const [validationErrors, setValidationErrors] = React.useState<{ [key: string]: string }>({});

  // Safety check to prevent errors when formData is undefined
  if (!formData) {
    return (
      <div className="p-6 bg-amber-50 rounded-lg">
        <p className="text-amber-800">Loading media details...</p>
      </div>
    );
  }

  const tierLimits = TIER_LIMITS[formData.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.essentials;
  const canEmbedVideo = tierLimits.allowsVideo;
  const maxImages = tierLimits.maxImages;

  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value) return;

    const urlResult = validateUrl(value);
    const errors = { ...validationErrors };

    if (!urlResult.isValid) {
      errors[name] = urlResult.errors[0];
    } else {
      delete errors[name];
    }

    setValidationErrors(errors);
  };

  const handleAutoplayToggle = () => {
    setFormData(prev => ({
      ...prev,
      videoAutoplay: !prev.videoAutoplay
    }));
  };

  // Check if we can add more photos
  const canAddMorePhotos = maxImages === -1 || (formData.photos?.length || 0) < maxImages;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-surface-700 mb-1">
          Business Logo URL *
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            id="logo"
            name="logo"
            value={formData.logo || ''}
            onChange={handleChange}
            onBlur={handleUrlBlur}
            className={`flex-1 p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              validationErrors.logo ? 'border-red-300' : 'border-surface-300'
            }`}
            required
          />
          <ImageUpload
            onUploadComplete={(url) => {
              setFormData(prev => ({ ...prev, logo: url }));
            }}
            onError={(error) => setError(error)}
          />
        </div>
        {validationErrors.logo && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.logo}</p>
        )}
        <p className="mt-1 text-sm text-surface-500">
          Please provide a URL to your business logo (recommended size: 200x200px, max file size: 1MB)
        </p>
      </div>

      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-surface-700 mb-1">
          Cover Image URL *
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            id="coverImage"
            name="coverImage"
            value={formData.coverImage || ''}
            onChange={handleChange}
            onBlur={handleUrlBlur}
            className={`flex-1 p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              validationErrors.coverImage ? 'border-red-300' : 'border-surface-300'
            }`}
            required
          />
          <ImageUpload
            onUploadComplete={(url) => {
              setFormData(prev => ({ ...prev, coverImage: url }));
            }}
            onError={(error) => setError(error)}
          />
        </div>
        {validationErrors.coverImage && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.coverImage}</p>
        )}
        <p className="mt-1 text-sm text-surface-500">
          Please provide a URL to your business cover image (recommended size: 1920x400px, max file size: 1MB)
        </p>
      </div>

      {canEmbedVideo && (
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-surface-700 mb-1">
            Video URL
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl || ''}
                  onChange={handleChange}
                  onBlur={handleUrlBlur}
                  placeholder="Enter YouTube or Vimeo URL"
                  className={`w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors.videoUrl ? 'border-red-300' : 'border-surface-300'
                  }`}
                />
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
              </div>
            </div>
            {validationErrors.videoUrl && (
              <p className="text-sm text-red-600">{validationErrors.videoUrl}</p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoplayToggle}
                className="flex items-center gap-2 text-sm text-surface-700 hover:text-surface-900"
              >
                {formData.videoAutoplay ? (
                  <ToggleRight className="h-5 w-5 text-primary-600" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-surface-400" />
                )}
                Autoplay video
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-surface-500">
            Paste a YouTube or Vimeo video URL to embed on your business page
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Additional Photos {maxImages !== -1 && `(${formData.photos?.filter((p: string) => p).length || 0}/${maxImages})`}
        </label>
        {(formData.photos || []).map((photo: string, index: number) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="url"
              value={photo || ''}
              onChange={(e) => handleArrayChange(index, e.target.value, 'photos')}
              className="flex-1 p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter photo URL"
            />
            <ImageUpload
              onUploadComplete={(url) => {
                handleArrayChange(index, url, 'photos');
              }}
              onError={(error) => setError(error)}
            />
            {index > 2 && (
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'photos')}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {canAddMorePhotos && (
          <button
            type="button"
            onClick={() => addArrayItem('photos')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            + Add Photo
          </button>
        )}
        {!canAddMorePhotos && maxImages !== -1 && (
          <p className="text-sm text-amber-600">
            You've reached the maximum number of photos for your tier ({maxImages}).
          </p>
        )}
        <p className="mt-1 text-sm text-surface-500">
          Recommended size: 800x600px or larger with 4:3 aspect ratio for best display. Maximum file size: 1MB per image
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-surface-900 mb-3">Social Sharing Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="metaImage" className="block text-sm font-medium text-surface-700 mb-1">
              Social Share Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="metaImage"
                name="metaImage"
                value={formData.metaImage || ''}
                onChange={handleChange}
                placeholder="Leave empty to use default image"
                className="flex-1 p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <ImageUpload
                onUploadComplete={(url) => {
                  setFormData(prev => ({ ...prev, metaImage: url }));
                }}
                onError={(error) => setError(error)}
              />
            </div>
            <p className="mt-1 text-sm text-surface-500">
              This image will be shown when your business is shared on social media (recommended size: 1200x630px, max file size: 1MB)
            </p>
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-surface-700 mb-1">
              Social Share Description
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Leave empty to use default description"
              className="w-full p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-surface-500">
              This description will be shown when your business is shared on social media (max 160 characters)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}