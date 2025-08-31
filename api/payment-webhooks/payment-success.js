// Extremely basic test webhook
module.exports = function handler(req, res) {
  console.log('Webhook called');
  
  // Just return plain text
  res.status(200).send('Webhook is working!');
}
