import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp, addDoc, limit, getDoc, updateDoc } from 'firebase/firestore';

// Initialize Firebase safely
let db = null;
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return db;
  
  try {
    // Firebase configuration - use environment variables (without VITE_ prefix for Vercel)
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };

    // Validate Firebase configuration
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error('Missing Firebase configuration:', {
        hasApiKey: !!firebaseConfig.apiKey,
        hasProjectId: !!firebaseConfig.projectId,
        envVars: Object.keys(process.env).filter(key => key.includes('FIREBASE'))
      });
      throw new Error('Firebase configuration is incomplete');
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

// Role hierarchy for smart upgrades
const roleHierarchy = {
  'Regular User': 1,
  'Enhanced User': 2,
  'Premium User': 3,
  'Elite User': 4
};

// Find user by email (actually by document ID from pending claim)
async function findUserByEmail(email) {
  try {
    if (!db) {
      db = initializeFirebase();
    }
    
    console.log('Looking for user with email:', email);
    
    // First, find the pending claim to get the userId
    const pendingClaimsRef = collection(db, 'pendingClaims');
    const claimQuery = query(
      pendingClaimsRef, 
      where('userEmail', '==', email),
      where('status', '==', 'pending'),
      limit(1)
    );
    const claimSnapshot = await getDocs(claimQuery);
    
    if (claimSnapshot.empty) {
      console.log('No pending claim found for email:', email);
      return null;
    }
    
    const claimDoc = claimSnapshot.docs[0];
    const claimData = claimDoc.data();
    const userId = claimData.userId;
    
    console.log('Found pending claim with userId:', userId);
    
    if (!userId) {
      console.log('No userId found in pending claim');
      return null;
    }
    
    // Now get the user document by ID
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('User document not found for userId:', userId);
      return null;
    }
    
    const userData = userDoc.data();
    console.log('Found user document:', userData);
    console.log('User document fields:', Object.keys(userData));
    
    return {
      userId: userDoc.id,
      email: email, // Use the email from the pending claim
      role: userData.role || 'Regular User'
    };
    
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

// Log payment to Firestore
async function logPayment(paymentData) {
  try {
    if (!db) {
      db = initializeFirebase();
    }
    
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

    // Initialize Firebase if needed
    if (!db) {
      db = initializeFirebase();
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

    // Update the business document if businessData exists
    if (businessData && businessData.id) {
      try {
        const businessRef = doc(db, 'businesses', businessData.id);
        
        // Map plan to business tier
        let businessTier = 'essentials';
        if (selectedPlan === 'enhanced') businessTier = 'enhanced';
        else if (selectedPlan === 'premium') businessTier = 'premium';
        else if (selectedPlan === 'elite') businessTier = 'elite';
        
        await updateDoc(businessRef, {
          userId: user.userId,
          ownerEmail: user.email,
          status: 'approved',
          verified: true,
          tier: businessTier,
          updatedAt: serverTimestamp(),
          claimedAt: serverTimestamp()
        });
        
        console.log(`Business ${businessData.id} updated successfully with tier: ${businessTier}`);
      } catch (businessUpdateError) {
        console.error('Error updating business document:', businessUpdateError);
      }
    }

    // Update user with payment success notification
    const userRef = doc(db, 'users', user.userId);
    await setDoc(userRef, { 
      role: newRole,
      lastPayment: serverTimestamp(),
      lastPaymentAt: serverTimestamp(),
      paymentSuccess: true,
      paymentSuccessAt: serverTimestamp()
    }, { merge: true });

    // Delete the processed pending claim
    await deleteDoc(claimDoc.ref);
    console.log('Pending claim deleted');

    return {
      success: true,
      message: 'Payment processed successfully',
      userRole: newRole,
      plan: selectedPlan,
      isYearly: isYearly,
      businessUpdated: !!(businessData && businessData.id)
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
  try {
    // Only allow GET requests (as configured in GHL automation)
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed. Only GET requests are supported.' 
      });
    }

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
