import { el, clamp, observeReveal, prefersReducedMotion } from './widgetBase.js';

function computeIndexed(returns) {
  // returns: [{period, value}] where value is percent return for period
  // Output: [{period, value}] starting at 100
  let level = 100;
  const out = [];
  for (const r of returns) {
    const v = Number(r.value);
    if (!Number.isFinite(v)) continue;
    level = level * (1 + v / 100);
    out.push({ period: r.period, value: level });
  }
  return out;
}

function svgLineChart({ width, height, padding, series }) {
  const w = width, h = height;
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;

  const all = series.flatMap(s => s.data.map(d => d.value));
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = (max - min) || 1;

  function x(i, n) {
    if (n <= 1) return padding + innerW / 2;
    return padding + (i / (n - 1)) * innerW;
  }
  function y(v) {
    return padding + (1 - ((v - min) / span)) * innerH;
  }

  const svg = el('svg', {
    width: "100%",
    height: String(h),
    viewBox: `0 0 ${w} ${h}`,
    preserveAspectRatio: "xMinYMin meet",
    role: "img",
    "aria-label": "...",
  });

  // Axes (minimal)
  svg.appendChild(el('line', { x1: String(padding), y1: String(h - padding), x2: String(w - padding), y2: String(h - padding), stroke: 'rgba(0,0,0,0.18)' }));
  svg.appendChild(el('line', { x1: String(padding), y1: String(padding), x2: String(padding), y2: String(h - padding), stroke: 'rgba(0,0,0,0.18)' }));

  series.forEach((s, idx) => {
    const pts = s.data.map((d, i) => `${x(i, s.data.length)},${y(d.value)}`).join(' ');
    svg.appendChild(el('polyline', {
      points: pts,
      fill: 'none',
      stroke: s.color,
      'stroke-width': '2.25'
    }));
  });
  return svg;
}

