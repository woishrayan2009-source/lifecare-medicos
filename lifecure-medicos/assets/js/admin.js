/* ===================================================
   LifeCure Medicos — Admin Dashboard
   admin.js (Firebase Edition)
=================================================== */

'use strict';

/* ===================================================
   FIREBASE SERVICES & DB MANAGER
=================================================== */
let auth, db, storage;
let medicines = [];
let doctors = [];
let doctorTimings = [];
let appointments = [];
let bookings = [];
let timingEdits = []; // Temporary storage for timing edits

/* ===================================================
   STORAGE KEYS (kept for backward compatibility)
=================================================== */
const KEY_MEDICINES    = 'lifecure_medicines';
const KEY_DOCTORS      = 'lifecure_doctors';
const KEY_DOCTOR_TIMINGS = 'lifecure_doctor_timings';
const KEY_APPOINTMENTS = 'lifecure_appointments';
const KEY_BOOKINGS     = 'lifecure_bookings';
const KEY_BILL_NUM     = 'lifecure_bill_number';

/* ===================================================
   UTILITY HELPERS
=================================================== */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addMonths(n) {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}
function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysUntilExpiry(expiryISO) {
  const now = new Date(); now.setHours(0,0,0,0);
  const exp = new Date(expiryISO); exp.setHours(0,0,0,0);
  return Math.floor((exp - now) / 86400000);
}
function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function formatTime(t) {
  if (!t) return '—';
  const [h, min] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr || 12}:${min} ${hr >= 12 ? 'PM' : 'AM'}`;
}
function inr(n) {
  return '₹' + parseFloat(n || 0).toFixed(2);
}
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ===================================================
   DATABASE HELPER FUNCTIONS (using Firestore)
=================================================== */
async function loadMedicines() {
  if (dbManager && dbManager.db) {
    medicines = await dbManager.getMedicines();
  }
  return medicines;
}

async function saveMedicineToDb(medData, medId = null) {
  if (medId) {
    const result = await dbManager.updateMedicine(medId, medData);
    if (result.success) {
      medicines = medicines.map(m => m.id === medId ? { ...m, ...medData } : m);
    }
    return result;
  } else {
    const result = await dbManager.addMedicine(medData);
    if (result.success) {
      medicines = await loadMedicines();
    }
    return result;
  }
}

async function deleteMedicineFromDb(medId) {
  const result = await dbManager.deleteMedicine(medId);
  if (result.success) {
    medicines = medicines.filter(m => m.id !== medId);
  }
  return result;
}

async function loadDoctors() {
  if (dbManager && dbManager.db) {
    doctors = await dbManager.getDoctors();
  }
  return doctors;
}

async function saveDoctorToDb(docData, docId = null) {
  if (docId) {
    const result = await dbManager.updateDoctor(docId, docData);
    if (result.success) {
      doctors = doctors.map(d => d.id === docId ? { ...d, ...docData } : d);
    }
    return result;
  } else {
    const result = await dbManager.addDoctor(docData);
    if (result.success) {
      doctors = await loadDoctors();
    }
    return result;
  }
}

async function deleteDoctorFromDb(docId) {
  const result = await dbManager.deleteDoctor(docId);
  if (result.success) {
    doctors = doctors.filter(d => d.id !== docId);
    // Also delete associated timings
    doctorTimings = doctorTimings.filter(t => t.doctorId !== docId);
  }
  return result;
}

async function loadAppointments() {
  if (dbManager && dbManager.db) {
    appointments = await dbManager.getAppointments();
  }
  return appointments;
}

async function saveAppointmentToDb(apptData, apptId = null) {
  if (apptId) {
    const result = await dbManager.updateAppointment(apptId, apptData);
    if (result.success) {
      appointments = appointments.map(a => a.id === apptId ? { ...a, ...apptData } : a);
    }
    return result;
  } else {
    const result = await dbManager.addAppointment(apptData);
    if (result.success) {
      appointments = await loadAppointments();
    }
    return result;
  }
}

async function deleteAppointmentFromDb(apptId) {
  const result = await dbManager.deleteAppointment(apptId);
  if (result.success) {
    appointments = appointments.filter(a => a.id !== apptId);
  }
  return result;
}

async function loadTimings() {
  if (dbManager && dbManager.db) {
    doctorTimings = await dbManager.getTimings();
  }
  return doctorTimings;
}

async function saveTimingToDb(timingData, timingId = null) {
  if (timingId) {
    const result = await dbManager.updateTiming(timingId, timingData);
    if (result.success) {
      doctorTimings = doctorTimings.map(t => t.id === timingId ? { ...t, ...timingData } : t);
    }
    return result;
  } else {
    const result = await dbManager.addTiming(timingData);
    if (result.success) {
      doctorTimings = await loadTimings();
    }
    return result;
  }
}

async function deleteTimingFromDb(timingId) {
  const result = await dbManager.deleteTiming(timingId);
  if (result.success) {
    doctorTimings = doctorTimings.filter(t => t.id !== timingId);
  }
  return result;
}

async function loadBookings() {
  if (dbManager && dbManager.db) {
    bookings = await dbManager.getBookings();
  }
  return bookings;
}

async function saveBookingToDb(bookingData, bookingId = null) {
  if (bookingId) {
    const result = await dbManager.updateBooking(bookingId, bookingData);
    if (result.success) {
      bookings = bookings.map(b => b.id === bookingId ? { ...b, ...bookingData } : b);
    }
    return result;
  } else {
    const result = await dbManager.createBooking(bookingData);
    if (result.success) {
      bookings = await loadBookings();
    }
    return result;
  }
}

// Legacy localStorage functions for backward compatibility
function getMedicines() {
  return medicines;
}

function getAppointments() {
  return appointments;
}

function getDoctors() {
  return doctors;
}

function getDoctorTimings() {
  return doctorTimings;
}

function getBookings() {
  return bookings;
}

function getNextBillNum() {
  // Generate bill number from timestamp for uniqueness
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return parseInt(timestamp + random);
}

/* ===================================================
   SEED DATA TO DATABASE
=================================================== */
async function seedSampleDataToDb() {
  // Check if medicines exist, if so skip seeding
  if (medicines.length > 0) return;

  try {
    const sampleMedicines = [
      { name: 'Paracetamol 500mg',   category: 'Tablet',  qty: 50, unit: 'Strips',  expiry: addMonths(6),  available: true, notes: '' },
      { name: 'Amoxicillin 250mg',   category: 'Capsule', qty: 30, unit: 'Strips',  expiry: addMonths(4),  available: true, notes: '' },
      { name: 'Omeprazole 20mg',     category: 'Capsule', qty: 25, unit: 'Strips',  expiry: addMonths(8),  available: true, notes: '' },
      { name: 'Cetirizine 10mg',     category: 'Tablet',  qty: 40, unit: 'Strips',  expiry: addMonths(3),  available: true, notes: '' },
      { name: 'Metformin 500mg',     category: 'Tablet',  qty: 15, unit: 'Strips',  expiry: addMonths(10), available: true, notes: '' },
    ];
    
    for (const med of sampleMedicines) {
      await dbManager.addMedicine({...med, id: genId()});
    }
    
    const sampleDoctors = [
      { name: 'Dr. Saddam Hussain', specialty: 'General', experience: 15, available: true, qualifications: 'MBBS, MD', notes: '' },
      { name: 'Dr. Sandip Roy', specialty: 'Dermatology', experience: 12, available: true, qualifications: 'MBBS, MD Dermatology', notes: '' },
      { name: 'Dr. Shirsendu Roy', specialty: 'Cardiology', experience: 18, available: true, qualifications: 'MBBS, MD Cardiology', notes: '' },
    ];
    
    for (const doc of sampleDoctors) {
      await dbManager.addDoctor({...doc, id: genId()});
    }
    
    // Reload data
    await loadMedicines();
    await loadDoctors();
    console.log('✓ Sample data seeded to Firestore');
  } catch (error) {
    console.warn('Could not seed sample data:', error);
  }
}

function seedSampleData() {
  // Legacy function - now just calls the async version if needed
  // This is kept for backward compatibility
}

/* ===================================================
   LOGIN / LOGOUT
=================================================== */
async function adminHandleLoginForm() {
  const email    = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPass').value.trim();

  if (!email || !password) {
    showLoginError('Please enter your email and password.');
    return;
  }

  // Use admin-auth module for Firebase authentication
  const result = await adminLoginWithEmail(email, password);
  
  if (!result.success) {
    showLoginError(result.error || 'Login failed. Please try again.');
  }
  // On success, admin-auth.js will handle the UI update
}

// Legacy function name support
async function adminHandleLogin() {
  return adminHandleLoginForm();
}

async function adminHandleLogout() {
  // Use admin-auth module
  return adminLogout();
}

function showLoginError(message) {
  const errEl = document.getElementById('loginError');
  errEl.querySelector('span').textContent = message;
  errEl.classList.remove('hidden');
  errEl.style.animation = 'none';
  errEl.offsetHeight;
  errEl.style.animation = '';
}

function togglePassword() {
  const inp = document.getElementById('adminPass');
  const ico = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    ico.className = 'fas fa-eye-slash';
  } else {
    inp.type = 'password';
    ico.className = 'fas fa-eye';
  }
}

/* ===================================================
   DOM READY — Entry Point
=================================================== */
document.addEventListener('DOMContentLoaded', async () => {

  // ✅ CRITICAL: Assign Firebase AFTER DOM+scripts are ready
  const services = window.firebaseServices || {};
  auth    = services.auth    || null;
  db      = services.db      || null;
  storage = services.storage || null;

  // Initialize database manager
  if (dbManager && db && auth) {
    dbManager.init(auth, db);
    console.log('✓ dbManager initialized');
  } else {
    console.warn('dbManager or Firebase services not fully loaded, using fallback mode');
  }

  // Debug: log Firebase status
  console.log('Firebase auth:', auth ? '✓ loaded' : '✗ NULL — check firebase-config.js');
  console.log('Firebase db:',   db   ? '✓ loaded' : '✗ NULL — check firebase-config.js');

  // Enter key support
  document.getElementById('adminPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') adminHandleLoginForm();
  });
  const adminEmailEl = document.getElementById('adminEmail');
  if (adminEmailEl) {
    adminEmailEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('adminPass').focus();
    });
  }

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });

  // ✅ Firebase Auth State Observer
  if (auth) {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User signed in — verify admin role in Firestore
        try {
          const userDoc = await db.collection('users').doc(user.uid).get();

          if (!userDoc.exists) {
            console.warn('No Firestore document for user:', user.uid);
            await auth.signOut();
            showLoginError('Admin account not set up. Contact support.');
            return;
          }

          const userData = userDoc.data();

          if (!userData || userData.role !== 'admin') {
            console.warn('User is not admin. Role:', userData?.role);
            await auth.signOut();
            showLoginError('Access denied. Admins only.');
            return;
          }

          // ✅ Admin confirmed — load data and show dashboard
          document.getElementById('loginScreen').classList.add('hidden');
          document.getElementById('adminDashboard').classList.remove('hidden');
          document.querySelector('.logged-in-badge').innerHTML =
            '<i class="fas fa-circle"></i> ' + escHtml(user.email);
          
          // Load all data from Firestore
          await loadMedicines();
          await loadDoctors();
          await loadAppointments();
          await loadTimings();
          await loadBookings();
          
          initDashboard();

        } catch (error) {
          console.error('Error verifying admin:', error);
          showLoginError('Error verifying access. Check console.');
        }

      } else {
        // User signed out — show login screen
        document.getElementById('adminDashboard').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');
        // Clear fields
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPass').value = '';
        document.getElementById('loginError').classList.add('hidden');
      }
    });
  } else {
    // Firebase failed to load — show clear error
    console.error('FATAL: auth is null. Firebase SDK or config failed to load.');
    showLoginError('Firebase failed to load. Please refresh or check console.');
  }

  // Seed sample data to database (if empty)
  seedSampleDataToDb();
});

/* ===================================================
   NAVIGATION
=================================================== */
const SECTION_TITLES = {
  dashboard:    'Dashboard',
  medicines:    'Medicine Stock',
  doctors:      'Doctors Management',
  appointments: 'Appointments Log',
  billing:      'Billing & Receipts',
};

function switchSection(name, clickedEl) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll(`.nav-item[data-section="${name}"]`).forEach(el => el.classList.add('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.querySelectorAll(`.tab-btn[data-section="${name}"]`).forEach(el => el.classList.add('active'));
  document.getElementById('sectionTitleHeader').textContent = SECTION_TITLES[name] || '';
  if (window.innerWidth <= 768) closeSidebar();
  if (name === 'dashboard')    renderDashboard();
  if (name === 'medicines')    renderMedicinesTable();
  if (name === 'doctors')      renderDoctorsTable();
  if (name === 'appointments') renderApptsTable();
  if (name === 'billing')      initBilling();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

/* ===================================================
   DASHBOARD INIT
=================================================== */
function initDashboard() {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('dashDate').textContent = new Date().toLocaleDateString('en-IN', opts);
  renderDashboard();
}

/* ===================================================
   SECTION 1: DASHBOARD
=================================================== */
function renderDashboard() {
  const meds  = getMedicines();
  const appts = getAppointments();
  const bookings = getBookings();
  const today = todayISO();
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  document.getElementById('statTotal').textContent    = meds.length;
  document.getElementById('statLow').textContent      = meds.filter(m => parseInt(m.qty) < 10).length;
  document.getElementById('statExpiring').textContent = meds.filter(m => { const d = daysUntilExpiry(m.expiry); return d >= 0 && d <= 30; }).length;
  document.getElementById('statAppts').textContent    = appts.filter(a => a.date === today).length;

  const alertsEl = document.getElementById('stockAlerts');
  const alerts = [];
  
  // Add booking alerts
  if (pendingBookings.length > 0) {
    alerts.push({ cls: 'info', icon: 'fa-calendar-plus', msg: `<strong>${pendingBookings.length} pending booking(s)</strong> awaiting confirmation` });
  }
  
  meds.forEach(m => {
    const days = daysUntilExpiry(m.expiry);
    if (days < 0)       alerts.push({ cls: 'danger', icon: 'fa-calendar-xmark',      msg: `<strong>${m.name}</strong> has expired (${formatDate(m.expiry)})` });
    else if (days <= 7) alerts.push({ cls: 'danger', icon: 'fa-triangle-exclamation', msg: `<strong>${m.name}</strong> expires in ${days} day(s) on ${formatDate(m.expiry)}` });
    else if (days <= 30)alerts.push({ cls: 'warn',   icon: 'fa-clock',               msg: `<strong>${m.name}</strong> expires in ${days} days (${formatDate(m.expiry)})` });
    if (parseInt(m.qty) === 0)      alerts.push({ cls: 'danger', icon: 'fa-box-open',            msg: `<strong>${m.name}</strong> is out of stock` });
    else if (parseInt(m.qty) < 10)  alerts.push({ cls: 'warn',   icon: 'fa-triangle-exclamation', msg: `<strong>${m.name}</strong> is low on stock (${m.qty} ${m.unit} left)` });
  });

  alertsEl.innerHTML = alerts.length === 0
    ? '<p class="no-alerts"><i class="fas fa-check-circle" style="color:var(--green)"></i> No alerts. Everything looks good!</p>'
    : alerts.slice(0, 10).map(a => `<div class="alert-item ${a.cls}"><i class="fas ${a.icon}"></i><span>${a.msg}</span></div>`).join('')
      + (alerts.length > 10 ? `<p style="font-size:0.82rem;color:var(--muted);margin-top:8px">+${alerts.length - 10} more alerts.</p>` : '');
}

/* ===================================================
   SECTION 2: MEDICINE STOCK
=================================================== */
function renderMedicinesTable() {
  const search = (document.getElementById('medSearch')?.value || '').toLowerCase();
  const filter = document.getElementById('medFilter')?.value || 'all';
  const sortBy = document.getElementById('medSort')?.value || 'name';
  let meds = getMedicines().filter(m => {
    const match = m.name.toLowerCase().includes(search) || m.category.toLowerCase().includes(search);
    if (!match) return false;
    const days = daysUntilExpiry(m.expiry);
    if (filter === 'low')      return parseInt(m.qty) > 0 && parseInt(m.qty) < 10;
    if (filter === 'expiring') return days >= 0 && days <= 30;
    if (filter === 'out')      return parseInt(m.qty) === 0;
    return true;
  });
  meds.sort((a, b) => {
    if (sortBy === 'name')   return a.name.localeCompare(b.name);
    if (sortBy === 'stock')  return parseInt(a.qty) - parseInt(b.qty);
    if (sortBy === 'expiry') return new Date(a.expiry) - new Date(b.expiry);
    return 0;
  });
  const tbody = document.getElementById('medTableBody');
  const empty = document.getElementById('medEmpty');
  if (meds.length === 0) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  tbody.innerHTML = meds.map((m, i) => {
    const days = daysUntilExpiry(m.expiry);
    const qty  = parseInt(m.qty);
    let rowClass = days < 0 || days <= 7 ? 'row-danger' : days <= 30 ? 'row-warn' : '';
    const qtyDisplay = qty < 10 ? `<span class="qty-low">${qty}</span>` : qty;
    const availBadge = !m.available || qty === 0
      ? '<span class="badge badge-red">Out of Stock</span>'
      : '<span class="badge badge-green">Available</span>';
    let expiryDisplay = formatDate(m.expiry);
    if (days < 0)        expiryDisplay += ' <span class="badge badge-red" style="font-size:0.7rem">Expired</span>';
    else if (days <= 7)  expiryDisplay += ` <span class="badge badge-red" style="font-size:0.7rem">${days}d</span>`;
    else if (days <= 30) expiryDisplay += ` <span class="badge badge-orange" style="font-size:0.7rem">${days}d</span>`;
    return `<tr class="${rowClass}" id="med-row-${m.id}">
      <td>${i+1}</td>
      <td><strong>${escHtml(m.name)}</strong>${m.notes ? `<br><small style="color:var(--muted)">${escHtml(m.notes)}</small>` : ''}</td>
      <td><span class="badge badge-grey">${escHtml(m.category)}</span></td>
      <td>${qtyDisplay} ${escHtml(m.unit)}</td>
      <td>${escHtml(m.unit)}</td>
      <td>${expiryDisplay}</td>
      <td>${availBadge}</td>
      <td><div class="action-btns">
        <button class="btn-icon edit" title="Edit" onclick="editMedicine('${m.id}')"><i class="fas fa-pen"></i></button>
        <button class="btn-icon del" title="Delete" onclick="confirmDeleteMedicine('${m.id}')"><i class="fas fa-trash-can"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

