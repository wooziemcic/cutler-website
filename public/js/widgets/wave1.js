import { fetchJSON } from './widgetBase.js';
import { mountAllocationDonut } from './allocationDonut.js';
import { mountBankLifecycle } from './bankLifecycle.js';
import { mountPerformanceChart } from './performanceChart.js';

async function safeMount(root, dataUrl, mountFn) {
  if (!root) return;
  try {
    const data = await fetchJSON(dataUrl);
    mountFn(root, data);
  } catch (err) {
    // Fail silently but visibly (institutional reliability)
    console.error(err);
    const msg = root.querySelector('[data-ccm-error]');
    if (msg) msg.textContent = 'This visualization is temporarily unavailable.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const alloc = document.querySelector('[data-ccm-widget="allocation-donut"]');
  const life = document.querySelector('[data-ccm-widget="bank-lifecycle"]');
  const perf = document.querySelector('[data-ccm-widget="performance-chart"]');

  if (alloc) safeMount(alloc, '../data/allocation_sample.json', mountAllocationDonut);
  if (life) safeMount(life, '../data/community_bank_lifecycle.json', mountBankLifecycle);
  if (perf) safeMount(perf, '../data/performance_series.json', mountPerformanceChart);
});
