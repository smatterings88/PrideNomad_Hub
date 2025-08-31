// Simple test webhook to isolate the issue
module.exports = async function handler(req, res) {
  try {
    console.log('Webhook handler called with method:', req.method);
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
      message: 'Webhook is working!',
      method: req.method,
      query: req.query,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
