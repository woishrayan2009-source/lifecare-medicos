/* ===================================================
   LifeCure Medicos — Dashboard Module
   dashboard.js
   
   Handles:
   - Loading user profile
   - Fetching medicines
   - Fetching doctors
   - Fetching notices
   - Search functionality
   - Doctor booking
=================================================== */

'use strict';

let allMedicines = [];
let allDoctors = [];
let allNotices = [];
let currentUserId = null;

/* ===================================================
   INITIALIZATION
=================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for auth state and db manager to be ready
  setTimeout(() => {
    currentUserId = getCurrentUserId();
    loadUserProfile();
    loadMedicines();
    loadDoctors();
    loadNotices();
  }, 1000);
});

/* ===================================================
   LOAD USER PROFILE
=================================================== */

async function loadUserProfile() {
  try {
    const userData = getUserData();
    if (userData && userData.name) {
      document.getElementById('userName').textContent = userData.name.split(' ')[0];
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

/* ===================================================
   LOAD MEDICINES
=================================================== */

async function loadMedicines() {
  try {
    if (!window.dbManager) {
      console.log('DB Manager not ready');
      return;
    }
    
    allMedicines = await window.dbManager.getMedicines();
    displayMedicines(allMedicines);
  } catch (error) {
    console.error('Error loading medicines:', error);
    showEmptyState('medicinesGrid', 'No medicines found');
  }
}

function displayMedicines(medicines) {
  const grid = document.getElementById('medicinesGrid');

  if (medicines.length === 0) {
    showEmptyState('medicinesGrid', 'No medicines found');
    return;
  }

  grid.innerHTML = medicines.map(medicine => {
    const status = medicine.available && medicine.qty > 0 ? 'available' : 'unavailable';
    const statusText = medicine.qty > 0 ? '✓ Available' : '✗ Out of Stock';
    
    return `
    <div class="medicine-card">
      <div class="medicine-name">${medicine.name || 'N/A'}</div>
      <div class="medicine-company">${medicine.category || 'N/A'}</div>
      
      <div class="medicine-details">
        <div class="detail-item">
          <span class="detail-label">Quantity</span>
          <span class="detail-value">${medicine.qty || 0} ${medicine.unit || 'units'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Expiry</span>
          <span class="detail-value">${medicine.expiry || 'N/A'}</span>
        </div>
      </div>

      <span class="stock-status ${status}">
        ${statusText}
      </span>
    </div>
  `).join('');
}

function searchMedicines() {
  const query = document.getElementById('medicineSearch').value.toLowerCase().trim();

  if (query.length === 0) {
    displayMedicines(allMedicines);
    return;
  }

  const filtered = allMedicines.filter(medicine => {
    const name = (medicine.name || '').toLowerCase();
    const category = (medicine.category || '').toLowerCase();
    return name.includes(query) || category.includes(query);
  });

  displayMedicines(filtered);
}

/* ===================================================
   LOAD DOCTORS
=================================================== */

async function loadDoctors() {
  try {
    if (!window.dbManager) {
      console.log('DB Manager not ready');
      return;
    }
    
    allDoctors = await window.dbManager.getDoctors();
    displayDoctors(allDoctors);
  } catch (error) {
    console.error('Error loading doctors:', error);
    showEmptyState('doctorsGrid', 'No doctors available');
  }
}

function displayDoctors(doctors) {
  const grid = document.getElementById('doctorsGrid');

  if (doctors.length === 0) {
    showEmptyState('doctorsGrid', 'No doctors available');
    return;
  }

  grid.innerHTML = doctors.map(doctor => {
    // Support both Firestore and localStorage data structures
    const name = doctor.doctorName || doctor.name || 'Dr. Unknown';
    const specialty = doctor.specialization || doctor.specialty || 'General';
    const timing = doctor.timing || '9 AM - 6 PM';
    const available = doctor.available !== false;
    const experience = doctor.experience || 0;
    
    return `
    <div class="doctor-card">
      <div class="doctor-photo">
        ${doctor.photoURL ? 
          `<img src="${doctor.photoURL}" alt="${name}" />` : 
          '<i class="fas fa-user-doctor"></i>'
        }
      </div>
      
      <div class="doctor-name">${name}</div>
      <div class="doctor-specialization">${specialty}${experience > 0 ? ` • ${experience} yrs` : ''}</div>
      
      <div class="doctor-timing">
        <i class="fas fa-clock"></i> ${timing}
      </div>

      <span class="doctor-status ${available ? 'available' : 'unavailable'}">
        ${available ? '✓ Available' : '✗ On Leave'}
      </span>

      ${doctor.leaveNotice ? `
        <div style="margin-top: 12px; padding: 12px; background: #fff3e0; border-radius: 8px; font-size: 12px; color: #e65100;">
          <strong>Notice:</strong> ${doctor.leaveNotice}
        </div>
      ` : ''}

      ${available ? `
        <button class="btn-book" onclick="openBookingModal('${doctor.id}', '${name}')">
          <i class="fas fa-calendar-plus"></i> Book Appointment
        </button>
      ` : ''}
    </div>
  `).join('');
}

function openBookingModal(doctorId, doctorName) {
  const modal = document.getElementById('bookingModal');
  if (!modal) {
    console.error('Booking modal not found');
    return;
  }
  
  document.getElementById('bookingDoctorId').value = doctorId;
  document.getElementById('bookingDoctorName').textContent = doctorName;
  document.getElementById('bookingForm').reset();
  document.getElementById('bookingError').classList.add('hidden');
  modal.classList.remove('hidden');
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.add('hidden');
}

function submitBooking() {
  const doctorId = document.getElementById('bookingDoctorId').value;
  const userName = document.getElementById('bookingName').value.trim();
  const userPhone = document.getElementById('bookingPhone').value.trim();
  const appointmentDate = document.getElementById('bookingDate').value;
  const appointmentTime = document.getElementById('bookingTime').value;
  const reason = document.getElementById('bookingReason').value.trim();
  const errorEl = document.getElementById('bookingError');

  if (!userName) return showBookingError('Please enter your name', errorEl);
  if (!userPhone || userPhone.length < 10) return showBookingError('Please enter a valid phone number', errorEl);
  if (!appointmentDate) return showBookingError('Please select a date', errorEl);
  if (!appointmentTime) return showBookingError('Please select a time', errorEl);

  // Find doctor name
  const doctor = allDoctors.find(d => d.id === doctorId);
  const doctorName = doctor?.name || 'Dr. Unknown';

  // Save booking to Firestore
  if (window.dbManager) {
    window.dbManager.createBooking({
      userId: currentUserId,
      userName: userName,
      userPhone: userPhone,
      doctorId: doctorId,
      doctorName: doctorName,
      date: appointmentDate,
      time: appointmentTime,
      reason: reason || 'General Checkup'
    }).then(result => {
      if (result.success) {
        alert('✓ Booking request submitted!\n\nYour appointment request has been sent to the admin for confirmation. You will receive updates shortly.');
        closeBookingModal();
      } else {
        showBookingError('Failed to submit booking: ' + result.error, errorEl);
      }
    }).catch(error => {
      showBookingError('Error: ' + error.message, errorEl);
    });
  } else {
    // Fallback to localStorage if db-manager not available
    const bookings = JSON.parse(localStorage.getItem('lifecure_bookings') || '[]');
    const newBooking = {
      id: window.dbManager?.genId() || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
      userId: currentUserId,
      doctorId: doctorId,
      userName: userName,
      userPhone: userPhone,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      reason: reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    localStorage.setItem('lifecure_bookings', JSON.stringify(bookings));
    alert('✓ Booking request submitted!\n\nYour appointment request has been sent to the admin for confirmation.');
    closeBookingModal();
  }
}

function showBookingError(message, errorEl) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

/* ===================================================
   LOAD NOTICES
=================================================== */

async function loadNotices() {
  try {
    if (!window.dbManager) {
      console.log('DB Manager not ready');
      return;
    }

    allNotices = await window.dbManager.getNotices();
    displayNotices(allNotices);
  } catch (error) {
    console.error('Error loading notices:', error);
    showEmptyState('noticesList', 'No notices available');
  }
}

function displayNotices(notices) {
  const list = document.getElementById('noticesList');

  if (notices.length === 0) {
    showEmptyState('noticesList', 'No notices at the moment');
    return;
  }

  list.innerHTML = notices.map(notice => {
    const date = notice.createdAt ? new Date(notice.createdAt.toDate()).toLocaleDateString() : 'N/A';
    const priority = notice.priority || 'normal';

    return `
      <div class="notice-card ${priority === 'high' ? 'high' : priority === 'urgent' ? 'urgent' : ''}">
        <div class="notice-title">
          ${priority === 'urgent' ? '<i class="fas fa-exclamation-circle"></i> ' : ''}
          ${notice.title || 'Notice'}
        </div>
        <div class="notice-message">${notice.message || ''}</div>
        <div class="notice-date">${date}</div>
      </div>
    `;
  }).join('');
}

/* ===================================================
   EMPTY STATE
=================================================== */

function showEmptyState(elementId, message) {
  document.getElementById(elementId).innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <i class="fas fa-inbox"></i>
      <p>${message}</p>
    </div>
  `;
}

/* ===================================================
   EXPORT FUNCTIONS (for use in other modules)
=================================================== */

window.searchMedicines = searchMedicines;
window.loadMedicines = loadMedicines;
window.loadDoctors = loadDoctors;
window.loadNotices = loadNotices;
