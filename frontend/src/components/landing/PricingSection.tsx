import Link from 'next/link';

export function PricingSection() {
  return (
    <section className="py-32 px-gutter bg-surface" id="pricing">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-headline-h1 text-headline-h1-mobile md:text-headline-h1 text-on-background mb-4">Simple, transparent pricing.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Start for free, scale when you need to.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col">
            <h3 className="font-headline-h2 text-[24px] text-on-background mb-2">Starter</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display-hero text-[48px] leading-none text-on-background">Free</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-8 pb-8 border-b border-outline-variant/20 flex-grow">Perfect for individuals exploring AI generation.</p>
            <Link className="w-full text-center py-3 px-4 rounded-xl font-button-text text-button-text border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors mb-6" href="/register">Get Started</Link>
            <ul className="space-y-4 font-body-sm text-body-sm text-on-surface">
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">check</span> 50 generations/month</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">check</span> Basic image generation</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">check</span> Standard resolution</li>
            </ul>
          </div>
          {/* Professional */}
          <div className="p-8 rounded-2xl bg-surface border-2 border-primary-container relative shadow-xl shadow-primary-container/10 flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-container text-on-primary-container px-4 py-1 rounded-full font-label-mono text-[10px] uppercase tracking-wider font-bold">Most Popular</div>
            <h3 className="font-headline-h2 text-[24px] text-on-background mb-2">Professional</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display-hero text-[48px] leading-none text-on-background">$29</span>
              <span className="font-body-sm text-on-surface-variant">/mo</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-8 pb-8 border-b border-outline-variant/20 flex-grow">For marketers needing consistent, on-brand assets.</p>
            <Link className="w-full text-center py-3 px-4 rounded-xl font-button-text text-button-text bg-primary-container text-on-primary-container glow-hover transition-all duration-300 active:scale-95 mb-6" href="/register">Start Free Trial</Link>
            <ul className="space-y-4 font-body-sm text-body-sm text-on-surface">
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary-container mt-0.5">check</span> Unlimited image generations</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary-container mt-0.5">check</span> 1 Brand Model training</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary-container mt-0.5">check</span> High-res exports</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary-container mt-0.5">check</span> Basic video generation</li>
            </ul>
          </div>
          {/* Agency */}
          <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col">
            <h3 className="font-headline-h2 text-[24px] text-on-background mb-2">Agency</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display-hero text-[48px] leading-none text-on-background">$99</span>
              <span className="font-body-sm text-on-surface-variant">/mo</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-8 pb-8 border-b border-outline-variant/20 flex-grow">For teams managing multiple brands and high volumes.</p>
            <a className="w-full text-center py-3 px-4 rounded-xl font-button-text text-button-text border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors mb-6" href="mailto:sales@lumavi.ai">Contact Sales</a>
            <ul className="space-y-4 font-body-sm text-body-sm text-on-surface">
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">check</span> Everything in Professional</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">check</span> Unlimited Brand Models</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">check</span> Advanced video generation</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">check</span> Team collaboration tools</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
