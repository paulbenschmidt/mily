'use client'

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { MarketingHeader } from "@/components/MarketingHeader"
import { MarketingFooter } from "@/components/MarketingFooter"

export default function ContactPage() {
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
              Contact
            </div>
            <h1 className="font-serif text-4xl font-medium text-foreground lg:text-5xl">
              Get in touch
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              I&#x27;d love to hear from you! Whether you have questions about Mily, feedback on how to make it better, or just want to say hello, don&#x27;t hesitate to reach out.
            </p>
          </div>

          {/* Contact Options */}
          <div className="space-y-8 mb-12">
            {/* Email */}
            <section className="rounded-2xl border border-border bg-muted/20 p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                  <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="mb-2 font-serif text-xl font-medium text-foreground">
                    Email
                  </h2>
                  <p className="mb-3 text-muted-foreground">
                    Send me an email—I&#x27;ll get back to you within a day or two
                  </p>
                  <a
                    href="mailto:paul@mily.bio"
                    className="text-brand hover:underline"
                  >
                    paul@mily.bio
                  </a>
                </div>
              </div>
            </section>

            {/* Support */}
            {/* <section className="rounded-2xl border border-border bg-muted/20 p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                  <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="mb-2 font-serif text-xl font-medium text-foreground">
                    Support
                  </h2>
                  <p className="mb-3 text-muted-foreground">
                    Need help with your account or have technical questions?
                  </p>
                  <a
                    href="mailto:support@mily.bio"
                    className="text-brand hover:underline"
                  >
                    support@mily.bio
                  </a>
                </div>
              </div>
            </section> */}

            {/* Feedback */}
            {/* <section className="rounded-2xl border border-border bg-muted/20 p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                  <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="mb-2 font-serif text-xl font-medium text-foreground">
                    Feedback
                  </h2>
                  <p className="mb-3 text-muted-foreground">
                    Have ideas for new features or suggestions for improvement?
                  </p>
                  <a
                    href="mailto:feedback@mily.bio"
                    className="text-brand hover:underline"
                  >
                    feedback@mily.bio
                  </a>
                </div>
              </div>
            </section> */}
          </div>

          {/* FAQ Note */}
          {/* <section className="mb-12 rounded-2xl border-2 border-brand/20 bg-brand/5 p-8">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Before you reach out
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Looking for quick answers? Check out our FAQ section (coming soon) for common questions about using Mily, managing your timeline, privacy settings, and more.
            </p>
          </section> */}

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
