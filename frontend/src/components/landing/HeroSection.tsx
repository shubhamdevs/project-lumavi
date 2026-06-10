import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-[921px] flex items-center justify-center overflow-hidden py-24 px-gutter">
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30">
        <div className="w-full h-full object-cover" id="animated-svg-ANIMATION_2" style={{ display: 'block' }}>
          <svg fill="none" height="100%" viewBox="0 0 200 200" width="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            {/* Logomark Center */}
            <circle cx="100" cy="100" fill="#3B2FCF" r="12"></circle>
            {/* Pulse Rings */}
            <circle cx="100" cy="100" opacity="0" r="12" stroke="#3B2FCF" strokeWidth="2">
              <animate attributeName="r" dur="1.8s" from="12" repeatCount="indefinite" to="80"></animate>
              <animate attributeName="opacity" dur="1.8s" repeatCount="indefinite" values="0.4;0"></animate>
              <animate attributeName="stroke-opacity" dur="1.8s" repeatCount="indefinite" values="0.4;0"></animate>
            </circle>
            <circle cx="100" cy="100" opacity="0" r="12" stroke="#3B2FCF" strokeWidth="2">
              <animate attributeName="r" begin="0.3s" dur="1.8s" from="12" repeatCount="indefinite" to="80"></animate>
              <animate attributeName="opacity" begin="0.3s" dur="1.8s" repeatCount="indefinite" values="0.4;0"></animate>
              <animate attributeName="stroke-opacity" begin="0.3s" dur="1.8s" repeatCount="indefinite" values="0.4;0"></animate>
            </circle>
            <circle cx="100" cy="100" opacity="0" r="12" stroke="#3B2FCF" strokeWidth="2">
              <animate attributeName="r" begin="0.6s" dur="1.8s" from="12" repeatCount="indefinite" to="80"></animate>
              <animate attributeName="opacity" begin="0.6s" dur="1.8s" repeatCount="indefinite" values="0.4;0"></animate>
              <animate attributeName="stroke-opacity" begin="0.6s" dur="1.8s" repeatCount="indefinite" values="0.4;0"></animate>
            </circle>
          </svg>
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 mb-8">
          <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
          <span className="font-label-mono text-label-mono text-on-surface-variant">Lumavi AI Engine 2.0 is live</span>
        </div>
        <h1 className="font-display-hero text-display-hero text-on-background mb-6 leading-tight tracking-tight">
          Your brand. Every asset.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Always.</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
          Generate on-brand images and videos in seconds. Lumavi learns your unique visual identity to create production-ready assets that never miss the mark.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-button-text text-button-text px-8 py-4 rounded-xl glow-hover transition-all duration-300 active:scale-95 w-full sm:w-auto hover:-translate-y-1 shadow-lg shadow-primary-container/20" href="/register">
            Generate your first image — free
            <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
          </Link>
          <a className="inline-flex items-center justify-center bg-surface text-on-surface border border-outline-variant/50 font-button-text text-button-text px-8 py-4 rounded-xl hover:bg-surface-container-low transition-all duration-300 active:scale-95 w-full sm:w-auto" href="#platform">
            <span className="material-symbols-outlined mr-2 text-[20px]">play_circle</span>
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}
