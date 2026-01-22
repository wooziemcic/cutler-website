import { el, formatPct, observeReveal, prefersReducedMotion } from './widgetBase.js';

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const startO = polarToCartesian(cx, cy, rOuter, endAngle);
  const endO = polarToCartesian(cx, cy, rOuter, startAngle);
  const startI = polarToCartesian(cx, cy, rInner, startAngle);
  const endI = polarToCartesian(cx, cy, rInner, endAngle);
  const largeArc = (endAngle - startAngle) <= 180 ? '0' : '1';
  return [
    `M ${startO.x} ${startO.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${endO.x} ${endO.y}`,
    `L ${startI.x} ${startI.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${endI.x} ${endI.y}`,
    'Z'
  ].join(' ');
}

export function mountAllocationDonut(root, data) {
  if (!root || !data) return;
  observeReveal(root);

  const segments = Array.isArray(data.segments) ? data.segments.slice() : [];
  if (!segments.length) {
    root.appendChild(el('p', { class: 'ccm-widget-subtitle', text: 'Allocation data unavailable.' }));
    return;
  }

  // Deterministic segment palette (muted, institutional)
  const palette = ['#4b2142', '#2f3b4a', '#6b6f76', '#a3a6ab', '#7a5a6a'];
  const total = segments.reduce((s, x) => s + Number(x.pct || 0), 0) || 100;

  const title = root.querySelector('[data-ccm-title]');
  const subtitle = root.querySelector('[data-ccm-subtitle]');
  if (title && data.title) title.textContent = data.title;
  if (subtitle && data.client_profile) subtitle.textContent = data.client_profile;

  const viz = root.querySelector('[data-ccm-viz]');
  const panel = root.querySelector('[data-ccm-panel]');
  const list = root.querySelector('[data-ccm-list]');
  if (!viz || !panel || !list) return;

  viz.innerHTML = '';
  list.innerHTML = '';

  const w = 340, h = 260;
  const cx = w / 2, cy = h / 2;
  const rOuter = 95, rInner = 56;

  const svg = el('svg', { class: 'ccm-donut', width: String(w), height: String(h), viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': 'Illustrative asset allocation' });
  const g = el('g', { transform: '' });
  svg.appendChild(g);

  // Center label
  const center = el('g', {});
  center.appendChild(el('text', { x: String(cx), y: String(cy - 4), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'ccm-donut-center', text: '100%' }));
  center.appendChild(el('text', { x: String(cx), y: String(cy + 16), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'ccm-donut-center-sub', text: 'Illustrative' }));
  svg.appendChild(center);

  const paths = [];
  let start = 0;
  segments.forEach((seg, idx) => {
    const pct = (Number(seg.pct || 0) / total) * 100;
    const angle = pct * 3.6;
    const end = start + angle;
    const path = el('path', {
      d: arcPath(cx, cy, rOuter, rInner, start, end),
      fill: palette[idx % palette.length],
      'data-key': seg.key || String(idx),
      tabindex: '0',
      role: 'button',
      'aria-label': `${seg.label}: ${formatPct(seg.pct)}`
    });
    g.appendChild(path);
    paths.push(path);
    start = end;
  });

  viz.appendChild(svg);

  function renderPanel(seg, idx) {
    if (!seg) return;
    panel.innerHTML = '';
    const head = el('div', { class: 'ccm-panel-head' }, [
      el('div', { class: 'ccm-swatch', style: `background:${palette[idx % palette.length]}` }),
      el('div', {}, [
        el('h4', { text: `${seg.label} (${formatPct(seg.pct)})` }),
        seg.role ? el('p', { class: 'ccm-panel-muted', text: seg.role }) : null
      ])
    ]);
    panel.appendChild(head);
    if (Array.isArray(seg.typical_holdings) && seg.typical_holdings.length) {
      panel.appendChild(el('p', { class: 'ccm-panel-label', text: 'Typical holdings (illustrative)' }));
      panel.appendChild(el('ul', { class: 'ccm-panel-list' }, seg.typical_holdings.map(x => el('li', { text: x }))));
    }
    if (Array.isArray(seg.primary_risks) && seg.primary_risks.length) {
      panel.appendChild(el('p', { class: 'ccm-panel-label', text: 'Primary risks' }));
      panel.appendChild(el('ul', { class: 'ccm-panel-list' }, seg.primary_risks.map(x => el('li', { text: x }))));
    }
  }

  function setActive(key) {
    const idx = segments.findIndex(s => (s.key || '') === key);
    const seg = segments[idx] || segments[0];
    const realIdx = idx >= 0 ? idx : 0;
    paths.forEach((p, i) => p.classList.toggle('is-active', i === realIdx));
    [...list.querySelectorAll('button')].forEach((b, i) => b.setAttribute('aria-pressed', i === realIdx ? 'true' : 'false'));
    renderPanel(seg, realIdx);
  }

  // Build list controls
  segments.forEach((seg, idx) => {
    const btn = el('button', {
      type: 'button',
      class: 'ccm-seg-btn',
      'data-key': seg.key || String(idx),
      'aria-pressed': 'false'
    }, [
      el('span', { class: 'ccm-swatch', style: `background:${palette[idx % palette.length]}` }),
      el('span', { class: 'ccm-seg-label', text: seg.label }),
      el('span', { class: 'ccm-seg-pct', text: formatPct(seg.pct) })
    ]);
    btn.addEventListener('click', () => setActive(seg.key || String(idx)));
    list.appendChild(btn);
  });

  // Attach events to donut paths
  paths.forEach((p, idx) => {
    const key = segments[idx].key || String(idx);
    const on = () => setActive(key);
    p.addEventListener('mouseenter', on);
    p.addEventListener('focus', on);
    p.addEventListener('click', on);
    p.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); on(); }
    });
  });

  // Default selection
  setActive(segments[0].key || '0');

  // Subtle entrance
  if (!prefersReducedMotion()) {
    svg.classList.add('ccm-anim-in');
  }
}
