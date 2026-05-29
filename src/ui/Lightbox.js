/**
 * Lightbox — full-screen media viewer for portfolio / archival items.
 * Opens on card click, closes on backdrop click, scroll, or Escape.
 */

let overlay = null;
let mediaWrap, titleEl, captionEl, tagsEl, yearEl;

function buildDOM() {
  overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.className = 'lightbox';
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-hidden', 'true');

  // ── Backdrop (click to close)
  const backdrop = document.createElement('div');
  backdrop.className = 'lightbox__backdrop';
  backdrop.addEventListener('click', closeLightbox);
  overlay.appendChild(backdrop);

  // ── Panel
  const panel = document.createElement('div');
  panel.className = 'lightbox__panel glass-panel scanlines';

  // Corner accents
  ['tl', 'tr', 'bl', 'br'].forEach(pos => {
    const c = document.createElement('span');
    c.className = `corner-accent corner-accent--${pos}`;
    panel.appendChild(c);
  });

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox__close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeLightbox);
  panel.appendChild(closeBtn);

  // Media area
  mediaWrap = document.createElement('div');
  mediaWrap.className = 'lightbox__media-wrap';
  panel.appendChild(mediaWrap);

  // Info area
  const info = document.createElement('div');
  info.className = 'lightbox__info';

  titleEl = document.createElement('h2');
  titleEl.className = 'lightbox__title holo-text';
  info.appendChild(titleEl);

  captionEl = document.createElement('p');
  captionEl.className = 'lightbox__caption';
  info.appendChild(captionEl);

  tagsEl = document.createElement('div');
  tagsEl.className = 'data-capsule__tags';
  info.appendChild(tagsEl);

  yearEl = document.createElement('div');
  yearEl.className = 'lightbox__year holo-label';
  info.appendChild(yearEl);

  panel.appendChild(info);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Close on scroll anywhere over the overlay
  overlay.addEventListener('wheel', closeLightbox, { passive: true });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
}

export function openLightbox(item) {
  if (!overlay) buildDOM();

  // ── Populate media
  mediaWrap.innerHTML = '';

  if (item.media.length === 1) {
    const m = item.media[0];
    if (m.type === 'video') {
      const vid = document.createElement('video');
      vid.src = m.src;
      vid.className = 'lightbox__media';
      vid.controls = true;
      vid.autoplay = true;
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      mediaWrap.appendChild(vid);
    } else if (m.type === 'iframe') {
      const wrap = document.createElement('div');
      wrap.className = 'lightbox__iframe-wrap';
      const iframe = document.createElement('iframe');
      iframe.src = m.src;
      iframe.title = item.title;
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
      iframe.loading = 'lazy';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
      iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      wrap.appendChild(iframe);
      mediaWrap.appendChild(wrap);
      // Fallback link in case the site blocks cross-origin embedding
      const fallback = document.createElement('a');
      fallback.href = m.src;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.className = 'lightbox__iframe-fallback';
      fallback.textContent = 'Open sketch in new tab →';
      mediaWrap.appendChild(fallback);
    } else {
      const img = document.createElement('img');
      img.src = m.src;
      img.alt = m.alt || item.title;
      img.className = 'lightbox__media';
      mediaWrap.appendChild(img);
      // If this image has an associated interactive sketch, show a link
      if (m.iframe) {
        const link = document.createElement('a');
        link.href = m.iframe;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'lightbox__iframe-fallback';
        link.textContent = 'Open interactive sketch \u2192';
        mediaWrap.appendChild(link);
      }
    }
  } else {
    // Multiple images — gallery grid
    const grid = document.createElement('div');
    grid.className = 'lightbox__gallery';
    item.media.forEach(m => {
      if (m.type === 'image') {
        const img = document.createElement('img');
        img.src = m.src;
        img.alt = m.alt || item.title;
        img.className = 'lightbox__gallery-img';
        grid.appendChild(img);
      }
    });
    mediaWrap.appendChild(grid);
  }

  // ── Populate info
  titleEl.textContent = item.title;
  captionEl.textContent = item.caption;
  tagsEl.innerHTML = item.tools
    .map(t => `<span class="data-capsule__tag">${t}</span>`)
    .join('');
  yearEl.textContent = `// ${item.year}`;

  // ── Open
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-open');
}

export function closeLightbox() {
  if (!overlay || !overlay.classList.contains('is-open')) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  // Pause any playing video
  overlay.querySelectorAll('video').forEach(v => v.pause());
}
