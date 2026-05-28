/* ===================================================
   LifeCure Medicos — Database Seeding
   db-seed.js
   
   Initialize Firestore with sample data
   Only runs if collections are empty
=================================================== */

'use strict';

async function seedInitialData() {
  if (!window.dbManager) {
    console.log('DB Manager not ready yet');
    return;
  }

  const db = window.dbManager.db;
  if (!db) return;

  try {
    // Check if doctors collection is empty
    const doctorsSnapshot = await db.collection(window.dbManager.DOCTORS).limit(1).get();
    if (!doctorsSnapshot.empty) {
      console.log('✓ Data already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding initial data...');

    // Add sample doctors
    const doctors = [
      { 
        id: window.dbManager.genId(), 
        name: 'Dr. Saddam Hussain', 
        specialty: 'General', 
        experience: 15, 
        available: true, 
        qualifications: 'MBBS, MD', 
        notes: '' 
      },
      { 
        id: window.dbManager.genId(), 
        name: 'Dr. Sandip Roy', 
        specialty: 'Dermatology', 
        experience: 12, 
        available: true, 
        qualifications: 'MBBS, MD Dermatology', 
        notes: '' 
      },
      { 
        id: window.dbManager.genId(), 
        name: 'Dr. Shirsendu Roy', 
        specialty: 'Cardiology', 
        experience: 18, 
        available: true, 
        qualifications: 'MBBS, MD Cardiology', 
        notes: '' 
      },
      { 
        id: window.dbManager.genId(), 
        name: 'Dr. Intekhab Alam', 
        specialty: 'Pediatrics', 
        experience: 10, 
        available: true, 
        qualifications: 'MBBS, MD Pediatrics', 
        notes: '' 
      },
    ];

    for (const doctor of doctors) {
      await db.collection(window.dbManager.DOCTORS).add({
        ...doctor,
        createdAt: new Date()
      });
    }
    console.log('✓ Added', doctors.length, 'doctors');

    // Add sample medicines
    const medicines = [
      { id: window.dbManager.genId(), name: 'Paracetamol 500mg', category: 'Tablet', qty: 50, unit: 'Strips', expiry: window.dbManager.addDays(180), available: true, notes: '' },
      { id: window.dbManager.genId(), name: 'Amoxicillin 250mg', category: 'Capsule', qty: 30, unit: 'Strips', expiry: window.dbManager.addDays(120), available: true, notes: '' },
      { id: window.dbManager.genId(), name: 'Omeprazole 20mg', category: 'Capsule', qty: 25, unit: 'Strips', expiry: window.dbManager.addDays(240), available: true, notes: '' },
      { id: window.dbManager.genId(), name: 'Cetirizine 10mg', category: 'Tablet', qty: 40, unit: 'Strips', expiry: window.dbManager.addDays(90), available: true, notes: '' },
      { id: window.dbManager.genId(), name: 'Metformin 500mg', category: 'Tablet', qty: 15, unit: 'Strips', expiry: window.dbManager.addDays(300), available: true, notes: '' },
      { id: window.dbManager.genId(), name: 'Azithromycin 250mg', category: 'Tablet', qty: 8, unit: 'Strips', expiry: window.dbManager.addDays(150), available: true, notes: 'Low stock — reorder soon' },
      { id: window.dbManager.genId(), name: 'Betamethasone Cream', category: 'Cream', qty: 20, unit: 'Pieces', expiry: window.dbManager.addDays(60), available: true, notes: '' },
      { id: window.dbManager.genId(), name: 'Vitamin D3 Drops', category: 'Drop', qty: 3, unit: 'Bottles', expiry: window.dbManager.addDays(45), available: true, notes: 'Expiring soon — use first' },
    ];

    for (const medicine of medicines) {
      await db.collection(window.dbManager.MEDICINES).add({
        ...medicine,
        createdAt: new Date()
      });
    }
    console.log('✓ Added', medicines.length, 'medicines');

    // Add sample timings
    const doctorsData = await db.collection(window.dbManager.DOCTORS).get();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let timingCount = 0;

    doctorsData.forEach(doc => {
      const docData = doc.data();
      days.forEach(day => {
        // Morning shift
        db.collection(window.dbManager.TIMINGS).add({
          id: window.dbManager.genId(),
          doctorId: docData.id,
          doctorName: docData.name,
          day: day,
          startTime: '09:00',
          endTime: '13:00',
          slotDuration: 30,
          break: false,
          createdAt: new Date()
        });
        // Afternoon shift
        db.collection(window.dbManager.TIMINGS).add({
          id: window.dbManager.genId(),
          doctorId: docData.id,
          doctorName: docData.name,
          day: day,
          startTime: '14:00',
          endTime: '18:00',
          slotDuration: 30,
          break: false,
          createdAt: new Date()
        });
        timingCount += 2;
      });
    });
    console.log('✓ Added', timingCount, 'doctor timings');

    console.log('✅ Initial data seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

// Wait for Firebase and dbManager to be ready
let seedAttempts = 0;
const seedInterval = setInterval(() => {
  if (window.dbManager && window.dbManager.db) {
    clearInterval(seedInterval);
    seedInitialData();
  } else if (seedAttempts++ > 20) {
    clearInterval(seedInterval);
    console.warn('Seeding timeout - dbManager not ready');
  }
}, 200);

console.log('✓ Database seeding module loaded');
