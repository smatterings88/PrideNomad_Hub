import { v4 as uuidv4 } from 'uuid';

interface GHLConfig {
  locationId: string;
  apiKey: string;
  paymentFormId: string;
  whiteLabelDomain?: string;
}

const GHL_CONFIG: GHLConfig = {
  locationId: import.meta.env.VITE_GHL_LOCATION_ID || '',
  apiKey: import.meta.env.VITE_GHL_API_KEY || '',
  paymentFormId: import.meta.env.VITE_GHL_PAYMENT_FORM_ID || '',
  whiteLabelDomain: import.meta.env.VITE_GHL_WHITE_LABEL_DOMAIN
};

interface PaymentRequest {
  amount: number;
  orderId: string;
  planId: string;
  customerEmail: string;
}

export async function initiateGHLPayment(payment: PaymentRequest): Promise<string> {
  try {
    // Validate config
    if (!GHL_CONFIG.locationId || !GHL_CONFIG.apiKey || !GHL_CONFIG.paymentFormId) {
      throw new Error('Missing GHL configuration. Please check your environment variables.');
    }

    // Construct the payment form URL with parameters
    const params = new URLSearchParams({
      'location': GHL_CONFIG.locationId,
      'form': GHL_CONFIG.paymentFormId,
      'email': payment.customerEmail,
      'amount': payment.amount.toFixed(2),
      'order_id': payment.orderId,
      'plan': payment.planId,
      'redirect': window.location.origin + '/payment'
    });

    // Use white label domain if available, otherwise use default GHL domain
    const domain = GHL_CONFIG.whiteLabelDomain || 'forms.highlevel.com';
    return `https://${domain}/payment/${GHL_CONFIG.paymentFormId}?${params.toString()}`;
  } catch (error) {
    console.error('Error initiating GHL payment:', error);
    throw new Error('Failed to initiate payment');
  }
}

export function validateGHLResponse(queryParams: URLSearchParams): {
  success: boolean;
  message: string;
  transactionId?: string;
} {
  const status = queryParams.get('status');
  const transactionId = queryParams.get('transaction_id');
  const errorMessage = queryParams.get('error_message');

  if (status === 'success') {
    return {
      success: true,
      message: 'Payment successful',
      transactionId
    };
  }

  return {
    success: false,
    message: errorMessage || 'Payment failed'
  };
}