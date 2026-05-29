import {
  EffectComposer,
  RenderPass,
  BloomEffect,
  ChromaticAberrationEffect,
  VignetteEffect,
  NoiseEffect,
  EffectPass,
  BlendFunction,
} from 'postprocessing';
import * as THREE from 'three';

let composer;

export function initPostProcessing(renderer, scene, camera) {
  composer = new EffectComposer(renderer);

  // Base render pass
  composer.addPass(new RenderPass(scene, camera));

  // Bloom — neon glow
  const bloom = new BloomEffect({
    blendFunction: BlendFunction.ADD,
    luminanceThreshold: 0.08,
    luminanceSmoothing: 0.25,
    intensity: 1.6,
    radius: 0.85,
    levels: 8,
  });

  // Chromatic aberration — slight sci-fi lens fringing
  const chromaticAberration = new ChromaticAberrationEffect({
    offset: new THREE.Vector2(0.0007, 0.0007),
  });

  // Vignette — dark edges, cinematic
  const vignette = new VignetteEffect({
    eskil: false,
    offset: 0.35,
    darkness: 0.65,
  });

  // Film grain — adds organic texture
  const noise = new NoiseEffect({
    blendFunction: BlendFunction.SOFT_LIGHT,
  });
  noise.blendMode.opacity.value = 0.22;

  composer.addPass(new EffectPass(camera, bloom, chromaticAberration));
  composer.addPass(new EffectPass(camera, vignette, noise));

  return composer;
}

export function resizeComposer(width, height) {
  if (composer) composer.setSize(width, height);
}

export function renderComposer(delta) {
  if (composer) composer.render(delta);
}

export { composer };
