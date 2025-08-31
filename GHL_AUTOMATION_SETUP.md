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

### **✅ Implementation Complete:**

The webhook endpoint has been implemented and is ready to receive GHL automation calls.

**Endpoint:** `https://yourdomain.com/api/ghl-webhook`

**Method:** GET

**Response:** JSON with payment processing results

### **Express.js Example (No longer needed - already implemented):**
```typescript
// This is now implemented in /api/ghl-webhook.js
app.get('/api/ghl-webhook', async (req, res) => {
  const result = await processGHLWebhook(req.query);
  res.json(result);
});
```

## 🔍 Testing

1. **Select plan** → Click "Continue to Payment"
2. **Complete payment** in iframe
3. **Check webhook endpoint** for GET request
4. **Verify user role update** and business tier assignment

### **Testing the Complete Flow:**

1. **Deploy to Vercel** with the updated configuration
2. **Set up GHL automation** according to the setup above
3. **Test business claim flow:**
   - User selects plan and business
   - Payment modal opens
   - User completes payment
   - GHL sends webhook to `/api/ghl-webhook`
   - Webhook processes payment and updates user role
   - User is redirected to business onboarding
   - Business gets appropriate tier based on user's subscription

### **Monitoring Webhook Calls:**

- Check Vercel function logs for webhook activity
- Monitor Firestore for pending claims and user role updates
- Verify business tier assignments in the businesses collection

## ⚠️ Important Notes

- Validate webhook origin
- Implement rate limiting
- Handle duplicate webhooks
- Monitor success/failure rates

This provides real-time payment detection without polling!
