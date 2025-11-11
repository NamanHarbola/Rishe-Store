# Rishè E-Commerce - Quick Start Guide

## ✅ What's Built

Your Rishè premium shirt store is **fully functional** with:

### Customer Features:
- ✅ Beautiful landing page with emerald green & beige theme
- ✅ Google OAuth authentication (Firebase)
- ✅ Product browsing with search & filters
- ✅ Product details with multiple images, colors, sizes
- ✅ Shopping cart
- ✅ Checkout with Razorpay payment gateway
- ✅ Order tracking
- ✅ Product reviews & ratings

### Admin Features:
- ✅ Admin dashboard with analytics
- ✅ Product management (Add/Edit/Delete)
- ✅ Multiple images per product
- ✅ Color variants with individual size stock tracking
- ✅ Order management (view, update status, addresses)
- ✅ Inventory tracking with low stock alerts
- ✅ Sales analytics with charts

## 🎨 Design Highlights

- **Theme**: Emerald green (#10b981) & light beige (#faf8f5)
- **Typography**: Playfair Display for headings, Inter for body
- **Animations**: Framer Motion with scroll effects
- **Mobile-friendly**: Fully responsive design
- **Modern UI**: Glassmorphism, hover effects, smooth transitions

## 🚀 Quick Access

- **Website**: https://rishe-apparel.preview.emergentagent.com/
- **Admin Panel**: https://rishe-apparel.preview.emergentagent.com/admin

## 📝 Firebase & Razorpay Setup

### Your Credentials (Already Configured):

**Firebase:**
- Project ID: `rishe-store`
- Auth Domain: `rishe-store.firebaseapp.com`
- ✅ Google OAuth is enabled

**Razorpay (Test Mode):**
- Key ID: `rzp_test_ReJJ79tMXuQ96u`
- Status: ✅ Configured for testing

### ⚠️ Important: Firebase Admin SDK

To enable backend authentication verification, you need to:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `rishe-store` project
3. Go to **Project Settings** > **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Convert to base64:
   ```bash
   cat your-firebase-adminsdk.json | base64 -w 0
   ```
7. Add to `/app/backend/.env`:
   ```env
   FIREBASE_ADMIN_CREDENTIALS="<paste_base64_string_here>"
   ```
8. Restart backend:
   ```bash
   sudo supervisorctl restart backend
   ```

## 🛍️ How to Add Products

1. **Sign in** with your Google account
2. Go to **Admin Panel** (/admin)
3. Click **Products** > **Add Product**
4. Fill in:
   - Name, Description, Price
   - Image URL (use any image hosting service)
   - Mark as "Featured" to show on homepage
   - Add color variants with stock for each size

### Sample Product Data:

```
Name: Classic Cotton Shirt
Description: Premium 100% cotton shirt with perfect fit
Price: 1299
Image URL: https://images.unsplash.com/photo-1596755094514-f87e34085b2c
Featured: ✓
Variants:
  - White (#FFFFFF): S:10, M:15, L:20, XL:10, XXL:5
  - Navy (#000080): S:10, M:15, L:20, XL:10, XXL:5
```

## 🧪 Testing Payments

Use Razorpay test card:
- **Card**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

## 📊 Admin Features

### Dashboard (`/admin`)
- Total orders, revenue, products
- Average order value
- Quick access to all admin sections

### Products (`/admin/products`)
- Add/Edit/Delete products
- Multiple images support
- Color variants with individual size stocks
- Featured products toggle

### Orders (`/admin/orders`)
- View all orders
- Update order status (pending → processing → shipped → delivered)
- View customer details & shipping addresses
- Filter and search

### Inventory (`/admin/inventory`)
- Real-time stock levels
- Low stock alerts (< 10 units)
- Stock by color and size
- Visual stock indicators

### Analytics (`/admin/analytics`)
- Order status distribution (pie chart)
- Recent orders revenue (bar chart)
- Recent orders table
- Total revenue & order statistics

## 🎯 Complete User Flow

1. **Customer visits homepage** → Sees featured products
2. **Browse products** → Search, filter, sort
3. **Select product** → Choose color & size
4. **Add to cart** → Review items
5. **Checkout** → Enter shipping details
6. **Payment** → Razorpay integration
7. **Order confirmation** → Track in "My Orders"
8. **Leave review** → Rate and comment on products

## 🔧 Troubleshooting

### Firebase Auth Not Working
- Ensure you've enabled Google provider in Firebase Console
- Check if your domain is in authorized domains
- Verify Firebase config in `/app/frontend/.env`

### Payment Not Working
- Using test mode keys (rzp_test_...)
- Check Razorpay dashboard for errors
- Ensure JavaScript is enabled

### Products Not Showing
- Add products through Admin Panel
- Check browser console for errors
- Verify backend is running: `sudo supervisorctl status`

## 📱 Mobile Experience

The entire website is fully responsive:
- Mobile-first navigation with hamburger menu
- Touch-friendly product cards
- Optimized checkout form
- Smooth animations on scroll

## 🎨 Customization

### Change Theme Colors

Edit `/app/frontend/src/index.css`:
```css
--primary: 142.1 76.2% 36.3%; /* Emerald green */
```

Edit `/app/frontend/src/App.css` for gradient colors and custom styles.

### Add More Features

All page components are in:
- `/app/frontend/src/pages/` - Customer pages
- `/app/frontend/src/pages/admin/` - Admin pages
- `/app/frontend/src/components/` - Reusable components

## 🚀 Next Steps

1. **Add Firebase Admin SDK** (see instructions above)
2. **Add sample products** through admin panel
3. **Test complete flow**: Browse → Add to Cart → Checkout → Payment
4. **Customize design** if needed
5. **Deploy to production** (switch to live Razorpay keys)

## 📧 Support

Check logs:
```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Frontend logs
tail -f /var/log/supervisor/frontend.*.log
```

Restart services:
```bash
sudo supervisorctl restart backend frontend
```

---

**Your Rishè store is ready! 🎉**

Start by signing in and adding your first product through the admin panel!
