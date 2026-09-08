/* ==========================================================================
   ÉMILY IN PARIS — Editorial Concept Site — Interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Nav: scroll state + mobile toggle ---------------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const onScrollNav = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.querySelectorAll('.has-dropdown.open').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-caret')?.setAttribute('aria-expanded', 'false');
      });
    });
  });

  /* ---------------- Nav dropdowns (Temporadas / Personajes) ---------------- */
  document.querySelectorAll('.nav-caret').forEach(caret => {
    caret.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const item = caret.closest('.has-dropdown');
      const isOpen = item.classList.toggle('open');
      caret.setAttribute('aria-expanded', String(isOpen));
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown.open').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-caret')?.setAttribute('aria-expanded', 'false');
      });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.has-dropdown.open').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-caret')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
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

  // season rows also fade their photo from grayscale using the same in-view class
  document.querySelectorAll('.season-row').forEach(row => {
    if (!('IntersectionObserver' in window) || reduceMotion) { row.classList.add('in-view'); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.25 });
    obs.observe(row);
  });

  /* ---------------- Custom cursor ---------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const cursorLabel = document.getElementById('cursorLabel');
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

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

    const hoverTargets = 'a, button, .fashion-card, .character-card, .paris-item, .masonry-item, input, .season-media img';
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(hoverTargets);
      if (!target) return;
      cursorRing.classList.add('hovering');
      if (target.matches('.masonry-item, .fashion-card')) cursorLabel.textContent = 'Voir';
      else if (target.matches('.paris-item')) cursorLabel.textContent = 'Explorer';
      else cursorLabel.textContent = '';
    });
    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(hoverTargets);
      if (!target) return;
      cursorRing.classList.remove('hovering');
      cursorLabel.textContent = '';
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0'; cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1'; cursorRing.style.opacity = '1';
    });
  }

  /* ---------------- Gallery lightbox ---------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  let lightboxTrigger = null;

  document.querySelectorAll('.masonry-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightboxTrigger = item;
      lightboxImg.src = img.src.replace(/\/\d+\/\d+$/, '/1200/1500');
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    });
  });

  /* ---------------- Main character carousel ---------------- */
  const mainCharacterCards = [...document.querySelectorAll('.character-row-main .character-card')];
  const characterPrev = document.getElementById('characterPrev');
  const characterNext = document.getElementById('characterNext');
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

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxTrigger?.focus();
  };
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'Tab') {
      e.preventDefault();
      lightboxClose.focus();
    }
  });

  /* ---------------- Quiz ---------------- */
  const quizQuestions = document.querySelectorAll('.quiz-question');
  const quizDots = document.querySelectorAll('.quiz-progress .dot');
  const quizResult = document.getElementById('quizResult');
  const quizRetake = document.getElementById('quizRetake');

  const characterData = {
    emily:   { name: 'Emily',   role: 'La Soñadora',   seed: 'character-emily-portrait',   desc: 'Te tirás de cabeza primero y pensás el epígrafe después. Paris tiene suerte de tener tu energía.' },
    mindy:   { name: 'Mindy',   role: 'La Estrella',   seed: 'character-mindy-portrait',   desc: 'Audaz, leal e imposible de ignorar — la sala se pone más ruidosa apenas entrás.' },
    gabriel: { name: 'Gabriel', role: 'El Romántico',  seed: 'character-gabriel-portrait', desc: 'Lideras con calidez y mano firme. La gente confía en vos antes de que digas una palabra.' },
    alfie:   { name: 'Alfie',   role: 'El Realista',   seed: 'character-alfie-portrait',   desc: 'Encantador pero sin vueltas — decís lo que todos los demás solo están pensando.' },
    camille: { name: 'Camille', role: 'El Alma Antigua', seed: 'character-camille-portrait', desc: 'Sin esfuerzo aparente, complicada y profundamente leal. Hacés que el caos parezca buen gusto.' },
    sylvie:  { name: 'Sylvie',  role: 'La Directrice', seed: 'character-sylvie-portrait',  desc: 'Exigente e imperturbable. Tus estándares son los únicos que importan.' },
    marcello:{ name: 'Marcello', role: 'El Recién Llegado', seed: 'character-marcello-portrait', desc: 'Cálido, seguro y siempre con un plan en marcha. Donde vos vas, ahí se instala el buen vino.' }
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

    document.getElementById('resultImg').src = `https://picsum.photos/seed/${c.seed}/300/300`;
    document.getElementById('resultImg').alt = `Retrato que representa a ${c.name}`;
    document.getElementById('resultRole').textContent = c.role;
    document.getElementById('resultName').textContent = c.name;
    document.getElementById('resultDesc').textContent = c.desc;

    quizQuestions.forEach(q => q.classList.remove('active'));
    quizResult.classList.add('active');
    quizDots.forEach(dot => dot.classList.add('done'));
  };

  document.querySelectorAll('.quiz-options button').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.value;
      scores[value] = (scores[value] || 0) + 1;
      currentQuestion++;
      if (currentQuestion < quizQuestions.length) {
        showQuestion(currentQuestion);
      } else {
        finishQuiz();
      }
    });
  });

  if (quizRetake) {
    quizRetake.addEventListener('click', () => {
      currentQuestion = 0;
      Object.keys(scores).forEach(k => delete scores[k]);
      showQuestion(0);
    });
  }

  /* ---------------- Newsletter (mock submit) ---------------- */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMsg = document.getElementById('newsletterMsg');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletterEmail').value.trim();
      if (!email) return;
      newsletterMsg.textContent = '\u00a1Merci! Ya est\u00e1s en la lista \u2014 bienvenida al club.';
      newsletterForm.reset();
    });
  }

  /* ---------------- Contact form (mock submit) ---------------- */
  const contactForm = document.getElementById('contactForm');
  const contactMsg = document.getElementById('contactMsg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      if (!name) return;
      contactMsg.textContent = `\u00a1Merci, ${name}! Recibimos tu mensaje y te vamos a responder pronto.`;
      contactForm.reset();
    });
  }

});
