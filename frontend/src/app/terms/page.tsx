'use client'

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { MarketingHeader } from "@/components/MarketingHeader"
import { MarketingFooter } from "@/components/MarketingFooter"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      {/* Main Content */}
      <main className="px-6 pt-32 pb-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Last updated: November 2025
            </div>
            <h1 className="font-serif text-4xl font-medium text-foreground lg:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              By using Mily, you agree to these terms. We&#x27;ve written them to be clear and fair.
            </p>
          </div>

          {/* Using Mily */}
          <section className="mb-10">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Using Mily
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Mily is a personal timeline application that helps you record, reflect on, and share life events. To use Mily, you must:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>Be at least 13 years old</li>
                <li>Provide accurate information when creating your account</li>
                <li>Keep your password secure and confidential</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
              </ul>
            </div>
          </section>

          {/* Your Content */}
          <section className="mb-10">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Your content
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">You own your content.</strong> The timeline events, notes, photos, and reflections you create on Mily belong to you. We don&apos;t claim any ownership over your content.
              </p>
              <p>
                By using Mily, you grant us permission to store and display your content as necessary to provide the service. This includes:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>Storing your timeline data on our servers</li>
                <li>Displaying your content to you and people you choose to share with</li>
                <li>Creating backups to protect your data</li>
              </ul>
              <p>
                You can export or delete your content at any time. When you delete content, we&apos;ll remove it from our active systems, though backup copies may persist for a reasonable period.
              </p>
            </div>
          </section>

          {/* Sharing & Privacy */}
          <section className="mb-10">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Sharing & privacy
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Your timeline is <strong className="text-foreground">private by default</strong>. You control who can see your content through privacy settings on individual events and timeline sharing features.
              </p>
              <p>
                When you share your timeline with others:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>Only events you&apos;ve marked as shareable will be visible</li>
                <li>You can revoke access at any time</li>
                <li>Shared viewers cannot edit or export your content</li>
              </ul>
              <p>
                See our <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link> for more details on how we protect your data.
              </p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="mb-10">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Acceptable use
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Mily is designed for personal reflection and authentic connection. Please don&apos;t:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>Share content that violates others&apos; privacy or rights</li>
                <li>Use the service to harass, abuse, or harm others</li>
                <li>Attempt to access other users&apos; accounts or data</li>
                <li>Use automated tools to scrape or collect data from Mily</li>
                <li>Upload malicious code or attempt to disrupt the service</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </div>
          </section>

          {/* Service Availability */}
          <section className="mb-10">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Service availability
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We work hard to keep Mily available and reliable, but we can&apos;t guarantee uninterrupted service. We may:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>Perform maintenance that temporarily affects availability</li>
                <li>Update or modify features to improve the service</li>
                <li>Discontinue features with reasonable notice</li>
              </ul>
              <p>
                We&apos;ll always give you the ability to export your data before making significant changes.
              </p>
            </div>
          </section>

          {/* Paid Features */}
          <section className="mb-10">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Paid features
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Mily offers optional paid features like additional storage, photo uploads, and themes. If you purchase these:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>Payments are processed securely through our payment provider</li>
                <li>Subscriptions renew automatically unless you cancel</li>
                <li>You can cancel anytime; you&apos;ll retain access through the end of your billing period</li>
                <li>Refunds at our discretion</li>
              </ul>
              <p>
                <strong className="text-foreground">Core privacy features are always free.</strong> We&apos;ll never put privacy controls behind a paywall.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-10">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Limitation of liability
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Mily is provided &quot;as is&quot; without warranties of any kind. We&apos;re not liable for:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>Loss of data (though we work hard to prevent this)</li>
                <li>Service interruptions or errors</li>
                <li>Indirect or consequential damages from using the service</li>
              </ul>
              <p>
                We recommend regularly exporting your timeline as a backup.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Changes to these terms
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We may update these terms from time to time. If we make significant changes, we&apos;ll notify you via email or through the app. Continued use of Mily after changes means you accept the updated terms.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12 rounded-2xl border border-border bg-muted/20 p-8">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Questions?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these terms, please <Link href="/contact" className="text-brand hover:underline">contact us</Link>. We&apos;re here to help.
            </p>
          </section>

          {/* CTA */}
          <div className="text-center">
            <p className="mb-6 text-muted-foreground">
              Ready to start your timeline?
            </p>
            <Link href="/signup">
              <Button size="md" className="bg-brand hover:bg-brand-hover text-white rounded-lg px-5 py-2.5 flex items-center gap-2 mx-auto">
                Get started
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
