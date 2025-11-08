import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  onClick?: () => void
  href?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ onClick, href, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-9 h-9',
    xl: 'w-10 h-10'
  }

  // Icon sizes multiplied by 3 for high-DPI mobile displays (Retina screens)
  // This prevents fuzziness on mobile devices with 2x-3x pixel density
  const iconSizes = {
    sm: 60,   // 20 * 3
    md: 72,   // 24 * 3
    lg: 84,   // 28 * 3
    xl: 96    // 32 * 3
  }

  const logoContent = (
    <div className={`${sizeClasses[size]} rounded-full bg-primary-350 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}>
      <Image
        src="/mily_logo.svg"
        alt="Mily Logo"
        width={iconSizes[size]}
        height={iconSizes[size]}
        className="object-contain"
      />
    </div>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="bg-transparent border-none p-0"
        aria-label="Mily Home"
      >
        {logoContent}
      </button>
    )
  }

  if (href) {
    return (
      <Link href={href} aria-label="Mily Home">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
