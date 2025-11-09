'use client'

import Link from "next/link"
import { Logo } from "./Logo"

export function MarketingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo href="/" />
          <Link
            href="/"
            className="font-serif text-2xl font-medium text-foreground cursor-pointer"
          >
            Mily
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/demo"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-block"
          >
            Demo
          </Link>
          <Link
            href="/about"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-block"
          >
            About
          </Link>
          <Link
            href="/login"
            className="text-sm text-foreground transition-colors hover:text-muted-foreground"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm text-foreground transition-colors hover:text-muted-foreground"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  )
}
