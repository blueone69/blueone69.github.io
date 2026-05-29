/**
 * HeroCard — builds the holographic data card injected into #section-hero
 * Also builds the contact card for #section-contact
 */

const SYSTEM_LINES = [
  { label: 'STATUS',    value: 'ONLINE' },
  { label: 'ROLE',      value: '3D GAME ARTIST / DESIGNER' },
  { label: 'LOCATION',  value: 'SWEDEN' },
  { label: 'SPEC',      value: 'MODELING · ENV · VR · UI' },
  { label: 'ENGINE',    value: 'UNREAL · BLENDER · UNITY · MAYA · SUBSTANCE PAINTER' },
];

const NAV_LINKS = [
  { label: 'Itch.io',    href: 'https://prilen.itch.io',                       icon: '⬡', external: true },
  { label: 'Mini-Game',  href: '/start.html',                                  icon: '▶' },
  { label: 'Behance',    href: 'https://www.behance.net/felixholm4/projects',   icon: '◈', external: true },
  { label: 'Sketchfab',  href: 'https://sketchfab.com/Felix.Holm',             icon: '◉', external: true },
];

// ─── Typewriter effect ────────────────────────────────────────────────────

function typewrite(el, text, speed = 55) {
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.appendChild(cursor);

  let i = 0;
  const tick = () => {
    if (i < text.length) {
      cursor.insertAdjacentText('beforebegin', text[i]);
      i++;
      setTimeout(tick, speed + Math.random() * 25);
    }
    // cursor stays blinking after finish
  };
  setTimeout(tick, 900); // delay before start
}

// ─── Build hero card DOM ──────────────────────────────────────────────────

export function buildHeroCard(container) {
  const card = document.createElement('div');
  card.className = 'glass-panel glass-panel--hero holo-flicker scanlines';
  card.setAttribute('role', 'banner');

  // Corner accents
  ['tl','tr','bl','br'].forEach(pos => {
    const c = document.createElement('span');
    c.className = `corner-accent corner-accent--${pos}`;
    card.appendChild(c);
  });

  // System label
  const sysLabel = document.createElement('div');
  sysLabel.className = 'holo-label';
  sysLabel.textContent = 'PORTFOLIO.SYS v2.0 — INITIALISED';
  sysLabel.style.marginBottom = '1.2rem';
  card.appendChild(sysLabel);

  // Name
  const name = document.createElement('h1');
  name.className = 'hero-name';
  typewrite(name, 'Felix Holm');
  card.appendChild(name);

  // Subtitle
  const sub = document.createElement('p');
  sub.className = 'hero-subtitle';
  sub.textContent = '3D Game Artist  ·  Designer  ·  Creator';
  sub.style.marginBottom = '1.8rem';
  card.appendChild(sub);

  // Separator
  const sep = document.createElement('div');
  sep.style.cssText = 'height:1px;background:linear-gradient(90deg,rgba(0,212,255,0.5),transparent);margin-bottom:1.4rem;';
  card.appendChild(sep);

  // System lines (key-value data readout)
  const lineWrap = document.createElement('div');
  lineWrap.style.cssText = 'display:flex;flex-direction:column;gap:0.45rem;';
  SYSTEM_LINES.forEach(({ label, value }) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:1rem;align-items:baseline;';

    const lbl = document.createElement('span');
    lbl.className = 'holo-label';
    lbl.style.minWidth = '90px';
    lbl.textContent = label + ' ::';

    const val = document.createElement('span');
    val.style.cssText = 'font-size:0.78rem;color:var(--clr-text);letter-spacing:0.06em;';
    val.textContent = value;

    row.appendChild(lbl);
    row.appendChild(val);
    lineWrap.appendChild(row);
  });
  card.appendChild(lineWrap);

  // ── Links separator
  const linkSep = document.createElement('div');
  linkSep.style.cssText = 'height:1px;background:linear-gradient(90deg,rgba(0,212,255,0.45),transparent);margin:1.4rem 0 1rem;';
  card.appendChild(linkSep);

  // ── Nav buttons row
  const linksWrap = document.createElement('div');
  linksWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;pointer-events:auto;';
  NAV_LINKS.forEach(({ label, href, icon, external }) => {
    const a = document.createElement('a');
    a.className = 'nav-btn';
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    a.innerHTML = `<span style="margin-right:.4em;opacity:.7">${icon}</span>${label}`;
    linksWrap.appendChild(a);
  });
  card.appendChild(linksWrap);

  // ── Contact email
  const emailSep = document.createElement('div');
  emailSep.style.cssText = 'height:1px;background:linear-gradient(90deg,rgba(0,212,255,0.25),transparent);margin-bottom:0.8rem;';
  card.appendChild(emailSep);

  const emailLink = document.createElement('a');
  emailLink.href = 'mailto:felix.holm.1989@gmail.com';
  emailLink.className = 'holo-text';
  emailLink.style.cssText = 'font-size:0.78rem;letter-spacing:0.08em;pointer-events:auto;display:block;';
  emailLink.textContent = 'felix.holm.1989@gmail.com';
  card.appendChild(emailLink);

  container.appendChild(card);
}

// ─── Build contact card ───────────────────────────────────────────────────

export function buildContactCard(container) {
  const card = document.createElement('div');
  card.className = 'glass-panel contact-card scanlines';
  card.style.padding = 'var(--space-lg) var(--space-xl)';

  const label = document.createElement('div');
  label.className = 'holo-label';
  label.style.marginBottom = '1rem';
  label.textContent = ':: SIGNAL DETECTED — ESTABLISH CONTACT ::';
  card.appendChild(label);

  const email = document.createElement('a');
  email.href = 'mailto:felix.holm.1989@gmail.com';
  email.className = 'hero-name holo-text';
  email.style.fontSize = 'clamp(1rem, 2.5vw, 1.6rem)';
  email.style.display = 'block';
  email.style.marginBottom = '1.2rem';
  email.textContent = 'felix.holm.1989@gmail.com';
  card.appendChild(email);

  // Corner accents
  ['tl','tr','bl','br'].forEach(pos => {
    const c = document.createElement('span');
    c.className = `corner-accent corner-accent--${pos}`;
    card.appendChild(c);
  });

  container.appendChild(card);
}
