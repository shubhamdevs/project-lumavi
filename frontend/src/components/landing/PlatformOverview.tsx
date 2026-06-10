export function PlatformOverview() {
  return (
    <section className="py-32 px-gutter bg-[#0a0f2c] text-white overflow-hidden relative" id="platform">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-container/20 to-transparent pointer-events-none"></div>
      <div className="max-w-container-max mx-auto relative z-10">
        <div className="text-center mb-20">
          <span className="font-label-mono text-label-mono text-secondary-fixed mb-4 block">PLATFORM OVERVIEW</span>
          <h2 className="font-headline-h1 text-headline-h1-mobile md:text-headline-h1 mb-6">The complete creative engine.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Brand Engine */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed/20 flex items-center justify-center mb-6 text-primary-fixed group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">tune</span>
            </div>
            <h3 className="font-headline-h2 text-[20px] mb-2">Brand Engine</h3>
            <p className="font-body-sm text-body-sm text-white/70">Train our AI on your exact brand guidelines, logos, and preferred aesthetic styles.</p>
          </div>
          {/* Image Gen */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed/20 flex items-center justify-center mb-6 text-secondary-fixed group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">image</span>
            </div>
            <h3 className="font-headline-h2 text-[20px] mb-2">Image Gen</h3>
            <p className="font-body-sm text-body-sm text-white/70">Produce high-fidelity, photorealistic or stylized imagery tailored to your campaigns.</p>
          </div>
          {/* Video Gen */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed/20 flex items-center justify-center mb-6 text-tertiary-fixed group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">movie</span>
            </div>
            <h3 className="font-headline-h2 text-[20px] mb-2">Video Gen</h3>
            <p className="font-body-sm text-body-sm text-white/70">Transform static assets or text prompts into dynamic, engaging short-form video content.</p>
          </div>
          {/* Canvas Builder */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed/20 flex items-center justify-center mb-6 text-primary-fixed group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">dashboard_customize</span>
            </div>
            <h3 className="font-headline-h2 text-[20px] mb-2">Canvas Builder</h3>
            <p className="font-body-sm text-body-sm text-white/70">An infinite workspace to ideate, composite, and refine your generated assets collaboratively.</p>
          </div>
          {/* Gallery */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed/20 flex items-center justify-center mb-6 text-secondary-fixed group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">photo_library</span>
            </div>
            <h3 className="font-headline-h2 text-[20px] mb-2">Gallery</h3>
            <p className="font-body-sm text-body-sm text-white/70">A centralized, searchable repository for all your approved, brand-safe generated content.</p>
          </div>
          {/* Publishing */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed/20 flex items-center justify-center mb-6 text-tertiary-fixed group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">send</span>
            </div>
            <h3 className="font-headline-h2 text-[20px] mb-2">Publishing</h3>
            <p className="font-body-sm text-body-sm text-white/70">Export directly to your social channels or CMS in the optimal formats and resolutions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
