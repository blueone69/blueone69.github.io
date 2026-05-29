import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Camera waypoints ──────────────────────────────────────────────────────
//  Each waypoint = { pos: [x,y,z], target: [x,y,z] }
const WAYPOINTS = [
  { pos: [0,    1.5,  9.0], target: [0,   0.5,  0] },  // Hero
  { pos: [1.5,  0.8,  7.0], target: [0.5, 0,    0] },  // Navigation
  { pos: [-1,   0,    5.5], target: [0,   0,   -2] },  // Cinematic
  { pos: [1.2, -0.5,  4.5], target: [0,   0,   -2] },  // Standard
  { pos: [-0.8,-1.2,  6.0], target: [0,   0,    0] },  // Archival
  { pos: [0,   -0.5,  8.0], target: [0,   0,    0] },  // Contact
];

// Build two CatmullRomCurve3 splines: positions + lookAt targets
const posPoints   = WAYPOINTS.map(w => new THREE.Vector3(...w.pos));
const lookPoints  = WAYPOINTS.map(w => new THREE.Vector3(...w.target));

const posCurve    = new THREE.CatmullRomCurve3(posPoints,   false, 'catmullrom', 0.5);
const lookCurve   = new THREE.CatmullRomCurve3(lookPoints,  false, 'catmullrom', 0.5);

// Shared state for smooth lerping
const _targetPos  = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

let scrollProgress = { t: 0 };

export function initCameraPath(camera) {
  // Scrub scroll progress over the invisible #scroll-driver div
  ScrollTrigger.create({
    trigger: '#scroll-driver',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 2,
    onUpdate: (self) => {
      scrollProgress.t = self.progress;
    },
  });


}

// Called every frame from the render loop
export function updateCameraPath(camera, lerpFactor = 0.04) {
  const t = scrollProgress.t;

  posCurve.getPoint(t, _targetPos);
  lookCurve.getPoint(t, _targetLook);

  camera.position.lerp(_targetPos, lerpFactor);

  // Lerp a temporary look-at target then apply
  const currentLook = new THREE.Vector3();
  currentLook.copy(camera.position).add(
    new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
  );
  currentLook.lerp(_targetLook, lerpFactor);
  camera.lookAt(currentLook);
}

// Programmatically fly camera to a specific waypoint index
export function flyToWaypoint(camera, index, duration = 1.8) {
  const t = index / (WAYPOINTS.length - 1);
  gsap.to(scrollProgress, { t, duration, ease: 'power2.inOut' });
}
