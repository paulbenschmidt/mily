import Link from "next/link"

export function MarketingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="font-serif text-xl font-medium text-foreground">Mily</div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">© {currentYear} Mily. Your stories, your life.</div>
      </div>
    </footer>
  )
}
