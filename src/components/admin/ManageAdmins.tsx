import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserPlus, Trash2, Save, Search } from 'lucide-react';
import Breadcrumb from '../ui/Breadcrumb';
import { ADMIN_EMAILS } from '../../utils/constants';

interface Admin {
  id: string;
  email: string;
  role: string;
  addedAt: Date;
}

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const adminsRef = collection(db, 'admins');
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(adminsRef, 
      (snapshot) => {
        const adminsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          addedAt: doc.data().addedAt?.toDate() || new Date()
        })) as Admin[];

        setAdmins(adminsList.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime()));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching admins:', err);
        setError('Failed to load admin list');
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const email = newAdminEmail.toLowerCase();
      
      // Add to Firestore using email as document ID
      const adminRef = doc(db, 'admins', email);
      await setDoc(adminRef, {
        email,
        role: 'admin',
        addedAt: new Date()
      });

      setNewAdminEmail('');
      setSuccess('Admin added successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding admin:', err);
      setError('Failed to add admin');
    }
  };

  const handleRemoveAdmin = async (adminId: string, email: string) => {
    // Don't allow removing super admins
    if (['mgzobel@icloud.com', 'kenergizer@mac.com'].includes(email)) {
      setError('Cannot remove super admin');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this admin?')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteDoc(doc(db, 'admins', adminId));
      setSuccess('Admin removed successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing admin:', err);
      setError('Failed to remove admin');
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumb items={[{ label: 'Manage Admins' }]} />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb items={[{ label: 'Manage Admins' }]} />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Manage Admins</h1>
            <p className="text-surface-600 mt-2">
              Add or remove administrators for the platform
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Add Admin Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-surface-900 mb-4">Add New Admin</h2>
          <form onSubmit={handleAddAdmin} className="flex gap-4">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Enter admin email address"
              className="flex-1 p-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <UserPlus className="h-5 w-5" />
              Add Admin
            </button>
          </form>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
            <input
              type="text"
              placeholder="Search admins by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Admins List */}
        <div className="grid gap-4">
          {filteredAdmins.map((admin) => (
            <div
              key={admin.id}
              className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-surface-900">{admin.email}</h3>
                <p className="text-sm text-surface-500">
                  Added on {admin.addedAt.toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                disabled={['mgzobel@icloud.com', 'kenergizer@mac.com'].includes(admin.email)}
                className={`flex items-center gap-2 px-4 py-2 ${
                  ['mgzobel@icloud.com', 'kenergizer@mac.com'].includes(admin.email)
                    ? 'text-surface-400 cursor-not-allowed'
                    : 'text-red-600 hover:text-red-700'
                }`}
              >
                <Trash2 className="h-5 w-5" />
                Remove
              </button>
            </div>
          ))}

          {filteredAdmins.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-surface-600">No admins found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}