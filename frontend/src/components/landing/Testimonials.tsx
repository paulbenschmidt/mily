const testimonials = [
  {
    quote:
      "I showed my daughter my timeline and she finally understood why I made certain choices in my 30s. It opened up conversations we'd never had.",
    author: "Sarah M.",
    role: "Mother of two, 52",
  },
  {
    quote: "Looking at 15 years laid out visually, I realized how much I'd accomplished. I needed that perspective.",
    author: "David K.",
    role: "Career changer, 41",
  },
  {
    quote:
      "My partner and I shared our timelines with each other. Seeing all they went through before we met changed how I see them.",
    author: "Jamie L.",
    role: "Together 3 years",
  },
]

export function Testimonials() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Stories of reflection
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <p className="text-foreground leading-relaxed italic">&quot;{t.quote}&quot;</p>
              <div className="pt-4 border-t border-border">
                <p className="font-medium text-foreground">{t.author}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
