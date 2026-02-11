import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

interface MobileTopBarProps {
  phoneNumber: string
  email: string
}

export default function MobileTopBar({ phoneNumber, email }: MobileTopBarProps) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] h-10 bg-primary-500 text-white">
      <div className="container-xl h-full flex items-center justify-between px-4">
        {/* Left: Phone */}
        <a
          href={`tel:${phoneNumber.replace(/\s/g, '')}`}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          aria-label={`Call us at ${phoneNumber}`}
        >
          <PhoneIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{phoneNumber}</span>
        </a>

        {/* Right: Email */}
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          aria-label={`Email us at ${email}`}
        >
          <EnvelopeIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium hidden sm:inline">{email}</span>
        </a>
      </div>
    </div>
  )
}
