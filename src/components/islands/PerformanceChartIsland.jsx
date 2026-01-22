import { useEffect, useRef } from "preact/hooks";
import data from "../../lib/data/performance_series.json";
import { mountPerformanceChart } from "../../lib/widgets/performanceChart.js";

export default function PerformanceChartIsland() {
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!widgetRef.current) return;

    const el = widgetRef.current;
    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
        mountPerformanceChart(el, data);
        });
    });

    return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
    };
    }, []);

  return (
    <section
      ref={widgetRef}
      class="ccm-widget"
      data-ccm-widget="performance-chart"
      aria-label="Performance context"
    >
      <div class="ccm-widget-header">
        <div>
          <h3 class="ccm-widget-title" data-ccm-title>Performance Context</h3>
          <p class="ccm-widget-subtitle" data-ccm-subtitle>As of June 2024.</p>
        </div>

        <div class="ccm-mode" data-ccm-mode aria-label="Chart mode">
          <button type="button" data-mode="indexed" aria-pressed="true">
            Growth of $100
          </button>
          <button type="button" data-mode="annual" aria-pressed="false">
            Annual returns
          </button>
        </div>
      </div>

      <div class="ccm-widget-grid">
        <div>
          <div class="ccm-viz" data-ccm-viz>
</div>
          <div class="ccm-legend" data-ccm-legend aria-label="Series selection"></div>
        </div>

        <aside class="ccm-panel" aria-label="Methodology">
          <h4>How to read this</h4>
          <p class="ccm-panel-muted">
            This chart is intended to provide context for return patterns. Short periods can differ materially from long-term expectations,
            and outcomes depend on market conditions.
          </p>
          <p class="ccm-panel-label">Methodology</p>
          <p class="ccm-panel-muted">
            Growth-of-$100 is compounded from the return series shown. The display is only as accurate as the underlying series.
            Please verify values against official materials prior to external use.
          </p>
          <p class="ccm-panel-label">Disclosure</p>
          <p class="ccm-panel-muted">
            Past performance is not indicative of future results. For informational purposes only.
          </p>
        </aside>
      </div>

      <span data-ccm-error class="ccm-sr-only"></span>
    </section>
  );
}