function svgAnnualBars({ width, height, padding, series }) {
  const w = width, h = height;
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;

  // assume same periods for all
  const periods = series[0]?.data?.map(d => d.period) || [];
  const allValues = series.flatMap(s => s.data.map(d => Number(d.value))).filter(v => Number.isFinite(v));
  const min = Math.min(0, ...allValues);
  const max = Math.max(0, ...allValues);
  const span = (max - min) || 1;

  function x(i) {
    const n = Math.max(1, periods.length);
    return padding + (i + 0.15) * (innerW / n);
  }
  const barW = (innerW / Math.max(1, periods.length)) * 0.7;

  function y(v) {
    return padding + (1 - ((v - min) / span)) * innerH;
  }
  const y0 = y(0);

  const svg = el('svg', { width: String(w), height: String(h), viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': 'Annual returns chart (illustrative)' });
  svg.appendChild(el('line', { x1: String(padding), y1: String(y0), x2: String(w - padding), y2: String(y0), stroke: 'rgba(0,0,0,0.18)' }));

  // Bars: show first enabled series only (cleaner)
  const s = series[0];
  periods.forEach((p, i) => {
    const v = Number(s.data[i]?.value);
    if (!Number.isFinite(v)) return;
    const yv = y(v);
    const rectY = v >= 0 ? yv : y0;
    const rectH = Math.abs(y0 - yv);
    svg.appendChild(el('rect', {
      x: String(x(i)),
      y: String(rectY),
      width: String(barW),
      height: String(Math.max(0.5, rectH)),
      fill: s.color,
      rx: '2',
      'data-period': p,
      'aria-label': `${p}: ${v.toFixed(1)}%`
    }));
  });

  return svg;
}

export function mountPerformanceChart(root, data) {
  if (!root || !data) return;
  observeReveal(root);

  const title = root.querySelector('[data-ccm-title]');
  const subtitle = root.querySelector('[data-ccm-subtitle]');
  if (title && data.title) title.textContent = data.title;
  if (subtitle && data.as_of) subtitle.textContent = `As of ${data.as_of}`;

  const viz = root.querySelector('[data-ccm-viz]');
  const legend = root.querySelector('[data-ccm-legend]');
  const modeToggle = root.querySelector('[data-ccm-mode]');
  if (!viz || !legend || !modeToggle) return;

  const series = Array.isArray(data.series) ? data.series : [];
  if (!series.length) {
    viz.innerHTML = '<p class="ccm-widget-subtitle">Performance data unavailable.</p>';
    return;
  }

  // Palette: conservative
  const palette = ['#4b2142', '#2f3b4a', '#6b6f76'];
  const normalized = series.map((s, i) => ({
    key: s.key,
    label: s.label,
    type: s.type,
    frequency: s.frequency,
    returns: Array.isArray(s.returns) ? s.returns : [],
    color: palette[i % palette.length]
  }));

  // Default: show first series, allow adding one comparator.
  const enabled = new Set([normalized[0].key]);
  let mode = 'indexed'; // 'indexed' | 'annual'

  function renderLegend() {
    legend.innerHTML = '';
    normalized.forEach((s) => {
      const checked = enabled.has(s.key);
      const btn = el('button', {
        type: 'button',
        class: 'ccm-legend-btn',
        'aria-pressed': checked ? 'true' : 'false'
      }, [
        el('span', { class: 'ccm-swatch', style: `background:${s.color}` }),
        el('span', { class: 'ccm-legend-label', text: s.label })
      ]);
      btn.addEventListener('click', () => {
        if (enabled.has(s.key)) {
          if (enabled.size === 1) return; // keep at least one
          enabled.delete(s.key);
        } else {
          // cap at two series to keep it readable
          if (enabled.size >= 2) {
            // remove the oldest (first) that isn't the core
            const core = normalized[0].key;
            const toRemove = [...enabled].find(k => k !== core) || [...enabled][0];
            enabled.delete(toRemove);
          }
          enabled.add(s.key);
        }
        render();
      });
      legend.appendChild(btn);
    });
  }

  function renderMode() {
    const btnIndexed = modeToggle.querySelector('[data-mode="indexed"]');
    const btnAnnual = modeToggle.querySelector('[data-mode="annual"]');
    if (btnIndexed) btnIndexed.setAttribute('aria-pressed', mode === 'indexed' ? 'true' : 'false');
    if (btnAnnual) btnAnnual.setAttribute('aria-pressed', mode === 'annual' ? 'true' : 'false');
  }

  function render() {
    renderLegend();
    renderMode();
    viz.innerHTML = '';

    const active = normalized.filter(s => enabled.has(s.key));
    const rect = viz.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));   // responsive
    const height = 320;                                     // keep fixed height (institutional, consistent)
    const padding = 36;

    if (mode === 'annual') {
      // Use annual if available; otherwise fall back to indexed.
      const annual = active.find(s => s.frequency === 'annual') ? active.filter(s => s.frequency === 'annual') : [];
      if (!annual.length) {
        mode = 'indexed';
        return render();
      }
      const bars = svgAnnualBars({ width, height, padding, series: annual.map(s => ({ color: s.color, data: s.returns })) });
      if (!prefersReducedMotion()) bars.classList.add('ccm-anim-in');
      viz.appendChild(bars);
    } else {
      // Indexed mode: prefer monthly or annual, whatever exists.
      const idxSeries = active.map(s => ({
        color: s.color,
        data: computeIndexed(s.returns)
      })).filter(s => s.data.length);
      if (!idxSeries.length) {
        viz.innerHTML = '<p class="ccm-widget-subtitle">Performance series incomplete.</p>';
        return;
      }
      const line = svgLineChart({ width, height, padding, series: idxSeries });
      if (!prefersReducedMotion()) line.classList.add('ccm-anim-in');
      viz.appendChild(line);
    }
  }

  modeToggle.addEventListener('click', (e) => {
    const t = e.target.closest('button[data-mode]');
    if (!t) return;
    mode = t.getAttribute('data-mode');
    render();
  });

  render();
}
