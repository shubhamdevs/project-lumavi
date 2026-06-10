export function ComparisonSection() {
  return (
    <section className="py-24 px-gutter bg-surface-container-lowest border-y border-outline-variant/20" id="solutions">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline-h1 text-headline-h1-mobile md:text-headline-h1 text-on-background mb-4">The Lumavi Difference</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Stop settling for generic stock and hallucinated branding.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Without Lumavi */}
          <div className="rounded-2xl border border-outline-variant/30 bg-surface overflow-hidden group">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
              <span className="font-label-mono text-label-mono text-on-surface-variant">Without Lumavi</span>
              <span className="material-symbols-outlined text-error">close</span>
            </div>
            <div className="p-8 aspect-video relative flex items-center justify-center bg-surface-container-highest/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Generic generated image" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANEUMt7M-9RD-p9IRcUpRWhdJCn3Ts_34zxjyIwVYjGTgGPfhlNugH6z907hDGwEMXvznUlqbs9XhFRSpp3OnV4qoXKKP2irJJfAv9aa8M7Be6dF4ozMattNGmzTNBhdr_dUMAf1fHmRGbqe6pqA-DQvAyXX5vlNwyS9mRx8xCXF50Iux5xnssy_up1FpBQjZ6jOs2GuUVT4k8L-L1vDE_cNpVw_jbm_CwCaKQjfr0xx2PQbbX8TlQNsgXTRz24s6LwO3SGsDahhI" />
              <div className="relative z-10 bg-error-container/90 backdrop-blur text-on-error-container px-4 py-2 rounded-lg font-body-sm text-body-sm font-medium shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Inconsistent style &amp; off-brand colors
              </div>
            </div>
          </div>
          {/* With Lumavi */}
          <div className="rounded-2xl border-2 border-primary-container bg-surface overflow-hidden relative shadow-xl shadow-primary-container/10 group transform transition-transform hover:-translate-y-1">
            <div className="p-4 border-b border-primary-container/20 bg-primary-fixed/30 flex items-center justify-between">
              <span className="font-label-mono text-label-mono text-primary font-bold">With Lumavi</span>
              <span className="material-symbols-outlined text-secondary-container">check_circle</span>
            </div>
            <div className="p-8 aspect-video relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="On-brand generated image" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXPXBqfxFS32wfhKTgWJT8kxNZXOvE7Py3LAUceeK1Ygnfdx93_rpR63CB6SzkKwc0rANmynvIGW6KgNak23ur-zr4Vf8pEL6vravMjsSBnV8NpTJqfebUAkLRwiOddaDJIEP8k-qi3WFbYp1hyChe2yM1inBvwlP7S1vOBhGMer-twagx3Akr4RNPWFJp89H0q06xMonfUy8p-ruJ6GrMMJ37hDok0ZDNruBsG9oPd8BNY97x7HTItKHftw7aYjEi-vkhQs_UxD8" />
              <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur text-on-surface px-3 py-1.5 rounded-lg font-body-sm text-body-sm shadow flex items-center gap-2 border border-outline-variant/30">
                <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                Brand Model: Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
