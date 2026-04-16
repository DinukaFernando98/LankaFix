import Link from 'next/link'
import { MapPin } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Report an Issue', href: '/submit' },
    { label: 'Track a Report', href: '/track' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
  ],
  Account: [
    { label: 'Sign In', href: '/auth' },
    { label: 'Create Account', href: '/auth' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white text-lg tracking-tight">
                Lanka<span className="text-green-400">Fix</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Sri Lanka&apos;s civic issue reporting platform. Connecting citizens with local
              authorities to build better communities across all 25 districts.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200 cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} LankaFix. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">Building a better Sri Lanka, one report at a time.</p>
        </div>
      </div>
    </footer>
  )
}
