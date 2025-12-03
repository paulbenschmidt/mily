export function SocialProof() {
  return (
    <section className="py-12 px-6 border-y border-border/50 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-muted border-2 border-background"
                  style={{ backgroundColor: `hsl(${i * 60}, 30%, 80%)` }}
                />
              ))}
            </div>
            {/* <span className="text-sm text-muted-foreground ml-2">
              <span className="font-medium text-foreground">500+</span> timelines created
            </span> */}
          </div>
          {/* <div className="h-4 w-px bg-border hidden md:block" /> */}
          <p className="text-sm text-muted-foreground text-center">
            {/* Trusted by people who want to <span className="text-foreground font-medium">reflect intentionally</span> */}
            Start with just 3–5 big moments. You can fill in the rest over time.
          </p>
        </div>
      </div>
    </section>
  )
}
