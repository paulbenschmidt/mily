const steps = [
  {
    number: "01",
    title: "Add your life events",
    description:
      "Major milestones, small moments, everything in between. Add notes and photos to capture the full story.",
  },
  {
    number: "02",
    title: "See your timeline unfold",
    description: "Watch your life take shape visually. Bigger events stand out. Patterns emerge. Time gains meaning.",
  },
  {
    number: "03",
    title: "Reflect and share",
    description: "Revisit your journey. Share with family and friends. Deepen understanding of yourself and others.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">How it works</h2>
          <p className="text-lg text-muted-foreground">Simple to start. Meaningful to continue.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="space-y-4">
                <span className="text-sm font-mono text-primary">{step.number}</span>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
