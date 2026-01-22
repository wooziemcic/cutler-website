import { useEffect, useRef } from "preact/hooks";
import data from "../../lib/data/community_bank_lifecycle.json";
import { mountBankLifecycle } from "../../lib/widgets/bankLifecycle.js";

export default function BankLifecycleIsland() {
  const widgetRef = useRef(null);

 useEffect(() => {
    if (!widgetRef.current) return;

    // Wait for layout to settle so width/height are non-zero
    const el = widgetRef.current;
    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
        mountBankLifecycle(el, data);
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
      data-ccm-widget="bank-lifecycle"
      aria-label="Community bank lifecycle"
    >
      <div class="ccm-widget-header">
        <div>
          <h3 class="ccm-widget-title" data-ccm-title>
            Community Bank Lifecycle (Illustrative)
          </h3>
          <p class="ccm-widget-subtitle" data-ccm-subtitle>
            Illustrative framework.
          </p>
        </div>
      </div>

<div class="ccm-widget-grid">
    <div
        class="ccm-viz"
        data-ccm-viz
        aria-label="Lifecycle track"
    >
        <div class="ccm-life-track" data-ccm-track></div>
    </div>

    <aside class="ccm-panel" data-ccm-panel aria-live="polite"></aside>
    </div>

      <span data-ccm-error class="ccm-sr-only"></span>
    </section>
  );
}
