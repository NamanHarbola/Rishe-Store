# Rish\u00e8 E-Commerce Setup Guide

## Firebase Setup Instructions

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `rishe-store` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Google Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Toggle "Enable"
4. Add your support email
5. Click "Save"

### Step 3: Get Web App Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click on **Web** icon (`</>`)
4. Register app with nickname: `rishe-web`
5. Copy the configuration values and add them to `/app/frontend/.env`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Step 4: Get Firebase Admin SDK Credentials

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Convert it to base64:
   ```bash
   cat path/to/your-firebase-adminsdk.json | base64 -w 0
   ```
5. Add the base64 string to `/app/backend/.env`:
   ```env
   FIREBASE_ADMIN_CREDENTIALS=\"your_base64_encoded_json_here\"
   ```

### Step 5: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your domain: `rishe-apparel.preview.emergentagent.com`
3. For local testing, `localhost` is already authorized

## Razorpay Setup Instructions

### For Test Mode (Current Setup)

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** > **API Keys**
3. Under "Test Mode", generate API keys
4. Add to `/app/backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_secret_key
   ```
5. Add public key to `/app/frontend/.env`:
   ```env
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id
   ```

### For Production Mode

1. Complete KYC verification in Razorpay Dashboard
2. Switch to "Live Mode" in dashboard
3. Generate Live API keys
4. Update both `.env` files with live keys

## Testing with Razorpay Test Cards

Use these test card details for testing payments:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

## Running the Application

1. **Install backend dependencies**:
   ```bash
   cd /app/backend
   pip install -r requirements.txt
   ```

2. **Install frontend dependencies**:
   ```bash
   cd /app/frontend
   yarn install
   ```

3. **Start the services** (they're managed by supervisor):
   ```bash
   sudo supervisorctl restart backend
   sudo supervisorctl restart frontend
   ```

4. **Check service status**:
   ```bash
   sudo supervisorctl status
   ```

## Admin Access

Any authenticated user can access the admin panel at `/admin`. In production, you should implement proper role-based access control.

## Features Implemented

### Customer Features:
- Google OAuth authentication
- Browse products with filters
- Product details with multiple images
- Color and size variants
- Shopping cart
- Checkout with Razorpay
- Order tracking
- Product reviews

### Admin Features:
- Product management (Add/Edit/Delete)
- Multiple image upload per product
- Color variants with individual size stocks
- Order management (view, update status)
- Inventory tracking
- Sales analytics dashboard
- Revenue reports

## Folder Structure

```
/app
\u251c\u2500\u2500 backend/
\u2502   \u251c\u2500\u2500 server.py         # FastAPI backend
\u2502   \u251c\u2500\u2500 .env              # Backend environment variables
\u2502   \u2514\u2500\u2500 requirements.txt  # Python dependencies
\u2502
\u2514\u2500\u2500 frontend/
    \u251c\u2500\u2500 src/
    \u2502   \u251c\u2500\u2500 components/   # Reusable components
    \u2502   \u251c\u2500\u2500 pages/        # Page components
    \u2502   \u251c\u2500\u2500 context/      # React context (Auth, Cart)
    \u2502   \u251c\u2500\u2500 firebase.js   # Firebase initialization
    \u2502   \u251c\u2500\u2500 App.js        # Main app component
    \u2502   \u2514\u2500\u2500 App.css       # Global styles
    \u2502
    \u2514\u2500\u2500 .env              # Frontend environment variables
```

## Troubleshooting

### Firebase Authentication Not Working
- Check if authorized domains are configured correctly
- Verify API keys in frontend `.env`
- Check browser console for errors

### Razorpay Payment Failing
- Ensure you're using test mode keys for testing
- Check if keys are correctly set in both frontend and backend
- Verify the amount is in correct format (paise)

### Backend Not Starting
- Check backend logs: `tail -f /var/log/supervisor/backend.*.log`
- Verify MongoDB is running: `sudo systemctl status mongodb`
- Check if all dependencies are installed

### Frontend Not Loading
- Check frontend logs: `tail -f /var/log/supervisor/frontend.*.log`
- Verify all environment variables are set
- Run `yarn install` to ensure all dependencies are installed

## Next Steps

1. Complete Firebase setup using instructions above
2. Configure Razorpay test mode keys
3. Add some test products through admin panel
4. Test the complete checkout flow
5. Review and customize the design as needed

## Support

For issues or questions, check the logs:
```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Frontend logs  
tail -f /var/log/supervisor/frontend.*.log
```
