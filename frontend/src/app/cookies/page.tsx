import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Lumavi",
  description: "Learn how Lumavi uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
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
        <h1 className="font-[var(--font-syne)] text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-[var(--landing-text-muted)] text-sm mb-12">Last updated: June 2026</p>

        <div className="space-y-10 text-[var(--landing-text-secondary)] leading-relaxed">
          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and understand how you interact with the platform. Lumavi uses cookies to provide a seamless, personalized experience.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">2. How We Use Cookies</h2>
            <p>We use essential cookies to maintain your authentication session and preferences. We also use analytics cookies to understand how users interact with our platform, helping us improve the user experience. We do not use cookies for third-party advertising.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">3. Types of Cookies</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-[var(--landing-text-primary)]">Essential:</strong> Required for authentication, security, and core platform functionality.</li>
              <li><strong className="text-[var(--landing-text-primary)]">Analytics:</strong> Help us understand usage patterns and improve our service.</li>
              <li><strong className="text-[var(--landing-text-primary)]">Preferences:</strong> Remember your settings such as theme and language.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">4. Managing Cookies</h2>
            <p>You can control and delete cookies through your browser settings. Please note that disabling essential cookies may affect the functionality of the platform. For more information about managing cookies, visit your browser&apos;s help documentation.</p>
          </section>

          <section>
            <h2 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">5. Contact</h2>
            <p>For questions about our use of cookies, contact us at <a href="mailto:privacy@lumavi.ai" className="text-[var(--landing-accent-primary)] hover:underline">privacy@lumavi.ai</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
