import Image from "next/image"

export function MilyLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <Image
      src="/mily_logo_background.svg"
      alt="Mily logo"
      width={32}
      height={32}
      className={className}
    />
  )
}
