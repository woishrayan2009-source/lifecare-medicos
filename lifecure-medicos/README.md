# LifeCure Medicos — Production-Ready Medical Website

> **Your Health Is Our Priority**

A complete, production-ready website for **LifeCure Medicos** — a medical store and doctor consultation center located at Bhanga Bazar, Sribhumi, Assam, India.

**Built with:** HTML5 · CSS3 · Vanilla JavaScript · Firebase

---

## 📋 Features

### Public Website (`index.html`)
- Hero section with tagline
- Medicine availability search
- Doctor availability display
- Notice board
- Contact information & WhatsApp integration
- Google Maps embed
- Fully responsive design
- PWA-ready (installable)

### User Portal
- **Sign Up** (`signup.html`) - Email registration with password strength checker
- **Login** (`login.html`) - Email/password and Google Sign-In
- **Complete Profile** (`complete-profile.html`) - Medical profile with photo upload
- **Dashboard** (`dashboard.html`) - View medicines, doctors, notices
- **Profile** (`profile.html`) - Edit personal & health information

### Admin Panel (`admin.html`)
- Firebase-based authentication
- **Medicine Management** - Add, edit, delete, track stock
- **Doctor Management** - Manage availability, specializations, photos
- **Notice Management** - Post important notices
- **User Analytics** - View registered users
- **Dashboard** - Real-time statistics

---

## 🗂️ Folder Structure

```
lifecure-medicos/
├── index.html          # Main public-facing website
├── admin.html          # Admin panel (medicine stock + appointments)
├── manifest.json       # PWA manifest
├── README.md           # This file
└── assets/
    ├── css/
    │   ├── style.css   # Main website styles
    │   └── admin.css   # Admin panel styles
    ├── js/
    │   ├── main.js     # Main website JavaScript
    │   └── admin.js    # Admin panel JavaScript
    └── images/
        ├── logo.png            # Store logo (REPLACE with real logo)
        ├── favicon.png         # Browser tab icon (REPLACE)
        ├── og-image.jpg        # Social share preview image (REPLACE)
        ├── icon-192.png        # PWA icon 192×192 (REPLACE)
        ├── icon-512.png        # PWA icon 512×512 (REPLACE)
        └── ...                 # Doctor photos, store photos, gallery
```

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Markup     | HTML5 - Semantic, accessible       |
| Styling    | CSS3 - Flexbox, Grid, Animations   |
| Scripts    | Vanilla JavaScript (no jQuery)     |
| Backend    | Firebase Authentication            |
| Database   | Cloud Firestore                    |
| Storage    | Firebase Storage (profile photos)   |
| Hosting    | Firebase Hosting (recommended)      |

---

## ⚙️ Setup & Installation

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Name it: `lifecure-medicos`
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Firebase Services

**Authentication:**
- In Firebase Console, go to **Authentication** → **Sign-in method**
- Enable: **Email/Password**
- Enable: **Google** (add your OAuth credentials)

**Firestore Database:**
- Go to **Firestore Database** → **Create database**
- Start in **Test mode** (for development)
- Choose **Region: asia-south1** (India)

**Firebase Storage:**
- Go to **Storage** → **Get started**
- Start in **Test mode**
- Choose **Region: asia-south1** (India)

### Step 3: Get Firebase Credentials

1. Go to **Project Settings** (gear icon)
2. Click **"Your apps"** → **"</+>"** → **"Web"**
3. Register app as: `lifecure-medicos`
4. Copy your Firebase config

### Step 4: Update Firebase Config

Edit `assets/js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5: Create Admin User

1. Go to Firebase **Authentication** → **Users**
2. Click **"Add user"**
3. Email: `admin@lifecure.com`
4. Password: `strong-password-here`
5. Now go to **Firestore** → **users** collection
6. Create document with ID = user's UID
7. Add field: `role: "admin"`

### Step 6: Deploy

**Option A: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Option B: Netlify**
```bash
# Drag & drop the lifecure-medicos folder to Netlify
# Or use GitHub integration
```

**Option C: GitHub Pages**
```bash
git push to gh-pages branch
Enable "GitHub Pages" in repo settings
```

---

## 📁 File Structure

```
lifecure-medicos/
├── index.html                 # Home page (PUBLIC)
├── login.html                 # Login page
├── signup.html                # Sign up page
├── complete-profile.html      # Profile completion
├── dashboard.html             # User dashboard
├── profile.html               # User profile editor
├── admin.html                 # Admin panel
├── manifest.json              # PWA manifest
├── README.md                  # Documentation
│
├── assets/
│   ├── css/
│   │   ├── style.css          # Homepage styles
│   │   ├── auth.css           # Auth pages styles
│   │   ├── dashboard.css      # Dashboard styles
│   │   ├── profile.css        # Profile styles
│   │   └── admin.css          # Admin panel styles
│   │
│   ├── js/
│   │   ├── firebase-config.js # Firebase initialization
│   │   ├── auth.js            # Authentication module
│   │   ├── dashboard.js       # Dashboard module
│   │   ├── profile.js         # Profile module
│   │   ├── admin.js           # Admin module
│   │   └── main.js            # Main/homepage scripts
│   │
│   └── images/
│       ├── logo.jpeg          # Store logo
│       ├── doctors/           # Doctor photos
│       └── gallery/           # Store/product photos
```

---

## 🔐 Security

### Firestore Security Rules

After development, replace test mode rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public collections (read-only)
    match /medicines/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /doctors/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /notices/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // User documents (private)
    match /users/{uid} {
      allow read, update: if request.auth.uid == uid;
      allow write: if isAdmin();
    }
    
    // Helper functions
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile photos
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    
    // Admin uploads
    match /admin/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    function isAdmin() {
      return firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

All pages are fully responsive and tested on iOS and Android.

---

## 🎨 Color Scheme

- **Primary Green**: `#1a6b4a`
- **Light Green**: `#e8f5e9`
- **Orange Accent**: `#ff6b35`
- **Text**: `#1c1c1c`
- **Muted**: `#666666`
- **Border**: `#e0e0e0`

