# LifeCure Medicos — Doctor Booking System Guide

## Overview
A complete doctor appointment booking system where:
- **Admin** can manage doctors, view pending bookings, and confirm appointments
- **Users** can browse available doctors, book appointments, and track their requests
- All data is stored locally (localStorage) with optional Firebase integration

---

## Key Features Implemented

### 1. **Admin Panel — Doctors Management**
**Location:** Admin Dashboard → "Doctors" section

#### Adding Doctors
- Click **"+ Add Doctor"** button
- Fill in:
  - **Doctor Name** (e.g., "Dr. John Smith")
  - **Specialty** (General, Cardiology, Dermatology, Orthopedic, Pediatrics)
  - **Experience** (in years)
  - **Availability** (toggle to available/unavailable)
  - **Qualifications** (MBBS, MD, etc.)
  - **Notes** (optional additional info)

#### Managing Doctors
- **Edit:** Click the pencil icon to update doctor details
- **View Timings:** Click the clock icon (future enhancement for scheduling)
- **Delete:** Click trash icon to remove doctor
- **Search & Filter:** Use search box and specialty dropdown to find doctors

### 2. **Admin Panel — Booking Confirmation**
**Location:** Admin Dashboard → "Appointments" section → "Pending Bookings" tab

#### Pending Bookings Table Shows:
- User's name and phone
- Doctor name
- Preferred appointment date & time
- Reason for visit
- Current status (Pending)

#### Actions Available:
- **✓ Approve:** Converts user booking into confirmed appointment
  - Creates appointment record
  - Marks booking as "confirmed"
  - Appears in regular Appointments list
- **✕ Reject:** Denies the booking request
  - Marks booking as "rejected"
  - User notification system (for future enhancement)

### 3. **User Dashboard — Doctor Browsing**
**Location:** User Dashboard → "Available Doctors" section

#### Doctor Cards Display:
- Doctor photo/icon
- Name
- Specialty
- Experience (in years)
- Availability status (✓ Available / ✗ On Leave)
- **"Book Appointment" button** (only if available)

### 4. **User Dashboard — Appointment Booking**
**Process:**
1. Click **"Book Appointment"** on doctor card
2. Fill booking modal:
   - Your name *
   - Phone number (10 digits) *
   - Preferred date *
   - Preferred time *
   - Reason for visit (optional)
3. Click **"Confirm Booking"**
4. System shows: "✓ Booking request submitted!"
   - Admin will see it in "Pending Bookings"
   - Admin confirms or rejects

---

## Data Structure

### Doctors (localStorage: `lifecure_doctors`)
```javascript
{
  id: "unique_id",
  name: "Dr. John Smith",
  specialty: "General",
  experience: 15,
  available: true,
  qualifications: "MBBS, MD",
  notes: ""
}
```

### Doctor Timings (localStorage: `lifecure_doctor_timings`)
```javascript
{
  id: "unique_id",
  doctorId: "doctor_id",
  doctorName: "Dr. John Smith",
  day: "Monday",
  startTime: "09:00",
  endTime: "13:00",
  slotDuration: 30,
  break: true
}
```

### Bookings (localStorage: `lifecure_bookings`)
```javascript
{
  id: "unique_id",
  doctorId: "doctor_id",
  userName: "Ramesh Kumar",
  userPhone: "9876543210",
  appointmentDate: "2026-06-15",
  appointmentTime: "10:30",
  reason: "Checkup",
  status: "pending" || "confirmed" || "rejected",
  createdAt: "2026-05-28T10:30:00Z"
}
```

### Appointments (localStorage: `lifecure_appointments`)
```javascript
{
  id: "unique_id",
  patient: "Ramesh Kumar",
  phone: "9876543210",
  doctor: "Dr. John Smith",
  date: "2026-06-15",
  time: "10:30",
  status: "Scheduled" || "Completed" || "Cancelled",
  notes: "Reason for visit"
}
```

---

## Workflow Example

