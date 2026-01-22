import { el, observeReveal } from './widgetBase.js';

export function mountBankLifecycle(root, data) {
  if (!root || !data) return;
  observeReveal(root);

  const stages = Array.isArray(data.stages) ? data.stages : [];
  if (!stages.length) {
    root.appendChild(el('p', { class: 'ccm-widget-subtitle', text: 'Lifecycle data unavailable.' }));
    return;
  }

  const title = root.querySelector('[data-ccm-title]');
  const subtitle = root.querySelector('[data-ccm-subtitle]');
  if (title && data.title) title.textContent = data.title;
  if (subtitle && data.as_of) subtitle.textContent = `Illustrative framework (as of ${data.as_of})`;

  const track = root.querySelector('[data-ccm-track]');
  const panel = root.querySelector('[data-ccm-panel]');
  if (!track || !panel) return;

  track.innerHTML = '';

  const btns = [];
  stages.forEach((s, idx) => {
    const btn = el('button', {
      type: 'button',
      class: 'ccm-life-node',
      'data-key': s.key || String(idx),
      'aria-pressed': 'false'
    }, [
      el('span', { class: 'ccm-life-dot', 'aria-hidden': 'true' }),
      el('span', { class: 'ccm-life-label', text: s.label })
    ]);
    btn.addEventListener('click', () => setActive(s.key || String(idx)));
    btns.push(btn);
    track.appendChild(btn);
    if (idx < stages.length - 1) {
      track.appendChild(el('span', { class: 'ccm-life-connector', 'aria-hidden': 'true' }));
    }
  });

  function renderPanel(s) {
    panel.innerHTML = '';
    panel.appendChild(el('h4', { text: s.label }));
    if (Array.isArray(s.what_changes) && s.what_changes.length) {
      panel.appendChild(el('p', { class: 'ccm-panel-label', text: 'What changes' }));
      panel.appendChild(el('ul', { class: 'ccm-panel-list' }, s.what_changes.map(x => el('li', { text: x }))));
    }
    if (s.why_it_matters) {
      panel.appendChild(el('p', { class: 'ccm-panel-label', text: 'Why it can matter' }));
      panel.appendChild(el('p', { class: 'ccm-panel-muted', text: s.why_it_matters }));
    }
    if (s.what_can_go_wrong) {
      panel.appendChild(el('p', { class: 'ccm-panel-label', text: 'What can go wrong' }));
      panel.appendChild(el('p', { class: 'ccm-panel-muted', text: s.what_can_go_wrong }));
    }
    if (s.investor_takeaway) {
      panel.appendChild(el('p', { class: 'ccm-panel-label', text: 'Investor takeaway' }));
      panel.appendChild(el('p', { class: 'ccm-panel-muted', text: s.investor_takeaway }));
    }
  }

  function setActive(key) {
    const idx = stages.findIndex(x => (x.key || '') === key);
    const realIdx = idx >= 0 ? idx : 0;
    const s = stages[realIdx];
    btns.forEach((b, i) => {
      b.classList.toggle('is-active', i === realIdx);
      b.setAttribute('aria-pressed', i === realIdx ? 'true' : 'false');
    });
    renderPanel(s);
  }

  // Hover and focus should behave like click (no popups)
  btns.forEach((b) => {
    const key = b.getAttribute('data-key');
    const on = () => setActive(key);
    b.addEventListener('mouseenter', on);
    b.addEventListener('focus', on);
  });

  setActive(stages[0].key || '0');
}
