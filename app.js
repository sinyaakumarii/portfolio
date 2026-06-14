document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu Toggle ---
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // --- Hero Typewriter Effect ---
  const heroTypewriter = document.getElementById('hero-typewriter');
  if (heroTypewriter) {
    const heroRoles = [
      "Machine Learning Engineer",
      "Python Developer",
    ];
    let roleIndex = 0;
    let charIdx = 0;
    let deleting = false;
    let heroSpeed = 110;

    function typeHero() {
      const current = heroRoles[roleIndex];

      if (deleting) {
        heroTypewriter.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        heroSpeed = 55;
      } else {
        heroTypewriter.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        heroSpeed = 110;
      }

      if (!deleting && charIdx === current.length) {
        deleting = true;
        heroSpeed = 2200; // Pause at full phrase
      } else if (deleting && charIdx === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % heroRoles.length;
        heroSpeed = 450; // Pause before next phrase
      }

      setTimeout(typeHero, heroSpeed);
    }

    setTimeout(typeHero, 800);
  }

  // --- Project Filtering System ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300); // Match transition duration
        }
      });
    });
  });

  // --- Scroll Reveal Animations via IntersectionObserver ---
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  reveals.forEach(element => {
    revealObserver.observe(element);
  });

  // --- Active Nav Link Highlighting on Scroll ---
  // FIXED: We now specifically query sections that actually map to navbar items
  const navItems = document.querySelectorAll('.nav-links a:not(.cv-btn)');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';

    navItems.forEach(item => {
      const targetId = item.getAttribute('href').substring(1);
      const section = document.getElementById(targetId);

      if (section) {
        const sectionTop = section.offsetTop;
        // Check if the section is scrolled into view window range
        if (window.scrollY >= sectionTop - 150) {
          currentSectionId = targetId;
        }
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${currentSectionId}`) {
        item.classList.add('active');
      }
    });
  });

  // --- Contact Form Submission Handler ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.btn-submit');
      const originalText = submitBtn.innerHTML;

      // Visual Feedback during submission
      submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
      submitBtn.style.pointerEvents = 'none';

      // Simulate API call
      setTimeout(() => {
        submitBtn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
        submitBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)';
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.style.pointerEvents = 'auto';
        }, 4000);
      }, 1500);
    });
  }

  // --- Click Sound Effect for Hero CTA Buttons ---
  function playClickSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Oscillator for the click tone
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // Silently fail if Web Audio API is unavailable
    }
  }

  // Attach sound to the three hero CTA buttons
  const heroCta = document.querySelector('.hero-cta');
  if (heroCta) {
    heroCta.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', playClickSound);
      btn.addEventListener('mouseenter', () => {
        playTone({ type: 'sine', freqStart: 800, freqEnd: 1000, gainStart: 0.07, duration: 0.09 });
      });
    });
  }

  // =====================================================================
  // --- Section Sound Effects Engine ---
  // All sounds synthesized via Web Audio API. No audio files required.
  // =====================================================================

  // Shared AudioContext (lazy-created on first interaction)
  let _audioCtx = null;
  function getAudioCtx() {
    if (!_audioCtx) {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if browser suspended it (autoplay policy)
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  }

  // Debounce helper to prevent hover sounds from firing too rapidly
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * playTone(options)
   * A flexible tone generator for all UI sounds.
   *
   * @param {Object} opts
   *   type        - OscillatorType ('sine'|'triangle'|'square')
   *   freqStart   - Starting frequency (Hz)
   *   freqEnd     - Ending frequency (Hz), for pitch sweep
   *   gainStart   - Initial gain (0–1)
   *   duration    - Duration in seconds
   *   rampStyle   - 'exp' | 'linear' (frequency ramp type)
   */
  function playTone({
    type = 'sine',
    freqStart = 500,
    freqEnd = null,
    gainStart = 0.12,
    duration = 0.1,
    rampStyle = 'exp'
  } = {}) {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);

      if (freqEnd && freqEnd > 0 && freqStart > 0) {
        if (rampStyle === 'exp') {
          osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
        } else {
          osc.frequency.linearRampToValueAtTime(freqEnd, now + duration);
        }
      }

      gain.gain.setValueAtTime(gainStart, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch (e) {
      // Silently fail if Web Audio API is unavailable
    }
  }

  // --- Pre-defined Sound Profiles ---

  // Soft hover: gentle high-frequency shimmer
  function soundHoverSoft() {
    playTone({ type: 'sine', freqStart: 900, freqEnd: 1100, gainStart: 0.07, duration: 0.09 });
  }

  // Project card hover: slightly warmer tone
  function soundHoverProject() {
    playTone({ type: 'sine', freqStart: 750, freqEnd: 950, gainStart: 0.08, duration: 0.11 });
  }

  // Send Message button hover: a gentle ascending chime
  function soundHoverSendBtn() {
    playTone({ type: 'sine', freqStart: 660, freqEnd: 880, gainStart: 0.09, duration: 0.13 });
  }

  // Repository link click: satisfying descending pop
  function soundClickRepo() {
    playTone({ type: 'sine', freqStart: 1200, freqEnd: 500, gainStart: 0.18, duration: 0.15 });
  }

  // Form field focus: delicate soft ping
  function soundFocusField() {
    playTone({ type: 'sine', freqStart: 520, freqEnd: 600, gainStart: 0.08, duration: 0.12 });
  }

  // Send Message click: rising confirmation chord
  function soundClickSend() {
    // Two-tone confirmation feel
    playTone({ type: 'sine', freqStart: 600, freqEnd: 900, gainStart: 0.15, duration: 0.18 });
    setTimeout(() => {
      playTone({ type: 'sine', freqStart: 900, freqEnd: 1200, gainStart: 0.10, duration: 0.14 });
    }, 80);
  }

  // --- Attach: Skill Cards (Technical Toolbox) ---
  document.querySelectorAll('#skills .skill-category').forEach(card => {
    card.addEventListener('mouseenter', debounce(soundHoverSoft, 60));
  });

  // --- Attach: Coursework Tags (Academic Foundation) ---
  document.querySelectorAll('#education .coursework span').forEach(tag => {
    tag.addEventListener('mouseenter', debounce(soundHoverSoft, 60));
  });

  // --- Attach: Project Cards ---
  document.querySelectorAll('#projects .project-card').forEach(card => {
    card.addEventListener('mouseenter', debounce(soundHoverProject, 60));
  });

  // --- Attach: Project Repository Links (click) ---
  document.querySelectorAll('#projects .project-link').forEach(link => {
    link.addEventListener('click', soundClickRepo);
  });

  // --- Attach: Contact Form Inputs & Textarea (focus) ---
  document.querySelectorAll('#contact-form input, #contact-form textarea').forEach(field => {
    field.addEventListener('focus', soundFocusField);
  });

  // --- Attach: Send Message button (hover + click) ---
  const sendBtn = document.querySelector('#contact-form .btn-submit');
  if (sendBtn) {
    sendBtn.addEventListener('mouseenter', debounce(soundHoverSendBtn, 60));
    sendBtn.addEventListener('click', soundClickSend);
  }
});