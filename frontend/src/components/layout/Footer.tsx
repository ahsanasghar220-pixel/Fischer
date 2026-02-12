import { Link } from 'react-router-dom'
import { useState } from 'react'
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const footerNavigation = {
  products: [
    { name: 'Water Coolers', href: '/category/water-coolers' },
    { name: 'Geysers & Heaters', href: '/category/geysers-heaters' },
    { name: 'Cooking Ranges', href: '/category/cooking-ranges' },
    { name: 'Built-in Hobs & Hoods', href: '/category/hobs-hoods' },
    { name: 'All Appliances', href: '/shop' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'Service Request', href: '/service-request' },
    { name: 'Track Order', href: '/contact' },
    { name: 'Track Service', href: '/service-request' },
    { name: 'FAQs', href: '/page/faqs' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Experience Centers', href: '/experience' },
    { name: 'Become a Dealer', href: '/become-dealer' },
    { name: 'Find a Dealer', href: '/find-dealer' },
    { name: 'Privacy Policy', href: '/page/privacy-policy' },
    { name: 'Terms & Conditions', href: '/page/terms-conditions' },
  ],
}

const paymentMethods = ['Visa', 'Mastercard', 'JazzCash', 'EasyPaisa', 'COD']

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    try {
      await api.post('/newsletter/subscribe', { email })
      toast.success('Thank you for subscribing!')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-dark-100 dark:bg-dark-900">
      {/* Newsletter Section */}
      <div className="relative overflow-hidden bg-dark-900 dark:bg-dark-950">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-400/10" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-400/5 rounded-full blur-3xl" />

        <div className="relative container-xl py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-bold text-white font-display">
                Stay in the Loop
              </h3>
              <p className="text-dark-400 mt-2 max-w-md">
                Get exclusive offers, new product announcements, and tips delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row w-full max-w-md gap-3 sm:gap-0">
              <div className="relative flex-1">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 sm:py-4 bg-dark-800/50 border border-dark-700
                           rounded-xl sm:rounded-l-xl sm:rounded-r-none text-white placeholder:text-dark-500
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 sm:py-4 bg-primary-500 hover:bg-primary-400
                         text-dark-900 font-semibold rounded-xl sm:rounded-l-none sm:rounded-r-xl
                         flex items-center justify-center gap-2 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  'Subscribing...'
                ) : (
                  <>
                    Subscribe
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-dark-200 dark:border-dark-800">
        <div className="container-xl py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="col-span-1 sm:col-span-2">
              <Link to="/" className="inline-block">
                <img
                  src="/images/logo-dark.webp"
                  alt="Fischer"
                  width={120}
                  height={48}
                  className="h-12 w-auto dark:hidden"
                />
                <img
                  src="/images/logo-light.webp"
                  alt="Fischer"
                  width={120}
                  height={48}
                  className="h-12 w-auto hidden dark:block"
                />
              </Link>
              <p className="mt-6 text-dark-600 dark:text-dark-400 text-sm leading-relaxed max-w-xs">
                Designed Appliances for Modern Living since 1990.
                ISO 9001:2015 & PSQCA certified manufacturing excellence.
              </p>

              {/* Contact Info */}
              <div className="mt-6 space-y-3">
                <a
                  href="tel:+923211146642"
                  className="flex items-center gap-3 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm group"
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-200 dark:bg-dark-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <PhoneIcon className="w-4 h-4" />
                  </div>
                  +92 321 1146642
                </a>
                <a
                  href="mailto:marketing@fischerinfo.pk"
                  className="flex items-center gap-3 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm group"
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-200 dark:bg-dark-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <EnvelopeIcon className="w-4 h-4" />
                  </div>
                  marketing@fischerinfo.pk
                </a>
                <a
                  href="mailto:corporatesales@fischerinfo.pk"
                  className="flex items-center gap-3 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm group"
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-200 dark:bg-dark-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <EnvelopeIcon className="w-4 h-4" />
                  </div>
                  corporatesales@fischerinfo.pk
                </a>
                <a
                  href="mailto:sales@fischerinfo.pk"
                  className="flex items-center gap-3 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm group"
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-200 dark:bg-dark-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <EnvelopeIcon className="w-4 h-4" />
                  </div>
                  sales@fischerinfo.pk
                </a>
                <a
                  href="mailto:fischer.few@gmail.com"
                  className="flex items-center gap-3 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm group"
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-200 dark:bg-dark-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <EnvelopeIcon className="w-4 h-4" />
                  </div>
                  fischer.few@gmail.com
                </a>
                <div className="flex items-center gap-3 text-dark-600 dark:text-dark-400 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-dark-200 dark:bg-dark-800 flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4" />
                  </div>
                  Peco Road, Lahore, Pakistan
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider mb-4">
                Products
              </h4>
              <ul className="space-y-3">
                {footerNavigation.products.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm inline-block"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider mb-4">
                Support
              </h4>
              <ul className="space-y-3">
                {footerNavigation.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm inline-block"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                {footerNavigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm inline-block"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Follow Us */}
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <h4 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider mb-4">
                Follow Us
              </h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.facebook.com/share/1BfM24AMKa/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-800 hover:bg-primary-500/20 flex items-center justify-center
                           text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/fischerpakistan?igsh=cDdhcnpiZHBvZ2lv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-800 hover:bg-primary-500/20 flex items-center justify-center
                           text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/923211146642?text=Hello%20Fischer%2C%20I%20need%20assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-800 hover:bg-primary-500/20 flex items-center justify-center
                           text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com/@fischerpakistan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-800 hover:bg-primary-500/20 flex items-center justify-center
                           text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/fischerpk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-800 hover:bg-primary-500/20 flex items-center justify-center
                           text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@fischerpklhr?_r=1&_t=ZS-93nrx1A2MXE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-800 hover:bg-primary-500/20 flex items-center justify-center
                           text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>

              {/* Payment Methods */}
              <h4 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider mt-8 mb-4">
                We Accept
              </h4>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 text-xs font-medium text-dark-600 dark:text-dark-400
                             bg-dark-200 dark:bg-dark-800 rounded-lg"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-200 dark:border-dark-800">
        <div className="container-xl py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-500 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Fischer Pakistan (Fatima Engineering Works). All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Certifications */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-dark-200 dark:bg-dark-800 rounded-lg">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">ISO</span>
                  <span className="text-xs text-dark-600 dark:text-dark-400">9001:2015</span>
                </div>
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-dark-200 dark:bg-dark-800 rounded-lg">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">PSQCA</span>
                  <span className="text-xs text-dark-600 dark:text-dark-400">Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
