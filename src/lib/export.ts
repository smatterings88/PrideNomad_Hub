import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { generateSlug } from '../utils/slug';
import { ADMIN_EMAILS } from '../utils/constants';

export async function exportUnclaimedListings(): Promise<Blob> {
  // Check if user is authenticated and is an admin
  const currentUser = auth.currentUser;
  if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email || '')) {
    throw new Error('Unauthorized: Only administrators can export listings');
  }

  try {
    // Get all businesses
    const businessesRef = collection(db, 'businesses');
    const querySnapshot = await getDocs(businessesRef);
    
    // Filter for unclaimed businesses (those without userId or with null/undefined userId)
    const unclaimedBusinesses = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(business => !business.userId && !business.ownerEmail);

    // Create CSV header
    const csvHeader = 'Business Name,URL,Categories,Email,Phone,Address,City,State\n';
    
    // Create CSV rows
    const csvRows = unclaimedBusinesses.map(business => {
      const url = `${window.location.origin}/business/${business.id}/${generateSlug(business.businessName)}`;
      
      // Format categories as a semicolon-separated list
      const categories = Array.isArray(business.categories) 
        ? business.categories.join('; ')
        : (business.category || '');
      
      // Escape fields that might contain commas
      const escapeCsvField = (field: string) => {
        if (!field) return '';
        return `"${field.replace(/"/g, '""')}"`;
      };

      return [
        escapeCsvField(business.businessName || ''),
        escapeCsvField(url),
        escapeCsvField(categories),
        escapeCsvField(business.email || ''),
        escapeCsvField(business.phone || ''),
        escapeCsvField(business.address || ''),
        escapeCsvField(business.city || ''),
        escapeCsvField(business.state || '')
      ].join(',');
    }).join('\n');

    // Combine header and rows
    const csvContent = csvHeader + csvRows;

    // Create Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return blob;
  } catch (error) {
    console.error('Error exporting unclaimed listings:', error);
    throw error;
  }
}

export async function exportClaimedListings(): Promise<Blob> {
  // Check if user is authenticated and is an admin
  const currentUser = auth.currentUser;
  if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email || '')) {
    throw new Error('Unauthorized: Only administrators can export listings');
  }

  try {
    // Get all businesses
    const businessesRef = collection(db, 'businesses');
    const querySnapshot = await getDocs(businessesRef);
    
    // Filter for claimed businesses (those with userId or ownerEmail)
    const claimedBusinesses = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(business => business.userId || business.ownerEmail);

    // Sort businesses by tier (Elite > Premium > Enhanced > Essentials)
    const tierOrder = { 'elite': 0, 'premium': 1, 'enhanced': 2, 'essentials': 3 };
    claimedBusinesses.sort((a, b) => {
      const tierA = a.tier || 'essentials';
      const tierB = b.tier || 'essentials';
      return tierOrder[tierA as keyof typeof tierOrder] - tierOrder[tierB as keyof typeof tierOrder];
    });

    // Create CSV header
    const csvHeader = 'Business Name,Tier,URL,Categories,Owner Name,Owner Email,Owner Phone,Address,City,State,Country,Zip Code\n';
    
    // Create CSV rows
    const csvRows = claimedBusinesses.map(business => {
      const url = `${window.location.origin}/business/${business.id}/${generateSlug(business.businessName)}`;
      
      // Format categories as a semicolon-separated list
      const categories = Array.isArray(business.categories) 
        ? business.categories.join('; ')
        : (business.category || '');
      
      // Escape fields that might contain commas
      const escapeCsvField = (field: string) => {
        if (!field) return '';
        return `"${field.replace(/"/g, '""')}"`;
      };

      // Get owner name from displayName or email
      const ownerName = business.ownerName || '';

      return [
        escapeCsvField(business.businessName || ''),
        escapeCsvField(business.tier || 'essentials'),
        escapeCsvField(url),
        escapeCsvField(categories),
        escapeCsvField(ownerName),
        escapeCsvField(business.ownerEmail || ''),
        escapeCsvField(business.phone || ''),
        escapeCsvField(business.address || ''),
        escapeCsvField(business.city || ''),
        escapeCsvField(business.state || ''),
        escapeCsvField(business.country || ''),
        escapeCsvField(business.zipCode || '')
      ].join(',');
    }).join('\n');

    // Combine header and rows
    const csvContent = csvHeader + csvRows;

    // Create Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return blob;
  } catch (error) {
    console.error('Error exporting claimed listings:', error);
    throw error;
  }
}