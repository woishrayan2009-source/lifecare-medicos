/* ===================================================
   LifeCure Medicos — Admin Dashboard
   admin.js (Firebase Edition)
=================================================== */

'use strict';

/* ===================================================
   FIREBASE SERVICES — declared at top, assigned in DOMContentLoaded
=================================================== */
let auth, db, storage;

/* ===================================================
   STORAGE KEYS
=================================================== */
const KEY_MEDICINES    = 'lifecure_medicines';
const KEY_APPOINTMENTS = 'lifecure_appointments';
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
   LOCAL STORAGE HELPERS
=================================================== */
function getMedicines() {
  return JSON.parse(localStorage.getItem(KEY_MEDICINES) || '[]');
}
function saveMedicines(arr) {
  localStorage.setItem(KEY_MEDICINES, JSON.stringify(arr));
}
function getAppointments() {
  return JSON.parse(localStorage.getItem(KEY_APPOINTMENTS) || '[]');
}
function saveAppointments(arr) {
  localStorage.setItem(KEY_APPOINTMENTS, JSON.stringify(arr));
}
function getNextBillNum() {
  const n = parseInt(localStorage.getItem(KEY_BILL_NUM) || '999') + 1;
  localStorage.setItem(KEY_BILL_NUM, n);
  return n;
}

/* ===================================================
   SEED DATA
=================================================== */
function seedSampleData() {
  if (!localStorage.getItem(KEY_MEDICINES)) {
    saveMedicines([
      { id: genId(), name: 'Paracetamol 500mg',   category: 'Tablet',  qty: 50, unit: 'Strips',  expiry: addMonths(6),  available: true, notes: '' },
      { id: genId(), name: 'Amoxicillin 250mg',   category: 'Capsule', qty: 30, unit: 'Strips',  expiry: addMonths(4),  available: true, notes: '' },
      { id: genId(), name: 'Omeprazole 20mg',     category: 'Capsule', qty: 25, unit: 'Strips',  expiry: addMonths(8),  available: true, notes: '' },
      { id: genId(), name: 'Cetirizine 10mg',     category: 'Tablet',  qty: 40, unit: 'Strips',  expiry: addMonths(3),  available: true, notes: '' },
      { id: genId(), name: 'Metformin 500mg',     category: 'Tablet',  qty: 15, unit: 'Strips',  expiry: addMonths(10), available: true, notes: '' },
      { id: genId(), name: 'Azithromycin 250mg',  category: 'Tablet',  qty: 8,  unit: 'Strips',  expiry: addMonths(5),  available: true, notes: 'Low stock — reorder soon' },
      { id: genId(), name: 'Betamethasone Cream', category: 'Cream',   qty: 20, unit: 'Pieces',  expiry: addMonths(2),  available: true, notes: '' },
      { id: genId(), name: 'Vitamin D3 Drops',    category: 'Drop',    qty: 3,  unit: 'Bottles', expiry: addDays(45),   available: true, notes: 'Expiring soon — use first' },
    ]);
  }
  if (!localStorage.getItem(KEY_APPOINTMENTS)) {
    saveAppointments([
      { id: genId(), patient: 'Rahim Ali',    phone: '9876543210', doctor: 'Dr. Saddam Hussain',  date: todayISO(),  time: '10:00', status: 'Scheduled', notes: 'Gas and acidity problem' },
      { id: genId(), patient: 'Sunita Devi',  phone: '8765432109', doctor: 'Dr. Sandip Roy',      date: addDays(2),  time: '13:30', status: 'Scheduled', notes: 'Skin allergy follow-up' },
      { id: genId(), patient: 'Rajesh Kumar', phone: '7654321098', doctor: 'Dr. Shirsendu Roy',   date: addDays(-1), time: '14:00', status: 'Completed', notes: 'Fever and cough' },
    ]);
  }
}

/* ===================================================
   LOGIN / LOGOUT
=================================================== */
async function adminHandleLogin() {
  const email    = document.getElementById('adminUser').value.trim();
  const password = document.getElementById('adminPass').value.trim();

  if (!email || !password) {
    showLoginError('Please enter your email and password.');
    return;
  }

  // Check Firebase loaded correctly
  if (!auth) {
    showLoginError('Firebase not loaded. Please refresh the page.');
    console.error('auth is null — firebase-config.js may have failed to load.');
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // onAuthStateChanged will handle showing the dashboard
  } catch (error) {
    console.error('Login error:', error.code, error.message);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      showLoginError('Invalid email or password.');
    } else if (error.code === 'auth/invalid-email') {
      showLoginError('Please enter a valid email address.');
    } else if (error.code === 'auth/too-many-requests') {
      showLoginError('Too many attempts. Please try again later.');
    } else {
      showLoginError('Login failed: ' + error.message);
    }
  }
}