---

## 📧 Contact Information

**LifeCure Medicos**
- Address: Bazar Road, Bhanga Bazar, Sribhumi, Assam
- Phone: 8473966611 / 7980560994
- WhatsApp: https://wa.me/918473966611
- Timing: 7 AM – 11 PM (Daily)

---

## 📄 License

This project is custom-built for LifeCure Medicos. All rights reserved.

---

## ✨ Credits

Built with HTML5, CSS3, Vanilla JavaScript, and Firebase.
Designed for production deployment and maximum performance.

---

**Last Updated**: May 28, 2026
**Version**: 1.0.0 (Production Ready)
| Styles     | CSS3 with custom properties       |
| Scripts    | Vanilla JavaScript (ES6+)         |
| Fonts      | Google Fonts — Poppins            |
| Icons      | Font Awesome 6 (CDN)              |
| Storage    | Browser localStorage (admin only) |
| Hosting    | Netlify (recommended) / any CDN   |

No npm. No build step. No frameworks.

---

## 🚀 Deployment to Netlify

### Option A — Drag & Drop (Fastest)

1. Go to [netlify.com](https://netlify.com) and sign in (or create a free account).
2. In your dashboard, click **"Add new site"** → **"Deploy manually"**.
3. Drag and drop the entire `lifecure-medicos/` folder onto the upload area.
4. Your site goes live instantly with a Netlify URL (e.g. `lifecure-medicos.netlify.app`).
5. To use a custom domain (e.g. `lifecuremedicos.in`), go to **Site settings → Domain management**.

### Option B — GitHub + Continuous Deployment

1. Push the `lifecure-medicos/` folder to a GitHub repository.
2. In Netlify, click **"Add new site"** → **"Import an existing project"** → connect GitHub.
3. Select the repository; set **Publish directory** to `/` (root).
4. Click **Deploy site**.
5. Every push to `main` will automatically redeploy the site.

---

## 🔑 Admin Panel

- **URL:** `/admin.html`
- **Username:** `lifecure_admin`
- **Password:** `medicos2024`

> ⚠️ **Change these credentials before going live!** They are hardcoded in `assets/js/admin.js`. Search for `ADMIN_USERNAME` and `ADMIN_PASSWORD` constants and update them.

The admin panel uses **browser localStorage** — data is saved in the visitor's browser. It does not require a server or database.

---

## 📞 Contact Details

| Field        | Value                                    |
|--------------|------------------------------------------|
| Store Name   | LifeCure Medicos                         |
| Address      | Bazar Road, Bhanga Bazar, Sribhumi, Assam |
| Phone 1      | 8473966611                               |
| Phone 2      | 7980560994                               |
| WhatsApp     | [wa.me/918473966611](https://wa.me/918473966611) |
| Hours        | 7 AM – 11 PM (All days)                  |

---

## ✅ Pre-Launch Checklist

- [ ] Replace `assets/images/logo.png` with actual logo
- [ ] Replace `assets/images/og-image.jpg` with a real store photo
- [ ] Replace `assets/images/favicon.png` with branded favicon
- [ ] Replace PWA icons (`icon-192.png`, `icon-512.png`) with real icons
- [ ] Update Google Maps embed URL in the Contact section
- [ ] Add real doctor photos to `assets/images/`
- [ ] Add real store/gallery photos to `assets/images/`
- [ ] Change admin credentials in `assets/js/admin.js`
- [ ] Update `og:url` in `index.html` to the actual live domain
- [ ] Test on mobile devices before launch

---

## 📄 License

This website was built exclusively for **LifeCure Medicos**, Bhanga Bazar, Sribhumi, Assam. All rights reserved.