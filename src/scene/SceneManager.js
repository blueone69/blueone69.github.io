import * as THREE from 'three';

let renderer, scene, camera, clock;
let loopCallback = null;
let isPaused = false;
let isTabHidden = false;
let isLightboxOpen = false;

function syncLoopState() {
  if (!renderer || !loopCallback) return;
  const shouldPause = isTabHidden || isLightboxOpen;
  if (shouldPause && !isPaused) {
    isPaused = true;
    renderer.setAnimationLoop(null);
  } else if (!shouldPause && isPaused) {
    isPaused = false;
    clock.getDelta(); // reset delta so resuming doesn't jump
    renderer.setAnimationLoop(tick);
  }
}

function tick() {
  const delta = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.getElapsedTime();
  loopCallback(delta, elapsed);
}

function init(canvas) {
  // Renderer (EffectComposer handles offscreen passes, so main canvas MSAA is unnecessary)
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x00162e, 0.035);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.5, 9);
  camera.lookAt(0, 0.5, 0);

  // Clock
  clock = new THREE.Clock();

  // Resize & visibility handlers
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', () => {
    isTabHidden = document.hidden;
    syncLoopState();
  });
  window.addEventListener('lightbox:open', () => {
    isLightboxOpen = true;
    syncLoopState();
  });
  window.addEventListener('lightbox:close', () => {
    isLightboxOpen = false;
    syncLoopState();
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(callback) {
  loopCallback = callback;
  isPaused = false;
  if (!isTabHidden && !isLightboxOpen) {
    renderer.setAnimationLoop(tick);
  }
}

function stopLoop() {
  isPaused = true;
  renderer.setAnimationLoop(null);
}

export { init, animate, stopLoop, renderer, scene, camera, clock };
export function getRenderer() { return renderer; }
export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getClock() { return clock; }
