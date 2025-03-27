export interface Business {
  id: string;
  businessName: string;
  categories: string[];
  description: string;
  rating?: number;
  ratingCount?: number;
  ratingUsers?: string[];
  reviews?: number;
  city: string;
  state: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  coverImage: string;
  videoUrl?: string;
  videoAutoplay?: boolean;
  photos: string[];
  hours: BusinessHours[];
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  verified?: boolean;
  metaImage?: string;
  metaDescription?: string;
  tier: string;
  ownerEmail?: string;
  userId?: string;
  // Business attributes
  welcomeLGBTQ?: boolean;
  lgbtqFriendlyStaff?: boolean;
  lgbtqOwned?: boolean;
  safeEnvironment?: boolean;
  // Location coordinates
  latitude?: number;
  longitude?: number;
  // Source information
  listingSource?: string;
  sourceUrl?: string;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessOnboardingProps {
  initialData?: any;
  mode?: 'create' | 'edit';
}

export interface Rating {
  userId: string;
  rating: number;
  timestamp: Date;
}