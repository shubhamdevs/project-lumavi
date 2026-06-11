import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Lumavi",
  description: "Learn how Lumavi collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div
      className="min-h-screen antialiased"
      style={{ background: "var(--landing-bg)", color: "var(--landing-text-primary)" }}
    >
      {/* Simple nav */}
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

      {/* Content */}
      <main className="max-w-[720px] mx-auto px-6 pt-32 pb-20">
        <h1 className="font-[var(--font-syne)] text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-[var(--landing-text-muted)] text-sm mb-12">Last updated: June 2026</p>

        <div className="space-y-10 text-[var(--landing-text-secondary)] leading-relaxed">
          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including your name, email address, and organization details when you create an account. We also collect usage data, including features used, assets generated, and interaction patterns to improve our service.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send communications, and develop new features. Your brand assets and generated content are used solely to deliver the Lumavi service and are not shared with third parties for their own purposes.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">3. Data Storage &amp; Security</h2>
            <p>Your data is stored securely on Google Cloud infrastructure with encryption at rest and in transit. We implement industry-standard security measures including access controls, audit logging, and regular security assessments to protect your information.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">4. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. You may also request a copy of your data in a portable format. To exercise these rights, contact us at privacy@lumavi.ai.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@lumavi.ai" className="text-[var(--landing-accent-primary)] hover:underline">privacy@lumavi.ai</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
