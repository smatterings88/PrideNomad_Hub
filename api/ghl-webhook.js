import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp, addDoc, limit } from 'firebase/firestore';

// Firebase configuration - use environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Role hierarchy for smart upgrades
const roleHierarchy = {
  'Regular User': 1,
  'Enhanced User': 2,
  'Premium User': 3,
  'Elite User': 4
};

// Find user by email
async function findUserByEmail(email) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        userId: userDoc.id,
        email: userDoc.data().email,
        role: userDoc.data().role || 'Regular User'
      };
    }
    return null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

// Log payment to Firestore
async function logPayment(paymentData) {
  try {
    const paymentRef = collection(db, 'payments');
    await addDoc(paymentRef, {
      ...paymentData,
      timestamp: serverTimestamp(),
      status: 'completed'
    });
    console.log('Payment saved to Firestore successfully');
  } catch (error) {
    console.error('Error logging payment:', error);
  }
}

// Process GHL webhook
async function processGHLWebhook(params) {
  try {
    console.log('Processing GHL webhook with params:', params);
    
    if (!params.user_email) {
      throw new Error('Missing user_email parameter');
    }

    // Find the pending claim for this user
    const pendingClaimsRef = collection(db, 'pendingClaims');
    const claimQuery = query(
      pendingClaimsRef, 
      where('userEmail', '==', params.user_email),
      where('status', '==', 'pending'),
      limit(1)
    );
    const claimSnapshot = await getDocs(claimQuery);
    
    if (claimSnapshot.empty) {
      throw new Error('No pending claim found for user');
    }

    const claimDoc = claimSnapshot.docs[0];
    const claimData = claimDoc.data();
    const selectedPlan = claimData.selectedPlan;
    const isYearly = claimData.isYearly;
    const businessData = claimData.businessData;

    console.log('Found pending claim:', { selectedPlan, isYearly, businessData });

    // Find user by email
    const user = await findUserByEmail(params.user_email);
    if (!user) {
      throw new Error('User not found');
    }

    // Determine new role based on selected plan
    let newRole = 'Regular User';
    if (selectedPlan === 'enhanced') newRole = 'Enhanced User';
    else if (selectedPlan === 'premium') newRole = 'Premium User';
    else if (selectedPlan === 'elite') newRole = 'Elite User';

    // Smart role upgrade: only upgrade if new role is higher
    const currentLevel = roleHierarchy[user.role] || 0;
    const newLevel = roleHierarchy[newRole] || 0;

    if (newLevel > currentLevel) {
      // Update user role
      const userRef = doc(db, 'users', user.userId);
      await setDoc(userRef, { 
        role: newRole,
        lastPayment: serverTimestamp()
      }, { merge: true });
      console.log(`User role upgraded from ${user.role} to ${newRole}`);
    } else {
      console.log(`User role unchanged: ${user.role} (new role ${newRole} is not higher)`);
    }

    // Log the payment
    await logPayment({
      userId: user.userId,
      email: user.email,
      planId: selectedPlan,
      isYearly: isYearly,
      businessData: businessData
    });

    // Delete the processed pending claim
    await deleteDoc(claimDoc.ref);
    console.log('Pending claim deleted');

    return {
      success: true,
      message: 'Payment processed successfully',
      userRole: newRole,
      plan: selectedPlan,
      isYearly: isYearly
    };

  } catch (error) {
    console.error('Error processing GHL webhook:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

export default async function handler(req, res) {
  // Only allow GET requests (as configured in GHL automation)
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Only GET requests are supported.' 
    });
  }

  try {
    // Process the webhook with query parameters
    const result = await processGHLWebhook(req.query);
    
    if (result.success) {
      // Payment processed successfully
      res.status(200).json(result);
    } else {
      // Payment processing failed
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
