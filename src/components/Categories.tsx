import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { categories } from '../data/categories';
import { Building2, Globe2, Heart } from 'lucide-react';

const getCategoryIcon = (id: number) => {
  const icons = {
    1: Globe2,
    2: Heart,
    3: Building2
  };
  return icons[id as keyof typeof icons] || Globe2;
};

export default function Categories() {
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const businessesRef = collection(db, 'businesses');
        const querySnapshot = await getDocs(businessesRef);
        
        // Initialize counts
        const counts: { [key: string]: number } = {};
        categories.forEach(cat => {
          counts[cat.name] = 0;
        });

        // Count businesses in each category
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (Array.isArray(data.categories)) {
            data.categories.forEach((category: string) => {
              if (counts[category] !== undefined) {
                counts[category]++;
              }
            });
          } else if (data.category && counts[data.category] !== undefined) {
            counts[data.category]++;
          }
        });

        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  return (
    <section id="categories" className="pt-8 pb-24 bg-surface-100">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">
            Find Your People, Find Your Places...
          </h2>
          <p className="text-lg text-surface-600 max-w-2xl mx-auto">
            Browse all the services, spaces, and circles you need<br />
            - from tax pros to drag bingo... right here
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id);
            const count = categoryCounts[category.name] || 0;
            
            return (
              <Link
                key={category.id}
                to={`/category/${encodeURIComponent(category.name.toLowerCase())}`}
                className="group relative h-[260px] rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover brightness-110 contrast-110 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent group-hover:from-black/80 group-hover:via-black/50 transition-all duration-300" />
                </div>
                <div className="relative h-full p-4 flex flex-col justify-end z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center group-hover:bg-primary-500 transition-all duration-300">
                      <Icon className="h-5 w-5 text-white group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-xs font-medium text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                      {loading ? '...' : count.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1.5 group-hover:text-primary-200 transition-colors duration-300 line-clamp-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-100 group-hover:text-white transition-colors duration-300 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}