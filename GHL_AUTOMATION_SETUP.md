# GoHighLevel Automation Setup for Payment Webhooks

## 🎯 Overview

Set up GHL automation to send HTTP GET requests when payments are completed successfully.

## 🔧 Frontend Setup (Complete)

All modal iframes now include user email: `?email=${encodeURIComponent(auth.currentUser?.email || '')}`

## 🚀 GHL Automation Setup

### **For Each Payment Form, Create Automation:**

1. **Go to GHL Dashboard** → Automations
2. **Create New Automation**
3. **Trigger:** "Form Submission" or "Payment Received"
4. **Condition:** Form ID equals specific form ID + Payment Status = "Success"
5. **Action:** "HTTP Request"
   - **Method:** GET
   - **URL:** `https://yourdomain.com/api/ghl-webhook`
   - **Parameters:**
     ```
     user_email={{Contact.Email}}
     payment_type=Enhanced Monthly
     transaction_id={{Transaction.ID}}
     amount={{Transaction.Amount}}
     status=success
     form_id=76w8gDbB9tIqqquy8eX1
     ```

### **Form IDs and Payment Types:**

| Form ID | Payment Type |
|---------|--------------|
| `76w8gDbB9tIqqquy8eX1` | Enhanced Monthly |
| `tchR4XYrDJys2IWf2jfp` | Enhanced Annual |
| `GcGS1K6TlSefkrzBlLgf` | Premium Monthly |
| `GBDAzcqfKIKfgsV9jz6c` | Premium Annual |
| `XzGBbFvFm1sFPaj59fpq` | Elite Monthly |
| `DTHRDPzdUyPqiPoget0n` | Elite Annual |

## 🌐 Backend Webhook Endpoint

### **Express.js Example:**
```typescript
app.get('/api/ghl-webhook', async (req, res) => {
  const result = await processGHLWebhook(req.query);
  res.json(result);
});
```

## 🔍 Testing

1. Select plan → Click "Continue to Payment"
2. Complete payment in iframe
3. Check webhook endpoint for GET request
4. Verify user role update

## ⚠️ Important Notes

- Validate webhook origin
- Implement rate limiting
- Handle duplicate webhooks
- Monitor success/failure rates

This provides real-time payment detection without polling!
