/**
 * lifecure Medicos — Main JavaScript
 * assets/js/main.js
 *
 * Modules:
 * 1.  NAV — Hamburger, sticky shadow, active link highlighting
 * 2.  STORE STATUS — Open/Closed badge based on current time
 * 3.  DOCTORS — Data array, card rendering, availability sorting,
 *               hero "Consulting Today" list, modal open/close
 */

(function () {
  'use strict';

  /* =============================================
     DOM REFERENCES — NAV
  ============================================= */
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('navLinks');
  const navOverlay  = document.getElementById('navOverlay');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('main section[id]');

  /* Store status elements — hero card */
  const statusBadge = document.getElementById('storeStatusBadge');
  const statusText  = document.getElementById('storeStatusText');

  /* Store status elements — contact section */
  const contactStatusBadge = document.getElementById('contactStatusBadge');
  const contactStatusText  = document.getElementById('contactStatusText');


  /* =============================================
     MODULE 1 — HAMBURGER MENU TOGGLE
  ============================================= */

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    navOverlay.classList.add('visible');
    requestAnimationFrame(() => navOverlay.classList.add('active'));
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navOverlay.classList.remove('active');
    navOverlay.addEventListener(
      'transitionend',
      () => navOverlay.classList.remove('visible'),
      { once: true }
    );
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  navOverlay.addEventListener('click', closeMenu);

  allNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) closeMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('open')) closeMenu();
  });


  /* =============================================
     MODULE 1B — STICKY NAV SHADOW
  ============================================= */

  function handleNavShadow() {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }
  handleNavShadow();
  window.addEventListener('scroll', handleNavShadow, { passive: true });


  /* =============================================
     MODULE 1C — ACTIVE NAV LINK (IntersectionObserver)
  ============================================= */

  const visibleSections = new Set();

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.isIntersecting
          ? visibleSections.add(entry.target.id)
          : visibleSections.delete(entry.target.id);
      });
      updateActiveLink();
    },
    {
      threshold: 0.3,
      rootMargin: `-${navbar ? navbar.offsetHeight : 70}px 0px 0px 0px`,
    }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  function updateActiveLink() {
    let activeId = null;
    sections.forEach((s) => { if (visibleSections.has(s.id)) activeId = s.id; });
    if (!activeId) return;
    allNavLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });
  }

  window.addEventListener('resize', () => {
    sectionObserver.disconnect();
    sections.forEach((s) => sectionObserver.observe(s));
  });

  /* Smooth scroll polyfill for older browsers */
  allNavLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      if ('scrollBehavior' in document.documentElement.style) return;
      e.preventDefault();
      const navH      = navbar ? navbar.offsetHeight : 70;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });


  /* =============================================
     MODULE 2 — STORE OPEN / CLOSED STATUS
     Store hours: 7:00 AM – 11:00 PM every day
  ============================================= */

  function isStoreOpen() {
    const now             = new Date();
    const currentMinutes  = now.getHours() * 60 + now.getMinutes();
    const openMinutes     = 7  * 60;   // 420
    const closeMinutes    = 23 * 60;   // 1380
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  function updateStoreStatus() {
    const open = isStoreOpen();

    /* Update hero card badge */
    if (statusBadge && statusText) {
      statusBadge.classList.toggle('open',   open);
      statusBadge.classList.toggle('closed', !open);
      statusText.textContent = open ? 'Open Now' : 'Closed';
      statusBadge.setAttribute('aria-label', open ? 'Store is currently open' : 'Store is currently closed');
    }

    /* Update contact section badge (same logic, separate element) */
    if (contactStatusBadge && contactStatusText) {
      contactStatusBadge.classList.toggle('open',   open);
      contactStatusBadge.classList.toggle('closed', !open);
      contactStatusText.textContent = open ? 'Open Now' : 'Closed';
      contactStatusBadge.setAttribute('aria-label', open ? 'Store is currently open' : 'Store is currently closed');
    }
  }

  updateStoreStatus();
  setInterval(updateStoreStatus, 60 * 1000);


  /* =============================================
     MODULE 3 — DOCTORS
  ============================================= */

  /* --------------------------------------------------
     3A. DOCTORS DATA ARRAY
     All four doctors — data used for card rendering,
     sorting, hero list, and modal content.
  -------------------------------------------------- */
  const DOCTORS = [
    {
      id:              'sandip',
      name:            'Dr. Sandip Roy',
      qualifications:  'MBBS (Gau), MD (Dib.)',
      specialization:  'Skin Specialist',
      department:      'Dermatology, Venereology & Leprosy',
      registrationNo:  '19516 (AMC)',
      consultationDay: 'tuesday',          // lowercase day name
      consultationTime:'Every Tuesday from 1:00 PM onwards',
      phone:           ['8473966611', '7980560994'],
      avatarColor:     '#1a6b4a',           // green
      avatarInitials:  'SR',
      photoSrc:        'assets/images/doctors/dr-sandip.jpg',
      treatments: [
        'Acne & acne marks',
        'Allergy & itching',
        'Eczema',
        'Psoriasis',
        'Fungal infection',
        'Vitiligo (white patches)',
        'Skin infections',
        'Hair fall & dandruff',
        'Sensitive skin issues',
        'Cosmetic skin care',
        'Venereology treatment',
        'Leprosy treatment',
      ],
      extraInfo: null,
    },
    {
      id:              'shirsendu',
      name:            'Dr. Shirsendu Roy',
      qualifications:  'MBBS, MD',
      specialization:  'General Medicine Specialist',
      department:      'General Medicine',
      registrationNo:  null,
      consultationDay: 'sunday',
      consultationTime:'Every Sunday from 1:00 PM onwards',
      phone:           ['8473966611', '7980560994'],
      avatarColor:     '#1565c0',           // blue
      avatarInitials:  'SR',
      photoSrc:        'assets/images/doctors/dr-shirsendu.jpg',
      treatments:      [],                  // General medicine — no fixed list
      extraInfo:       'General consultations covering fever, infections, Cough, Cold & Flu, Diabetes, Blood pressure, Thyroid disorders, Gastric & acidity problems, Allergy & skin issues, Asthma & respiratory problems, General weakness & fatigue, General medicine related issues.',
    },
    {
      id:              'intekhab',
      name:            'Dr. Intekhab Alam',
      qualifications:  'MBBS, MS (AMU), M.Ch (AIIMS, New Delhi)',
      specialization:  'Heart Specialist',
      department:      'Cardiothoracic & Vascular Surgery (CTVS)',
      registrationNo:  null,
      consultationDay: 'scheduled',         // Scheduled dates only
      consultationTime:'Scheduled Dates Only — 5:00 PM to 7:00 PM',
      phone:           ['8473966611', '7980560994'],
      avatarColor:     '#c62828',           // red
      avatarInitials:  'IA',
      photoSrc:        'assets/images/doctors/dr-intekhab.jpg',
      treatments:      [],
      extraInfo:       'Senior Consultant – CTVS. Please call 8473966611 or 7980560994 to confirm the next available date before visiting.',
    },
    {
      id:              'saddam',
      name:            'Dr. Saddam Hussain',
      qualifications:  'BAMS (Shillong), PGCKS (Jaipur)',
      specialization:  'Ayurvedic Specialist',
      department:      'Ayurvedic Medicine (BAMS)',
      registrationNo:  '1423 (Assam State Council of Indian Medicine)',
      consultationDay: 'daily',             // Available every day
      consultationTime:'Available Daily — all days (24x7)',
      phone:           ['8473966611', '7980560994'],
      avatarColor:     '#e65100',           // orange
      avatarInitials:  'SH',
      photoSrc:        'assets/images/doctors/dr-saddam.jpg',
      treatments: [
        'Permanent treatment for long-term gas problems',
        'Piles and fistula treatment without operation',
        'Kidney stone treatment',
      ],
      extraInfo:       'Medical Officer. Walk-in available any day — no prior appointment needed.',
    },
  ];

  /* --------------------------------------------------
     3B. AVAILABILITY HELPERS
     Returns badge text + CSS class for a doctor based
     on today's day of the week (JS Date, 0=Sun … 6=Sat).
  -------------------------------------------------- */

  /**
   * Map day names to JS Date.getDay() values
   */
  const DAY_INDEX = {
    sunday:    0,
    monday:    1,
    tuesday:   2,
    wednesday: 3,
    thursday:  4,
    friday:    5,
    saturday:  6,
  };

  /**
   * Full day names for display (index = JS day value)
   */
  const DAY_NAMES = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ];

  /**
   * Returns an object { label, cssClass, daysUntil } for a doctor.
   * daysUntil: 0 = today, 7 = scheduled/unknown, 8 = daily (pinned separately)
   */
  function getDoctorAvailability(doctor) {
    const today = new Date().getDay(); // 0–6

    if (doctor.consultationDay === 'daily') {
      return { label: 'Available Daily', cssClass: 'doctor-avail-badge--daily', daysUntil: 8 };
    }

    if (doctor.consultationDay === 'scheduled') {
      return { label: 'Scheduled Dates', cssClass: 'doctor-avail-badge--scheduled', daysUntil: 7 };
    }

    const targetDay = DAY_INDEX[doctor.consultationDay];
    const diff      = (targetDay - today + 7) % 7; // 0 = today, 1–6 = days until

    if (diff === 0) {
      return { label: 'Available Today', cssClass: 'doctor-avail-badge--today', daysUntil: 0 };
    }

    const nextDayName = DAY_NAMES[targetDay];
    return { label: `Next: ${nextDayName}`, cssClass: 'doctor-avail-badge--next', daysUntil: diff };
  }

  /**
   * Sort doctors array for display order:
   * 1. Available today (daysUntil === 0)
   * 2. Upcoming by soonest day (daysUntil 1–6)
   * 3. Daily doctor — always visible, placed near front but after "today" doctors
   * 4. Scheduled-only doctors last (daysUntil === 7)
   *
   * Special rule: Daily doctor (Saddam) is pinned to position 2
   * (after any today doctors, before upcoming-week doctors) so he
   * is always in a prominent position as a walk-in option.
   */
  function sortDoctors(doctors) {
    const withAvail = doctors.map((d) => ({
      ...d,
      _avail: getDoctorAvailability(d),
    }));

    withAvail.sort((a, b) => {
      const dA = a._avail.daysUntil;
      const dB = b._avail.daysUntil;

      // Today doctors always first
      if (dA === 0 && dB !== 0) return -1;
      if (dB === 0 && dA !== 0) return  1;

      // Scheduled-only always last
      if (dA === 7 && dB !== 7) return  1;
      if (dB === 7 && dA !== 7) return -1;

      // Daily doctor (daysUntil=8) sits right after "today" doctors
      // (before upcoming-week ones) — treat as daysUntil 0.5 effectively
      if (dA === 8 && dB !== 0) return -1;
      if (dB === 8 && dA !== 0) return  1;

      // Among upcoming: sort by soonest
      return dA - dB;
    });

    return withAvail;
  }


  /* --------------------------------------------------
     3C. CARD RENDERER
     Builds and injects all doctor cards into #doctorsGrid.
  -------------------------------------------------- */

  function renderDoctorCards() {
    const grid = document.getElementById('doctorsGrid');
    if (!grid) return;

    const sorted = sortDoctors(DOCTORS);

    grid.innerHTML = sorted
      .map((doctor) => buildCardHTML(doctor, doctor._avail))
      .join('');

    // Attach click events after HTML is injected
    grid.querySelectorAll('.btn-explore').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.doctorId));
    });
  }

  /**
   * Returns the HTML string for a single doctor card.
   */
  function buildCardHTML(doctor, avail) {
    const scheduleText = escapeHTML(doctor.consultationTime);
    const qualsText    = escapeHTML(doctor.qualifications);
    const nameText     = escapeHTML(doctor.name);
    const specText     = escapeHTML(doctor.specialization);

    return `
      <article
        class="doctor-card"
        role="listitem"
        style="--card-accent-color: ${doctor.avatarColor};"
        aria-label="${nameText}"
      >
        <!-- Top row: avatar + availability badge -->
        <div class="doctor-card__top">

          <!-- Avatar: shows photo if available, falls back to initials -->
          <div class="doctor-avatar-wrap" aria-hidden="true">
            <div
              class="doctor-avatar-initials"
              id="initials-${doctor.id}"
              style="background-color: ${doctor.avatarColor};"
            >${doctor.avatarInitials}</div>
            <img
              class="doctor-avatar-img"
              src="${doctor.photoSrc}"
              alt="Photo of ${nameText}"
              loading="lazy"
              onload="this.style.opacity='1'; document.getElementById('initials-${doctor.id}').style.display='none';"
              onerror="this.style.display='none';"
              style="opacity:0; transition: opacity 0.3s ease;"
            />
          </div>

          <!-- Availability badge — set dynamically by JS -->
          <span class="doctor-avail-badge ${avail.cssClass}" aria-label="${avail.label}">
            ${avail.cssClass === 'doctor-avail-badge--today'
              ? '<span style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;animation:pulse 2s ease infinite;"></span>'
              : '<i class="fa-regular fa-calendar" aria-hidden="true"></i>'
            }
            ${escapeHTML(avail.label)}
          </span>

        </div>

        <!-- Card body: name, quals, spec, schedule -->
        <div class="doctor-card__body">
          <h3 class="doctor-card__name">${nameText}</h3>
          <p class="doctor-card__qualifications">${qualsText}</p>

          <span class="doctor-card__spec">
            <i class="fa-solid fa-stethoscope" aria-hidden="true"></i>
            ${specText}
          </span>

          <div class="doctor-card__schedule" aria-label="Consultation schedule">
            <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
            <span>${scheduleText}</span>
          </div>
        </div>

        <!-- Card action buttons -->
        <div class="doctor-card__actions">
          <button
            class="btn-explore"
            data-doctor-id="${doctor.id}"
            aria-label="View full details for ${nameText}"
          >
            Explore
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
          <a
            href="https://wa.me/918473966611"
            class="btn-book-wa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Book appointment with ${nameText} on WhatsApp"
          >
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
            Book via WhatsApp
          </a>
        </div>

      </article>
    `;
  }


  /* --------------------------------------------------
     3D. HERO CARD — "Consulting Doctors Today"
     Populates the hero card's doctor list with doctors
     who are available today (or daily).
  -------------------------------------------------- */

  function renderHeroTodayDoctors() {
    const container = document.getElementById('heroTodayDoctors');
    if (!container) return;

    // Doctors consulting today: consultationDay matches today OR 'daily'
    const todayDoctors = DOCTORS.filter((d) => {
      if (d.consultationDay === 'daily') return true;
      if (d.consultationDay === 'scheduled') return false;
      return getDoctorAvailability(d).daysUntil === 0;
    });

    if (todayDoctors.length === 0) {
      container.innerHTML = `
        <p class="hero-no-doctors">No specialist visiting today — walk in for general medicine</p>
      `;
      return;
    }

    container.innerHTML = todayDoctors
      .map(
        (d) => `
          <div class="hero-doctor-entry">
            <div
              class="hero-doctor-entry__dot"
              style="background-color: ${d.avatarColor};"
              aria-hidden="true"
            >${d.avatarInitials}</div>
            <div class="hero-doctor-entry__info">
              <span class="hero-doctor-entry__name">${escapeHTML(d.name)}</span>
              <span class="hero-doctor-entry__spec">${escapeHTML(d.specialization)}</span>
            </div>
            <span class="hero-doctor-entry__time">
              ${d.consultationDay === 'daily' ? 'Daily' : 'Today'}
            </span>
          </div>
        `
      )
      .join('');
  }


  /* --------------------------------------------------
     3E. MODAL — Open, populate, close
  -------------------------------------------------- */

  const modalOverlay = document.getElementById('doctorModalOverlay');
  const modalContent = document.getElementById('doctorModalContent');
  const modalClose   = document.getElementById('doctorModalClose');

  /**
   * Opens the modal and fills it with data for the given doctor ID.
   */
  function openModal(doctorId) {
    const doctor = DOCTORS.find((d) => d.id === doctorId);
    if (!doctor || !modalOverlay || !modalContent) return;

    modalContent.innerHTML = buildModalHTML(doctor);

    // Trap focus inside modal while open
    modalOverlay.setAttribute('aria-hidden', 'false');
    modalOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus the close button for keyboard accessibility
    requestAnimationFrame(() => {
      if (modalClose) modalClose.focus();
    });
  }

  /**
   * Closes the modal.
   */
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* Close on button click */
  if (modalClose) modalClose.addEventListener('click', closeModal);

  /* Close on overlay click (clicking outside the panel) */
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  /* Close on Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-open')) {
      closeModal();
    }
  });

  /**
   * Builds the full HTML content string for the modal.
   */
  function buildModalHTML(doctor) {
    const avail        = getDoctorAvailability(doctor);
    const hasPhoto     = true; // always attempt; onerror hides it
    const treatmentTags = doctor.treatments.length
      ? doctor.treatments
          .map((t) => `<span class="treatment-tag">${escapeHTML(t)}</span>`)
          .join('')
      : '';

    const regRow = doctor.registrationNo
      ? `
        <div class="modal-meta__row">
          <div class="modal-meta__icon" aria-hidden="true">
            <i class="fa-solid fa-id-card"></i>
          </div>
          <div>
            <div class="modal-meta__label">Registration No.</div>
            <div class="modal-meta__value">${escapeHTML(doctor.registrationNo)}</div>
          </div>
        </div>
      `
      : '';

    const phonesHTML = doctor.phone
      .map(
        (p) =>
          `<a href="tel:+91${p}" class="modal-phone-link">
            <i class="fa-solid fa-phone" aria-hidden="true"></i>
            ${escapeHTML(p)}
          </a>`
      )
      .join('');

    const extraNoteHTML = doctor.extraInfo
      ? `<div class="modal-extra-note">
           <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
           ${escapeHTML(doctor.extraInfo)}
         </div>`
      : '';

    const treatmentsSection = treatmentTags
      ? `
        <div class="modal-treatments">
          <div class="modal-treatments__title">
            <i class="fa-solid fa-list-check" aria-hidden="true"></i>
            Conditions Treated
          </div>
          <div class="modal-treatments__tags">${treatmentTags}</div>
        </div>
      `
      : '';

    return `
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-avatar-wrap" aria-hidden="true">
          <div
            class="modal-avatar-initials"
            id="modal-initials-${doctor.id}"
            style="background-color: ${doctor.avatarColor};"
          >${doctor.avatarInitials}</div>
          <img
            class="modal-avatar-img"
            src="${doctor.photoSrc}"
            alt="Photo of ${escapeHTML(doctor.name)}"
            onload="this.style.opacity='1'; document.getElementById('modal-initials-${doctor.id}').style.display='none';"
            onerror="this.style.display='none';"
            style="opacity:0; transition: opacity 0.3s ease;"
          />
        </div>
        <div class="modal-header__info">
          <h2 class="modal-header__name" id="modalDoctorName">${escapeHTML(doctor.name)}</h2>
          <p class="modal-header__quals">${escapeHTML(doctor.qualifications)}</p>
          <span class="modal-header__spec">
            <i class="fa-solid fa-stethoscope" aria-hidden="true"></i>
            ${escapeHTML(doctor.specialization)}
          </span>
        </div>
      </div>

      <!-- Meta Rows -->
      <div class="modal-meta">

        <!-- Department -->
        <div class="modal-meta__row">
          <div class="modal-meta__icon" aria-hidden="true">
            <i class="fa-solid fa-building-columns"></i>
          </div>
          <div>
            <div class="modal-meta__label">Department</div>
            <div class="modal-meta__value">${escapeHTML(doctor.department)}</div>
          </div>
        </div>

        <!-- Registration (if available) -->
        ${regRow}

        <!-- Consultation Schedule -->
        <div class="modal-meta__row">
          <div class="modal-meta__icon" aria-hidden="true">
            <i class="fa-solid fa-calendar-days"></i>
          </div>
          <div>
            <div class="modal-meta__label">Consultation Schedule</div>
            <div class="modal-meta__value">${escapeHTML(doctor.consultationTime)}</div>
          </div>
        </div>

        <!-- Availability today -->
        <div class="modal-meta__row">
          <div class="modal-meta__icon" aria-hidden="true">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div class="modal-meta__label">Availability Status</div>
            <div class="modal-meta__value">
              <span class="doctor-avail-badge ${avail.cssClass}" style="font-size:0.75rem;">
                ${escapeHTML(avail.label)}
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- Conditions Treated -->
      ${treatmentsSection}

      <!-- Extra info note -->
      ${extraNoteHTML}

      <!-- Contact + Book CTA -->
      <div class="modal-contact">
        ${phonesHTML}
        <a
          href="https://wa.me/918473966611"
          class="modal-wa-btn"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book appointment on WhatsApp"
        >
          <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
          Book Appointment on WhatsApp
        </a>
      </div>
    `;
  }


  /* --------------------------------------------------
     3F. UTILITY — HTML escaping
     Prevents XSS if any data contains special characters.
  -------------------------------------------------- */

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  /* --------------------------------------------------
     3G. INIT — Run doctors module on page load
  -------------------------------------------------- */

  renderDoctorCards();
  renderHeroTodayDoctors();


  /* =============================================
     MODULE 4 — DIAGNOSTICS
     Data array, card rendering, accordion toggle,
     and real-time search filtering.
  ============================================= */

  /* --------------------------------------------------
     4A. DIAGNOSTICS DATA ARRAY
     Each entry: id, icon (FA class), name, description, preparation.
  -------------------------------------------------- */
  const DIAGNOSTICS = [
    {
      id:          'blood-sugar-fasting',
      icon:        'fa-solid fa-droplet',
      iconColor:   '#e53935',
      name:        'Blood Sugar (Fasting)',
      description: 'Measures glucose level after overnight fast.',
      preparation: 'Fast for 8–10 hours before the test. Plain water is allowed. Morning testing is preferred for best accuracy.',
    },
    {
      id:          'blood-sugar-pp',
      icon:        'fa-solid fa-droplet-slash',
      iconColor:   '#e53935',
      name:        'Blood Sugar (PP / Random)',
      description: 'Post-meal or spot glucose measurement.',
      preparation: 'For PP test: eat a normal meal 2 hours before the test. No fasting needed for a Random blood sugar test.',
    },
    {
      id:          'cbc',
      icon:        'fa-solid fa-vials',
      iconColor:   '#1a6b4a',
      name:        'Complete Blood Count (CBC)',
      description: 'Full analysis of blood cells and components.',
      preparation: 'No special fasting required. Inform your doctor about any medications you are currently taking.',
    },
    {
      id:          'lipid-profile',
      icon:        'fa-solid fa-heart-pulse',
      iconColor:   '#c62828',
      name:        'Lipid Profile',
      description: 'Checks cholesterol, triglycerides, HDL, and LDL.',
      preparation: 'Fast for 10–12 hours before the test. Only plain water is allowed. Avoid fatty or heavy meals the previous night.',
    },
    {
      id:          'thyroid-profile',
      icon:        'fa-solid fa-bacteria',
      iconColor:   '#6a1b9a',
      name:        'Thyroid Profile (T3, T4, TSH)',
      description: 'Evaluates thyroid gland function and hormone levels.',
      preparation: 'Can be done fasting or non-fasting. Morning is preferred. Do not take thyroid medication before the test — take it after.',
    },
    {
      id:          'urine-routine',
      icon:        'fa-solid fa-flask',
      iconColor:   '#f9a825',
      name:        'Urine Routine & Microscopy',
      description: 'Detects infections, kidney issues, and metabolic conditions.',
      preparation: 'Collect a midstream morning urine sample in a clean container. Clean the area thoroughly before collection.',
    },
    {
      id:          'lft',
      icon:        'fa-solid fa-shield-virus',
      iconColor:   '#2e7d32',
      name:        'Liver Function Test (LFT)',
      description: 'Assesses liver health, enzymes, and protein levels.',
      preparation: 'Fast for 8–12 hours before the test. Avoid alcohol for at least 24 hours prior to the test.',
    },
    {
      id:          'kft',
      icon:        'fa-solid fa-circle-nodes',
      iconColor:   '#1565c0',
      name:        'Kidney Function Test (KFT)',
      description: 'Evaluates kidney performance — urea, creatinine, and more.',
      preparation: 'Fast for 8 hours before the test. Stay well hydrated — drink adequate water before arriving for the test.',
    },
    {
      id:          'hba1c',
      icon:        'fa-solid fa-chart-line',
      iconColor:   '#e65100',
      name:        'HbA1c (Glycated Hemoglobin)',
      description: 'Tracks average blood sugar over the past 2–3 months.',
      preparation: 'No fasting required. This test can be done at any time of day, regardless of meals.',
    },
    {
      id:          'ecg',
      icon:        'fa-solid fa-wave-square',
      iconColor:   '#c62828',
      name:        'ECG (Electrocardiogram)',
      description: 'Records heart rhythm and electrical activity.',
      preparation: 'No special preparation needed. Avoid applying lotion, oil, or cream on the chest area before the test.',
    },
    {
      id:          'pregnancy-test',
      icon:        'fa-solid fa-baby',
      iconColor:   '#ad1457',
      name:        'Pregnancy Test (Urine)',
      description: 'Detects hCG hormone to confirm pregnancy.',
      preparation: 'First morning urine is preferred for highest accuracy. No fasting or special preparation required.',
    },
    {
      id:          'rapid-test',
      icon:        'fa-solid fa-bug-slash',
      iconColor:   '#00695c',
      name:        'Malaria / Dengue / Typhoid Rapid Test',
      description: 'Quick screening for common infectious fevers.',
      preparation: 'No fasting required. Inform the staff about your current symptoms, their duration, and any medications you are taking.',
    },
  ];


  /* --------------------------------------------------
     4B. BUILD A SINGLE DIAGNOSTIC CARD HTML STRING
  -------------------------------------------------- */
  function buildDiagCardHTML(test) {
    return `
      <div
        class="diag-card"
        role="listitem"
        data-id="${test.id}"
        data-name="${test.name.toLowerCase()}"
      >
        <!-- Coloured left-border accent bar -->
        <div
          class="diag-card__accent"
          style="background-color: ${test.iconColor};"
          aria-hidden="true"
        ></div>

        <!-- Card body -->
        <div class="diag-card__body">

          <!-- Icon + Name row -->
          <div class="diag-card__top">
            <div
              class="diag-card__icon-wrap"
              style="
                background-color: ${test.iconColor}18;
                color: ${test.iconColor};
              "
              aria-hidden="true"
            >
              <i class="${test.icon}"></i>
            </div>
            <div class="diag-card__title-group">
              <h3 class="diag-card__name">${escapeHTML(test.name)}</h3>
              <p class="diag-card__desc">${escapeHTML(test.description)}</p>
            </div>
          </div>

          <!-- Accordion toggle button -->
          <button
            class="diag-card__toggle"
            aria-expanded="false"
            aria-controls="prep-${test.id}"
            type="button"
          >
            <i class="fa-solid fa-notes-medical" aria-hidden="true"></i>
            <span class="diag-card__toggle-label">Preparation Guide</span>
            <i class="fa-solid fa-chevron-down diag-card__chevron" aria-hidden="true"></i>
          </button>

          <!-- Accordion panel — hidden by default -->
          <div
            class="diag-card__prep-panel"
            id="prep-${test.id}"
            role="region"
            aria-label="Preparation for ${escapeHTML(test.name)}"
          >
            <div class="diag-card__prep-inner">
              <i class="fa-solid fa-circle-check diag-card__prep-tick" aria-hidden="true"></i>
              <p class="diag-card__prep-text">${escapeHTML(test.preparation)}</p>
            </div>
          </div>

        </div><!-- /diag-card__body -->
      </div>
    `;
  }


  /* --------------------------------------------------
     4C. RENDER ALL DIAGNOSTIC CARDS INTO THE GRID
  -------------------------------------------------- */
  function renderDiagnosticCards() {
    const grid = document.getElementById('diagGrid');
    if (!grid) return;

    grid.innerHTML = DIAGNOSTICS.map(buildDiagCardHTML).join('');

    // After injection, attach accordion toggle listeners
    attachDiagAccordions();
  }


  /* --------------------------------------------------
     4D. ACCORDION — TOGGLE PREPARATION PANEL
     Uses max-height trick for smooth CSS transition.
  -------------------------------------------------- */
  function attachDiagAccordions() {
    const toggles = document.querySelectorAll('.diag-card__toggle');
    toggles.forEach((btn) => {
      btn.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        const panelId  = this.getAttribute('aria-controls');
        const panel    = document.getElementById(panelId);
        if (!panel) return;

        if (expanded) {
          // Collapse
          panel.style.maxHeight = panel.scrollHeight + 'px'; // set explicit for transition
          requestAnimationFrame(() => {
            panel.style.maxHeight = '0';
          });
          this.setAttribute('aria-expanded', 'false');
          this.closest('.diag-card').classList.remove('is-open');
        } else {
          // Expand
          panel.style.maxHeight = panel.scrollHeight + 'px';
          this.setAttribute('aria-expanded', 'true');
          this.closest('.diag-card').classList.add('is-open');

          // After transition ends, set to 'auto' so it doesn't clip if content changes
          panel.addEventListener(
            'transitionend',
            () => { if (panel.style.maxHeight !== '0px') panel.style.maxHeight = 'none'; },
            { once: true }
          );
        }
      });
    });
  }


  /* --------------------------------------------------
     4E. REAL-TIME SEARCH / FILTER
  -------------------------------------------------- */
  function initDiagSearch() {
    const input    = document.getElementById('diagSearch');
    const clearBtn = document.getElementById('diagSearchClear');
    const noResult = document.getElementById('diagNoResults');
    const termEl   = document.getElementById('diagNoResultsTerm');
    if (!input) return;

    input.addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();

      // Show / hide clear button
      if (clearBtn) clearBtn.hidden = query.length === 0;

      filterDiagCards(query, noResult, termEl);
    });

    // Clear button resets the filter
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.hidden = true;
        filterDiagCards('', noResult, termEl);
        input.focus();
      });
    }
  }

  /**
   * Shows/hides cards based on query. Updates "no results" visibility.
   */
  function filterDiagCards(query, noResultEl, termEl) {
    const cards   = document.querySelectorAll('#diagGrid .diag-card');
    let   visible = 0;

    cards.forEach((card) => {
      const name    = card.dataset.name || '';
      const matches = !query || name.includes(query);
      card.hidden   = !matches;
      if (matches) visible++;
    });

    if (noResultEl) {
      noResultEl.hidden = visible > 0;
      if (termEl && visible === 0) termEl.textContent = query;
    }
  }


  /* --------------------------------------------------
     4F. INIT — Run diagnostics module
  -------------------------------------------------- */
  renderDiagnosticCards();
  initDiagSearch();


  /* =============================================
     MODULE 5 — REVIEWS CAROUSEL
     6 patient reviews, 3 visible on desktop (≥768px),
     1 visible on mobile. Auto-scrolls every 5s.
     Pauses on hover. Supports swipe on touch devices.
  ============================================= */

  /* --------------------------------------------------
     5A. REVIEWS DATA
     ⚠️ REPLACE BEFORE PUBLISHING: swap these sample
     reviews with real patient testimonials from client.
  -------------------------------------------------- */
  const REVIEWS = [
    {
      text:     "lifecure Medicos has been our family's trusted pharmacy for years. The staff is very helpful and the medicines are always genuine.",
      name:     'Rajesh Das',
      location: 'Bhanga',
    },
    {
      text:     "Dr. Sandip Roy treated my skin condition perfectly. The consultation was thorough and the advice was very practical.",
      name:     'Priya Sharma',
      location: 'Sribhumi',
    },
    {
      text:     "Very good diagnostic services. The preparation instructions they gave for my blood test were very clear and helpful.",
      name:     'Mohammed Ali',
      location: 'Bhanga Bazar',
    },
    {
      text:     "Open till 11 PM is a huge convenience. I got my medicines even on a late evening when other shops were closed.",
      name:     'Anita Roy',
      location: 'Bhanga',
    },
    {
      text:     "Dr. Saddam Hussain's treatment for my chronic acidity problem was very effective. Highly recommended.",
      name:     'Suresh Biswas',
      location: 'Sribhumi',
    },
    {
      text:     "The WhatsApp appointment booking system is very convenient. Got my appointment confirmation instantly.",
      name:     'Fatema Begum',
      location: 'Bhanga',
    },
  ];


  /* --------------------------------------------------
     5B. REVIEWS CAROUSEL INIT FUNCTION
     Called once on page load. Sets up cards, events,
     autoplay, touch swipe, and resize handling.
  -------------------------------------------------- */
  function initReviewsCarousel() {

    /* DOM elements */
    const carouselEl = document.getElementById('reviewsCarousel');
    const trackWrap  = document.getElementById('reviewsTrackWrap');
    const track      = document.getElementById('reviewsTrack');
    const dotsEl     = document.getElementById('reviewsDots');
    const prevBtn    = document.getElementById('reviewsPrev');
    const nextBtn    = document.getElementById('reviewsNext');

    /* Bail if section not in DOM */
    if (!track || !trackWrap) return;

    const GAP   = 24;             // px gap between cards — must match CSS
    const TOTAL = REVIEWS.length; // 6

    let currentIndex = 0;
    let autoTimer    = null;

    /* ---- Build and inject all review cards ---- */
    track.innerHTML = REVIEWS.map((r) => `
      <article class="review-card" role="listitem" aria-label="Review by ${escapeHTML(r.name)}">

        <!-- Green top accent bar -->
        <div class="review-card__accent" aria-hidden="true"></div>

        <!-- 5-star rating -->
        <div class="review-card__stars" aria-label="5 out of 5 stars" role="img">
          <i class="fa-solid fa-star" aria-hidden="true"></i>
          <i class="fa-solid fa-star" aria-hidden="true"></i>
          <i class="fa-solid fa-star" aria-hidden="true"></i>
          <i class="fa-solid fa-star" aria-hidden="true"></i>
          <i class="fa-solid fa-star" aria-hidden="true"></i>
        </div>

        <!-- Review text -->
        <blockquote class="review-card__text">
          <i class="fa-solid fa-quote-left review-card__quote-icon" aria-hidden="true"></i>
          ${escapeHTML(r.text)}
        </blockquote>

        <!-- Reviewer name + location -->
        <div class="review-card__author">
          <div class="review-card__author-avatar" aria-hidden="true">
            ${escapeHTML(r.name.charAt(0))}
          </div>
          <div class="review-card__author-info">
            <span class="review-card__name">${escapeHTML(r.name)}</span>
            <span class="review-card__location">
              <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
              ${escapeHTML(r.location)}
            </span>
          </div>
        </div>

      </article>
    `).join('');


    /* ---- Responsive helpers ---- */

    /** Returns number of cards visible at current viewport width */
    function cardsPerView() {
      return window.innerWidth >= 768 ? 3 : 1;
    }

    /** Max slide index: last position where we can advance */
    function maxIndex() {
      return Math.max(0, TOTAL - cardsPerView());
    }

    /** Computes single card width from the wrapper's current pixel width */
    function cardWidth() {
      const cpv = cardsPerView();
      return (trackWrap.offsetWidth - GAP * (cpv - 1)) / cpv;
    }


    /* ---- Size all cards to the computed width ---- */
    function sizeCards() {
      const w = cardWidth();
      track.querySelectorAll('.review-card').forEach((card) => {
        card.style.width    = w + 'px';
        card.style.minWidth = w + 'px';
      });
    }


    /* ---- Slide track to currentIndex position ---- */
    function applyTransform(animate) {
      const w      = cardWidth();
      const offset = currentIndex * (w + GAP);

      if (!animate) {
        /* Instant snap — used on resize so there's no visible slide */
        track.style.transition = 'none';
        track.style.transform  = `translateX(-${offset}px)`;
        /* Re-enable transition after this paint frame */
        requestAnimationFrame(() => {
          track.style.transition = '';
        });
      } else {
        track.style.transform = `translateX(-${offset}px)`;
      }
    }


    /* ---- Rebuild dot indicators ---- */
    function buildDots() {
      if (!dotsEl) return;
      const max = maxIndex();
      dotsEl.innerHTML = '';

      for (let i = 0; i <= max; i++) {
        const btn = document.createElement('button');
        btn.className  = 'reviews-dot' + (i === currentIndex ? ' active' : '');
        btn.type       = 'button';
        btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
        btn.setAttribute('aria-pressed', String(i === currentIndex));
        btn.addEventListener('click', () => { goTo(i); startAuto(); });
        dotsEl.appendChild(btn);
      }
    }


    /* ---- Navigate to a specific index ---- */
    function goTo(idx) {
      currentIndex = Math.max(0, Math.min(idx, maxIndex()));
      applyTransform(true);
      buildDots();
    }

    /** Advance one step forward (wraps to 0 at the end) */
    function next() { goTo(currentIndex >= maxIndex() ? 0 : currentIndex + 1); }

    /** Go one step back (wraps to max at the start) */
    function prev() { goTo(currentIndex <= 0 ? maxIndex() : currentIndex - 1); }


    /* ---- Autoplay ---- */
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, 5000);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }


    /* ---- Button events ---- */
    if (prevBtn) {
      prevBtn.addEventListener('click', () => { prev(); startAuto(); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => { next(); startAuto(); });
    }


    /* ---- Pause on hover / resume on leave ---- */
    if (carouselEl) {
      carouselEl.addEventListener('mouseenter', stopAuto);
      carouselEl.addEventListener('mouseleave', startAuto);
      /* Also pause on focus-within (keyboard accessibility) */
      carouselEl.addEventListener('focusin',  stopAuto);
      carouselEl.addEventListener('focusout', startAuto);
    }


    /* ---- Touch swipe support ---- */
    let touchStartX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 48) {    // minimum 48px swipe threshold
        diff > 0 ? next() : prev();
        startAuto();
      }
    }, { passive: true });


    /* ---- Resize: recompute card sizes and clamp index ---- */
    let resizeDebounce;
    window.addEventListener('resize', () => {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        /* Clamp currentIndex in case cardsPerView changed (e.g. mobile → desktop) */
        currentIndex = Math.min(currentIndex, maxIndex());
        sizeCards();
        applyTransform(false);  // no animation on resize snap
        buildDots();
      }, 120);
    });


    /* ---- Initial render ---- */
    sizeCards();
    applyTransform(false);
    buildDots();
    startAuto();

  } // end initReviewsCarousel


  /* --------------------------------------------------
     5C. INIT — Run carousel on page load
  -------------------------------------------------- */
  initReviewsCarousel();


  /* =============================================
     MODULE 6 — GALLERY & LIGHTBOX
     8 placeholder gallery items. Each wraps an <img>
     at assets/images/store-X.jpg. When real photos are
     placed at those paths, they automatically fade in
     over the CSS placeholder.

     Lightbox features:
     • Opens on item click
     • Prev / Next buttons (wraps around)
     • Keyboard: ArrowLeft, ArrowRight, Escape
     • Touch swipe (>50 px threshold)
     • Close on overlay click (outside image)
     • Focus trapping inside lightbox while open
  ============================================= */

  /* --------------------------------------------------
     6A. GALLERY DATA
     Mirrors the 8 items in index.html exactly.
     Captions and image paths must stay in sync.
  -------------------------------------------------- */
  const GALLERY_ITEMS = [
    {
      index:   0,
      src:     'assets/images/store-1.jpg',
      caption: 'Store Front — Bazar Road',
      icon:    'fa-solid fa-store',
      color:   'linear-gradient(135deg, #1a6b4a 0%, #2d8f63 100%)',
    },
    {
      index:   1,
      src:     'assets/images/store-2.jpg',
      caption: 'Medicine Counter',
      icon:    'fa-solid fa-pills',
      color:   'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
    },
    {
      index:   2,
      src:     'assets/images/store-3.jpg',
      caption: 'Consultation Area',
      icon:    'fa-solid fa-user-doctor',
      color:   'linear-gradient(135deg, #00695c 0%, #26a69a 100%)',
    },
    {
      index:   3,
      src:     'assets/images/store-4.jpg',
      caption: 'Diagnostic Setup',
      icon:    'fa-solid fa-microscope',
      color:   'linear-gradient(135deg, #b71c1c 0%, #ef5350 100%)',
    },
    {
      index:   4,
      src:     'assets/images/store-5.jpg',
      caption: 'Medicine Storage',
      icon:    'fa-solid fa-boxes-stacked',
      color:   'linear-gradient(135deg, #6a1b9a 0%, #ab47bc 100%)',
    },
    {
      index:   5,
      src:     'assets/images/store-6.jpg',
      caption: 'Waiting Area',
      icon:    'fa-solid fa-couch',
      color:   'linear-gradient(135deg, #e65100 0%, #ff9800 100%)',
    },
    {
      index:   6,
      src:     'assets/images/store-7.jpg',
      caption: 'Store Interior',
      icon:    'fa-solid fa-shop',
      color:   'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
    },
    {
      index:   7,
      src:     'assets/images/store-8.jpg',
      caption: 'Staff at Work',
      icon:    'fa-solid fa-people-group',
      color:   'linear-gradient(135deg, #1a237e 0%, #5c6bc0 100%)',
    },
  ];


  /* --------------------------------------------------
     6B. LIGHTBOX STATE & DOM REFERENCES
  -------------------------------------------------- */
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxClose   = document.getElementById('lightboxClose');
  const lightboxPrev    = document.getElementById('lightboxPrev');
  const lightboxNext    = document.getElementById('lightboxNext');
  const lightboxImgWrap = document.getElementById('lightboxImgWrap');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');

  /* Bail early if lightbox elements are not in DOM */
  const lightboxReady =
    lightboxOverlay && lightboxClose && lightboxPrev &&
    lightboxNext && lightboxImgWrap && lightboxCaption && lightboxCounter;

  let currentLightboxIndex = 0;   // which photo is currently shown
  let lightboxIsOpen       = false;


  /* --------------------------------------------------
     6C. OPEN LIGHTBOX
     Sets the background colour of the wrap to match
     the item's placeholder colour while the photo loads.
  -------------------------------------------------- */
  function openLightbox(index) {
    if (!lightboxReady) return;

    currentLightboxIndex = index;
    lightboxIsOpen       = true;

    /* Show overlay */
    lightboxOverlay.classList.add('is-open');
    lightboxOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    /* Load the image for this index */
    renderLightboxImage(index, false);   // false = no animation (initial open)

    /* Move focus to close button for accessibility */
    requestAnimationFrame(() => {
      if (lightboxClose) lightboxClose.focus();
    });
  }


  /* --------------------------------------------------
     6D. CLOSE LIGHTBOX
  -------------------------------------------------- */
  function closeLightbox() {
    if (!lightboxReady) return;

    lightboxIsOpen = false;
    lightboxOverlay.classList.remove('is-open');
    lightboxOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    /* Clear the image to free memory */
    lightboxImgWrap.innerHTML = '';
  }


  /* --------------------------------------------------
     6E. NAVIGATE — Prev / Next
  -------------------------------------------------- */
  function lightboxGoTo(newIndex, direction) {
    const total = GALLERY_ITEMS.length;

    /* Wrap-around */
    if (newIndex < 0)      newIndex = total - 1;
    if (newIndex >= total) newIndex = 0;

    currentLightboxIndex = newIndex;
    renderLightboxImage(newIndex, direction);
  }

  function lightboxPrevItem() {
    lightboxGoTo(currentLightboxIndex - 1, 'prev');
  }

  function lightboxNextItem() {
    lightboxGoTo(currentLightboxIndex + 1, 'next');
  }


  /* --------------------------------------------------
     6F. RENDER IMAGE IN LIGHTBOX
     Injects either a real <img> (if file loads) or
     a CSS placeholder (if file is missing / 404).
     Direction: 'prev' | 'next' | false (no slide)
  -------------------------------------------------- */
  function renderLightboxImage(index, direction) {
    if (!lightboxReady) return;

    const item = GALLERY_ITEMS[index];

    /* Update caption + counter */
    lightboxCaption.textContent = item.caption;
    lightboxCounter.textContent = `${index + 1} / ${GALLERY_ITEMS.length}`;

    /* Set the placeholder background colour immediately */
    lightboxImgWrap.style.background = item.color;

    /* Slide animation */
    if (direction) {
      const fromX = direction === 'next' ? '30px' : '-30px';
      lightboxImgWrap.style.transform  = `translateX(${fromX}) scale(0.96)`;
      lightboxImgWrap.style.opacity    = '0';
      lightboxImgWrap.style.transition = 'none';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lightboxImgWrap.style.transition = 'transform 280ms ease, opacity 280ms ease';
          lightboxImgWrap.style.transform  = 'translateX(0) scale(1)';
          lightboxImgWrap.style.opacity    = '1';
        });
      });
    }

    /* Build the image element */
    const img = document.createElement('img');
    img.className = 'lightbox-photo';
    img.alt       = item.caption;

    /* Show placeholder icon while loading */
    lightboxImgWrap.innerHTML =
      `<i class="lightbox-placeholder-icon ${item.icon}" aria-hidden="true"></i>`;

    /* When image loads successfully, replace placeholder with the photo */
    img.onload = function () {
      lightboxImgWrap.innerHTML = '';
      img.classList.add('loaded');
      lightboxImgWrap.appendChild(img);
    };

    /* If image fails to load, keep the CSS placeholder icon */
    img.onerror = function () {
      /* Placeholder icon already showing — nothing more to do */
    };

    /* Set src AFTER attaching handlers */
    img.src = item.src;
  }


  /* --------------------------------------------------
     6G. EVENT LISTENERS — Lightbox controls
  -------------------------------------------------- */

  if (lightboxReady) {

    /* Close button */
    lightboxClose.addEventListener('click', closeLightbox);

    /* Prev button */
    lightboxPrev.addEventListener('click', lightboxPrevItem);

    /* Next button */
    lightboxNext.addEventListener('click', lightboxNextItem);

    /* Click outside image (on the dark overlay) closes lightbox */
    lightboxOverlay.addEventListener('click', function (e) {
      if (
        e.target === lightboxOverlay ||
        e.target === lightboxClose
      ) {
        closeLightbox();
      }
    });

    /* Keyboard navigation: arrows + Escape */
    document.addEventListener('keydown', function (e) {
      if (!lightboxIsOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          lightboxPrevItem();
          break;
        case 'ArrowRight':
          e.preventDefault();
          lightboxNextItem();
          break;
        case 'Escape':
          closeLightbox();
          break;
      }
    });

    /* Touch swipe support — horizontal swipe to navigate */
    let swipeStartX = 0;

    lightboxOverlay.addEventListener('touchstart', function (e) {
      swipeStartX = e.touches[0].clientX;
    }, { passive: true });

    lightboxOverlay.addEventListener('touchend', function (e) {
      const diff = swipeStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? lightboxNextItem() : lightboxPrevItem();
      }
    }, { passive: true });

  } // end if lightboxReady


  /* --------------------------------------------------
     6H. ATTACH CLICK HANDLERS TO GALLERY ITEMS
     Each .gallery-item in #galleryGrid opens the
     lightbox at the matching index from GALLERY_ITEMS.
  -------------------------------------------------- */
  function initGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    const items = galleryGrid.querySelectorAll('.gallery-item');

    items.forEach(function (item) {
      const index = parseInt(item.dataset.index, 10);

      /* Make items keyboard-reachable */
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-haspopup', 'dialog');

      /* Click → open lightbox */
      item.addEventListener('click', function () {
        openLightbox(index);
      });

      /* Enter / Space key → open lightbox (keyboard accessibility) */
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });
  }


  /* --------------------------------------------------
     6I. INIT — Run gallery module on page load
  -------------------------------------------------- */
  initGallery();


  /* =============================================
     MODULE 7 — PAGE LOADING ANIMATION
     Fades out the full-screen green loader after
     1 second (or immediately if DOM is already
     fully ready). Adds 'hidden' class which triggers
     CSS opacity + visibility transition.
  ============================================= */

  (function initPageLoader() {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;

    /* Hide after 1000 ms — enough for fonts + first paint */
    setTimeout(function () {
      loader.classList.add('hidden');

      /* After the CSS transition finishes (500ms), remove from DOM entirely
         so screen readers and tab order are clean */
      loader.addEventListener(
        'transitionend',
        function () { loader.remove(); },
        { once: true }
      );
    }, 1000);
  })();


  /* =============================================
     MODULE 8 — FLOATING WHATSAPP BUTTON
     The button is pure HTML + CSS (see index.html
     and style.css). No JS needed beyond the
     aria-label already set in markup.
     This module is a no-op placeholder in case
     future behaviour (e.g. badge counter) is added.
  ============================================= */
  /* WhatsApp button is purely CSS-driven — no JS required. */


  /* =============================================
     MODULE 9 — BACK TO TOP BUTTON
     Shows after 400px of scroll. Smooth-scrolls
     to the very top of the page on click.
     Positioned above the floating WA button.
  ============================================= */

  (function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const SCROLL_THRESHOLD = 400; // px before button appears

    /* --- Show / hide based on scroll position --- */
    function handleScroll() {
      btn.classList.toggle('visible', window.scrollY > SCROLL_THRESHOLD);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on load in case page is pre-scrolled

    /* --- Scroll to top on click --- */
    btn.addEventListener('click', function () {
      /* Use native smooth scroll if supported */
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        /* Fallback for older browsers */
        window.scrollTo(0, 0);
      }

      /* Move focus to the skip-link / top of page for keyboard users */
      const skipLink = document.querySelector('.skip-link');
      if (skipLink) {
        skipLink.focus({ preventScroll: true });
      } else {
        /* Focus the logo link if no skip link present */
        const brand = document.querySelector('.nav-brand');
        if (brand) brand.focus({ preventScroll: true });
      }
    });

    /* --- Keyboard: Space / Enter while focused --- */
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  })();


  /* =============================================
     INIT LOG
  ============================================= */
  console.log(
    '%clifecure Medicos — Loaded ✓ (Step 9: Final Polish, SEO, Accessibility)',
    'color: #1a6b4a; font-weight: bold; font-size: 13px;'
  );

})(); // End IIFE