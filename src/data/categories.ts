export interface Category {
  id: number;
  name: string;
  description: string;
  count: number;
  image: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: 'Restaurants & Food Services',
    description: 'Restaurants, cafes, catering services, food trucks, and specialty food shops',
    count: 0,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 2,
    name: 'Retail & Shopping',
    description: 'Boutiques, stores, markets, and specialty retail shops',
    count: 0,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 3,
    name: 'Health & Medical Services',
    description: 'Healthcare providers, clinics, therapists, and wellness centers',
    count: 0,
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 4,
    name: 'Home Services',
    description: 'Plumbing, HVAC, electricians, and home maintenance services',
    count: 0,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 5,
    name: 'Automotive',
    description: 'Auto repair, dealerships, car washes, and automotive services',
    count: 0,
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 6,
    name: 'Beauty & Personal Care',
    description: 'Salons, barbershops, spas, and beauty services',
    count: 0,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-pink-100 text-pink-800'
  },
  {
    id: 7,
    name: 'Professional Services',
    description: 'Lawyers, accountants, consultants, and business services',
    count: 0,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 8,
    name: 'Real Estate',
    description: 'Real estate agents, property management, and housing services',
    count: 0,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-cyan-100 text-cyan-800'
  },
  {
    id: 9,
    name: 'Hotels & Hospitality',
    description: 'Hotels, motels, bed & breakfasts, and hospitality services',
    count: 0,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 10,
    name: 'Entertainment & Nightlife',
    description: 'Bars, clubs, theaters, and entertainment venues',
    count: 0,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-rose-100 text-rose-800'
  },
  {
    id: 11,
    name: 'Education & Training',
    description: 'Schools, tutoring services, and vocational training centers',
    count: 0,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-amber-100 text-amber-800'
  },
  {
    id: 12,
    name: 'Fitness & Recreation',
    description: 'Gyms, yoga studios, and sports facilities',
    count: 0,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-lime-100 text-lime-800'
  },
  {
    id: 13,
    name: 'Recreation or Sports Organization',
    description: 'Sports clubs, teams, leagues, and recreational organizations',
    count: 0,
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 14,
    name: 'Community Organization',
    description: 'Nonprofits, charities, NGOs, and social service organizations',
    count: 0,
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=1920',
    color: 'bg-teal-100 text-teal-800'
  }
];

export const getCategoryColor = (categoryName: string): string => {
  const category = categories.find(c => c.name === categoryName);
  return category?.color || 'bg-gray-100 text-gray-800';
};

// Category mapping for migration
export const CATEGORY_MAPPING: { [key: string]: string } = {
  'Accommodations': 'Hotels & Hospitality',
  'Emergency Services and Legal Support': 'Professional Services',
  'Travel Resources': 'Hotels & Hospitality',
  'Community and Events': 'Community Organization',
  'Health and Wellness': 'Health & Medical Services',
  'Work and Co-Working Spaces': 'Real Estate',
  'Community Engagement': 'Community Organization',
  'Dining and Leisure': 'Restaurants & Food Services',
  'Professional Services': 'Professional Services',
  'Sustainable and Ethical Choices': 'Community Organization'
};