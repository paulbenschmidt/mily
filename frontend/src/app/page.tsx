'use client'

import { Button } from "@/components/ui/Button"
import Link from "next/link"
import Image from "next/image"
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
                <stop offset="0%" style={{ stopColor: '#c7d2fe', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#a5b4fc', stopOpacity: 0.2 }} />
              </linearGradient>
              <linearGradient id="wave-gradient-4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#e0e7ff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#c7d2fe', stopOpacity: 0.7 }} />
              </linearGradient>
              <linearGradient id="wave-gradient-5" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#eef2ff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#e0e7ff', stopOpacity: 0.4 }} />
              </linearGradient>
              <linearGradient id="wave-gradient-6" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.7 }} />
              </linearGradient>
            </defs>

            {/* First wave - starts higher, curves upward to top right */}
            <path
              d="M0,350 C200,330 350,310 550,280 C750,250 950,200 1150,130 C1280,80 1380,40 1440,10 L1440,800 L0,800 Z"
              fill="url(#wave-gradient-1)"
            />

            {/* Second wave - starts from middle, gentle upward curve */}
            <path
              d="M0,460 C200,440 340,400 540,375 C780,345 1020,330 1240,340 C1350,345 1410,350 1440,355 L1440,800 L0,800 Z"
              fill="url(#wave-gradient-2)"
            />

            {/* Third wave - starts lower, organic upward curve with gentler right descent */}
            <path
              d="M0,520 C280,490 420,450 640,430 C900,405 1140,420 1320,460 C1390,480 1425,505 1440,525 L1440,800 L0,800 Z"
              fill="url(#wave-gradient-3)"
            />

            {/* Fourth wave - reversed color, upside-down U shape */}
            <path
              d="M0,560 C200,560 400,560 640,560 C880,560 1100,580 1280,630 C1360,655 1410,685 1440,710 L1440,800 L0,800 Z"
              fill="url(#wave-gradient-4)"
            />

            {/* Fifth wave - lighter reversed color, upside-down U shape */}
            <path
              d="M0,630 C200,630 400,630 640,630 C880,630 1100,645 1280,685 C1360,705 1410,730 1440,755 L1440,800 L0,800 Z"
              fill="url(#wave-gradient-5)"
            />

            {/* Sixth wave - background color, upside-down U shape */}
            <path
              d="M0,680 C200,680 400,680 640,680 C880,680 1100,690 1280,720 C1360,735 1410,755 1440,775 L1440,800 L0,800 Z"
              fill="url(#wave-gradient-6)"
            />
          </svg>
        </div>

        <div className="mx-auto max-w-6xl text-center relative z-10 mt-24 lg:mt-32">
          {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Build your personal timeline
          </div> */}
          <h1 className="font-serif text-5xl font-medium leading-tight tracking-tight text-foreground text-balance lg:text-6xl">
            Build your personal timeline
          </h1>
          {/* <p className="mx-auto mt-3 max-w-2xl text-xl leading-relaxed text-secondary-700 lg:text-3xl">
            Rediscover your life.
          </p> */}
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <button className="w-full rounded-lg bg-brand px-8 py-4 text-base font-medium text-white transition-all hover:bg-brand/90 hover:shadow-lg sm:w-auto flex items-center gap-2">
                Start for Free
                <svg className="h-6 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>

          {/* Timeline Screenshot */}
          <div className="mt-16 lg:mt-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 to-purple-400/20 rounded-lg blur-xl transform translate-y-4"></div>
              <Image
                src="/timeline_example.png"
                alt="Mily timeline example showing life events"
                width={1200}
                height={800}
                className="relative rounded-lg shadow-2xl border border-border"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="border-t border-border px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
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
      <section id="about" className="border-t border-border px-8 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-medium text-foreground lg:text-4xl">
            Life is richer when we remember
          </h2>
          <p className="mt-6 px-4 leading-relaxed text-muted-foreground lg:text-lg lg:px-0">
            Your story matters. Every moment has shaped who you are. <br/>Mily helps you see the bigger picture and share
            it with people who matter.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/signup">
              <button className="rounded-lg bg-brand px-8 py-4 text-base font-medium text-white transition-all hover:bg-brand/90 hover:shadow-lg flex items-center gap-2">
                Start Your Timeline
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
