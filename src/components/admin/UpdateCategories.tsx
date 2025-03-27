import React, { useState } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ArrowRight, Loader2 } from 'lucide-react';
import { CATEGORY_MAPPING } from '../../data/categories';
import Breadcrumb from '../ui/Breadcrumb';

interface MigrationStats {
  total: number;
  updated: number;
  skipped: number;
  failed: number;
}

export default function UpdateCategories() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState<MigrationStats>({
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0
  });
  const [progress, setProgress] = useState(0);

  const updateBusinessCategories = async () => {
    if (!window.confirm('Are you sure you want to update all business categories? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setStats({
      total: 0,
      updated: 0,
      skipped: 0,
      failed: 0
    });
    setProgress(0);

    try {
      // Get all businesses
      const businessesRef = collection(db, 'businesses');
      const querySnapshot = await getDocs(businessesRef);
      const totalBusinesses = querySnapshot.docs.length;
      
      let updated = 0;
      let skipped = 0;
      let failed = 0;

      for (let i = 0; i < querySnapshot.docs.length; i++) {
        const doc = querySnapshot.docs[i];
        const data = doc.data();
        
        try {
          if (Array.isArray(data.categories)) {
            // Map old categories to new ones
            const newCategories = data.categories.map((category: string) => 
              CATEGORY_MAPPING[category] || category
            );

            // Remove duplicates
            const uniqueCategories = [...new Set(newCategories)];

            // Only update if categories have changed
            if (JSON.stringify(data.categories) !== JSON.stringify(uniqueCategories)) {
              await updateDoc(doc.ref, {
                categories: uniqueCategories
              });
              updated++;
            } else {
              skipped++;
            }
          } else if (data.category) {
            // Handle single category field
            const newCategory = CATEGORY_MAPPING[data.category] || data.category;
            
            await updateDoc(doc.ref, {
              categories: [newCategory],
              category: newCategory
            });
            updated++;
          } else {
            skipped++;
          }
        } catch (err) {
          console.error(`Error updating business ${doc.id}:`, err);
          failed++;
        }

        // Update progress
        const progress = Math.round(((i + 1) / totalBusinesses) * 100);
        setProgress(progress);
        
        // Update stats
        setStats({
          total: totalBusinesses,
          updated,
          skipped,
          failed
        });
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error updating categories:', err);
      setError('Failed to update categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Update Categories' }
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-surface-900 mb-6">
            Update Business Categories
          </h1>

          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-amber-800 mb-4">
                Category Migration Plan
              </h2>
              <div className="space-y-2">
                {Object.entries(CATEGORY_MAPPING).map(([oldCategory, newCategory]) => (
                  <div key={oldCategory} className="flex items-center gap-2">
                    <span className="text-amber-700">{oldCategory}</span>
                    <ArrowRight className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-900 font-medium">{newCategory}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                Category migration completed successfully!
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-surface-600">
                  Processing... {progress}% complete
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-surface-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-surface-900">{stats.total}</div>
                    <div className="text-sm text-surface-600">Total Businesses</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{stats.updated}</div>
                    <div className="text-sm text-green-600">Updated</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">{stats.skipped}</div>
                    <div className="text-sm text-yellow-600">Skipped</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={updateBusinessCategories}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating Categories...
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5" />
                  Start Category Migration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}