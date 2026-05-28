# LifeCure Medicos — Database System Implementation Guide

## 🎯 System Overview

LifeCure Medicos has been upgraded to a fully database-driven system using Firebase Firestore. This guide explains how to set up and use the new system.

---

## 📋 What's New

### ✅ Completed Features

1. **Firestore Database Integration**
   - All data now stored in cloud Firestore
   - Collections for: doctors, medicines, timings, bookings, appointments, notices, users
   - Real-time data synchronization

2. **Role-Based Access Control**
   - **Users**: Can login, search medicines, book doctors
   - **Admins**: Can manage doctors, medicines, timings, bookings, and send notices
   - Role selection during signup with admin approval workflow

3. **Firebase Authentication**
   - Email/password authentication
   - Real-time auth state management
   - Session persistence

4. **User Features**
   - Search and browse medicines with availability status
   - View available doctors and their specializations
   - Book doctor appointments with details
   - View important notices
   - Complete profile with health information

5. **Admin Features**
   - Manage doctors (add, edit, delete)
   - Manage medicine stock and availability
   - Manage doctor timings and scheduling
   - Approve/reject doctor bookings
   - Send notices to users
   - View system analytics on dashboard
   - Manage user roles

6. **System Initialization**
   - Automatic data seeding on first run
   - First-time admin account creation via `init.html`
   - Sample doctors, medicines, and timings pre-loaded

---

## 🚀 Getting Started

### Step 1: User Signup (All Users Start as "Patient")

1. Open `http://localhost:5500/signup.html`
2. Fill in form:
   - Full Name
   - Phone Number (10 digits)
   - Email
   - Password (minimum 6 characters)
3. Select account type:
   - **Patient** - For regular users booking doctors
   - **Staff/Admin** - For hospital staff (gets "adminStatus: pending")
4. Click "Create Account"
5. You'll be redirected based on your profile status

### Step 2: Make Yourself Admin (Manual Role Change)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click "Firestore Database"
4. Click "users" collection
5. Find the user you just created (search by email)
6. Click to open the document
7. Edit the `role` field: change from `"user"` to `"admin"`
8. Save the changes

**Now you're an admin!** 

### Step 3: Admin Login

1. Go to `http://localhost:5500/admin.html`
2. Login with your credentials:
   - Email: (the email you created in step 1)
   - Password: (the password you created)
3. You'll see the admin dashboard with all management features

### Step 4: User Registration & Testing

1. Go to `http://localhost:5500/signup.html` (in new window/incognito)
2. Create a patient account:
   - Name: Test Patient
   - Phone: 9876543210
   - Email: patient@test.com
   - Password: Test123!
   - Role: **Select "Patient"**
3. Login at `http://localhost:5500/login.html`
4. You can now:
   - Search for medicines
   - Browse available doctors
   - Book doctor appointments
   - View important notices

### Step 5: Admin Approves Booking

1. Go back to Admin Panel (`http://localhost:5500/admin.html`)
2. Navigate to "Appointments" → "Pending Bookings"
3. Review the booking details
4. Click ✓ to approve or ✕ to reject
5. Patient will see the updated status

---

## 📁 Project Structure

```
lifecure-medicos/
├── index.html                 # Landing page
├── login.html                 # User login
├── signup.html                # User signup with role selection
├── dashboard.html             # User dashboard (medicines, doctors, bookings)
├── admin.html                 # Admin panel
├── init.html                  # System initialization (first-time setup)
├── complete-profile.html      # User profile completion
├── profile.html               # User profile management
│
├── assets/
│   ├── js/
│   │   ├── firebase-config.js        # Firebase configuration
│   │   ├── auth.js                   # Authentication module
│   │   ├── admin-auth.js             # Admin authentication
│   │   ├── db-manager.js             # Database operations
│   │   ├── db-seed.js                # Initial data seeding
│   │   ├── dashboard.js              # User dashboard logic
│   │   └── admin.js                  # Admin panel logic
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css                  # Login/signup styles
│   │   ├── dashboard.css             # User dashboard styles
│   │   ├── admin.css                 # Admin panel styles
│   │   └── profile.css
│   │
│   └── images/
│       └── doctors/
└── README.md
```

---

## 🗄️ Firestore Collections Schema

### Users Collection
```javascript
{
  uid: string,
  name: string,
  email: string,
  phone: string,
  role: "user" | "admin",
  adminStatus: "pending" | null,
  profileCompleted: boolean,
  photoURL: string | null,
  dob: string | null,
  gender: string | null,
  bloodGroup: string | null,
  address: string | null,
  city: string | null,
  state: string | null,
  pincode: string | null,
  emergencyContact: string | null,
  allergies: string | null,
  diseases: string | null,
  createdAt: timestamp
}
```

