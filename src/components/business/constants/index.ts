export const defaultFormData = {
  tier: 'essentials',
  businessName: '',
  categories: [],
  subCategories: {},
  description: '',
  yearEstablished: '',
  employeeCount: '',
  services: [''],
  amenities: [''],
  website: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  country: 'US',
  zipCode: '',
  logo: '',
  coverImage: '',
  videoUrl: '',
  videoAutoplay: false,
  photos: ['', '', ''],
  hours: [
    { day: 'Monday', open: '09:00', close: '17:00', closed: false },
    { day: 'Tuesday', open: '09:00', close: '17:00', closed: false },
    { day: 'Wednesday', open: '09:00', close: '17:00', closed: false },
    { day: 'Thursday', open: '09:00', close: '17:00', closed: false },
    { day: 'Friday', open: '09:00', close: '17:00', closed: false },
    { day: 'Saturday', open: '10:00', close: '15:00', closed: true },
    { day: 'Sunday', open: '10:00', close: '15:00', closed: true }
  ],
  socialMedia: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  },
  metaImage: '',
  metaDescription: '',
  // Business attributes
  welcomeLGBTQ: false,
  lgbtqFriendlyStaff: false,
  lgbtqOwned: false,
  safeEnvironment: false,
  // Location coordinates
  latitude: null,
  longitude: null,
  // Source information
  listingSource: '',
  sourceUrl: ''
};

export const STEPS = [
  { id: 'basic', title: 'Basic Information' },
  { id: 'details', title: 'Business Details' },
  { id: 'contact', title: 'Contact Information' },
  { id: 'media', title: 'Media & Photos' },
  { id: 'hours', title: 'Business Hours' }
];