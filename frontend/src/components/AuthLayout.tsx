import { ReactNode } from 'react'
import { Logo } from './Logo'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <div className="absolute top-6 left-6">
        <Logo href="/" size="lg" />
      </div>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}
