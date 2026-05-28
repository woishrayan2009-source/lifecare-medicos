/* ===================================================
   LifeCure Medicos — Database Manager
   db-manager.js
   
   Centralized Firestore operations for:
   - Doctors
   - Medicines
   - Doctor Timings
   - Bookings
   - Appointments
   - Notices
   - User Management
=================================================== */

'use strict';

let dbManager = {
  auth: null,
  db: null,

  /* COLLECTIONS */
  DOCTORS: 'doctors',
  MEDICINES: 'medicines',
  TIMINGS: 'timings',
  BOOKINGS: 'bookings',
  APPOINTMENTS: 'appointments',
  NOTICES: 'notices',
  USERS: 'users',

  /* ===================================================
     INITIALIZATION
  =================================================== */
  init(firebaseAuth, firebaseDb) {
    this.auth = firebaseAuth;
    this.db = firebaseDb;
    console.log('✓ Database manager initialized');
  },

  /* ===================================================
     UTILITY HELPERS
  =================================================== */
  genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  todayISO() {
    return new Date().toISOString().slice(0, 10);
  },

  addDays(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  },

  /* ===================================================
     DOCTORS
  =================================================== */
  async getAll(collection) {
    try {
      const snapshot = await this.db.collection(collection).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
      return [];
    }
  },

  async getDoctors() {
    return this.getAll(this.DOCTORS);
  },

  async addDoctor(doctorData) {
    try {
      const docRef = await this.db.collection(this.DOCTORS).add({
        ...doctorData,
        id: this.genId(),
        createdAt: new Date(),
        available: doctorData.available !== false
      });
      return { success: true, id: docRef.id, docId: doctorData.id };
    } catch (error) {
      console.error('Error adding doctor:', error);
      return { success: false, error: error.message };
    }
  },

  async updateDoctor(docId, updates) {
    try {
      const querySnapshot = await this.db.collection(this.DOCTORS)
        .where('id', '==', docId).get();
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Doctor not found' };
      }

      await querySnapshot.docs[0].ref.update({
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating doctor:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteDoctor(docId) {
    try {
      const querySnapshot = await this.db.collection(this.DOCTORS)
        .where('id', '==', docId).get();
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Doctor not found' };
      }

      await querySnapshot.docs[0].ref.delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting doctor:', error);
      return { success: false, error: error.message };
    }
  },

  /* ===================================================
     MEDICINES
  =================================================== */
  async getMedicines() {
    return this.getAll(this.MEDICINES);
  },

  async addMedicine(medicineData) {
    try {
      const docRef = await this.db.collection(this.MEDICINES).add({
        ...medicineData,
        id: this.genId(),
        createdAt: new Date(),
        available: medicineData.available !== false
      });
      return { success: true, id: docRef.id, medId: medicineData.id };
    } catch (error) {
      console.error('Error adding medicine:', error);
      return { success: false, error: error.message };
    }
  },

  async updateMedicine(medId, updates) {
    try {
      const querySnapshot = await this.db.collection(this.MEDICINES)
        .where('id', '==', medId).get();
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Medicine not found' };
      }

      await querySnapshot.docs[0].ref.update({
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating medicine:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteMedicine(medId) {
    try {
      const querySnapshot = await this.db.collection(this.MEDICINES)
        .where('id', '==', medId).get();
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Medicine not found' };
      }

      await querySnapshot.docs[0].ref.delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting medicine:', error);
      return { success: false, error: error.message };
    }
  },

  async searchMedicines(query) {
    try {
      const snapshot = await this.db.collection(this.MEDICINES).get();
      const medicines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const queryLower = query.toLowerCase();
      return medicines.filter(med => 
        med.name?.toLowerCase().includes(queryLower) ||
        med.category?.toLowerCase().includes(queryLower)
      );
    } catch (error) {
      console.error('Error searching medicines:', error);
      return [];
    }
  },

  /* ===================================================
     TIMINGS
  =================================================== */
  async getTimings(doctorId = null) {
    try {
      let query = this.db.collection(this.TIMINGS);
      if (doctorId) {
        query = query.where('doctorId', '==', doctorId);
      }
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching timings:', error);
      return [];
    }
  },

  async addTiming(timingData) {
    try {
      const docRef = await this.db.collection(this.TIMINGS).add({
        ...timingData,
        id: this.genId(),
        createdAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding timing:', error);
      return { success: false, error: error.message };
    }
  },

  async updateTiming(timingId, updates) {
    try {
      const querySnapshot = await this.db.collection(this.TIMINGS)
        .where('id', '==', timingId).get();
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Timing not found' };
      }

      await querySnapshot.docs[0].ref.update({
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating timing:', error);
      return { success: false, error: error.message };
    }
  },

  /* ===================================================
     BOOKINGS
  =================================================== */
  async getBookings(status = null) {
    try {
      let query = this.db.collection(this.BOOKINGS);
      if (status) {
        query = query.where('status', '==', status);
      }
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  async getUserBookings(userId) {
    try {
      const snapshot = await this.db.collection(this.BOOKINGS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  },

  async createBooking(bookingData) {
    try {
      const docRef = await this.db.collection(this.BOOKINGS).add({
        ...bookingData,
        id: this.genId(),
        status: 'pending',
        createdAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: error.message };
    }
  },

  async updateBooking(bookingId, updates) {
    try {
      const querySnapshot = await this.db.collection(this.BOOKINGS)
        .where('id', '==', bookingId).get();
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Booking not found' };
      }

      await querySnapshot.docs[0].ref.update({
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating booking:', error);
      return { success: false, error: error.message };
    }
  },

  async approveBooking(bookingId) {
    try {
      const result = await this.updateBooking(bookingId, { status: 'confirmed' });
      if (result.success) {
        // Create appointment from booking
        const querySnapshot = await this.db.collection(this.BOOKINGS)
          .where('id', '==', bookingId).get();
        
        if (!querySnapshot.empty) {
          const booking = querySnapshot.docs[0].data();
          await this.db.collection(this.APPOINTMENTS).add({
            id: this.genId(),
            userId: booking.userId,
            userName: booking.userName,
            doctorId: booking.doctorId,
            doctorName: booking.doctorName,
            date: booking.date,
            time: booking.time,
            reason: booking.reason,
            status: 'scheduled',
            createdAt: new Date()
          });
        }
      }
      return result;
    } catch (error) {
      console.error('Error approving booking:', error);
      return { success: false, error: error.message };
    }
  },

  async rejectBooking(bookingId) {
    return this.updateBooking(bookingId, { status: 'rejected' });
  },

  /* ===================================================
     NOTICES
  =================================================== */
  async getNotices() {
    try {
      const snapshot = await this.db.collection(this.NOTICES)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching notices:', error);
      return [];
    }
  },

  async createNotice(noticeData) {
    try {
      const docRef = await this.db.collection(this.NOTICES).add({
        ...noticeData,
        id: this.genId(),
        createdAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating notice:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteNotice(noticeId) {
    try {
      const querySnapshot = await this.db.collection(this.NOTICES)
        .where('id', '==', noticeId).get();
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Notice not found' };
      }

      await querySnapshot.docs[0].ref.delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting notice:', error);
      return { success: false, error: error.message };
    }
  },

  /* ===================================================
     USER MANAGEMENT
  =================================================== */
  async getAllUsers() {
    try {
      const snapshot = await this.db.collection(this.USERS).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async changeUserRole(userId, newRole) {
    try {
      await this.db.collection(this.USERS).doc(userId).update({
        role: newRole,
        adminStatus: null,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error changing user role:', error);
      return { success: false, error: error.message };
    }
  },

  async getPendingAdmins() {
    try {
      const snapshot = await this.db.collection(this.USERS)
        .where('adminStatus', '==', 'pending')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      return [];
    }
  },

  async approveAdminRequest(userId) {
    return this.changeUserRole(userId, 'admin');
  },

  async rejectAdminRequest(userId) {
    try {
      await this.db.collection(this.USERS).doc(userId).update({
        adminStatus: null
      });
      return { success: true };
    } catch (error) {
      console.error('Error rejecting admin request:', error);
      return { success: false, error: error.message };
    }
  }
};

// Initialize with Firebase when ready
document.addEventListener('DOMContentLoaded', () => {
  const services = window.firebaseServices || {};
  if (services.auth && services.db) {
    dbManager.init(services.auth, services.db);
  }
});

// Export globally
window.dbManager = dbManager;
console.log('✓ Database manager module loaded');
