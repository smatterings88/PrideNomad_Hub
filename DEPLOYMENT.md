# Vercel Deployment Guide for PrideNomad Hub

## Prerequisites
- Vercel account connected to your GitHub repository
- All environment variables configured

## Environment Variables Required

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### GoHighLevel (GHL) Configuration
```
VITE_GHL_API_KEY=your_ghl_api_key
VITE_GHL_LOCATION_ID=your_location_id
VITE_GHL_PAYMENT_FORM_ID=your_payment_form_id
VITE_GHL_WHITE_LABEL_DOMAIN=your_white_label_domain
```

### Supabase Configuration
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Uploadcare Configuration
```
VITE_UPLOADCARE_PUBLIC_KEY=your_uploadcare_public_key
```

### NMI Payment Configuration
```
VITE_NMI_API_KEY=your_nmi_api_key
VITE_NMI_REDIRECT_URL=your_redirect_url
VITE_NMI_SECURITY_KEY=your_security_key
```

### Google Maps Configuration
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Deployment Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

2. **Configure Environment Variables**
   - In your Vercel project dashboard, go to Settings > Environment Variables
   - Add all the environment variables listed above
   - Make sure to set them for Production, Preview, and Development environments

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Manual deployments can be triggered from the dashboard

## Post-Deployment

1. **Verify Environment Variables**
   - Check that all environment variables are accessible
   - Test Firebase authentication
   - Test Google Maps integration
   - Test payment forms

2. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor build times and bundle sizes
   - Verify that all modals and forms work correctly

## Troubleshooting

### Common Issues
- **Build Failures**: Check that all dependencies are in package.json
- **Environment Variables**: Ensure all VITE_ prefixed variables are set
- **CORS Issues**: Check Content Security Policy in vite.config.ts
- **Payment Forms**: Verify iframe sources are allowed in CSP

### Support
- Check Vercel deployment logs
- Verify environment variable values
- Test locally with production build

## Security Notes

- All environment variables are prefixed with VITE_ for client-side access
- Content Security Policy is configured in vite.config.ts
- Firebase security rules should be properly configured
- Payment forms are embedded via secure iframes
