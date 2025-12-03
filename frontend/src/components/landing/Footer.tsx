import Link from "next/link"
import { MilyLogo } from "../MilyLogo"

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <MilyLogo className="w-6 h-6" />
              <span className="font-semibold text-foreground">Mily</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              A reflective timeline app helping you understand yourself and deepen relationships.
            </p>
          </div>

          <div className="flex gap-12">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Product</h4>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/demo"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Demo
                </Link>
                <Link
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  How it works
                </Link>
              </nav>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Company</h4>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Mily. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Your data stays private. Always.</p>
        </div>
      </div>
    </footer>
  )
}
