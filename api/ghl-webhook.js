import { processGHLWebhook } from '../src/lib/ghl-webhook';

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
