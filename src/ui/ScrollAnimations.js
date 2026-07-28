import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Global multiplier applied to every wheel delta before it is routed to the
// scroll driver (section-to-section transitions). Lower = slower scrolling.
const SCROLL_SPEED = 0.45;

// Faster multiplier used only while scrolling *within* a long section
// (Portfolio / Archival grids). These have much more content to cover than
// the transition distance between sections, so they get their own, quicker
// pace instead of feeling sluggish at the same speed as everything else.
const INTERNAL_SCROLL_SPEED = 0.85;

// Page-scroll progress range during which the "Featured Work" (cinematic)
// section is active, and the dead-zone fraction reserved at each end so the
// first/last cards stay pinned. Shared by the drive + snap logic below.
const CINEMATIC_ENTER = 0.15;
const CINEMATIC_LEAVE = 0.39;
const CINEMATIC_DEAD  = 0.15;

// ─── Mouse-move parallax ──────────────────────────────────────────────────

let mouseX = 0, mouseY = 0;
const glassEls = [];

function onMouseMove(e) {
  mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;  // -1 → 1
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}

function tickParallax() {
  glassEls.forEach(({ el, depth }) => {
    const tx = mouseX * depth * 14;
    const ty = mouseY * depth * 10;
    gsap.to(el, {
      x: tx, y: ty,
      duration: 1.6,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });
  requestAnimationFrame(tickParallax);
}

// ─── Section entry animations ─────────────────────────────────────────────

export function initScrollAnimations(isFallback = false) {
  if (isFallback) {
    // In CSS fallback mode, just show everything
    document.querySelectorAll('.scene-section').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  // ── Hero section: always visible on load
  const heroSection = document.getElementById('section-hero');
  if (heroSection) {
    // Slight delay so Three.js boots first
    setTimeout(() => heroSection.classList.add('is-visible'), 400);
  }

  // ── Per-section ScrollTrigger (tied to #scroll-driver scroll progress)
  // Ranges are non-overlapping — each section ends before the next begins.
  // A tiny gap (0.01) gives room for the CSS opacity transition to complete.
  const sectionMap = [
    { id: 'section-hero',      enter: 0.00,            leave: 0.14 },
    { id: 'section-cinematic', enter: CINEMATIC_ENTER, leave: CINEMATIC_LEAVE },
    { id: 'section-portfolio', enter: 0.40,            leave: 0.61 },
    { id: 'section-archival',  enter: 0.62,            leave: 1.00 },
  ];

  // ── Build bottom progress indicator (dots double as click-to-navigate buttons)
  const indicator = document.createElement('div');
  indicator.id = 'section-indicator';
  const dots = sectionMap.map(({ id }, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'section-indicator__dot';
    d.setAttribute('aria-label', `Go to ${id.replace('section-', '')} section`);
    if (i === 0) d.classList.add('is-active');
    d.addEventListener('click', () => goToSection(i));
    indicator.appendChild(d);
    return d;
  });
  document.body.appendChild(indicator);

  // ── Build hero "scroll to explore" hint (bouncing arrow)
  // Only shown while the user is still at the very top of the hero section.
  let scrollHint = null;
  if (heroSection) {
    scrollHint = document.createElement('div');
    scrollHint.className = 'scroll-hint';
    scrollHint.innerHTML = `
      <span class="scroll-hint__arrow" aria-hidden="true">&#8595;</span>
    `;
    heroSection.appendChild(scrollHint);
    setTimeout(() => scrollHint.classList.add('is-visible'), 900);
  }

  // We hook into the scroll-driver progress to show/hide sections
  // Also manage z-index so the entering section always sits on top
  const cinematicSection = document.getElementById('section-cinematic');

  // Current card index within the Featured Work section, and a lock so a
  // new wheel gesture can't interrupt an in-flight card transition.
  let cinematicIndex = 0;
  let isCinematicSnapping = false;

  let lastProgress = 0;
  ScrollTrigger.create({
    trigger: '#scroll-driver',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      const previousProgress = lastProgress;
      lastProgress = p;

      // Hide the scroll hint as soon as the user starts scrolling away
      if (scrollHint) {
        scrollHint.classList.toggle('is-visible', p < 0.015);
      }

      sectionMap.forEach(({ id, enter, leave }, idx) => {
        const el = document.getElementById(id);
        if (!el) return;
        const visible = p >= enter && p <= leave;
        el.style.zIndex = visible ? 20 + idx : 10 + idx;
        if (visible && !el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
          // Reset the card index whenever the section is (re-)entered —
          // from the top if scrolling down, from the last card if scrolling up.
          if (id === 'section-cinematic') {
            const grid = document.getElementById('cinematic-grid');
            const count = grid ? grid.children.length : 1;
            cinematicIndex = p >= previousProgress ? 0 : Math.max(0, count - 1);
          }
        } else if (!visible && el.classList.contains('is-visible')) {
          el.classList.remove('is-visible');
        }
        // Sync indicator dot
        dots[idx].classList.toggle('is-active', visible);
      });

      // Drive cinematic section's scrollTop from GSAP progress.
      // 15% dead zones at both entry and exit keep the first/last cards pinned
      // even if the user's flick overshoots the section boundary.
      if (cinematicSection) {
        const rawP = Math.max(0, Math.min(1, (p - CINEMATIC_ENTER) / (CINEMATIC_LEAVE - CINEMATIC_ENTER)));
        let localP;
        if      (rawP < CINEMATIC_DEAD)     localP = 0;
        else if (rawP > 1 - CINEMATIC_DEAD) localP = 1;
        else                                localP = (rawP - CINEMATIC_DEAD) / (1 - CINEMATIC_DEAD * 2);
        const maxScroll = cinematicSection.scrollHeight - cinematicSection.clientHeight;
        if (maxScroll > 0) cinematicSection.scrollTop = maxScroll * localP;
      }
    },
  });

  // ── Paginate the Featured Work section one card per scroll gesture.
  // Converts a target card index into the page-scroll position that drives
  // it (inverting the dead-zone remap above), then tweens the window there.
  function goToCinematicCard(index) {
    if (!cinematicSection) return;

    const grid = document.getElementById('cinematic-grid');
    const cards = grid ? Array.from(grid.children) : [];
    if (!cards.length) return;

    const clampedIndex = Math.max(0, Math.min(cards.length - 1, index));
    const maxScroll = cinematicSection.scrollHeight - cinematicSection.clientHeight;
    const targetLocalP = maxScroll > 0
      ? Math.max(0, Math.min(1, cards[clampedIndex].offsetTop / maxScroll))
      : 0;

    const targetRawP = CINEMATIC_DEAD + targetLocalP * (1 - CINEMATIC_DEAD * 2);
    const targetP    = CINEMATIC_ENTER + targetRawP * (CINEMATIC_LEAVE - CINEMATIC_ENTER);

    const scrollDriver  = document.getElementById('scroll-driver');
    const maxPageScroll = scrollDriver.offsetHeight - window.innerHeight;
    if (maxPageScroll <= 0) return;
    const targetY = targetP * maxPageScroll;

    cinematicIndex = clampedIndex;
    isCinematicSnapping = true;

    gsap.to(window, {
      scrollTo: { y: targetY },
      duration: 0.6,
      ease: 'power2.inOut',
      overwrite: 'auto',
      onComplete: () => { isCinematicSnapping = false; },
    });
  }

  // ── Click-to-navigate section indicator dots. Jumps straight to the
  // target section's page-scroll position, just past its entry point so it
  // reads as fully "arrived" instead of sitting right on the fade boundary.
  function goToSection(index) {
    const target = sectionMap[index];
    if (!target) return;

    const scrollDriver  = document.getElementById('scroll-driver');
    const maxPageScroll = scrollDriver.offsetHeight - window.innerHeight;
    if (maxPageScroll <= 0) return;

    let targetP;
    if (target.id === 'section-cinematic') {
      // Land exactly on the first card, just past the entry dead zone.
      targetP = CINEMATIC_ENTER + CINEMATIC_DEAD * (CINEMATIC_LEAVE - CINEMATIC_ENTER) + 0.002;
      cinematicIndex = 0;
      isCinematicSnapping = true;
    } else {
      targetP = Math.min(target.leave, target.enter + 0.01);
      const el = document.getElementById(target.id);
      if (el) el.scrollTop = 0; // start at the top of the section's own grid
    }

    gsap.to(window, {
      scrollTo: { y: targetP * maxPageScroll },
      duration: 0.8,
      ease: 'power2.inOut',
      overwrite: 'auto',
      onComplete: () => { isCinematicSnapping = false; },
    });
  }

  // ── Wheel interceptor — capture at window so we always fire first.
  // We always call preventDefault() to stop native page/element scroll, then
  // route the delta ourselves.  This eliminates the race where the browser can
  // batch multiple wheel events and overshoot the section boundary before our
  // handler has a chance to react.
  window.addEventListener('wheel', (e) => {
    e.preventDefault();

    const active = document.querySelector('.scene-section.is-visible');

    // Featured Work: one wheel gesture = one card, paginated like the
    // section-to-section navigation instead of continuous free scroll.
    if (active && active.id === 'section-cinematic') {
      if (isCinematicSnapping) return; // ignore input mid-transition

      const grid  = document.getElementById('cinematic-grid');
      const cards = grid ? Array.from(grid.children) : [];
      const goingDown = e.deltaY > 0;

      const atFirst = cinematicIndex <= 0;
      const atLast  = cinematicIndex >= cards.length - 1;

      if (cards.length < 2) {
        window.scrollBy({ top: e.deltaY * SCROLL_SPEED, behavior: 'instant' });
        return;
      }

      if ((goingDown && atLast) || (!goingDown && atFirst)) {
        // At the section boundary — hand off to page scroll so GSAP
        // advances into the next/previous section.
        window.scrollBy({ top: e.deltaY * SCROLL_SPEED, behavior: 'instant' });
        return;
      }

      goToCinematicCard(cinematicIndex + (goingDown ? 1 : -1));
      return;
    }

    // Between sections: drive page scroll so GSAP advances.
    if (!active) {
      window.scrollBy({ top: e.deltaY * SCROLL_SPEED, behavior: 'instant' });
      return;
    }

    const atTop    = active.scrollTop <= 0;
    const atBottom = active.scrollTop + active.clientHeight >= active.scrollHeight - 2;
    const goingDown = e.deltaY > 0;
    const goingUp   = e.deltaY < 0;

    if ((goingDown && !atBottom) || (goingUp && !atTop)) {
      // Section still has room — scroll it internally, at the faster pace.
      active.scrollTop += e.deltaY * INTERNAL_SCROLL_SPEED;
    } else {
      // At a boundary — advance GSAP via page scroll.
      window.scrollBy({ top: e.deltaY * SCROLL_SPEED, behavior: 'instant' });
    }
  }, { passive: false, capture: true });

  // ── Mouse parallax on glass panels
  const panels = document.querySelectorAll('.glass-panel');
  panels.forEach((el, i) => {
    const depth = 0.1 + (i % 3) * 0.08;
    glassEls.push({ el, depth });
  });

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  requestAnimationFrame(tickParallax);
}
