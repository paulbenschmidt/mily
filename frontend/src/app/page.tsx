'use client'

import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { MarketingHeader } from "@/components/MarketingHeader"
import { MarketingFooter } from "@/components/MarketingFooter"

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

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
              <button className="w-full rounded-lg bg-brand px-8 py-4 text-base font-medium text-white transition-all hover:bg-brand/90 hover:shadow-lg sm:w-auto flex items-center gap-2">
                Start your timeline
                <svg className="h-6 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="border-t border-border px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left: Text content */}
            <div>
              <h2 className="font-serif text-3xl font-medium text-foreground lg:text-5xl">
                See it in action
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
                See how Mily helps you capture and reflect on life&apos;s moments
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/demo">
                  <button className="w-full rounded-lg bg-brand px-8 py-4 text-base font-medium text-white transition-all hover:bg-brand/90 hover:shadow-lg sm:w-auto">
                    Explore the Demo
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="w-full rounded-lg border-2 border-border bg-white px-8 py-4 text-base font-medium text-foreground transition-all hover:bg-muted/50 sm:w-auto">
                    Create Your Timeline
                  </button>
                </Link>
              </div>
            </div>

            {/* Right: Visual preview */}
            <div className="rounded-2xl border border-border bg-muted/20 p-8 lg:p-12">
              <div className="space-y-6">
                {/* Timeline preview illustration */}
                <div className="flex items-start gap-4">
                  <div className="relative flex w-4 flex-col items-center">
                    <div className="h-4 w-4 rounded-full bg-brand" />
                    <div className="h-16 w-0.5 bg-border" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="h-5 w-40 rounded bg-muted-subtle" />
                    <div className="mt-2 h-3 w-full rounded bg-muted" />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="relative flex w-4 flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-muted-subtle" />
                    <div className="h-16 w-0.5 bg-border" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="h-5 w-32 rounded bg-muted-subtle" />
                    <div className="mt-2 h-3 w-4/5 rounded bg-muted" />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="relative flex w-4 flex-col items-center">
                    <div className="h-4 w-4 rounded-full bg-brand" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="h-5 w-48 rounded bg-muted-subtle" />
                    <div className="mt-2 h-3 w-full rounded bg-muted-subtle-2" />
                  </div>
                </div>
              </div>
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
            Your story matters. Every moment has shaped who you are. <br/>Mily helps you see the bigger picture and share
            it with people who matter.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/signup">
              <button className="rounded-lg bg-brand px-8 py-4 text-base font-medium text-white transition-all hover:bg-brand/90 hover:shadow-lg flex items-center gap-2">
                Begin reflecting
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
