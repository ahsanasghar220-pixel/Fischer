import { Link } from 'react-router-dom'
import { useState } from 'react'
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const footerNavigation = {
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'Service Request', href: '/service-request' },
    { name: 'Track Order', href: '/contact' },
    { name: 'Track Service', href: '/service-request' },
    { name: 'FAQs', href: '/page/faqs' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Experience Centers', href: '/experience' },
    { name: 'Become a Dealer', href: '/become-dealer' },
    { name: 'Find a Dealer', href: '/find-dealer' },
    { name: 'Privacy Policy', href: '/page/privacy-policy' },
    { name: 'Terms & Conditions', href: '/page/terms-conditions' },
  ],
}

const paymentMethods = ['Visa', 'Mastercard', 'JazzCash', 'EasyPaisa', 'COD']

const socials = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1BfM24AMKa/?mibextid=wwXIfr',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/fischerpakistan?igsh=cDdhcnpiZHBvZ2lv',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/923211146642?text=Hello%20Fischer%2C%20I%20need%20assistance',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@fischerpakistan',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/fischerpk/',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@fischerpklhr?_r=1&_t=ZS-93nrx1A2MXE',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
]

function NavColumn({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
        <span className="inline-block w-4 h-px bg-primary-500" />
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((item) => (
          <li key={item.name}>
            <Link
              to={item.href}
              className="group/link flex items-center gap-1.5 text-sm text-dark-400 hover:text-white transition-colors duration-200"
            >
              <ArrowRightIcon className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200 text-primary-500 flex-shrink-0" />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    try {
      await api.post('/api/newsletter/subscribe', { email })
      toast.success('Thank you for subscribing!')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-dark-950 dark:bg-dark-950" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Top accent bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent" />

      {/* Newsletter Section */}
      <div className="bg-primary-600">
        <div className="container-xl py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-xl lg:text-2xl font-bold text-white font-display">
                Stay in the Loop
              </h3>
              <p className="text-primary-100 mt-1 text-sm max-w-sm">
                Exclusive offers, new arrivals, and expert tips — straight to your inbox.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-md gap-2">
              <div className="relative flex-1">
                <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-white/15 border border-white/25
                           rounded-xl text-white placeholder:text-white/50 text-sm
                           focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent
                           transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-3 bg-white hover:bg-white/90
                         text-primary-600 font-semibold rounded-xl text-sm
                         flex items-center gap-2 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="container-xl pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand Column — wider */}
          <div className="sm:col-span-2 lg:col-span-4">
            {/* Logo */}
            <Link to="/" className="inline-block mb-5">
              <img
                src="/images/logo/Fischer-electronics-logo-white.svg"
                alt="Fischer"
                width={794}
                height={450}
                className="h-12 w-auto"
              />
            </Link>

            <p className="text-dark-400 text-sm leading-relaxed max-w-xs mb-6">
              Designed Appliances for Modern Living since 1990.
              ISO 9001:2015 &amp; PSQCA certified manufacturing excellence.
            </p>

            {/* Cert badges */}
            <div className="flex flex-wrap gap-2 mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-700 bg-dark-800/60">
                <span className="text-[11px] font-bold text-primary-400">ISO</span>
                <span className="text-[11px] text-dark-400">9001:2015</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-700 bg-dark-800/60">
                <span className="text-[11px] font-bold text-primary-400">PSQCA</span>
                <span className="text-[11px] text-dark-400">Certified</span>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-2.5">
              <a
                href="tel:+923211146642"
                className="flex items-center gap-2.5 text-dark-400 hover:text-white transition-colors text-sm group"
              >
                <PhoneIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                +92 321 1146642
              </a>
              <a
                href="mailto:marketing@fischerinfo.pk"
                className="flex items-center gap-2.5 text-dark-400 hover:text-white transition-colors text-sm"
              >
                <EnvelopeIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                marketing@fischerinfo.pk
              </a>
              <a
                href="mailto:sales@fischerinfo.pk"
                className="flex items-center gap-2.5 text-dark-400 hover:text-white transition-colors text-sm"
              >
                <EnvelopeIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                sales@fischerinfo.pk
              </a>
              <div className="flex items-center gap-2.5 text-dark-400 text-sm">
                <MapPinIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                Peco Road, Lahore, Pakistan
              </div>
            </div>
          </div>

          {/* Nav: Support */}
          <div className="lg:col-span-2 lg:col-start-6">
            <NavColumn title="Support" links={footerNavigation.support} />
          </div>

          {/* Nav: Company */}
          <div className="lg:col-span-2">
            <NavColumn title="Company" links={footerNavigation.company} />
          </div>

          {/* Social + Payment */}
          <div className="sm:col-span-2 lg:col-span-3 lg:col-start-10">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
              <span className="inline-block w-4 h-px bg-primary-500" />
              Follow Us
            </h4>
            <div className="flex flex-wrap gap-2 mb-8">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-dark-800 border border-dark-700
                           flex items-center justify-center
                           text-dark-400 hover:text-white hover:bg-primary-600 hover:border-primary-500
                           transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <h4 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
              <span className="inline-block w-4 h-px bg-primary-500" />
              We Accept
            </h4>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="px-2.5 py-1 text-[11px] font-medium text-dark-300
                           bg-dark-800 border border-dark-700 rounded-md"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dark-800/80" />

      {/* Bottom Bar */}
      <div className="container-xl py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-dark-500 text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} Fischer Pakistan (Fatima Engineering Works). All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/page/privacy-policy" className="text-dark-500 hover:text-dark-300 text-xs transition-colors">
              Privacy Policy
            </Link>
            <span className="text-dark-700">·</span>
            <Link to="/page/terms-conditions" className="text-dark-500 hover:text-dark-300 text-xs transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
