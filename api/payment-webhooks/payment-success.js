// Extremely simple test webhook
module.exports = function handler(req, res) {
  console.log('Webhook called');
  
  try {
    res.status(200).json({
      success: true,
      message: 'Webhook is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error occurred'
    });
  }
}