### User Journey
1. User opens dashboard → sees "Available Doctors" section
2. Clicks "Book Appointment" on preferred doctor
3. Enters details: name, phone, date, time, reason
4. Clicks "Confirm Booking"
5. **System saves booking as "pending"**
6. User sees confirmation message

### Admin Journey
1. Admin logs in → Dashboard shows "N pending booking(s)" alert
2. Goes to Appointments → Pending Bookings tab
3. Reviews: User name, doctor, date, time, reason
4. Clicks **"✓ Approve"** to confirm:
   - Booking converts to confirmed appointment
   - Appears in regular "Appointments" list
   - Status changes to "Scheduled"

---

## Important Notes

### ✅ What's Implemented
- Full doctor management (add, edit, delete, search)
- User booking system with modal
- Pending bookings approval workflow
- Dashboard alerts for pending bookings
- Doctor availability status (Available/On Leave)
- Search and filter functionality
- Responsive design for mobile & desktop

### 🔮 Future Enhancements
- **Doctor Timings:** Full scheduling system
  - Configure working days & hours
  - Lunch breaks
  - Time slot availability
  - Automatic slot generation
- **User Notifications:** SMS/Email confirmations
- **Availability Logic:** Show only available time slots
- **Calendar View:** Visual appointment calendar
- **Payment Integration:** Online booking fees
- **Ratings & Reviews:** Doctor feedback system
- **Firebase Integration:** Cloud storage option

---

## Sample Data
The system comes with sample data:

**4 Sample Doctors:**
- Dr. Saddam Hussain (General, 15 yrs)
- Dr. Sandip Roy (Dermatology, 12 yrs)
- Dr. Shirsendu Roy (Cardiology, 18 yrs)
- Dr. Intekhab Alam (Pediatrics, 10 yrs)

**Doctor Timings:**
- Monday-Saturday: 9 AM-1 PM, 2 PM-6 PM
- 30-minute slots
- Lunch break: 1 PM-2 PM

---

## Testing the System

### Step 1: Admin Setup
1. Go to `/admin.html`
2. Login (credentials in admin.js)
3. Click "Doctors" section
4. Verify 4 sample doctors are loaded
5. Try editing a doctor or adding a new one

### Step 2: User Booking
1. Go to `/dashboard.html`
2. Scroll to "Available Doctors"
3. Click "Book Appointment" on a doctor
4. Fill modal with test data
5. Submit booking

### Step 3: Admin Confirmation
1. Return to admin dashboard
2. Go to Appointments → Pending Bookings tab
3. Verify your booking appears
4. Click "✓ Approve" to confirm
5. Check "Appointments" tab to see it listed

---

## File Changes

### Created/Modified Files:
- ✅ `admin.html` - Added Doctors section & Pending Bookings tab
- ✅ `admin.js` - Added doctors management functions, booking handlers
- ✅ `dashboard.html` - Added booking modal
- ✅ `dashboard.js` - Added booking functionality
- ✅ `admin.css` - Added tab and section styles
- ✅ `dashboard.css` - Added modal styles

---

## Technical Details

### Storage Keys
- `lifecure_doctors` - Doctor records
- `lifecure_doctor_timings` - Doctor schedules
- `lifecure_bookings` - User booking requests
- `lifecure_appointments` - Confirmed appointments

### Key Functions

**Admin Functions:**
- `renderDoctorsTable()` - Display doctors list
- `openDoctorModal()` / `saveDoctor()` - Add/edit doctors
- `renderPendingBookings()` - Show pending bookings
- `approveBooking()` - Confirm booking & create appointment
- `rejectBooking()` - Decline booking

**User Functions:**
- `displayDoctors()` - Show available doctors
- `openBookingModal()` - Show booking form
- `submitBooking()` - Save booking request

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify localStorage has data: `localStorage.getItem('lifecure_doctors')`
3. Ensure JavaScript is enabled
4. Clear cache if experiencing display issues