function openMedicineModal(editId = null) {
  clearMedModal();
  if (editId) {
    const m = getMedicines().find(x => x.id === editId);
    if (!m) return;
    document.getElementById('medModalTitle').textContent = 'Edit Medicine';
    document.getElementById('medEditId').value   = m.id;
    document.getElementById('medName').value     = m.name;
    document.getElementById('medCategory').value = m.category;
    document.getElementById('medQty').value      = m.qty;
    document.getElementById('medUnit').value     = m.unit;
    document.getElementById('medExpiry').value   = m.expiry;
    document.getElementById('medAvail').checked  = m.available;
    document.getElementById('medAvailLabel').textContent = m.available ? 'Available' : 'Not Available';
    document.getElementById('medNotes').value    = m.notes || '';
  } else {
    document.getElementById('medModalTitle').textContent = 'Add Medicine';
  }
  document.getElementById('medicineModal').classList.remove('hidden');
}
function clearMedModal() {
  ['medEditId','medName','medQty','medNotes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('medCategory').value = '';
  document.getElementById('medUnit').value = '';
  document.getElementById('medExpiry').value = '';
  document.getElementById('medAvail').checked = true;
  document.getElementById('medAvailLabel').textContent = 'Available';
  document.getElementById('medModalError').classList.add('hidden');
}
function closeMedicineModal() { document.getElementById('medicineModal').classList.add('hidden'); }
function editMedicine(id) { openMedicineModal(id); }

function saveMedicine() {
  const editId   = document.getElementById('medEditId').value;
  const name     = document.getElementById('medName').value.trim();
  const category = document.getElementById('medCategory').value;
  const qty      = document.getElementById('medQty').value;
  const unit     = document.getElementById('medUnit').value;
  const expiry   = document.getElementById('medExpiry').value;
  const available= document.getElementById('medAvail').checked;
  const notes    = document.getElementById('medNotes').value.trim();
  const errEl    = document.getElementById('medModalError');
  if (!name)     return showModalError(errEl, 'Medicine name is required.');
  if (!category) return showModalError(errEl, 'Please select a category.');
  if (qty === '' || parseInt(qty) < 0) return showModalError(errEl, 'Enter a valid stock quantity.');
  if (!unit)     return showModalError(errEl, 'Please select a unit.');
  if (!expiry)   return showModalError(errEl, 'Expiry date is required.');
  
  let meds = getMedicines();
  const dup = meds.find(m => m.name.toLowerCase() === name.toLowerCase() && m.id !== editId);
  if (dup) return showModalError(errEl, 'A medicine with this name already exists.');
  
  // Save to database
  const medData = { name, category, qty: parseInt(qty), unit, expiry, available, notes };
  
  if (editId) {
    saveMedicineToDb(medData, editId).then(result => {
      if (result.success) {
        closeMedicineModal();
        renderMedicinesTable();
        renderDashboard();
        showSuccessMessage('Medicine updated successfully!');
      } else {
        showModalError(errEl, 'Error updating medicine: ' + result.error);
      }
    }).catch(err => {
      showModalError(errEl, 'Error saving: ' + err.message);
    });
  } else {
    saveMedicineToDb({...medData, id: genId()}).then(result => {
      if (result.success) {
        closeMedicineModal();
        renderMedicinesTable();
        renderDashboard();
        showSuccessMessage('Medicine added successfully!');
      } else {
        showModalError(errEl, 'Error adding medicine: ' + result.error);
      }
    }).catch(err => {
      showModalError(errEl, 'Error saving: ' + err.message);
    });
  }
}

function confirmDeleteMedicine(id) {
  const m = getMedicines().find(x => x.id === id);
  if (!m) return;
  openConfirm(`Delete "<strong>${escHtml(m.name)}</strong>"? This cannot be undone.`, async () => {
    const result = await deleteMedicineFromDb(id);
    if (result.success) {
      renderMedicinesTable();
      renderDashboard();
      showSuccessMessage('Medicine deleted successfully!');
    } else {
      alert('Error deleting medicine: ' + result.error);
    }
  });
}

document.addEventListener('change', e => {
  if (e.target && e.target.id === 'medAvail') {
    document.getElementById('medAvailLabel').textContent = e.target.checked ? 'Available' : 'Not Available';
  }
});

/* ===================================================   SECTION 2B: DOCTORS MANAGEMENT
=================================================== */
function renderDoctorsTable() {
  const search = (document.getElementById('docSearch')?.value || '').toLowerCase();
  const specialty = document.getElementById('docSpecialty')?.value || 'all';
  let doctors = getDoctors().filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search) || d.specialty.toLowerCase().includes(search);
    const matchSpecialty = specialty === 'all' || d.specialty === specialty;
    return matchSearch && matchSpecialty;
  });
  doctors.sort((a, b) => a.name.localeCompare(b.name));
  const tbody = document.getElementById('docTableBody');
  const empty = document.getElementById('docEmpty');
  if (doctors.length === 0) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  tbody.innerHTML = doctors.map((d, i) => {
    const timings = getDoctorTimings().filter(t => t.doctorId === d.id);
    const scheduleStr = timings.length > 0 ? `${timings.length} slots` : 'No schedule';
    const availBadge = d.available 
      ? '<span class="badge badge-green">Available</span>' 
      : '<span class="badge badge-red">Unavailable</span>';
    return `<tr id="doc-row-${d.id}">
      <td>${i+1}</td>
      <td><strong>${escHtml(d.name)}</strong>${d.qualifications ? `<br><small style="color:var(--muted)">${escHtml(d.qualifications)}</small>` : ''}</td>
      <td><span class="badge badge-grey">${escHtml(d.specialty)}</span></td>
      <td>${d.experience || 0} years</td>
      <td>${availBadge}</td>
      <td><small>${scheduleStr}</small></td>
      <td><div class="action-btns">
        <button class="btn-icon edit" title="Edit" onclick="editDoctor('${d.id}')"><i class="fas fa-pen"></i></button>
        <button class="btn-icon info" title="Timings" onclick="manageDoctorTimings('${d.id}')"><i class="fas fa-clock"></i></button>
        <button class="btn-icon del" title="Delete" onclick="confirmDeleteDoctor('${d.id}')"><i class="fas fa-trash-can"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

function openDoctorModal(editId = null) {
  clearDoctorModal();
  if (editId) {
    const d = getDoctors().find(x => x.id === editId);
    if (!d) return;
    document.getElementById('docModalTitle').textContent = 'Edit Doctor';
    document.getElementById('docEditId').value = d.id;
    document.getElementById('docName').value = d.name;
    document.getElementById('docSpecialtyInput').value = d.specialty;
    document.getElementById('docExperience').value = d.experience || 0;
    document.getElementById('docAvailable').checked = d.available;
    document.getElementById('docAvailLabel').textContent = d.available ? 'Available' : 'Not Available';
    document.getElementById('docQualifications').value = d.qualifications || '';
    document.getElementById('docNotes').value = d.notes || '';
  } else {
    document.getElementById('docModalTitle').textContent = 'Add Doctor';
  }
  document.getElementById('doctorModal').classList.remove('hidden');
}

function clearDoctorModal() {
  ['docEditId','docName','docExperience','docQualifications','docNotes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('docSpecialtyInput').value = '';
  document.getElementById('docAvailable').checked = true;
  document.getElementById('docAvailLabel').textContent = 'Available';
  document.getElementById('docModalError').classList.add('hidden');
}

function closeDoctorModal() { document.getElementById('doctorModal').classList.add('hidden'); }

function editDoctor(id) { openDoctorModal(id); }

function saveDoctor() {
  const editId = document.getElementById('docEditId').value;
  const name = document.getElementById('docName').value.trim();
  const specialty = document.getElementById('docSpecialtyInput').value;
  const experience = parseInt(document.getElementById('docExperience').value) || 0;
  const available = document.getElementById('docAvailable').checked;
  const qualifications = document.getElementById('docQualifications').value.trim();
  const notes = document.getElementById('docNotes').value.trim();
  const errEl = document.getElementById('docModalError');

  if (!name) return showModalError(errEl, 'Doctor name is required.');
  if (!specialty) return showModalError(errEl, 'Please select a specialty.');
  if (experience < 0) return showModalError(errEl, 'Experience must be a positive number.');

  let doctors = getDoctors();
  const dup = doctors.find(d => d.name.toLowerCase() === name.toLowerCase() && d.id !== editId);
  if (dup) return showModalError(errEl, 'A doctor with this name already exists.');

  const docData = { name, specialty, experience, available, qualifications, notes };

  if (editId) {
    saveDoctorToDb(docData, editId).then(result => {
      if (result.success) {
        closeDoctorModal();
        renderDoctorsTable();
        renderDashboard();
        showSuccessMessage('Doctor updated successfully!');
      } else {
        showModalError(errEl, 'Error updating doctor: ' + result.error);
      }
    }).catch(err => {
      showModalError(errEl, 'Error saving: ' + err.message);
    });
  } else {
    saveDoctorToDb({...docData, id: genId()}).then(result => {
      if (result.success) {
        closeDoctorModal();
        renderDoctorsTable();
        renderDashboard();
        showSuccessMessage('Doctor added successfully!');
      } else {
        showModalError(errEl, 'Error adding doctor: ' + result.error);
      }
    }).catch(err => {
      showModalError(errEl, 'Error saving: ' + err.message);
    });
  }
}

function confirmDeleteDoctor(id) {
  const d = getDoctors().find(x => x.id === id);
  if (!d) return;
  openConfirm(`Delete "<strong>${escHtml(d.name)}</strong>"? This cannot be undone.`, async () => {
    const result = await deleteDoctorFromDb(id);
    if (result.success) {
      renderDoctorsTable();
      renderDashboard();
      showSuccessMessage('Doctor deleted successfully!');
    } else {
      alert('Error deleting doctor: ' + result.error);
    }
  });
}

function manageDoctorTimings(doctorId) {
  const doc = getDoctors().find(d => d.id === doctorId);
  if (!doc) return;
  
  document.getElementById('timingsDoctorId').value = doctorId;
  document.getElementById('timingsModalTitle').textContent = `Doctor Timings - ${escHtml(doc.name)}`;
  
  // Load timings for this doctor
  timingEdits = getDoctorTimings().filter(t => t.doctorId === doctorId).map(t => ({...t}));
  
  if (timingEdits.length === 0) {
    // Create default timings if none exist
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => {
      timingEdits.push({
        id: genId(),
        doctorId: doctorId,
        doctorName: doc.name,
        day: day,
        startTime: '09:00',
        endTime: '13:00',
        slotDuration: 30,
        break: true
      });
      timingEdits.push({
        id: genId(),
        doctorId: doctorId,
        doctorName: doc.name,
        day: day,
        startTime: '14:00',
        endTime: '18:00',
        slotDuration: 30,
        break: false
      });
    });
  }
  
  renderTimingsTable();
  document.getElementById('timingsModal').classList.remove('hidden');
}

function renderTimingsTable() {
  const tbody = document.getElementById('timingsTableBody');
  tbody.innerHTML = timingEdits.map((t, idx) => `
    <tr>
      <td>
        <select onchange="timingEdits[${idx}].day = this.value" style="width: 100%; padding: 5px;">
          <option value="Monday" ${t.day === 'Monday' ? 'selected' : ''}>Monday</option>
          <option value="Tuesday" ${t.day === 'Tuesday' ? 'selected' : ''}>Tuesday</option>
          <option value="Wednesday" ${t.day === 'Wednesday' ? 'selected' : ''}>Wednesday</option>
          <option value="Thursday" ${t.day === 'Thursday' ? 'selected' : ''}>Thursday</option>
          <option value="Friday" ${t.day === 'Friday' ? 'selected' : ''}>Friday</option>
          <option value="Saturday" ${t.day === 'Saturday' ? 'selected' : ''}>Saturday</option>
          <option value="Sunday" ${t.day === 'Sunday' ? 'selected' : ''}>Sunday</option>
        </select>
      </td>
      <td>
        <input type="time" value="${t.startTime}" onchange="timingEdits[${idx}].startTime = this.value" style="width: 100%; padding: 5px;" />
      </td>
      <td>
        <input type="time" value="${t.endTime}" onchange="timingEdits[${idx}].endTime = this.value" style="width: 100%; padding: 5px;" />
      </td>
      <td>
        <input type="number" value="${t.slotDuration}" min="15" max="120" step="15" onchange="timingEdits[${idx}].slotDuration = parseInt(this.value)" style="width: 100%; padding: 5px; text-align: center;" />
      </td>
      <td>
        <button class="btn-icon del" title="Delete" onclick="deleteTimingSlot(${idx})">
          <i class="fas fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function addTimingSlot() {
  const doctorId = document.getElementById('timingsDoctorId').value;
  const docName = getDoctors().find(d => d.id === doctorId)?.name || 'Unknown';
  timingEdits.push({
    id: genId(),
    doctorId: doctorId,
    doctorName: docName,
    day: 'Monday',
    startTime: '09:00',
    endTime: '13:00',
    slotDuration: 30,
    break: false
  });
  renderTimingsTable();
}

function deleteTimingSlot(idx) {
  timingEdits.splice(idx, 1);
  renderTimingsTable();
}

async function saveAllTimings() {
  const errEl = document.getElementById('timingsModalError');
  
  try {
    // Validate timings
    for (const timing of timingEdits) {
      if (!timing.day || !timing.startTime || !timing.endTime) {
        showModalError(errEl, 'All fields are required');
        return;
      }
      if (timing.startTime >= timing.endTime) {
        showModalError(errEl, 'Start time must be before end time');
        return;
      }
    }
    
    errEl.classList.add('hidden');
    
    // Save to database
    const doctorId = document.getElementById('timingsDoctorId').value;
    const existingTimings = getDoctorTimings().filter(t => t.doctorId === doctorId);
    
    // Delete old timings
    for (const timing of existingTimings) {
      await deleteTimingFromDb(timing.id);
    }
    
    // Add new timings
    for (const timing of timingEdits) {
      await saveTimingToDb(timing, timing.id);
    }
    
    // Reload data and close modal
    await loadTimings();
    closeTimingsModal();
    renderDoctorsTable();
    showSuccessMessage('Doctor timings saved successfully!');
  } catch (error) {
    console.error('Error saving timings:', error);
    showModalError(errEl, 'Error saving timings: ' + error.message);
  }
}

function closeTimingsModal() {
  document.getElementById('timingsModal').classList.add('hidden');
  timingEdits = [];
}

function showSuccessMessage(msg) {
  const div = document.createElement('div');
  div.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4caf50; color: white; padding: 15px 20px; border-radius: 4px; z-index: 10000; animation: slideIn 0.3s ease-out;';
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

document.addEventListener('change', e => {
  if (e.target && e.target.id === 'docAvailable') {
    document.getElementById('docAvailLabel').textContent = e.target.checked ? 'Available' : 'Not Available';
  }
});

/* ===================================================   SECTION 3: APPOINTMENTS
=================================================== */
function renderApptsTable() {
  const search       = (document.getElementById('apptSearch')?.value || '').toLowerCase();
  const doctorFilter = document.getElementById('apptDoctorFilter')?.value || 'all';
  const dateFilter   = document.getElementById('apptDateFilter')?.value || '';
  const statusFilter = document.getElementById('apptStatusFilter')?.value || 'all';
  let appts = getAppointments().filter(a => {
    return a.patient.toLowerCase().includes(search)
      && (doctorFilter === 'all' || a.doctor === doctorFilter)
      && (!dateFilter || a.date === dateFilter)
      && (statusFilter === 'all' || a.status === statusFilter);
  });
  appts.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
  const tbody = document.getElementById('apptTableBody');
  const empty = document.getElementById('apptEmpty');
  if (appts.length === 0) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  tbody.innerHTML = appts.map((a, i) => {
    const statusBadge = { Scheduled: '<span class="badge badge-blue">Scheduled</span>', Completed: '<span class="badge badge-green">Completed</span>', Cancelled: '<span class="badge badge-grey">Cancelled</span>' }[a.status] || a.status;
    const completeBtn = a.status === 'Scheduled' ? `<button class="btn-icon check" title="Mark Completed" onclick="markApptCompleted('${a.id}')"><i class="fas fa-check"></i></button>` : '';
    return `<tr>
      <td>${i+1}</td>
      <td><strong>${escHtml(a.patient)}</strong></td>
      <td>${escHtml(a.phone)}</td>
      <td>${escHtml(a.doctor)}</td>
      <td>${formatDate(a.date)}</td>
      <td>${formatTime(a.time)}</td>
      <td>${statusBadge}</td>
      <td><small style="color:var(--muted)">${escHtml(a.notes || '—')}</small></td>
      <td><div class="action-btns">${completeBtn}
        <button class="btn-icon edit" title="Edit" onclick="editAppt('${a.id}')"><i class="fas fa-pen"></i></button>
        <button class="btn-icon del" title="Delete" onclick="confirmDeleteAppt('${a.id}')"><i class="fas fa-trash-can"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

function switchApptTab(tab, clickedBtn) {
  // Hide all views
  document.querySelectorAll('.appt-view-section').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.tab-switch').forEach(b => b.classList.remove('active'));
  
  // Show selected view
  document.getElementById('apptView-' + tab).classList.remove('hidden');
  clickedBtn.classList.add('active');
  
  // Render the appropriate data
  if (tab === 'scheduled') renderApptsTable();
  if (tab === 'pending') renderPendingBookings();
}

function openApptModal(editId = null) {
  clearApptModal();
  if (editId) {
    const a = getAppointments().find(x => x.id === editId);
    if (!a) return;
    document.getElementById('apptModalTitle').textContent = 'Edit Appointment';
    document.getElementById('apptEditId').value  = a.id;
    document.getElementById('apptPatient').value = a.patient;
    document.getElementById('apptPhone').value   = a.phone;
    document.getElementById('apptDoctor').value  = a.doctor;
    document.getElementById('apptStatus').value  = a.status;
    document.getElementById('apptDate').value    = a.date;
    document.getElementById('apptTime').value    = a.time;
    document.getElementById('apptNotes').value   = a.notes || '';
  } else {
    document.getElementById('apptModalTitle').textContent = 'Add Appointment';
    document.getElementById('apptDate').value = todayISO();
  }
  document.getElementById('apptModal').classList.remove('hidden');
}
function clearApptModal() {
  ['apptEditId','apptPatient','apptPhone','apptNotes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('apptDoctor').value = '';
  document.getElementById('apptStatus').value = 'Scheduled';
  document.getElementById('apptDate').value = '';
  document.getElementById('apptTime').value = '';
  document.getElementById('apptModalError').classList.add('hidden');
}
function closeApptModal() { document.getElementById('apptModal').classList.add('hidden'); }
function editAppt(id) { openApptModal(id); }

function saveAppt() {
  const editId  = document.getElementById('apptEditId').value;
  const patient = document.getElementById('apptPatient').value.trim();
  const phone   = document.getElementById('apptPhone').value.trim();
  const doctor  = document.getElementById('apptDoctor').value;
  const status  = document.getElementById('apptStatus').value;
  const date    = document.getElementById('apptDate').value;
  const time    = document.getElementById('apptTime').value;
  const notes   = document.getElementById('apptNotes').value.trim();
  const errEl   = document.getElementById('apptModalError');
  if (!patient) return showModalError(errEl, 'Patient name is required.');
  if (!phone)   return showModalError(errEl, 'Phone number is required.');
  if (!doctor)  return showModalError(errEl, 'Please select a doctor.');
  if (!date)    return showModalError(errEl, 'Date is required.');
  if (!time)    return showModalError(errEl, 'Time is required.');
  
  const apptData = { patient, phone, doctor, status, date, time, notes };
  
  if (editId) {
    saveAppointmentToDb(apptData, editId).then(result => {
      if (result.success) {
        closeApptModal();
        renderApptsTable();
        renderDashboard();
        showSuccessMessage('Appointment updated!');
      } else {
        showModalError(errEl, 'Error updating appointment: ' + result.error);
      }
    }).catch(err => {
      showModalError(errEl, 'Error saving: ' + err.message);
    });
  } else {
    saveAppointmentToDb({...apptData, id: genId()}).then(result => {
      if (result.success) {
        closeApptModal();
        renderApptsTable();
        renderDashboard();
        showSuccessMessage('Appointment created!');
      } else {
        showModalError(errEl, 'Error creating appointment: ' + result.error);
      }
    }).catch(err => {
      showModalError(errEl, 'Error saving: ' + err.message);
    });
  }
}

function markApptCompleted(id) {
  saveAppointmentToDb({ status: 'Completed' }, id).then(result => {
    if (result.success) {
      renderApptsTable();
      renderDashboard();
      showSuccessMessage('Appointment marked as completed!');
    }
  });
}

function confirmDeleteAppt(id) {
  const a = getAppointments().find(x => x.id === id);
  if (!a) return;
  openConfirm(`Delete appointment for "<strong>${escHtml(a.patient)}</strong>"? This cannot be undone.`, async () => {
    const result = await deleteAppointmentFromDb(id);
    if (result.success) {
      renderApptsTable();
      renderDashboard();
      showSuccessMessage('Appointment deleted!');
    } else {
      alert('Error deleting appointment: ' + result.error);
    }
  });
}

/* ===================================================   BOOKINGS: USER APPOINTMENT REQUESTS
=================================================== */
function renderPendingBookings() {
  const bookings = getBookings().filter(b => b.status === 'pending');
  const doctors = getDoctors();
  const tbody = document.getElementById('pendingBookingsBody');
  if (!tbody) return;
  
  if (bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--muted)"><i class="fas fa-check-circle"></i> No pending bookings</td></tr>';
    return;
  }
  
  tbody.innerHTML = bookings.map((b, i) => {
    const doctor = doctors.find(d => d.id === b.doctorId);
    const doctorName = doctor ? doctor.name : 'Unknown Doctor';
    return `<tr id="booking-row-${b.id}">
      <td>${i+1}</td>
      <td><strong>${escHtml(b.userName)}</strong><br><small style="color:var(--muted)">${escHtml(b.userPhone)}</small></td>
      <td><strong>${escHtml(doctorName)}</strong></td>
      <td>${formatDate(b.appointmentDate)}</td>
      <td>${formatTime(b.appointmentTime)}</td>
      <td><small>${escHtml(b.reason || 'No reason provided')}</small></td>
      <td><span class="badge badge-orange">Pending</span></td>
      <td><div class="action-btns">
        <button class="btn-icon green" title="Approve" onclick="approveBooking('${b.id}')"><i class="fas fa-check"></i></button>
        <button class="btn-icon red" title="Reject" onclick="rejectBooking('${b.id}')"><i class="fas fa-times"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

function approveBooking(bookingId) {
  const bookings_list = getBookings();
  const booking = bookings_list.find(b => b.id === bookingId);
  if (!booking) return;
  
  // Create an appointment from the booking
  const newAppt = {
    id: genId(),
    patient: booking.userName,
    phone: booking.userPhone,
    doctor: getDoctors().find(d => d.id === booking.doctorId)?.name || 'Unknown',
    date: booking.appointmentDate,
    time: booking.appointmentTime,
    status: 'Scheduled',
    notes: booking.reason || ''
  };
  
  // Add to appointments and mark booking as confirmed
  saveAppointmentToDb({...newAppt}).then(() => {
    saveBookingToDb({ status: 'confirmed' }, bookingId).then(() => {
      loadAppointments();
      renderApptsTable();
      renderPendingBookings();
      renderDashboard();
      showSuccessMessage('Booking approved!');
    });
  });
}

function rejectBooking(bookingId) {
  openConfirm('Reject this booking request?', async () => {
    const result = await saveBookingToDb({ status: 'rejected' }, bookingId);
    if (result.success) {
      renderPendingBookings();
      renderDashboard();
      showSuccessMessage('Booking rejected!');
    }
  });
}

/* ===================================================   SECTION 4: BILLING
=================================================== */
let billItems = [];

function initBilling() {
  document.getElementById('billDate').value = todayISO();
  if (billItems.length === 0) addBillItem();
  calcBillTotal();
}

function addBillItem() {
  const id = genId();
  billItems.push({ id, desc: '', qty: 1, price: 0 });
  const container = document.getElementById('lineItemsContainer');
  const row = document.createElement('div');
  row.className = 'line-item-row';
  row.id = 'item-' + id;
  row.innerHTML = `
    <input type="text" placeholder="Item description" oninput="updateItem('${id}','desc',this.value)" />
    <input type="number" placeholder="Qty" min="1" value="1" oninput="updateItem('${id}','qty',this.value)" style="text-align:center" />
    <input type="number" placeholder="Unit price" min="0" step="0.01" oninput="updateItem('${id}','price',this.value)" />
    <span class="line-total-display" id="lt-${id}">₹0.00</span>
    <button class="btn-remove-item" title="Remove" onclick="removeItem('${id}')"><i class="fas fa-xmark"></i></button>`;
  container.appendChild(row);
  calcBillTotal();
}

function updateItem(id, field, val) {
  const item = billItems.find(x => x.id === id);
  if (!item) return;
  item[field] = field === 'desc' ? val : parseFloat(val) || 0;
  const ltEl = document.getElementById('lt-' + id);
  if (ltEl) ltEl.textContent = inr((item.qty || 0) * (item.price || 0));
  calcBillTotal();
}

function removeItem(id) {
  if (billItems.length <= 1) return;
  billItems = billItems.filter(x => x.id !== id);
  const row = document.getElementById('item-' + id);
  if (row) row.remove();
  calcBillTotal();
}

function calcBillTotal() {
  const subtotal = billItems.reduce((sum, x) => sum + (x.qty * x.price), 0);
  document.getElementById('billSubtotal').textContent = inr(subtotal);
  const discType = document.getElementById('discountType')?.value || 'flat';
  const discVal  = parseFloat(document.getElementById('billDiscount')?.value) || 0;
  const taxPct   = parseFloat(document.getElementById('billTax')?.value) || 0;
  const discount = discType === 'percent' ? (subtotal * discVal / 100) : discVal;
  const afterDisc = Math.max(0, subtotal - discount);
  const tax = afterDisc * taxPct / 100;
  document.getElementById('billTotal').textContent = inr(afterDisc + tax);
}

function generateReceipt() {
  const patient = document.getElementById('billPatient').value.trim();
  if (!patient) { alert('Please enter patient name before generating receipt.'); document.getElementById('billPatient').focus(); return; }
  const phone   = document.getElementById('billPhone').value.trim();
  const doctor  = document.getElementById('billDoctor').value;
  const date    = document.getElementById('billDate').value || todayISO();
  const billNo  = getNextBillNum();
  const subtotal = billItems.reduce((sum, x) => sum + (x.qty * x.price), 0);
  const discType = document.getElementById('discountType').value;
  const discVal  = parseFloat(document.getElementById('billDiscount').value) || 0;
  const taxPct   = parseFloat(document.getElementById('billTax').value) || 0;
  const discount = discType === 'percent' ? (subtotal * discVal / 100) : discVal;
  const afterDisc = Math.max(0, subtotal - discount);
  const tax = afterDisc * taxPct / 100;
  const total = afterDisc + tax;
  const itemRows = billItems.filter(x => x.desc).map((x, i) => `
    <tr><td>${i+1}</td><td>${escHtml(x.desc)}</td><td style="text-align:center">${x.qty}</td>
    <td style="text-align:right">${inr(x.price)}</td><td style="text-align:right"><strong>${inr(x.qty * x.price)}</strong></td></tr>`).join('');
  const receiptHTML = `
    <div class="receipt-body">
      <div class="receipt-letterhead">
        <h2>LifeCure Medicos</h2>
        <p>Bazar Road, Bhanga Bazar, Sribhumi (Assam)</p>
        <p>Phone: 8473966611 / 7980560994 &nbsp;|&nbsp; Open: 7 AM – 11 PM</p>
      </div>
      <div class="receipt-meta"><div><strong>Bill No:</strong> #LCM-${billNo}</div><div><strong>Date:</strong> ${formatDate(date)}</div></div>
      <div class="receipt-meta"><div><strong>Patient:</strong> ${escHtml(patient)}</div><div><strong>Phone:</strong> ${escHtml(phone || '—')}</div></div>
      ${doctor ? `<div style="font-size:0.82rem;margin-bottom:10px;color:var(--muted)"><strong>Doctor:</strong> ${escHtml(doctor)}</div>` : ''}
      <table class="receipt-table">
        <thead><tr><th>#</th><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div class="receipt-totals">
        <div>Subtotal: ${inr(subtotal)}</div>
        ${discount > 0 ? `<div>Discount: – ${inr(discount)}</div>` : ''}
        ${tax > 0 ? `<div>Tax (${taxPct}%): ${inr(tax)}</div>` : ''}
        <div class="receipt-grand">Total: ${inr(total)}</div>
      </div>
      <div class="receipt-footer">Thank you for choosing LifeCure Medicos. Get well soon!<br>"Your Health Is Our Priority"</div>
    </div>`;
  document.getElementById('receiptContent').innerHTML = receiptHTML;
  document.getElementById('printReport').innerHTML = `<div class="print-target">${receiptHTML}</div>`;
}

function printReceipt() {
  const content = document.getElementById('receiptContent').innerHTML;
  if (!content || content.includes('receipt-placeholder')) { alert('Please generate a receipt first.'); return; }
  const printWin = window.open('', '_blank', 'width=700,height=900');
  printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt — LifeCure Medicos</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Poppins',sans-serif;padding:32px;color:#1c1c1c}
    .receipt-letterhead{text-align:center;border-bottom:2px solid #1a6b4a;padding-bottom:14px;margin-bottom:14px}
    .receipt-letterhead h2{color:#1a6b4a;font-size:1.3rem}.receipt-letterhead p{font-size:0.78rem;color:#666;margin-top:3px}
    .receipt-meta{display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:10px}
    table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:0.82rem}
    th{background:#e8f5e9;color:#1a6b4a;padding:7px 10px;text-align:left;font-size:0.76rem}td{padding:7px 10px;border-bottom:1px solid #eee}
    .receipt-totals{text-align:right;font-size:0.84rem}.receipt-totals div{margin-bottom:4px;color:#666}
    .receipt-grand{font-size:1rem;font-weight:700;color:#1a6b4a;border-top:2px solid #1a6b4a;padding-top:6px;margin-top:6px}
    .receipt-footer{text-align:center;margin-top:16px;font-size:0.75rem;color:#999;border-top:1px dashed #ddd;padding-top:10px}
    </style></head><body>${content}</body></html>`);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => { printWin.print(); printWin.close(); }, 500);
}

function printTodayReport() {
  const today = todayISO();
  const appts = getAppointments().filter(a => a.date === today);
  const meds  = getMedicines();
  const lowStock = meds.filter(m => parseInt(m.qty) < 10);
  const expSoon  = meds.filter(m => { const d = daysUntilExpiry(m.expiry); return d >= 0 && d <= 30; });
  const dateStr  = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const apptRows = appts.length ? appts.map((a, i) => `<tr><td>${i+1}</td><td>${escHtml(a.patient)}</td><td>${escHtml(a.phone)}</td><td>${escHtml(a.doctor)}</td><td>${formatTime(a.time)}</td><td>${a.status}</td></tr>`).join('') : '<tr><td colspan="6" style="text-align:center;color:#999">No appointments today</td></tr>';
  const lowRows  = lowStock.length ? lowStock.map((m, i) => `<tr><td>${i+1}</td><td>${escHtml(m.name)}</td><td>${m.qty} ${escHtml(m.unit)}</td><td>${formatDate(m.expiry)}</td></tr>`).join('') : '<tr><td colspan="4" style="text-align:center;color:#999">None</td></tr>';
  const printWin = window.open('', '_blank', 'width=800,height=900');
  printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Daily Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Poppins',sans-serif;padding:32px;color:#1c1c1c}
    h1{color:#1a6b4a;font-size:1.3rem;margin-bottom:4px}p.sub{color:#666;font-size:0.82rem;margin-bottom:24px}
    h2{font-size:1rem;margin:20px 0 10px;color:#1a6b4a;border-bottom:1px solid #c8e6c9;padding-bottom:6px}
    table{width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:16px}
    th{background:#e8f5e9;color:#1a6b4a;padding:7px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #eee}
    .footer{margin-top:40px;text-align:center;font-size:0.75rem;color:#999;border-top:1px dashed #ddd;padding-top:12px}
    </style></head><body>
    <h1>LifeCure Medicos — Daily Report</h1><p class="sub">${dateStr}</p>
    <h2>Today's Appointments (${appts.length})</h2>
    <table><thead><tr><th>#</th><th>Patient</th><th>Phone</th><th>Doctor</th><th>Time</th><th>Status</th></tr></thead><tbody>${apptRows}</tbody></table>
    <h2>Low Stock Medicines (${lowStock.length})</h2>
    <table><thead><tr><th>#</th><th>Medicine</th><th>Stock</th><th>Expiry</th></tr></thead><tbody>${lowRows}</tbody></table>
    <p><strong>Expiring within 30 days:</strong> ${expSoon.length} item(s)</p>
    <div class="footer">Printed from LifeCure Medicos Admin Panel &nbsp;|&nbsp; "Your Health Is Our Priority"</div>
    </body></html>`);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => { printWin.print(); printWin.close(); }, 500);
}

/* ===================================================
   CONFIRM MODAL
=================================================== */
let _confirmCallback = null;
function openConfirm(msg, callback) {
  document.getElementById('confirmMsg').innerHTML = msg;
  _confirmCallback = callback;
  document.getElementById('confirmModal').classList.remove('hidden');
  document.getElementById('confirmYesBtn').onclick = () => { if (_confirmCallback) _confirmCallback(); closeConfirm(); };
}
function closeConfirm() {
  document.getElementById('confirmModal').classList.add('hidden');
  _confirmCallback = null;
}

/* ===================================================
   MODAL ERROR HELPER
=================================================== */
function showModalError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}