'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { MarketingHeader } from "@/components/MarketingHeader"
import { MarketingFooter } from "@/components/MarketingFooter"

export default function AboutPage() {
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
              About Mily
            </div>
            <h1 className="font-serif text-4xl font-medium text-foreground lg:text-5xl">
              Why Mily Exists
            </h1>
          </div>

          {/* Origin Story */}
          <section className="mb-12">
            <p className="mb-4 leading-relaxed text-muted-foreground lg:text-lg">
              I grew up around the world, living in several countries, so the idea for a timeline project first sparked from wanting to remember my own life better. But as I thought about this, I wondered: <strong className="text-brand">what if there was a better way to learn about the lives of those around us?</strong> Every one of us has countless stories tucked away in memories, at risk of being forgotten.
            </p>
            <p className="leading-relaxed text-muted-foreground lg:text-lg">
              There&apos;s a word for this: <strong className="text-brand">sonder</strong>—the realization that every person, whether friend, acquaintance, or stranger, has a life that is just as complicated, nuanced, and beautiful as one&apos;s own. That&apos;s what Mily is really about: cultivating space to appreciate our lives and the lives of others in ways that honor each person&apos;s experience.
            </p>
          </section>

          {/* What Makes Mily Different */}
          <section className="mb-12 rounded-2xl border border-border bg-muted/20 p-8">
            <h2 className="mb-6 font-serif text-2xl font-medium text-foreground">
              What Makes Mily Different
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              When writing your timeline, you choose what events you want to share with others and who you want to share them with—grandparents sharing stories with grandchildren, couples on dates just getting to know each other, friends learning new and interesting histories about each other. Think of it as sharing old photos in a shoebox rather than maintaining an online presence.
            </p>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              And if you want to focus on reflection without sharing with others, Mily works beautifully that way, too! Your stories belong to you—export them, delete them, share them as you choose. Private by default, never sold to advertisers.
            </p>
          </section>

          {/* About Paul */}
          <section className="mb-12">
            <h2 className="mb-6 font-serif text-2xl font-medium text-foreground">
              A Little More About Me
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground lg:text-lg">
              Through studying psychology and being in therapy, I learned how powerful it is to revisit past events from new perspectives. A little later on, I started learning to code and enjoyed exploring ways to make life easier, simpler, and better with technology. Mily sits at the intersection of both: using technology to help us understand ourselves and connect more deeply with others.
            </p>
            {/* <p className="mb-4 leading-relaxed text-muted-foreground lg:text-lg">
              I eat my veggies, exercise regularly, and sleep a lot—so that I can (hopefully) live a long life filled with many, many, many memories with loved ones.
            </p> */}
            <p className="leading-relaxed text-muted-foreground lg:text-lg">
              I hope that your interactions with Mily leave you with more joy, deeper love, and an even greater desire to make the most of this life. Thanks for joining on the journey. :)
            </p>
          </section>

          {/* What's Next */}
          <section className="mb-12 rounded-2xl border-2 border-brand/20 bg-brand/5 p-8">
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              What&apos;s Next
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Mily is just getting started. I&apos;m continuing to work on features that make it even easier to capture meaningful moments and share them with the people you care about. If you have thoughts, feedback, or just want to say hello, I&apos;d love to hear from you!
            </p>
            <div className="mt-6 flex flex-col items-center text-center">
              <div>
                <p className="font-medium text-foreground">Paul</p>
                <a href="mailto:paul@mily.bio" className="text-brand hover:underline">
                  paul@mily.bio
                </a>
              </div>
              <Image
                src="/self_portrait.jpeg"
                alt="Paul"
                width={350}
                height={350}
                className="mt-6 border-2 border-border rounded-lg"
              />
            </div>
          </section>

          {/* CTA */}
          <div className="text-center">
            <p className="mb-6 text-muted-foreground">
              Ready to start your timeline?
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
