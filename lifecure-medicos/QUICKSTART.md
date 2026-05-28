# ⚡ LifeCare Medicos — Quick Start Guide (3 Minutes)

## 🚀 Start Here

### Step 1: Create User Account
```
http://localhost:5500/signup.html
```
- Name: Admin User
- Phone: 9876543210
- Email: admin@test.com  
- Password: Admin123!
- Role: **Select "Patient"** (we'll change to admin in Firestore)

### Step 2: Go to Firebase Console
```
https://console.firebase.google.com
→ Your Project → Firestore Database
→ users collection
→ Find your admin@test.com user
→ Click to edit
→ Change role field from "user" to "admin"
→ Save
```

### Step 3: Login as Admin
```
http://localhost:5500/admin.html
```
- Email: admin@test.com
- Password: Admin123!
- ✅ You'll see admin dashboard with sample data already loaded

### Step 4: Create Test Patient Account
```
http://localhost:5500/signup.html
```
- Name: John Patient
- Phone: 9123456789
- Email: patient@test.com
- Password: Patient123!
- Role: **Select "Patient"**
- Complete signup

### Step 5: Login as Patient
```
http://localhost:5500/login.html
```
- Email: patient@test.com
- Password: Patient123!
- ✅ Access user dashboard

### Step 6: Test Features
- **Search Medicines**: Search box at top of dashboard
- **Browse Doctors**: See all available doctors below medicines
- **Book Appointment**: Click "Book Appointment" on any doctor
- **View Notices**: See important announcements
- **Admin Approves**: Go back to admin panel to approve bookings

---

## 📊 What You Get

### Admin Can (after changing role in Firestore):
- ✅ Manage doctors (add/edit/delete)
- ✅ Manage medicine stock
- ✅ Approve user bookings
- ✅ Send notices to users
- ✅ Manage user roles

### Users Can:
- ✅ Search medicines
- ✅ Browse doctors by specialty
- ✅ Book appointments
- ✅ Complete health profile
- ✅ View important notices

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `signup.html` | User registration |
| `login.html` | User login |
| `admin.html` | Admin panel |
| `dashboard.html` | User dashboard |
| `SYSTEM_SETUP.md` | Full documentation |

---

## 🗄️ Data Auto-Loaded ✨

On first run, system automatically creates:
- **4 Sample Doctors**: General, Dermatology, Cardiology, Pediatrics
- **8 Medicines**: Common tablets, capsules, creams
- **Doctor Timings**: Mon-Sat, 9am-6pm with lunch break

---

## 🔄 Common Workflow

```
1. You Sign Up (signup.html, select "Patient")
                    ↓
2. Change role to "admin" in Firestore Console
                    ↓
3. Login as Admin (admin.html)
                    ↓
4. View sample doctors and medicines
                    ↓
5. Patient Signs Up separately
                    ↓
6. Patient Logs In → Dashboard
                    ↓
7. Patient Books Appointment
                    ↓
8. You Approve in Admin Panel
                    ↓
9. Patient Sees Confirmed Appointment
```

---

## 🎯 Test Credentials

### Your Admin Account (after role change in Firestore)
```
Email: admin@test.com
Password: Admin123!
```

### Patient Test Account
```
Email: patient@test.com
Password: Patient123!
```

---

## ⚠️ Important

- **All users signup as "Patient" role initially**
- **Change role to "admin" in Firebase Console Firestore**
- All data stored in Firebase Firestore (cloud)
- Sample data auto-seeds on first run
- Existing doctors and medicines stay in database

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Firebase not configured" | Check firebase-config.js in Firebase Console |
| Login fails | Verify email/password, refresh page |
| No doctors showing | Wait 2 seconds for data to load, refresh |
| Can't access admin features | Check role is "admin" in Firestore users collection |
| Booking not appearing | Refresh admin panel, check Firestore console |

---

## 📚 Full Documentation

For detailed setup, database schema, and advanced features:
→ Read **`SYSTEM_SETUP.md`** in project root

---

## ✅ You're Ready!

1. Go to `http://localhost:5500/signup.html` and create account
2. Change role in Firebase Console to "admin"
3. Login at `http://localhost:5500/admin.html` 🚀

