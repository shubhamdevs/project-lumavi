import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Lumavi",
  description: "The terms and conditions governing your use of the Lumavi platform.",
};

export default function TermsOfServicePage() {
  return (
    <div
      className="min-h-screen antialiased"
      style={{ background: "var(--landing-bg)", color: "var(--landing-text-primary)" }}
    >
      <nav className="fixed top-0 w-full z-50 bg-[#06091a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 max-w-[960px] mx-auto">
          <Link href="/" className="font-[var(--font-syne)] text-xl font-bold text-white">
            Lumavi<span className="text-[var(--landing-accent-primary)] ml-0.5">✦</span>
          </Link>
          <Link href="/" className="text-[var(--landing-text-secondary)] text-sm hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </nav>

      <main className="max-w-[720px] mx-auto px-6 pt-32 pb-20">
        <h1 className="font-[var(--font-syne)] text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-[var(--landing-text-muted)] text-sm mb-12">Last updated: June 2026</p>

        <div className="space-y-10 text-[var(--landing-text-secondary)] leading-relaxed">
          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Lumavi, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform. These terms apply to all users, including visitors, registered users, and organizational accounts.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">2. Account Registration</h2>
            <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">3. Permitted Use</h2>
            <p>Lumavi grants you a limited, non-exclusive, non-transferable license to use the platform in accordance with your subscription plan. You may generate, download, and use content created through the platform for your commercial and personal projects. You retain ownership of your brand assets and original prompts.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">4. Content Ownership</h2>
            <p>You retain all rights to your brand assets, guidelines, and original content uploaded to the platform. Generated content is licensed to you according to your subscription plan. Lumavi does not claim ownership of your generated content.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">5. Billing &amp; Subscriptions</h2>
            <p>Paid subscriptions are billed in advance on a monthly or annual basis. You may cancel your subscription at any time, with cancellation taking effect at the end of the current billing period. Refunds are handled on a case-by-case basis.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">6. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@lumavi.ai" className="text-[var(--landing-accent-primary)] hover:underline">legal@lumavi.ai</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
