import {
  Header,
  HeroSection,
  SocialProof,
  ValueProps,
  HowItWorks,
  Testimonials,
  FinalCTA,
  Footer,
} from "@/components/landing"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <SocialProof />
        <ValueProps />
        <HowItWorks />
        {/* <Testimonials /> */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
