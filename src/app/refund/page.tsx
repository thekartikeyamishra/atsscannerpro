import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Our policy regarding cancellations, refunds, and payments for ATS Scanner Pro.',
  alternates: { canonical: `${SITE_URL}/refund` },
  robots: { index: true, follow: true },
};

export default function RefundPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <span className="badge mb-4 inline-flex">Billing & Compliance</span>
            <h1 className="text-3xl sm:text-4xl font-black font-syne text-white mb-2">
              Refund & Cancellation Policy
            </h1>
            <p className="text-sm text-slate-500">Last updated: October 2, 2026</p>
          </div>

          <div className="text-sm text-slate-400 space-y-6 leading-relaxed">
            <section className="glass-card rounded-xl p-5">
              <h2 className="text-base font-bold text-white mb-2">1. Free Tier Services</h2>
              <p>
                ATS Scanner Pro currently provides free web analysis, keyword evaluation, and deterministic layout formatting without mandatory subscription fees or upfront charges.
              </p>
            </section>

            <section className="glass-card rounded-xl p-5">
              <h2 className="text-base font-bold text-white mb-2">2. Digital Goods & Premium Upgrades</h2>
              <p>
                If you purchase premium scan credits, deep architectural analysis, or enterprise bundle passes through our integrated payment gateways (including Razorpay or PayPal):
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
                <li>Because analysis tokens and AI compute are delivered instantaneously upon request, completed scan executions are non-reversible once server resources have finished running.</li>
                <li>If a processing error occurs on our server (HTTP 500/502) that consumes a paid token without returning an analysis report, full credit restoration or a monetary refund will be processed within 5–7 working days upon verification.</li>
              </ul>
            </section>

            <section className="glass-card rounded-xl p-5">
              <h2 className="text-base font-bold text-white mb-2">3. Dispute Resolution & Contact</h2>
              <p>
                For questions regarding payments, billing discrepancies, or refund escalations, contact:
              </p>
              <p className="mt-2 text-white font-medium">
                Email:{' '}
                <a href="mailto:workmailkartikeya@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                  workmailkartikeya@gmail.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 border-t border-white/[0.06] pt-4">
            <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Return to Scanner Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}