import { el, observeReveal } from './widgetBase.js';

// Planning Process (Wave 2)
// Calm interactive step list + explanation panel (no popups).

function renderPanel(panel, step) {
  const nodes = [
    el('h4', { text: step.label || 'Step' }),
    el('p', { class: 'ccm-panel-muted', text: step.description || '' })
  ];

  if (step.focus) {
    nodes.push(el('p', { class: 'ccm-panel-label', text: 'Focus' }));
    nodes.push(el('p', { class: 'ccm-panel-muted', text: step.focus }));
  }

  if (step.risk) {
    nodes.push(el('p', { class: 'ccm-panel-label', text: 'Watchouts' }));
    nodes.push(el('p', { class: 'ccm-panel-muted', text: step.risk }));
  }

  panel.replaceChildren(...nodes);
}

export function mountPlanningWheel(root, data) {
  if (!root || !data) return;
  observeReveal(root);

  const steps = Array.isArray(data.steps) ? data.steps : [];
  const list = root.querySelector('[data-ccm-list]');
  const panel = root.querySelector('[data-ccm-panel]');
  if (!list || !panel || steps.length === 0) return;

  let active = 0;

  function setActive(i, focusButton = false) {
    active = Math.max(0, Math.min(steps.length - 1, i));
    const buttons = list.querySelectorAll('button');
    buttons.forEach((b, idx) => b.setAttribute('aria-pressed', idx === active ? 'true' : 'false'));
    renderPanel(panel, steps[active]);
    if (focusButton) {
      const btn = buttons[active];
      if (btn) btn.focus({ preventScroll: true });
    }
  }

  const frag = document.createDocumentFragment();
  steps.forEach((s, idx) => {
    const btn = el('button', {
      type: 'button',
      class: 'ccm-step-btn',
      'aria-pressed': 'false'
    }, [
      el('span', { class: 'ccm-step-num', text: String(idx + 1) }),
      el('span', { class: 'ccm-step-label', text: s.label || `Step ${idx + 1}` })
    ]);

    btn.addEventListener('click', () => setActive(idx));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setActive((active + 1) % steps.length, true);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setActive((active - 1 + steps.length) % steps.length, true);
      }
    });

    frag.appendChild(btn);
  });

  list.replaceChildren(frag);
  setActive(0);
}
