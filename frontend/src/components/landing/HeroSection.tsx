import Link from "next/link"
import { ProductPreview } from "./ProductPreview"

export function HeroSection() {
  return (
    <section className="min-h-[calc(100vh-8rem)] flex items-center pt-36 lg:pt-20 pb-8 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Column - Copy */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-foreground text-balance">
                Life is a Story.
                See it with Mily.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg text-pretty">
                Mily is your personal visual timeline, helping you see the bigger picture of your life and share it with the people who matter most.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl text-base font-medium hover:bg-primary/90 transition-colors group"
              >
                Start your timeline
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-3.5 rounded-xl text-base font-medium hover:bg-secondary/80 transition-colors border border-border"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                See an example
              </Link>
            </div>

            {/* Trust Signal */}
            <p className="text-sm text-muted-foreground">No credit card required • Your data stays private • Export anytime</p>
          </div>

          {/* Right Column - Product Preview */}
          <div className="relative">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  )
}
