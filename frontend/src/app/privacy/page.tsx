'use client'

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { MarketingHeader } from "@/components/MarketingHeader"
import { MarketingFooter } from "@/components/MarketingFooter"

export default function PrivacyPage() {
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
              Your trust matters
            </div>
            <h1 className="font-serif text-4xl font-medium text-foreground lg:text-5xl">
              Privacy & Trust
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Mily exists to create a safe space for reflection and connection. That means your trust is everything.
            </p>
          </div>

          {/* Your Data, Your Control */}
          <section className="mb-12 rounded-2xl border border-border bg-muted/20 p-8">
            <h2 className="mb-6 font-serif text-2xl font-medium text-foreground">
              Your data, your control
            </h2>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  <strong className="text-foreground">Your stories are yours</strong>—export or delete them anytime
                </span>
              </li>
              <li className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  <strong className="text-foreground">Your timeline content and reflections are private by default</strong> and will never be sold to advertisers or data brokers
                </span>
              </li>
              <li className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  We may develop features that let you <strong className="text-foreground">share your timeline with services you trust</strong> (like therapy apps or community platforms), but sharing is always opt-in and under your control
                </span>
              </li>
            </ul>
          </section>

          {/* How We Operate */}
          <section className="mb-12">
            <h2 className="mb-6 font-serif text-2xl font-medium text-foreground">
              How we operate
            </h2>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong className="text-foreground">Privacy features are free for everyone, always</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  We use analytics to improve the app, but <strong className="text-foreground">never mine your content for profit</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  We may share <strong className="text-foreground">anonymized, aggregated insights</strong> with researchers or partners whose work aligns with our mission
                </span>
              </li>
              <li className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  We keep the lights on through <strong className="text-foreground">optional paid features</strong> (storage, photos, themes), not by compromising your privacy
                </span>
              </li>
            </ul>
          </section>

          {/* Our Commitment */}
          <section className="mb-12 rounded-2xl border-2 border-brand/20 bg-brand/5 p-8">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Our commitment
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We&#x27;re building Mily to be sustainable without being extractive. If we ever face a choice between growth and our mission to help people reflect and connect authentically, we choose the mission.
            </p>
          </section>

          {/* CTA */}
          <div className="text-center">
            <p className="mb-6 text-muted-foreground">
              Ready to start your timeline in a space you can trust?
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
