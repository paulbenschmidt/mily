const EyeIcon = () => (
  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {/* Front person */}
    <circle cx="9" cy="7" r="3" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    {/* Back person */}
    <circle cx="17" cy="7" r="3" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21v-2a4 4 0 00-3-3.87" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const props = [
  {
    icon: EyeIcon,
    title: "Gain perspective",
    description: "See the full arc of your life in one view. Realize how far you've come and what truly matters.",
  },
  {
    icon: UsersIcon,
    title: "Deepen connections",
    description: "Share your timeline with loved ones. Let others see the richness of your experiences before you met.",
  },
  {
    icon: ShieldIcon,
    title: "Private by default",
    description:
      "Your memories are yours. We never sell your data. Export or delete anytime. Privacy features are always free.",
  },
]

export function ValueProps() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            More than a journal. More than photos.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Journals hold your thoughts and photos capture your moments. Mily brings them together on a timeline so you can see the bigger story.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {props.map((prop, i) => (
            <div key={i} className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <prop.icon />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{prop.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{prop.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
