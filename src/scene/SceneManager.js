import * as THREE from 'three';

let renderer, scene, camera, clock;

function init(canvas) {
  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

  // Resize handler
  window.addEventListener('resize', onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(callback) {
  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    callback(delta, elapsed);
  });
}

function stopLoop() {
  renderer.setAnimationLoop(null);
}

export { init, animate, stopLoop, renderer, scene, camera, clock };
export function getRenderer() { return renderer; }
export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getClock() { return clock; }
