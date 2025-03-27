import { v4 as uuidv4 } from 'uuid';

interface NMIConfig {
  apiKey: string;
  redirectUrl: string;
  securityKey: string;
}

const NMI_CONFIG: NMIConfig = {
  apiKey: import.meta.env.VITE_NMI_API_KEY || '',
  redirectUrl: import.meta.env.VITE_NMI_REDIRECT_URL || '',
  securityKey: import.meta.env.VITE_NMI_SECURITY_KEY || ''
};

interface PaymentRequest {
  amount: number;
  orderId: string;
  planId: string;
  customerEmail: string;
}

export async function initiateNMIPayment(payment: PaymentRequest): Promise<string> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const hash = await generateHash(timestamp);
    
    const params = new URLSearchParams({
      'key-id': NMI_CONFIG.apiKey,
      'hash': hash,
      'time-stamp': timestamp,
      'redirect-url': NMI_CONFIG.redirectUrl,
      'amount': payment.amount.toFixed(2),
      'order-id': payment.orderId,
      'customer-receipt': 'true',
      'customer-email': payment.customerEmail,
      'transaction-type': 'sale',
      'currency': 'USD',
      'order-description': `PrideNomad Hub - ${payment.planId}`,
    });

    return `https://secure.networkmerchants.com/payment/v1/payment.php?${params.toString()}`;
  } catch (error) {
    console.error('Error initiating NMI payment:', error);
    throw new Error('Failed to initiate payment');
  }
}

async function generateHash(timestamp: string): Promise<string> {
  const data = `${NMI_CONFIG.apiKey}${timestamp}${NMI_CONFIG.securityKey}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-512', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function validateNMIResponse(queryParams: URLSearchParams): {
  success: boolean;
  message: string;
  transactionId?: string;
} {
  const responseHash = queryParams.get('response-hash');
  const responseCode = queryParams.get('response-code');
  const responseMessage = queryParams.get('response-message');
  const transactionId = queryParams.get('transaction-id');

  // Validate response hash here
  // In production, you would verify the hash using your security key

  if (responseCode === '100') {
    return {
      success: true,
      message: 'Payment successful',
      transactionId
    };
  }

  return {
    success: false,
    message: responseMessage || 'Payment failed'
  };
}