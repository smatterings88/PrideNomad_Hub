// Admin email addresses - this array is dynamically updated when admins are added/removed
export const ADMIN_EMAILS: string[] = [
  'mgzobel@icloud.com',
  'kenergizer@mac.com'
];

// Application constants
export const APP_CONFIG = {
  name: 'PrideNomad Hub',
  version: '1.0.0',
  supportEmail: 'support@pridenomad.com',
  maxFileSize: 1024 * 1024, // 1MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  defaultPageSize: 20,
  maxSearchResults: 100
} as const;

// Business tier limits
export const TIER_LIMITS = {
  essentials: {
    maxCategories: 1,
    maxImages: 1,
    maxDescriptionLength: 100,
    allowsVideo: false,
    allowsSubCategories: false
  },
  enhanced: {
    maxCategories: 2,
    maxImages: 3,
    maxDescriptionLength: 500,
    allowsVideo: false,
    allowsSubCategories: false
  },
  premium: {
    maxCategories: 5,
    maxImages: 10,
    maxDescriptionLength: -1, // Unlimited
    allowsVideo: true,
    allowsSubCategories: true
  },
  elite: {
    maxCategories: -1, // Unlimited
    maxImages: -1, // Unlimited
    maxDescriptionLength: -1, // Unlimited
    allowsVideo: true,
    allowsSubCategories: true
  }
} as const;

// Cache keys
export const CACHE_KEYS = {
  businesses: 'businesses',
  categories: 'categories',
  userProfile: 'userProfile',
  searchResults: 'searchResults'
} as const;