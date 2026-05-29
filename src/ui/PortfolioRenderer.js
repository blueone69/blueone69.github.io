import { cinematicItems, standardItems, archivalItems } from '../data/portfolio.js';
import { openLightbox } from './Lightbox.js';

// ─── Helpers ──────────────────────────────────────────────────────────────

function buildMediaEl(mediaObj) {
  if (mediaObj.type === 'video') {
    const vid = document.createElement('video');
    vid.src = mediaObj.src;
    vid.autoplay = true;
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.controls = false;
    vid.className = 'data-capsule__media';
    return vid;
  }
  if (mediaObj.type === 'iframe') {
    // p5.js editor blocks cross-origin embedding — show a stylised placeholder;
    // clicking the card opens the lightbox which tries the iframe + external link.
    const placeholder = document.createElement('div');
    placeholder.className = 'data-capsule__iframe-placeholder data-capsule__media';
    const icon = document.createElement('span');
    icon.className = 'iframe-placeholder__icon';
    icon.textContent = '▶';
    const label = document.createElement('span');
    label.className = 'iframe-placeholder__label';
    label.textContent = 'INTERACTIVE SKETCH';
    placeholder.appendChild(icon);
    placeholder.appendChild(label);
    return placeholder;
  }
  // image
  const img = document.createElement('img');
  img.src = mediaObj.src;
  img.alt = mediaObj.alt || '';
  img.loading = 'lazy';
  img.className = 'data-capsule__media';
  return img;
}

function buildTags(tools) {
  const wrap = document.createElement('div');
  wrap.className = 'data-capsule__tags';
  tools.forEach(t => {
    const span = document.createElement('span');
    span.className = 'data-capsule__tag';
    span.textContent = t;
    wrap.appendChild(span);
  });
  return wrap;
}

// Corner accents helper
function addCorners(el) {
  ['tl','tr','bl','br'].forEach(pos => {
    const c = document.createElement('span');
    c.className = `corner-accent corner-accent--${pos}`;
    el.appendChild(c);
  });
}

// ─── Build a data capsule card ─────────────────────────────────────────────

function buildCapsule(item, isCinematic = false) {
  const card = document.createElement('article');
  card.className = `glass-panel glass-panel--capsule${isCinematic ? ' glass-panel--cinematic' : ''}`;
  card.dataset.id = item.id;

  // Media section — show first media item (or first two for multi-image cinematic)
  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'data-capsule__media-wrap';

  if (isCinematic && item.media.length > 1) {
    if (item.media.length === 3) {
      // First image full width, next two side-by-side
      mediaWrap.appendChild(buildMediaEl(item.media[0]));
      const row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;';
      row.appendChild(buildMediaEl(item.media[1]));
      row.appendChild(buildMediaEl(item.media[2]));
      mediaWrap.appendChild(row);
    } else {
      // Side-by-side layout for dual images
      mediaWrap.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;';
      item.media.slice(0, 2).forEach(m => mediaWrap.appendChild(buildMediaEl(m)));
    }
  } else {
    mediaWrap.appendChild(buildMediaEl(item.media[0]));
  }

  card.appendChild(mediaWrap);

  // Info section
  const info = document.createElement('div');
  info.className = 'data-capsule__info';

  const title = document.createElement('h3');
  title.className = 'data-capsule__title';
  title.textContent = item.title;
  info.appendChild(title);

  const caption = document.createElement('p');
  caption.className = 'data-capsule__caption';
  caption.textContent = item.caption;
  info.appendChild(caption);

  info.appendChild(buildTags(item.tools));

  const year = document.createElement('div');
  year.className = 'data-capsule__year holo-label--dim';
  year.textContent = `// ${item.year}`;
  info.appendChild(year);

  card.appendChild(info);

  // Corner accents on cinematic items
  if (isCinematic) addCorners(card);

  // Scanlines on all capsules
  card.classList.add('scanlines');

  // Open lightbox on click
  card.addEventListener('click', () => openLightbox(item));

  return card;
}

// ─── Build an archival memory shard ───────────────────────────────────────

const SHARD_ROTATIONS = [-2.5, 1.2, -1.8, 2.1, -0.8, 1.6, -2.2, 0.9];

function buildShard(item, index) {
  const rotation = SHARD_ROTATIONS[index % SHARD_ROTATIONS.length];

  const card = document.createElement('article');
  card.className = 'glass-panel glass-panel--shard';
  card.style.setProperty('--shard-rotation', `${rotation}deg`);
  card.dataset.id = item.id;

  // Archived badge
  const badge = document.createElement('span');
  badge.className = 'archived-badge';
  badge.textContent = 'ARCHIVED';
  card.appendChild(badge);

  // Media
  card.appendChild(buildMediaEl(item.media[0]));

  // Minimal info
  const info = document.createElement('div');
  info.className = 'data-capsule__info';
  info.style.padding = '0.6rem 0.8rem';

  const title = document.createElement('p');
  title.className = 'data-capsule__caption';
  title.style.fontSize = '0.72rem';
  title.textContent = item.title;
  info.appendChild(title);

  const tools = document.createElement('div');
  tools.className = 'data-capsule__year holo-label--dim';
  tools.textContent = `${item.tools.join(' · ')} // ${item.year}`;
  info.appendChild(tools);

  card.appendChild(info);

  // Open lightbox on click
  card.addEventListener('click', () => openLightbox(item));

  return card;
}

// ─── Main entry: inject all items ─────────────────────────────────────────

export function renderPortfolio() {
  const cinematicGrid = document.getElementById('cinematic-grid');
  const portfolioGrid = document.getElementById('portfolio-grid');
  const archivalGrid  = document.getElementById('archival-grid');

  if (cinematicGrid) {
    cinematicItems.forEach(item => {
      cinematicGrid.appendChild(buildCapsule(item, true));
    });
  }

  if (portfolioGrid) {
    standardItems.forEach(item => {
      portfolioGrid.appendChild(buildCapsule(item, false));
    });
  }

  if (archivalGrid) {
    archivalItems.forEach((item, i) => {
      archivalGrid.appendChild(buildShard(item, i));
    });
  }
}
