export function ProblemSection() {
  return (
    <section className="py-32 px-gutter bg-surface">
      <div className="max-w-container-max mx-auto">
        <div className="max-w-3xl mb-16">
          <h2 className="font-headline-h1 text-headline-h1-mobile md:text-headline-h1 text-on-background mb-6">Marketing teams move fast.<br/>Their tools don&apos;t.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Traditional asset creation creates bottlenecks. Lumavi removes them, scaling your brand&apos;s visual output without sacrificing quality.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Speed */}
          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 text-primary-container">
              <span className="material-symbols-outlined text-[28px]">bolt</span>
            </div>
            <h3 className="font-headline-h2 text-[24px] text-on-background mb-3">Speed</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">From brief to final asset in seconds, not weeks. Accelerate your campaign launches and iterative testing.</p>
          </div>
          {/* Cost */}
          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 text-secondary">
              <span className="material-symbols-outlined text-[28px]">payments</span>
            </div>
            <h3 className="font-headline-h2 text-[24px] text-on-background mb-3">Cost</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Reduce reliance on expensive agency retainers and stock subscriptions. Produce infinite variations at a fraction of the cost.</p>
          </div>
          {/* Consistency */}
          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 text-tertiary-container">
              <span className="material-symbols-outlined text-[28px]">architecture</span>
            </div>
            <h3 className="font-headline-h2 text-[24px] text-on-background mb-3">Consistency</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Lock in your visual identity. Every generated asset adheres strictly to your brand guidelines, typography, and color palette.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
