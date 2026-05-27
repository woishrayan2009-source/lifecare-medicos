# lifecure Medicos — Website

> **Your Health Is Our Priority**

A complete, production-ready static website for **lifecure Medicos** — a medical store and doctor consultation center located at Bhanga Bazar, Sribhumi, Assam, India.

---

## 📋 About

lifecure Medicos offers:
- A full-service medical/pharmacy store
- On-site specialist doctor consultations (Skin, General Medicine, Heart, Ayurveda)
- Open **7 AM to 11 PM**, all days

This website is a **pure static site** — no backend, no database, no build tools required. It runs entirely in the browser and can be deployed instantly to Netlify or any static hosting provider.

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
| Markup     | HTML5                             |
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
| Store Name   | lifecure Medicos                         |
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

This website was built exclusively for **lifecure Medicos**, Bhanga Bazar, Sribhumi, Assam. All rights reserved.