/**
 * Navigation — builds the sci-fi holographic nav panel in #section-nav
 */

const NAV_LINKS = [
  { label: 'Play Mini-Game', href: '/start.html',                     icon: '▶' },
  { label: 'Behance — UX & Design', href: 'https://www.behance.net/felixholm4/projects', icon: '◈', external: true },
  { label: 'Sketchfab — 3D Assets', href: 'https://sketchfab.com/Felix.Holm',           icon: '◉', external: true },
  { label: 'Itch.io — Game Builds', href: 'https://prilen.itch.io',                     icon: '⬡', external: true },
];

export function buildNavigation(container) {
  const panel = document.createElement('nav');
  panel.className = 'glass-panel glass-panel--nav';
  panel.setAttribute('aria-label', 'Main navigation');

  NAV_LINKS.forEach(({ label, href, icon, external }) => {
    const a = document.createElement('a');
    a.className = 'nav-btn';
    a.href = href;
    if (external) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    a.innerHTML = `<span style="margin-right:.5em;opacity:.7">${icon}</span>${label}`;
    panel.appendChild(a);
  });

  container.appendChild(panel);
}
