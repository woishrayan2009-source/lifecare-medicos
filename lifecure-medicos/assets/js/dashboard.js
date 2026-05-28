/* ===================================================
   LifeCure Medicos — Dashboard Module
   dashboard.js
   
   Handles:
   - Loading user profile
   - Fetching medicines
   - Fetching doctors
   - Fetching notices
   - Search functionality
=================================================== */

'use strict';

const { db } = window.firebaseServices;

let allMedicines = [];
let allDoctors = [];
let allNotices = [];

/* ===================================================
   INITIALIZATION
=================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for auth state to be ready
  setTimeout(() => {
    loadUserProfile();
    loadMedicines();
    loadDoctors();
    loadNotices();
  }, 500);
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
    const snapshot = await db.collection('medicines').get();
    allMedicines = [];

    snapshot.forEach(doc => {
      allMedicines.push({ id: doc.id, ...doc.data() });
    });

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

  grid.innerHTML = medicines.map(medicine => `
    <div class="medicine-card">
      <div class="medicine-name">${medicine.medicineName || 'N/A'}</div>
      <div class="medicine-company">${medicine.company || 'N/A'}</div>
      
      <div class="medicine-details">
        <div class="detail-item">
          <span class="detail-label">Price</span>
          <span class="detail-value">₹${parseFloat(medicine.price || 0).toFixed(2)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Stock</span>
          <span class="detail-value">${medicine.stock || 0} units</span>
        </div>
      </div>

      <span class="stock-status ${medicine.available ? 'available' : 'unavailable'}">
        ${medicine.available ? '✓ Available' : '✗ Out of Stock'}
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
    const name = (medicine.medicineName || '').toLowerCase();
    const company = (medicine.company || '').toLowerCase();
    return name.includes(query) || company.includes(query);
  });

  displayMedicines(filtered);
}

/* ===================================================
   LOAD DOCTORS
=================================================== */

async function loadDoctors() {
  try {
    const snapshot = await db.collection('doctors').get();
    allDoctors = [];

    snapshot.forEach(doc => {
      allDoctors.push({ id: doc.id, ...doc.data() });
    });

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

  grid.innerHTML = doctors.map(doctor => `
    <div class="doctor-card">
      <div class="doctor-photo">
        ${doctor.photoURL ? 
          `<img src="${doctor.photoURL}" alt="${doctor.doctorName}" />` : 
          '<i class="fas fa-user-doctor"></i>'
        }
      </div>
      
      <div class="doctor-name">${doctor.doctorName || 'Dr. Unknown'}</div>
      <div class="doctor-specialization">${doctor.specialization || 'General Physician'}</div>
      
      <div class="doctor-timing">
        <i class="fas fa-clock"></i> ${doctor.timing || '9 AM - 6 PM'}
      </div>

      <span class="doctor-status ${doctor.available ? 'available' : 'unavailable'}">
        ${doctor.available ? '✓ Available' : '✗ On Leave'}
      </span>

      ${doctor.leaveNotice ? `
        <div style="margin-top: 12px; padding: 12px; background: #fff3e0; border-radius: 8px; font-size: 12px; color: #e65100;">
          <strong>Notice:</strong> ${doctor.leaveNotice}
        </div>
      ` : ''}
    </div>
  `).join('');
}

/* ===================================================
   LOAD NOTICES
=================================================== */

async function loadNotices() {
  try {
    const snapshot = await db.collection('notices').orderBy('createdAt', 'desc').limit(10).get();
    allNotices = [];

    snapshot.forEach(doc => {
      allNotices.push({ id: doc.id, ...doc.data() });
    });

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
