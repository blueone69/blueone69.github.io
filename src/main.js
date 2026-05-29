/**
 * main.js — entry point
 *
 * 1. Feature-detect WebGL / device capability
 * 2. If low-end → CSS fallback mode
 * 3. If capable → boot full Three.js WebGL pipeline
 * 4. Build all UI (always runs, regardless of WebGL)
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Prevent the browser restoring the previous scroll position on load/refresh.
// Must run before GSAP/ScrollTrigger reads the scroll offset.
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ─── UI modules (always loaded) ───────────────────────────────────────────
import { buildHeroCard }                from './ui/HeroCard.js';
import { renderPortfolio }               from './ui/PortfolioRenderer.js';
import { initScrollAnimations }          from './ui/ScrollAnimations.js';

gsap.registerPlugin(ScrollTrigger);

// ─── Capability detection ─────────────────────────────────────────────────

function detectLowEnd() {
  // No WebGL support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return true;

  // Mobile or low hardware concurrency
  const isMobile  = window.matchMedia('(max-width: 768px)').matches;
  const isLowCPU  = (navigator.hardwareConcurrency || 4) <= 2;

  return isMobile || isLowCPU;
}

// ─── Boot WebGL pipeline ──────────────────────────────────────────────────

async function bootWebGL(canvas) {
  // Dynamic imports so they don't parse if we're in fallback
  const [
    { init: initScene, animate, getRenderer, getScene, getCamera },
    { initEnvironment, updateEnvironment },
    { initParticles, updateParticles },
    { initPostProcessing, renderComposer, resizeComposer },
    { initCameraPath, updateCameraPath },
  ] = await Promise.all([
    import('./scene/SceneManager.js'),
    import('./scene/Environment.js'),
    import('./scene/Particles.js'),
    import('./scene/PostProcessing.js'),
    import('./scene/CameraPath.js'),
  ]);

  initScene(canvas);

  const renderer = getRenderer();
  const scene    = getScene();
  const camera   = getCamera();

  initEnvironment(scene);
  initParticles(scene);
  initPostProcessing(renderer, scene, camera);
  initCameraPath(camera);

  // Resize handler for post-processing
  window.addEventListener('resize', () => {
    resizeComposer(window.innerWidth, window.innerHeight);
  });

  // Render loop
  animate((delta, elapsed) => {
    updateEnvironment(elapsed);
    updateParticles(elapsed);
    updateCameraPath(camera);
    renderComposer(delta);
  });
}

// ─── Main initialisation ──────────────────────────────────────────────────

async function main() {
  const isLowEnd = detectLowEnd();
  const canvas   = document.getElementById('webgl-canvas');

  if (isLowEnd) {
    // ── CSS fallback mode
    document.body.classList.add('css-fallback');
  } else {
    // ── Full WebGL mode
    try {
      await bootWebGL(canvas);
    } catch (err) {
      console.warn('[Portfolio] WebGL boot failed, falling back to CSS mode.', err);
      document.body.classList.add('css-fallback');
    }
  }

  // ── Build UI (always)
  buildHeroCard(document.getElementById('section-hero'));
  renderPortfolio();
  initScrollAnimations(isLowEnd);
}

main();
