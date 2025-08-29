import { auth, setUserRole } from './firebase';

// Interface for the webhook query parameters
interface GHLWebhookParams {
  user_email: string;
  payment_type: string;
  transaction_id?: string;
  amount?: string;
  status: string;
  form_id?: string;
}

// Map payment types to plan IDs and billing cycles
const PAYMENT_TYPE_MAP: Record<string, { planId: string; isYearly: boolean }> = {
  'Enhanced Monthly': { planId: 'enhanced', isYearly: false },
  'Enhanced Annual': { planId: 'enhanced', isYearly: true },
  'Premium Monthly': { planId: 'premium', isYearly: false },
  'Premium Annual': { planId: 'premium', isYearly: true },
  'Elite Monthly': { planId: 'elite', isYearly: false },
  'Elite Annual': { planId: 'elite', isYearly: true },
};

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
    if (!params.user_email || !params.payment_type || !params.status) {
      throw new Error('Missing required parameters');
    }

    // Check if payment was successful
    if (params.status !== 'success') {
      return {
        success: false,
        message: 'Payment not successful',
        status: params.status
      };
    }

    // Parse payment type to get plan and billing cycle
    const paymentInfo = PAYMENT_TYPE_MAP[params.payment_type];
    if (!paymentInfo) {
      throw new Error(`Unknown payment type: ${params.payment_type}`);
    }

    const { planId, isYearly } = paymentInfo;
    const userRole = PLAN_TO_ROLE[planId];

    if (!userRole) {
      throw new Error(`Unknown plan ID: ${planId}`);
    }

    // Find user by email (you'll need to implement this based on your backend)
    const user = await findUserByEmail(params.user_email);
    if (!user) {
      throw new Error(`User not found with email: ${params.user_email}`);
    }

    // Update user role
    await setUserRole(user.uid, userRole);

    // Log successful payment (you can implement this as needed)
    await logPayment({
      userId: user.uid,
      email: params.user_email,
      planId,
      isYearly,
      amount: params.amount,
      transactionId: params.transaction_id,
      formId: params.form_id,
      paymentType: params.payment_type
    });

    return {
      success: true,
      message: 'Payment processed successfully',
      userRole,
      planId,
      isYearly,
      transactionId: params.transaction_id
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
  // This is a placeholder - implement based on your backend
  // You might query Firebase Auth, your database, etc.
  try {
    // Example: Query Firebase Auth for user by email
    // const userRecord = await auth.getUserByEmail(email);
    // return userRecord;
    
    // For now, return null to indicate not implemented
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
  amount?: string;
  transactionId?: string;
  formId?: string;
  paymentType: string;
}) {
  // This is a placeholder - implement based on your backend
  // You might save to Firestore, your database, etc.
  try {
    console.log('Payment logged:', paymentData);
    
    // Example: Save to Firestore
    // const paymentRef = collection(db, 'payments');
    // await addDoc(paymentRef, {
    //   ...paymentData,
    //   timestamp: serverTimestamp(),
    //   status: 'completed'
    // });
    
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