### Doctors Collection
```javascript
{
  id: string (unique),
  name: string,
  specialty: string (General, Cardiology, Dermatology, etc.),
  experience: number,
  qualifications: string,
  available: boolean,
  notes: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Medicines Collection
```javascript
{
  id: string (unique),
  name: string,
  category: string (Tablet, Capsule, Cream, etc.),
  qty: number,
  unit: string (Strips, Pieces, Bottles, etc.),
  expiry: string (YYYY-MM-DD),
  available: boolean,
  notes: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Timings Collection
```javascript
{
  id: string (unique),
  doctorId: string,
  doctorName: string,
  day: string (Monday, Tuesday, etc.),
  startTime: string (HH:mm),
  endTime: string (HH:mm),
  slotDuration: number (minutes),
  break: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Bookings Collection
```javascript
{
  id: string (unique),
  userId: string,
  userName: string,
  userPhone: string,
  doctorId: string,
  doctorName: string,
  date: string (YYYY-MM-DD),
  time: string (HH:mm),
  reason: string,
  status: "pending" | "confirmed" | "rejected" | "completed",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Appointments Collection
```javascript
{
  id: string (unique),
  userId: string,
  userName: string,
  doctorId: string,
  doctorName: string,
  date: string (YYYY-MM-DD),
  time: string (HH:mm),
  reason: string,
  status: "scheduled" | "completed" | "cancelled",
  createdAt: timestamp
}
```

### Notices Collection
```javascript
{
  id: string (unique),
  title: string,
  message: string,
  priority: "normal" | "high" | "urgent",
  createdAt: timestamp
}
```

---

## 🔐 Key API Functions

### Database Manager (`db-manager.js`)

```javascript
// Doctors
await dbManager.getDoctors()
await dbManager.addDoctor(doctorData)
await dbManager.updateDoctor(doctorId, updates)
await dbManager.deleteDoctor(doctorId)

// Medicines
await dbManager.getMedicines()
await dbManager.addMedicine(medicineData)
await dbManager.updateMedicine(medicineId, updates)
await dbManager.deleteMedicine(medicineId)
await dbManager.searchMedicines(query)

// Bookings
await dbManager.getBookings(status)
await dbManager.getUserBookings(userId)
await dbManager.createBooking(bookingData)
await dbManager.approveBooking(bookingId)
await dbManager.rejectBooking(bookingId)

// Notices
await dbManager.getNotices()
await dbManager.createNotice(noticeData)
await dbManager.deleteNotice(noticeId)

// User Management
await dbManager.getAllUsers()
await dbManager.changeUserRole(userId, newRole)
await dbManager.getPendingAdmins()
await dbManager.approveAdminRequest(userId)
```

### Authentication (`auth.js`)

```javascript
// Signup with role selection
await handleSignup({ name, phone, email, password, confirmPassword, role })

// Login
await handleLogin(email, password)

// Logout
await handleLogout()

// Get current user info
getCurrentUserId()
getCurrentUserEmail()
getUserRole()
getUserData()
isLoggedIn()
isAdmin()
```

### Admin Authentication (`admin-auth.js`)

```javascript
// Admin login (checks role before allowing access)
await adminLoginWithEmail(email, password)

// Admin logout
await adminLogout()

// Get admin info
getCurrentAdminUser()
getCurrentAdminData()
```

---

## 🧪 Testing the System

### Test Admin Flow

1. **First Admin Setup**
   - Visit `http://localhost:5500/init.html`
   - Create admin account with email: `admin@test.com`, password: `Admin123`
   - You'll be redirected to admin panel

2. **Admin Panel**
   - Add sample doctors (if not auto-seeded)
   - Add medicine stock
   - Send notice to users
   - Check pending bookings

### Test User Flow

1. **User Signup**
   - Visit `http://localhost:5500/signup.html`
   - Select "Patient" role
   - Use email: `user@test.com`, password: `User123`
   - Complete profile

2. **User Dashboard**
   - Visit `http://localhost:5500/dashboard.html`
   - Search medicines
   - Browse doctors
   - Book appointment

3. **Admin Reviews Booking**
   - Go to admin panel
   - Find the pending booking
   - Approve or reject it

---

## ⚠️ Important Notes

### Admin Role Assignment

There are two ways to assign admin role:

1. **First Admin (via init.html)**
   - Only works if no admins exist
   - Creates full admin account directly

2. **Additional Admins (via signup)**
   - User signs up selecting "Staff/Admin" role
   - Role is set to "adminStatus: pending"
   - Existing admin must approve via admin panel
   - Once approved, role changes to "admin"

### Data Initialization

- `db-seed.js` automatically seeds initial data if collections are empty
- Includes 4 sample doctors, 8 medicines, and complete timings
- Only runs once (checks if data exists first)

### Local Storage Fallback

Some functions still use localStorage as fallback if Firestore is unavailable. This is for development/testing purposes.

---

## 🔍 Troubleshooting

### "Firebase not configured" error

- Check `firebase-config.js` has valid Firebase credentials
- Ensure Firebase project is set up at console.firebase.google.com

### Admin login fails

- Verify user has `role: "admin"` in Firestore users collection
- Check email is correct
- Ensure password is at least 6 characters

### No data appears on dashboard

- Check `db-seed.js` ran (check browser console)
- Verify Firestore collections have data
- Clear browser cache and refresh

### Booking not appearing in admin panel

- Refresh admin panel
- Check `bookings` collection in Firestore
- Verify user ID is correct

---

## 📦 Deployment Checklist

Before deploying to production:

- [ ] Update Firebase config with production credentials
- [ ] Ensure all environment variables are set
- [ ] Test complete user flow (signup → login → booking)
- [ ] Test admin flow (init → add data → manage bookings)
- [ ] Verify Firestore security rules are configured
- [ ] Enable authentication methods in Firebase
- [ ] Set up proper error monitoring
- [ ] Test on production domain

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Database Guide](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

## 📝 Version Info

- **System**: LifeCure Medicos v2.0 (Database Edition)
- **Firebase**: compat SDK v10.4.0
- **Last Updated**: May 2026
- **Status**: Production Ready

---

## 🤝 Support

For issues or questions:
1. Check the console for error messages
2. Review Firestore data in Firebase Console
3. Verify all scripts are loaded (check Network tab)
4. Ensure Firebase credentials are correct

