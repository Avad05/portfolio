'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ──────────────────────────────────────────────
  // 1. Scroll Reveal Animation
  // ──────────────────────────────────────────────

  /** Reveals `.reveal` elements as they enter the viewport. */
  const initScrollReveal = () => {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));

    // Safety net: content must never be left invisible if the observer never
    // fires for an element (bfcache restores, zero-height layout, odd engines).
    window.setTimeout(() => {
      revealEls.forEach((el) => {
        if (el.classList.contains('visible')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('visible');
        }
      });
    }, 3000);
  };

  // ──────────────────────────────────────────────
  // 2. Smooth Scroll for Navigation
  // ──────────────────────────────────────────────

  const NAV_HEIGHT = 64;

  /** Enables smooth-scroll for all in-page anchor links. */
  const initSmoothScroll = () => {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (!anchors.length) return;

    anchors.forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#') return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

        // Close mobile menu if open
        closeMobileMenu();
      });
    });
  };

  // ──────────────────────────────────────────────
  // 3. Mobile Menu Toggle
  // ──────────────────────────────────────────────

  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');

  /** Opens or closes the mobile navigation menu. */
  const toggleMobileMenu = () => {
    if (!navToggle || !navMenu) return;

    const isOpen = navMenu.classList.toggle('nav__menu--open');
    navToggle.classList.toggle('nav__toggle--active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('no-scroll', isOpen);
  };

  /** Closes the mobile menu if it is currently open. */
  const closeMobileMenu = () => {
    if (!navToggle || !navMenu) return;
    if (!navMenu.classList.contains('nav__menu--open')) return;

    navMenu.classList.remove('nav__menu--open');
    navToggle.classList.remove('nav__toggle--active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };

  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileMenu);
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // Close when clicking outside the menu
  document.addEventListener('click', (e) => {
    if (
      navMenu &&
      navMenu.classList.contains('nav__menu--open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  // ──────────────────────────────────────────────
  // 4. Navigation Background on Scroll
  // ──────────────────────────────────────────────

  const nav = document.querySelector('.nav');
  let lastScrollY = 0;
  let scrollTicking = false;

  /** Adds/removes `.nav--scrolled` based on scroll position. */
  const updateNavBackground = () => {
    if (!nav) return;
    if (lastScrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    scrollTicking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      lastScrollY = window.scrollY;
      if (!scrollTicking) {
        requestAnimationFrame(updateNavBackground);
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  // ──────────────────────────────────────────────
  // 5. Active Navigation Link
  // ──────────────────────────────────────────────

  /** Highlights the nav link corresponding to the section currently in view. */
  const initActiveNavLink = () => {
    const sectionIds = ['hero', 'about', 'work', 'experience', 'contact'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const navLinks = document.querySelectorAll('.nav__link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((section) => observer.observe(section));
  };

  // ──────────────────────────────────────────────
  // 6. Typed Text Effect
  // ──────────────────────────────────────────────

  /** Cycles through an array of strings with a typewriter effect. */
  const initTypedText = () => {
    const el = document.querySelector('.typed-text');
    const cursor = document.querySelector('.typed-cursor');
    if (!el) return;

    if (prefersReducedMotion) {
      el.textContent = 'full-stack applications';
      return;
    }

    const strings = [
      'full-stack applications',
      'open source tools',
      'beautiful interfaces',
      'performant systems',
    ];

    const TYPE_SPEED = 80;
    const DELETE_SPEED = 40;
    const PAUSE_DURATION = 2000;

    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
      const current = strings[stringIndex];

      if (!isDeleting) {
        // Typing forward
        charIndex++;
        el.textContent = current.substring(0, charIndex);

        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(tick, PAUSE_DURATION);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        // Deleting backward
        charIndex--;
        el.textContent = current.substring(0, charIndex);

        if (charIndex === 0) {
          isDeleting = false;
          stringIndex = (stringIndex + 1) % strings.length;
          setTimeout(tick, TYPE_SPEED);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    };

    // Start after a brief initial pause
    setTimeout(tick, 500);

    // Blinking cursor animation via class toggle
    if (cursor) {
      setInterval(() => cursor.classList.toggle('blink'), 530);
    }
  };

  // ──────────────────────────────────────────────
  // 7. Parallax Gradient Orbs
  // ──────────────────────────────────────────────

  /** Translates `.gradient-orb` elements based on mouse position for a parallax feel. */
  const initParallaxOrbs = () => {
    if (prefersReducedMotion) return;

    const orbs = document.querySelectorAll('.gradient-orb');
    if (!orbs.length) return;

    let mouseX = 0;
    let mouseY = 0;
    let rafId = null;

    const updateOrbs = () => {
      const offsetX = (mouseX - window.innerWidth / 2) / 30;
      const offsetY = (mouseY - window.innerHeight / 2) / 30;

      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 0.5;
        orb.style.setProperty('--tx', `${offsetX * factor}px`);
        orb.style.setProperty('--ty', `${offsetY * factor}px`);
      });

      rafId = null;
    };

    window.addEventListener(
      'mousemove',
      (e) => {
        if (window.innerWidth <= 768) return;

        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!rafId) {
          rafId = requestAnimationFrame(updateOrbs);
        }
      },
      { passive: true }
    );
  };

  // ──────────────────────────────────────────────
  // 8. Back to Top Button
  // ──────────────────────────────────────────────

  /** Shows/hides the back-to-top button and scrolls to top on click. */
  const initBackToTop = () => {
    const btn = document.querySelector('.back-to-top') || document.getElementById('back-to-top');
    if (!btn) return;

    let btTicking = false;

    const updateVisibility = () => {
      btn.classList.toggle('visible', window.scrollY > 500);
      btTicking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!btTicking) {
          requestAnimationFrame(updateVisibility);
          btTicking = true;
        }
      },
      { passive: true }
    );

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  };

  // ──────────────────────────────────────────────
  // 9. Copyright Year
  // ──────────────────────────────────────────────

  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ──────────────────────────────────────────────
  // 11. Staggered Text Reveal
  // ──────────────────────────────────────────────

  const initStaggeredReveal = () => {
    const lines = document.querySelectorAll('.hero__title-line');
    if (!lines.length || prefersReducedMotion) return;

    // Apply incremental delays
    lines.forEach((line, index) => {
      line.style.transitionDelay = `${100 + index * 150}ms`;
    });
  };

  // ──────────────────────────────────────────────
  // 12. Theme Toggle
  // ──────────────────────────────────────────────
  
  const initThemeToggle = () => {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    toggleBtn.addEventListener('click', () => {
      // Add a transition class to the body for a smooth global crossfade
      document.body.classList.add('theme-transitioning');
      
      // Force browser to recalculate styles before changing the theme
      // This ensures the transition actually happens instead of snapping instantly
      void document.body.offsetHeight;
      
      const currentTheme = document.documentElement.getAttribute('data-theme') ||
                           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      requestAnimationFrame(() => {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Remove the class after the transition duration
        setTimeout(() => {
          document.body.classList.remove('theme-transitioning');
        }, 900);
      });
    });
  };

  // ──────────────────────────────────────────────
  // 13. Typewriter Effect
  // ──────────────────────────────────────────────
  
  const initTypewriter = () => {
    const typewriterElement = document.getElementById('typewriter-text');
    if (!typewriterElement) return;

    const phrases = [
      "that scales.",
      "with precision.",
      "from scratch.",
      "for the future."
    ];
    
    let phraseIndex = 0;
    let charIndex = phrases[0].length; // Start with the first phrase fully typed
    let isDeleting = false;
    let typingSpeed = 100;
    
    const type = () => {
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 40; // Faster when deleting
      } else {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = Math.random() * 50 + 80; // Natural typing speed variation
      }
      
      // If word is completely typed
      if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 1500; // Pause briefly at end of phrase
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 200; // Short pause before typing new phrase
      }
      
      setTimeout(type, typingSpeed);
    };
    
    // Start the deleting effect after a moderate initial delay
    setTimeout(() => {
      isDeleting = true;
      type();
    }, 2000);
  };

  // ──────────────────────────────────────────────
  // 10. Split-Text Reveal
  // ──────────────────────────────────────────────

  /**
   * Wraps every glyph of a `.split` element in its own span so the scroll
   * reveal can stagger them. Walks text nodes only, so nested markup
   * (`<br>`, `<span class="text-gradient">`) survives intact.
   */
  const initSplitText = () => {
    const targets = document.querySelectorAll('.split');
    if (!targets.length || prefersReducedMotion) return;

    targets.forEach((el) => {
      if (el.dataset.split === 'done') return;

      const textNodes = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      let index = 0;

      textNodes.forEach((node) => {
        if (!node.nodeValue.trim()) return;

        const frag = document.createDocumentFragment();

        // Group glyphs into inline-block words so long headings still wrap
        // between words rather than mid-word.
        node.nodeValue.split(/(\s+)/).forEach((chunk) => {
          if (!chunk) return;

          if (/^\s+$/.test(chunk)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }

          const word = document.createElement('span');
          word.className = 'word';

          [...chunk].forEach((glyph) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = glyph;
            span.style.setProperty('--char-delay', `${index * 22}ms`);
            word.appendChild(span);
            index += 1;
          });

          frag.appendChild(word);
        });

        node.parentNode.replaceChild(frag, node);
      });

      el.dataset.split = 'done';
    });
  };

  // ──────────────────────────────────────────────
  // 11. Scroll Progress Rail
  // ──────────────────────────────────────────────

  /** Scales the right-edge rail to match how far the page has been read. */
  const initScrollRail = () => {
    const thumb = document.querySelector('.scroll-rail__thumb');
    if (!thumb) return;

    let railTicking = false;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      thumb.style.setProperty('--progress', Math.min(1, Math.max(0, progress)).toFixed(4));
      railTicking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!railTicking) {
          requestAnimationFrame(update);
          railTicking = true;
        }
      },
      { passive: true }
    );

    update();
  };

  // ──────────────────────────────────────────────
  // 12. Magnetic Hover
  // ──────────────────────────────────────────────

  /** Pulls buttons and social chips slightly toward the pointer. */
  const initMagnetic = () => {
    if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    const targets = document.querySelectorAll('.btn, .social-link, .resume-badge, .back-to-top');
    const STRENGTH = 0.28;

    targets.forEach((el) => {
      el.classList.add('magnetic');

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        el.style.setProperty('--mx', `${dx * STRENGTH}px`);
        el.style.setProperty('--my', `${dy * STRENGTH}px`);
      });

      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  };

  // ──────────────────────────────────────────────
  // Initialise all modules
  // ──────────────────────────────────────────────

  initSplitText();
  initScrollReveal();
  initScrollRail();
  initMagnetic();
  initSmoothScroll();
  initActiveNavLink();
  initStaggeredReveal();
  initParallaxOrbs();
  initBackToTop();
  initThemeToggle();
  initTypewriter();
});
