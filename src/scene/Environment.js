import * as THREE from 'three';

export function initEnvironment(scene) {

  // --- Ambient neon light ---
  const ambientLight = new THREE.AmbientLight(0x00162e, 0.8);
  scene.add(ambientLight);

  // Cyan point light (portal-like glow)
  const portalLight = new THREE.PointLight(0x00d4ff, 2.5, 30);
  portalLight.position.set(0, 0, -4);
  scene.add(portalLight);

  // Violet fill light
  const violetLight = new THREE.PointLight(0x7b00ff, 1.8, 25);
  violetLight.position.set(-5, 3, -2);
  scene.add(violetLight);
}

// eslint-disable-next-line no-unused-vars
export function updateEnvironment(_elapsed) {}
