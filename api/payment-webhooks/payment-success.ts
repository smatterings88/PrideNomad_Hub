import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    console.log('Payment webhook handler called with method:', req.method);
    console.log('Query parameters:', req.query);
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed. Only GET requests are supported.' 
      });
    }

    // Simple test response
    res.status(200).json({
      success: true,
      message: 'Payment webhook is working!',
      method: req.method,
      query: req.query,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Payment webhook handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
