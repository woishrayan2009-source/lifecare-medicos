/* ===================================================
   LifeCure Medicos — Profile Module
   profile.js
   
   Handles:
   - Loading user profile
   - Editing profile
   - Photo upload
   - Saving changes
=================================================== */

'use strict';

const { db, storage } = window.firebaseServices;

let currentPhotoFile = null;

/* ===================================================
   INITIALIZATION
=================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  setTimeout(() => {
    loadUserProfile();
  }, 500);
});

/* ===================================================
   LOAD USER PROFILE
=================================================== */

async function loadUserProfile() {
  try {
    const userId = getCurrentUserId();
    if (!userId) return;

    const userDoc = await db.collection('users').doc(userId).get();
    const data = userDoc.data();

    if (data) {
      // Update header
      document.getElementById('profileName').textContent = data.name || 'User';
      document.getElementById('profileEmail').textContent = data.email || '';

      // Fill form fields
      document.getElementById('name').value = data.name || '';
      document.getElementById('email').value = data.email || '';
      document.getElementById('phone').value = data.phone || '';
      document.getElementById('dob').value = data.dob || '';
      document.getElementById('gender').value = data.gender || '';
      document.getElementById('bloodGroup').value = data.bloodGroup || '';
      document.getElementById('allergies').value = data.allergies || '';
      document.getElementById('diseases').value = data.diseases || '';
      document.getElementById('address').value = data.address || '';
      document.getElementById('city').value = data.city || '';
      document.getElementById('state').value = data.state || '';
      document.getElementById('pincode').value = data.pincode || '';
      document.getElementById('emergencyContact').value = data.emergencyContact || '';

      // Load photo
      if (data.photoURL) {
        document.getElementById('profilePhotoDisplay').innerHTML = `<img src="${data.photoURL}" alt="Profile" />`;
        document.getElementById('photoPreview').innerHTML = `<img src="${data.photoURL}" alt="Profile" />`;
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    showError('Failed to load profile');
  }
}

/* ===================================================
   TAB SWITCHING
=================================================== */

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remove active class from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  document.getElementById('tab-' + tabName).classList.add('active');

  // Add active class to clicked button
  event.target.closest('.tab-btn').classList.add('active');
}

/* ===================================================
   PHOTO UPLOAD
=================================================== */

document.getElementById('photoInput')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    showError('File must be less than 5MB');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showError('Please select an image file');
    return;
  }

  currentPhotoFile = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = (event) => {
    document.getElementById('photoPreview').innerHTML = `<img src="${event.target.result}" alt="Preview" />`;
  };
  reader.readAsDataURL(file);
});

/* ===================================================
   FORM SUBMISSION
=================================================== */

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const saveBtn = document.querySelector('.btn-save');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span style="display: inline-flex; align-items: center; gap: 8px;"><span style="display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite;"></span> Saving...</span>';
  
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      showError('User not authenticated');
      return;
    }

    let photoURL = null;

    // Upload photo if changed
    if (currentPhotoFile) {
      const timestamp = Date.now();
      const storageRef = storage.ref(`profiles/${userId}/${timestamp}-${currentPhotoFile.name}`);
      await storageRef.put(currentPhotoFile);
      photoURL = await storageRef.getDownloadURL();
    }

    // Prepare update data
    const updateData = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      dob: document.getElementById('dob').value,
      gender: document.getElementById('gender').value,
      bloodGroup: document.getElementById('bloodGroup').value,
      allergies: document.getElementById('allergies').value,
      diseases: document.getElementById('diseases').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      pincode: document.getElementById('pincode').value,
      emergencyContact: document.getElementById('emergencyContact').value,
      updatedAt: new Date()
    };

    if (photoURL) {
      updateData.photoURL = photoURL;
    }

    // Update in Firestore (use set with merge to create if not exists)
    await db.collection('users').doc(userId).set(updateData, {merge: true});

    showSuccess('Profile updated successfully!');

    // Reset photo file
    currentPhotoFile = null;
    document.getElementById('photoInput').value = '';

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);

  } catch (error) {
    console.error('Save error:', error);
    showError('Error saving profile: ' + error.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
  }
});

/* ===================================================
   NAVIGATION
=================================================== */

function goBackToDashboard() {
  if (confirm('Discard unsaved changes?')) {
    window.location.href = 'dashboard.html';
  }
}

/* ===================================================
   MESSAGES
=================================================== */

function showError(message) {
  const el = document.getElementById('errorMessage');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => {
    el.classList.remove('show');
  }, 5000);
}

function showSuccess(message) {
  const el = document.getElementById('successMessage');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => {
    el.classList.remove('show');
  }, 5000);
}

/* ===================================================
   EXPORT FUNCTIONS
=================================================== */

window.switchTab = switchTab;
window.goBackToDashboard = goBackToDashboard;
