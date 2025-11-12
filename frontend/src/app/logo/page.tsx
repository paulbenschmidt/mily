import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mily Logo',
  description: 'Official Mily logo',
}

export default function LogoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="flex flex-col items-center gap-8">
        <div className="w-64 h-64 rounded-full bg-primary-350 flex items-center justify-center">
          <Image
            src="/mily_logo.svg"
            alt="Mily Logo"
            width={256}
            height={256}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-medium text-neutral-800">Mily</h1>
      </div>
    </div>
  )
}
