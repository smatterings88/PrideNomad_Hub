import { auth, setUserRole } from './firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, limit, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase';

// Interface for the webhook query parameters
interface GHLWebhookParams {
  user_email: string;
}

// Map plan IDs to user roles
const PLAN_TO_ROLE: Record<string, string> = {
  'essentials': 'Regular User',
  'enhanced': 'Enhanced User',
  'premium': 'Premium User',
  'elite': 'Elite User'
};

/**
 * Process GHL webhook for payment confirmation
 * This function should be called from your backend endpoint
 */
export async function processGHLWebhook(params: GHLWebhookParams) {
  try {
    // Validate required parameters
    if (!params.user_email) {
      throw new Error('Missing user email');
    }

    // Find user by email
    const user = await findUserByEmail(params.user_email);
    if (!user) {
      throw new Error(`User not found with email: ${params.user_email}`);
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

    if (!selectedPlan) {
      throw new Error('No plan selection found in pending claim');
    }

    // Update user role based on stored plan (upgrade if higher tier)
    const userRole = PLAN_TO_ROLE[selectedPlan];
    if (!userRole) {
      throw new Error(`Unknown plan ID: ${selectedPlan}`);
    }

    // Get current user role and upgrade if necessary
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentUserData = userDoc.data();
      const currentRole = currentUserData.role || 'Regular User';
      
      // Define role hierarchy for upgrades
      const roleHierarchy: Record<string, number> = {
        'Regular User': 0,
        'Enhanced User': 1,
        'Premium User': 2,
        'Elite User': 3
      };
      
      const currentLevel = roleHierarchy[currentRole] || 0;
      const newLevel = roleHierarchy[userRole] || 0;
      
      // Only upgrade if the new role is higher
      if (newLevel > currentLevel) {
        await setUserRole(user.uid, userRole);
      }
    } else {
      // New user, set initial role
      await setUserRole(user.uid, userRole);
    }

    // Log successful payment
    await logPayment({
      userId: user.uid,
      email: params.user_email,
      planId: selectedPlan,
      isYearly: isYearly || false,
      businessData: businessData
    });

    // Delete the processed pending claim
    await deleteDoc(claimDoc.ref);

    return {
      success: true,
      message: 'Payment processed successfully',
      userRole,
      planId: selectedPlan,
      isYearly: isYearly || false
    };

  } catch (error) {
    console.error('GHL webhook processing error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error
    };
  }
}

/**
 * Find user by email - implement this based on your backend
 */
async function findUserByEmail(email: string): Promise<{ uid: string; email: string } | null> {
  try {
    // Query Firestore to find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        uid: userDoc.id,
        email: userDoc.data().email || email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

/**
 * Log payment information - implement this based on your backend
 */
async function logPayment(paymentData: {
  userId: string;
  email: string;
  planId: string;
  isYearly: boolean;
  businessData?: any;
}) {
  try {
    console.log('Payment logged:', paymentData);
    
    // Save to Firestore payments collection
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

/**
 * Example webhook endpoint handler for Express.js backend
 * 
 * app.get('/api/ghl-webhook', async (req, res) => {
 *   try {
 *     const result = await processGHLWebhook(req.query as GHLWebhookParams);
 *     
 *     if (result.success) {
 *       res.json(result);
 *     } else {
 *       res.status(400).json(result);
 *     }
 *   } catch (error) {
 *     res.status(500).json({
 *       success: false,
 *       message: 'Internal server error'
 *     });
 *   }
 * });
 */
