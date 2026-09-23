/* ==========================================================================
   ÉMILY IN PARIS — Editorial Concept Site — Interactions

   This file is shared by every page of the site. Each section below guards
   itself on the elements it needs (e.g. `if (lightbox) {...}`), because most
   pages only contain a subset of the site's components — a stray error in
   one block must never stop the rest of the script (nav, forms, etc.) from
   running on that page.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Nav: scroll state + mobile toggle ---------------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (nav && navToggle && navLinks) {
    const onScrollNav = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    onScrollNav();
    window.addEventListener('scroll', onScrollNav, { passive: true });

    const closeAllDropdowns = () => {
      document.querySelectorAll('.has-dropdown.open').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-caret')?.setAttribute('aria-expanded', 'false');
      });
    };

    const closeMobileMenu = () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      closeAllDropdowns();
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      if (!isOpen) closeAllDropdowns();
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => closeMobileMenu());
    });

    /* Nav dropdowns (Temporadas / Personajes) — the caret drives the open
       state used on mobile (tap to expand) and is also a valid keyboard
       trigger on desktop; the hover/focus-within CSS handles the mouse
       case there independently. */
    document.querySelectorAll('.nav-caret').forEach(caret => {
      caret.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const item = caret.closest('.has-dropdown');
        if (!item) return;
        const isOpen = item.classList.toggle('open');
        caret.setAttribute('aria-expanded', String(isOpen));
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.has-dropdown')) closeAllDropdowns();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (navLinks.classList.contains('open')) closeMobileMenu();
      else closeAllDropdowns();
    });

    // Close the mobile panel if the viewport is resized past the mobile
    // breakpoint while it's open (e.g. rotating a tablet to landscape).
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && navLinks.classList.contains('open')) closeMobileMenu();
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = (i % 4) * 90;
            setTimeout(() => el.classList.add('in-view'), delay);
            io.unobserve(el);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(el => io.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('in-view'));
    }
  }

  // Season rows also fade their photo from grayscale using the same
  // in-view class, observed separately since it also applies on scroll-back.
  const seasonRows = document.querySelectorAll('.season-row');
  if (seasonRows.length) {
    seasonRows.forEach(row => {
      if (!('IntersectionObserver' in window) || reduceMotion) { row.classList.add('in-view'); return; }
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('in-view'); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.25 });
      obs.observe(row);
    });
  }

  /* ---------------- Custom cursor (desktop pointer only) ---------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const cursorLabel = document.getElementById('cursorLabel');

  if (!reduceMotion && !isTouch && cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    const hoverTargets = 'a, button, .fashion-card, .character-card, .paris-item, .masonry-item, .hub-card, input, textarea, .season-media img';
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(hoverTargets);
      if (!target) return;
      cursorRing.classList.add('hovering');
      if (cursorLabel) {
        if (target.matches('.masonry-item, .fashion-card, .hub-card')) cursorLabel.textContent = 'Voir';
        else if (target.matches('.paris-item')) cursorLabel.textContent = 'Explorer';
        else cursorLabel.textContent = '';
      }
    });
    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(hoverTargets);
      if (!target) return;
      cursorRing.classList.remove('hovering');
      if (cursorLabel) cursorLabel.textContent = '';
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0'; cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1'; cursorRing.style.opacity = '1';
    });
  }

  /* ---------------- Gallery lightbox (Galería page) ----------------
     Navigates left/right through every photo in the masonry without
     closing the viewer: arrow buttons, ←/→ keys, Escape to close, and a
     small focus trap so Tab cycles inside the dialog while it's open. */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const galleryItems = [...document.querySelectorAll('.masonry-item')];

  if (lightbox && lightboxImg && lightboxClose && galleryItems.length) {
    let galleryIndex = 0;
    let lightboxTrigger = null;

    const renderSlide = () => {
      const img = galleryItems[galleryIndex].querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || 'Foto de la galería';
      if (lightboxCounter) lightboxCounter.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
    };

    const openLightboxAt = (index, trigger) => {
      galleryIndex = (index + galleryItems.length) % galleryItems.length;
      lightboxTrigger = trigger || galleryItems[galleryIndex];
      renderSlide();
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lightboxTrigger?.focus();
    };

    const goPrev = () => { galleryIndex = (galleryIndex - 1 + galleryItems.length) % galleryItems.length; renderSlide(); };
    const goNext = () => { galleryIndex = (galleryIndex + 1) % galleryItems.length; renderSlide(); };

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightboxAt(index, item));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev?.addEventListener('click', goPrev);
    lightboxNext?.addEventListener('click', goNext);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft') { goPrev(); return; }
      if (e.key === 'ArrowRight') { goNext(); return; }
      if (e.key === 'Tab') {
        const focusable = [lightboxClose, lightboxPrev, lightboxNext].filter(Boolean);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Basic touch swipe support alongside the visible arrow buttons.
    let touchStartX = null;
    lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { dx > 0 ? goPrev() : goNext(); }
      touchStartX = null;
    }, { passive: true });
  }

  /* ---------------- Main character carousel (Personajes page) ---------------- */
  const mainCharacterCards = [...document.querySelectorAll('.character-row-main .character-card')];
  const characterPrev = document.getElementById('characterPrev');
  const characterNext = document.getElementById('characterNext');

  if (mainCharacterCards.length) {
    let activeCharacter = 0;

    const setActiveCharacter = (index, shouldScroll = false) => {
      activeCharacter = (index + mainCharacterCards.length) % mainCharacterCards.length;
      mainCharacterCards.forEach((card, i) => card.classList.toggle('is-active', i === activeCharacter));
      if (shouldScroll) mainCharacterCards[activeCharacter].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    };

    mainCharacterCards.forEach((card, index) => {
      card.addEventListener('mouseenter', () => setActiveCharacter(index));
      card.addEventListener('focus', () => setActiveCharacter(index, true));
    });
    characterPrev?.addEventListener('click', () => setActiveCharacter(activeCharacter - 1, true));
    characterNext?.addEventListener('click', () => setActiveCharacter(activeCharacter + 1, true));
  }

  /* ---------------- Quiz (Personajes page) ---------------- */
  const quizQuestions = document.querySelectorAll('.quiz-question');
  const quizDots = document.querySelectorAll('.quiz-progress .dot');
  const quizResult = document.getElementById('quizResult');
  const quizRetake = document.getElementById('quizRetake');

  if (quizQuestions.length && quizResult) {
    const characterData = {
      emily:    { name: 'Emily',    role: 'La Soñadora',       seed: 'character-emily-portrait',    desc: 'Te tirás de cabeza primero y pensás el epígrafe después. Paris tiene suerte de tener tu energía.' },
      mindy:    { name: 'Mindy',    role: 'La Estrella',       seed: 'character-mindy-portrait',    desc: 'Audaz, leal e imposible de ignorar — la sala se pone más ruidosa apenas entrás.' },
      gabriel:  { name: 'Gabriel',  role: 'El Romántico',      seed: 'character-gabriel-portrait',  desc: 'Lideras con calidez y mano firme. La gente confía en vos antes de que digas una palabra.' },
      alfie:    { name: 'Alfie',    role: 'El Realista',       seed: 'character-alfie-portrait',    desc: 'Encantador pero sin vueltas — decís lo que todos los demás solo están pensando.' },
      camille:  { name: 'Camille',  role: 'El Alma Antigua',   seed: 'character-camille-portrait',  desc: 'Sin esfuerzo aparente, complicada y profundamente leal. Hacés que el caos parezca buen gusto.' },
      sylvie:   { name: 'Sylvie',   role: 'La Directrice',     seed: 'character-sylvie-portrait',   desc: 'Exigente e imperturbable. Tus estándares son los únicos que importan.' },
      marcello: { name: 'Marcello', role: 'El Recién Llegado', seed: 'character-marcello-portrait', desc: 'Cálido, seguro y siempre con un plan en marcha. Donde vos vas, ahí se instala el buen vino.' }
    };

    let currentQuestion = 0;
    const scores = {};

    const showQuestion = (index) => {
      quizQuestions.forEach(q => q.classList.toggle('active', Number(q.dataset.index) === index));
      quizDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
        dot.classList.toggle('done', i < index);
      });
      quizResult.classList.remove('active');
    };

    const finishQuiz = () => {
      let winner = 'emily';
      let max = -1;
      Object.keys(scores).forEach(key => { if (scores[key] > max) { max = scores[key]; winner = key; } });
      const c = characterData[winner];

      const resultImg = document.getElementById('resultImg');
      if (resultImg) {
        resultImg.src = `https://picsum.photos/seed/${c.seed}/300/300`;
        resultImg.alt = `Retrato que representa a ${c.name}`;
      }
      const resultRole = document.getElementById('resultRole');
      const resultName = document.getElementById('resultName');
      const resultDesc = document.getElementById('resultDesc');
      if (resultRole) resultRole.textContent = c.role;
      if (resultName) resultName.textContent = c.name;
      if (resultDesc) resultDesc.textContent = c.desc;

      quizQuestions.forEach(q => q.classList.remove('active'));
      quizResult.classList.add('active');
      quizDots.forEach(dot => dot.classList.add('done'));
    };

    document.querySelectorAll('.quiz-options button').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        scores[value] = (scores[value] || 0) + 1;
        currentQuestion++;
        if (currentQuestion < quizQuestions.length) showQuestion(currentQuestion);
        else finishQuiz();
      });
    });

    if (quizRetake) {
      quizRetake.addEventListener('click', () => {
        currentQuestion = 0;
        Object.keys(scores).forEach(k => delete scores[k]);
        showQuestion(0);
      });
    }
  }

  /* ---------------- Shared form helpers ---------------- */
  // Friendlier, Spanish, in-context validation messages instead of the
  // browser's default (often English) ones — purely a UX nicety, the real
  // enforcement is still the native `required`/`type` constraints.
  const attachFriendlyValidation = (form) => {
    if (!form) return;
    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('invalid', () => {
        if (field.validity.valueMissing) field.setCustomValidity('Este campo es obligatorio.');
        else if (field.validity.typeMismatch && field.type === 'email') field.setCustomValidity('Ingresá un email válido (ej: nombre@dominio.com).');
        else field.setCustomValidity('');
      });
      field.addEventListener('input', () => field.setCustomValidity(''));
    });
  };

  /* ---------------- Newsletter (Home page, mock submit) ---------------- */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMsg = document.getElementById('newsletterMsg');

  if (newsletterForm && newsletterMsg) {
    attachFriendlyValidation(newsletterForm);
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!newsletterForm.checkValidity()) return;
      newsletterMsg.textContent = '\u00a1Merci! Ya est\u00e1s en la lista \u2014 bienvenida al club.';
      newsletterForm.reset();
    });
  }

  /* ---------------- Contact form (Contacto page, mock submit) ---------------- */
  const contactForm = document.getElementById('contactForm');
  const contactMsg = document.getElementById('contactMsg');

  if (contactForm && contactMsg) {
    attachFriendlyValidation(contactForm);
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) return;
      const nameField = document.getElementById('contactName');
      const name = nameField ? nameField.value.trim() : '';
      contactMsg.textContent = `\u00a1Merci, ${name}! Recibimos tu mensaje y te vamos a responder pronto.`;
      contactForm.reset();
    });
  }

});
