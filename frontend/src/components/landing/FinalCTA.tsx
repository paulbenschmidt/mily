import Link from "next/link"

export function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-6 text-balance">
          Your life is worth remembering.
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Start building your timeline today. It only takes a few minutes to add your first events—and a lifetime to
          appreciate.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-base font-medium hover:bg-primary/90 transition-colors group"
          >
            Start your timeline free
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          No credit card required • Your data stays private • Export anytime
        </p>
      </div>
    </section>
  )
}
