import { useEffect, useRef } from "preact/hooks";

import data from "../../lib/data/allocation_sample.json";
import { mountAllocationDonut } from "../../lib/widgets/allocationDonut.js";

export default function AllocationDonutIsland() {
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!widgetRef.current) return;

    // Mount expects the full widget DOM structure to exist already.
    mountAllocationDonut(widgetRef.current, data);
  }, []);

  return (
    <section
      ref={widgetRef}
      class="ccm-widget"
      data-ccm-widget="allocation-donut"
      aria-label="Illustrative allocation"
    >
      <div class="ccm-widget-header">
        <div>
          <h3 class="ccm-widget-title" data-ccm-title>
            Example Investment Portfolio (Illustrative)
          </h3>
          <p class="ccm-widget-subtitle" data-ccm-subtitle>
            Illustrative allocation shown for discussion and planning context. Actual client portfolios vary.
          </p>
        </div>
      </div>

      <div class="ccm-widget-grid">
        <div>
          <div class="ccm-viz" data-ccm-viz>
            <noscript>
              <p class="muted">
                This illustration requires JavaScript. A static summary is provided below.
              </p>
            </noscript>
          </div>

          <div class="ccm-seg-list" data-ccm-list aria-label="Allocation segments"></div>
        </div>

        <aside class="ccm-panel" data-ccm-panel aria-live="polite"></aside>
      </div>

      <p class="ccm-widget-footer">
        For illustrative purposes only. Actual allocations vary by objectives, constraints, tax considerations, and risk tolerance.
        This material is for informational purposes only and does not constitute investment advice.
        <span data-ccm-error class="ccm-sr-only"></span>
      </p>
    </section>
  );
}
