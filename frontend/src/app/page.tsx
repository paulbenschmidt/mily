'use client'

import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { MarketingHeader } from "@/components/MarketingHeader"
import { MarketingFooter } from "@/components/MarketingFooter"

export default function Home() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader showNavLinks />

      {/* Hero Section */}
      <section id="hero" className="relative flex min-h-screen flex-col justify-center px-6 lg:px-8 overflow-hidden bg-white">
        {/* Wave Background */}
<div className="absolute inset-0">
  <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#eef2ff', stopOpacity: 0.5 }} />
        <stop offset="100%" style={{ stopColor: '#e0e7ff', stopOpacity: 0.4 }} />
      </linearGradient>
      <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#e0e7ff', stopOpacity: 0.45 }} />
        <stop offset="100%" style={{ stopColor: '#c7d2fe', stopOpacity: 0.35 }} />
      </linearGradient>
      <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#c7d2fe', stopOpacity: 0.4 }} />
        <stop offset="100%" style={{ stopColor: '#a5b4fc', stopOpacity: 0.3 }} />
      </linearGradient>
    </defs>

    {/* First wave - gentle, starts higher left, smooth gradual curl upward to top right */}
    <path
      d="M0,520 C200,500 350,480 550,450 C750,420 950,370 1150,300 C1280,250 1380,210 1440,180 L1440,800 L0,800 Z"
      fill="url(#wave-gradient-1)"
    />

    {/* Second wave - more pronounced swell, ends center-right slightly below center */}
    <path
      d="M0,640 C200,620 340,580 540,555 C780,525 1020,510 1240,520 C1350,525 1410,530 1440,535 L1440,800 L0,800 Z"
      fill="url(#wave-gradient-2)"
    />

    {/* Third wave - deep, organic curve with dramatic right swell */}
    <path
      d="M0,720 C280,690 420,650 640,630 C900,605 1140,635 1320,710 C1390,745 1425,775 1440,795 L1440,800 L0,800 Z"
      fill="url(#wave-gradient-3)"
    />
  </svg>
</div>

        <div className="mx-auto max-w-4xl text-center relative z-10 mt-12 lg:mt-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Your life, visualized
          </div>
          <h1 className="font-serif text-5xl font-medium leading-tight tracking-tight text-foreground text-balance lg:text-7xl">
            Rediscover your life
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Your life is a story worth sharing. <br /> Remember and celebrate with those who matter.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="md" className="bg-brand hover:bg-brand-hover text-white rounded-lg px-5 py-2.5 flex items-center gap-2">
                Start your timeline
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
            {/* TODO: Add demo link! */}
            {/* <Link href="#demo">
              <Button size="md" variant="outline" className="border-2 border-border rounded-lg px-5 py-2.5 bg-white hover:bg-muted/50">
                See how it works
              </Button>
            </Link> */}
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="mx-auto mt-16 max-w-5xl lg:mt-24">
          <div className="relative pt-8 pb-4">
            {/* Horizontal timeline line */}
            <div className="absolute left-0 right-0 top-10 h-px bg-border" />

            {/* Timeline points */}
            {/* <div className="relative flex justify-between gap-4 px-8 sm:gap-8 lg:gap-12">
              {[
                { year: "1980", label: "Born", type: "major" },
                { year: "2000", label: "College", type: "minor" },
                { year: "2010", label: "Moved", type: "major" },
                { year: "2020", label: "Married", type: "major" },
                { year: currentYear.toString(), label: "Today", type: "minor" },
              ].map((event, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="mb-6 flex h-4 w-4 items-center justify-center">
                    <div
                      className={`rounded-full border-2 border-background ${
                        event.type === "major"
                          ? "h-4 w-4 bg-brand"
                          : event.type === "minor"
                            ? "h-3 w-3 bg-muted-foreground"
                            : "h-2.5 w-2.5 bg-muted"
                      }`}
                    />
                  </div>
                  <div className="mt-2 flex flex-col items-center text-center">
                    <div className="font-mono text-xs text-muted-foreground leading-tight">{event.year}</div>
                    <div className="mt-1 text-sm text-foreground leading-tight whitespace-nowrap">{event.label}</div>
                  </div>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
            {/* Feature 1 */}
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/30">
                <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-3xl font-medium text-foreground lg:text-4xl">Record what matters</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground lg:text-lg">
                Capture Major, Minor, and Memory events from your life. Add notes, photos, and reflections to each
                moment. Your timeline grows with you.
              </p>
            </div>

            {/* Visual placeholder: three dots and some ghost text */}
            <div className="flex items-center justify-center rounded-2xl border border-border bg-muted/20 p-12">
              <div className="w-full max-w-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-3 w-3 rounded-full bg-brand" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted/60" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-20 rounded bg-muted" />
                    <div className="h-3 w-3/4 rounded bg-muted/60" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual placeholder: intersecting lines */}
            <div className="flex items-center justify-center rounded-2xl border border-border bg-muted/20 p-12 lg:order-1">
              <div className="relative h-64 w-full max-w-sm">
                {/* Intersecting lines visualization */}
                <svg className="h-full w-full" viewBox="0 0 300 200">
                  <path
                    d="M 0 100 Q 75 80, 150 100 T 300 100"
                    stroke="var(--brand)"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.6"
                  />
                  <path
                    d="M 0 120 Q 75 140, 150 120 T 300 120"
                    stroke="var(--muted-foreground)"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col justify-center lg:order-2">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/30">
                <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-3xl font-medium text-foreground lg:text-4xl">Share with intention</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground lg:text-lg">
                Deepen relationships by sharing your timeline with friends and family. Control privacy at every level.
                Spark conversations that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-t border-border px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-medium text-foreground lg:text-4xl">
            Life is richer when we remember
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground lg:text-lg">
            Mily helps you appreciate the depth of your experiences and the lives of others. By
            visualizing life spatially, you gain perspective on what truly matters—and discover new dimensions in the
            people you care about.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button size="md" className="bg-brand hover:bg-brand-hover text-white rounded-lg px-5 py-2.5 flex items-center gap-2">
                Begin reflecting
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
