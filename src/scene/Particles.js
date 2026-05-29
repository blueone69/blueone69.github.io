import * as THREE from 'three';

const PARTICLE_COUNT = 4000;

const vertexShader = /* glsl */`
  attribute float aSeed;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uSize;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    // Individual drift per particle using seed
    float seed = aSeed;
    float speed = 0.08 + seed * 0.12;
    float drift = sin(uTime * speed + seed * 6.2831) * 1.2;
    float driftZ = cos(uTime * speed * 0.7 + seed * 3.14) * 0.6;

    // Cycle length 24 units. seed * 24 randomises starting phase.
    float cycleLen = 24.0;
    float cyclePos = mod(uTime * (0.04 + seed * 0.06) + seed * cycleLen, cycleLen);

    vec3 pos = position;
    pos.x += drift * 0.5;
    // Y is driven entirely by the cycle in absolute world space (-14 → +10).
    // This guarantees the hard wrap only fires when cyclePos wraps 24→0,
    // exactly when cycleFade is already 0 — so the teleport is never visible.
    pos.y  = cyclePos - 14.0;
    pos.z += driftZ;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Distance-based size attenuation
    float dist = -mvPos.z;
    gl_PointSize = uSize * (300.0 / dist);

    // Fade near camera and far away
    vAlpha = smoothstep(0.0, 2.0, dist) * smoothstep(30.0, 10.0, dist);
    vAlpha *= 0.4 + seed * 0.6;

    // Fade in over first 4 units of cycle, fade out over last 4 — completely
    // hides the wrap since alpha = 0 exactly when cyclePos resets to 0.
    float cycleFade = smoothstep(0.0, 4.0, cyclePos) * smoothstep(cycleLen, cycleLen - 4.0, cyclePos);
    vAlpha *= cycleFade;
  }
`;

const fragmentShader = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Soft circular point
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float dist = dot(uv, uv);
    if (dist > 1.0) discard;

    float alpha = (1.0 - dist) * vAlpha;
    // Bloom core: bright center
    float core = pow(1.0 - dist, 3.0) * 0.8;
    vec3 col = mix(vColor, vec3(1.0), core);

    gl_FragColor = vec4(col, alpha);
  }
`;

let particleMesh;

export function initParticles(scene) {
  const geo = new THREE.BufferGeometry();

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const seeds = new Float32Array(PARTICLE_COUNT);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  const cyanColor = new THREE.Color(0x00d4ff);
  const violetColor = new THREE.Color(0x7b00ff);
  const magentaColor = new THREE.Color(0xff0080);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spread particles through the whole scene volume.
    // Y is shifted +4 so particles cover the top of the hero viewport.
    positions[i * 3]     = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 24 + 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

    seeds[i] = Math.random();

    // Weighted towards cyan, some violet, rare magenta
    const r = Math.random();
    let col;
    if (r < 0.55) col = cyanColor;
    else if (r < 0.88) col = violetColor;
    else col = magentaColor;

    // Add slight random brightness variation
    const brightness = 0.6 + Math.random() * 0.4;
    colors[i * 3]     = col.r * brightness;
    colors[i * 3 + 1] = col.g * brightness;
    colors[i * 3 + 2] = col.b * brightness;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 2.5 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: false,
  });

  particleMesh = new THREE.Points(geo, mat);
  scene.add(particleMesh);
}

export function updateParticles(elapsed) {
  if (!particleMesh) return;
  particleMesh.material.uniforms.uTime.value = elapsed;
}