async function adminHandleLogout() {
  try {
    await auth.signOut();
    // onAuthStateChanged handles the UI reset
  } catch (error) {
    console.error('Logout error:', error);
  }
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
document.addEventListener('DOMContentLoaded', () => {

  // ✅ CRITICAL: Assign Firebase AFTER DOM+scripts are ready
  const services = window.firebaseServices || {};
  auth    = services.auth    || null;
  db      = services.db      || null;
  storage = services.storage || null;

  // Debug: log Firebase status
  console.log('Firebase auth:', auth ? '✓ loaded' : '✗ NULL — check firebase-config.js');
  console.log('Firebase db:',   db   ? '✓ loaded' : '✗ NULL — check firebase-config.js');

  // Enter key support
  document.getElementById('adminPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') adminHandleLogin();
  });
  document.getElementById('adminUser').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('adminPass').focus();
  });

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

          // ✅ Admin confirmed — show dashboard
          document.getElementById('loginScreen').classList.add('hidden');
          document.getElementById('adminDashboard').classList.remove('hidden');
          document.querySelector('.logged-in-badge').innerHTML =
            '<i class="fas fa-circle"></i> ' + escHtml(user.email);
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
        document.getElementById('adminUser').value = '';
        document.getElementById('adminPass').value = '';
        document.getElementById('loginError').classList.add('hidden');
      }
    });
  } else {
    // Firebase failed to load — show clear error
    console.error('FATAL: auth is null. Firebase SDK or config failed to load.');
    showLoginError('Firebase failed to load. Please refresh or check console.');
  }

  seedSampleData();
});

/* ===================================================
   NAVIGATION
=================================================== */
const SECTION_TITLES = {
  dashboard:    'Dashboard',
  medicines:    'Medicine Stock',
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
  const today = todayISO();

  document.getElementById('statTotal').textContent    = meds.length;
  document.getElementById('statLow').textContent      = meds.filter(m => parseInt(m.qty) < 10).length;
  document.getElementById('statExpiring').textContent = meds.filter(m => { const d = daysUntilExpiry(m.expiry); return d >= 0 && d <= 30; }).length;
  document.getElementById('statAppts').textContent    = appts.filter(a => a.date === today).length;

  const alertsEl = document.getElementById('stockAlerts');
  const alerts = [];
  meds.forEach(m => {
    const days = daysUntilExpiry(m.expiry);
    if (days < 0)       alerts.push({ cls: 'danger', icon: 'fa-calendar-xmark',      msg: `<strong>${m.name}</strong> has expired (${formatDate(m.expiry)})` });
    else if (days <= 7) alerts.push({ cls: 'danger', icon: 'fa-triangle-exclamation', msg: `<strong>${m.name}</strong> expires in ${days} day(s) on ${formatDate(m.expiry)}` });
    else if (days <= 30)alerts.push({ cls: 'warn',   icon: 'fa-clock',               msg: `<strong>${m.name}</strong> expires in ${days} days (${formatDate(m.expiry)})` });
    if (parseInt(m.qty) === 0)      alerts.push({ cls: 'danger', icon: 'fa-box-open',            msg: `<strong>${m.name}</strong> is out of stock` });
    else if (parseInt(m.qty) < 10)  alerts.push({ cls: 'warn',   icon: 'fa-triangle-exclamation', msg: `<strong>${m.name}</strong> is low on stock (${m.qty} ${m.unit} left)` });
  });

  alertsEl.innerHTML = alerts.length === 0
    ? '<p class="no-alerts"><i class="fas fa-check-circle" style="color:var(--green)"></i> No stock alerts. Everything looks good!</p>'
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
  if (editId) {
    meds = meds.map(m => m.id === editId ? { ...m, name, category, qty: parseInt(qty), unit, expiry, available, notes } : m);
  } else {
    meds.push({ id: genId(), name, category, qty: parseInt(qty), unit, expiry, available, notes });
  }
  saveMedicines(meds);
  closeMedicineModal();
  renderMedicinesTable();
  renderDashboard();
}

function confirmDeleteMedicine(id) {
  const m = getMedicines().find(x => x.id === id);
  if (!m) return;
  openConfirm(`Delete "<strong>${escHtml(m.name)}</strong>"? This cannot be undone.`, () => {
    saveMedicines(getMedicines().filter(x => x.id !== id));
    renderMedicinesTable();
    renderDashboard();
  });
}

document.addEventListener('change', e => {
  if (e.target && e.target.id === 'medAvail') {
    document.getElementById('medAvailLabel').textContent = e.target.checked ? 'Available' : 'Not Available';
  }
});

/* ===================================================
   SECTION 3: APPOINTMENTS
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
  let appts = getAppointments();
  if (editId) {
    appts = appts.map(a => a.id === editId ? { ...a, patient, phone, doctor, status, date, time, notes } : a);
  } else {
    appts.push({ id: genId(), patient, phone, doctor, status, date, time, notes });
  }
  saveAppointments(appts);
  closeApptModal();
  renderApptsTable();
  renderDashboard();
}

function markApptCompleted(id) {
  saveAppointments(getAppointments().map(a => a.id === id ? { ...a, status: 'Completed' } : a));
  renderApptsTable();
  renderDashboard();
}

function confirmDeleteAppt(id) {
  const a = getAppointments().find(x => x.id === id);
  if (!a) return;
  openConfirm(`Delete appointment for "<strong>${escHtml(a.patient)}</strong>"? This cannot be undone.`, () => {
    saveAppointments(getAppointments().filter(x => x.id !== id));
    renderApptsTable();
    renderDashboard();
  });
}

/* ===================================================
   SECTION 4: BILLING
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