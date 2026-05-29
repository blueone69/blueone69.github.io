import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    { id: 'section-hero',      enter: 0.00, leave: 0.24 },
    { id: 'section-cinematic', enter: 0.25, leave: 0.49 },
    { id: 'section-portfolio', enter: 0.50, leave: 0.71 },
    { id: 'section-archival',  enter: 0.80, leave: 1.00 },
  ];

  // ── Build bottom progress indicator
  const indicator = document.createElement('div');
  indicator.id = 'section-indicator';
  const dots = sectionMap.map((_, i) => {
    const d = document.createElement('div');
    d.className = 'section-indicator__dot';
    if (i === 0) d.classList.add('is-active');
    indicator.appendChild(d);
    return d;
  });
  document.body.appendChild(indicator);

  // We hook into the scroll-driver progress to show/hide sections
  // Also manage z-index so the entering section always sits on top
  const cinematicSection = document.getElementById('section-cinematic');

  let lastProgress = 0;
  ScrollTrigger.create({
    trigger: '#scroll-driver',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      lastProgress = p;

      sectionMap.forEach(({ id, enter, leave }, idx) => {
        const el = document.getElementById(id);
        if (!el) return;
        const visible = p >= enter && p <= leave;
        el.style.zIndex = visible ? 20 + idx : 10 + idx;
        if (visible && !el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
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
        const ENTER = 0.25, LEAVE = 0.49;
        const DEAD  = 0.15;
        const rawP  = Math.max(0, Math.min(1, (p - ENTER) / (LEAVE - ENTER)));
        let localP;
        if      (rawP < DEAD)        localP = 0;
        else if (rawP > 1 - DEAD)    localP = 1;
        else                         localP = (rawP - DEAD) / (1 - DEAD * 2);
        const maxScroll = cinematicSection.scrollHeight - cinematicSection.clientHeight;
        if (maxScroll > 0) cinematicSection.scrollTop = maxScroll * localP;
      }
    },
  });

  // ── Wheel interceptor — capture at window so we always fire first.
  // We always call preventDefault() to stop native page/element scroll, then
  // route the delta ourselves.  This eliminates the race where the browser can
  // batch multiple wheel events and overshoot the section boundary before our
  // handler has a chance to react.
  window.addEventListener('wheel', (e) => {
    e.preventDefault();

    const active = document.querySelector('.scene-section.is-visible');

    // Between sections or cinematic: drive page scroll so GSAP advances.
    // Cinematic scroll speed is reduced by 50% so the content moves slower.
    if (!active || active.id === 'section-cinematic') {
      const delta = active?.id === 'section-cinematic' ? e.deltaY * 0.5 : e.deltaY;
      window.scrollBy({ top: delta, behavior: 'instant' });
      return;
    }

    const atTop    = active.scrollTop <= 0;
    const atBottom = active.scrollTop + active.clientHeight >= active.scrollHeight - 2;
    const goingDown = e.deltaY > 0;
    const goingUp   = e.deltaY < 0;

    if ((goingDown && !atBottom) || (goingUp && !atTop)) {
      // Section still has room — scroll it internally.
      active.scrollTop += e.deltaY;
    } else {
      // At a boundary — advance GSAP via page scroll.
      window.scrollBy({ top: e.deltaY, behavior: 'instant' });
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
