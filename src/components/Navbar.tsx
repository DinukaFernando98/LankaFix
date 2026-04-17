'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, MapPin, LogOut, User, ChevronDown, FileText } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useAuthModal } from '@/components/providers/AuthModalProvider'

const navLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Features', href: '/#features' },
  { label: 'Hotzone Map', href: '/hotzones' },
  { label: 'Track a Report', href: '/track' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { openModal } = useAuthModal()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return
    function handleClick() { setUserMenuOpen(false) }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [userMenuOpen])

  async function handleSignOut() {
    setUserMenuOpen(false)
    setMobileOpen(false)
    await signOut({ callbackUrl: '/' })
  }

  function handleSubmitReport() {
    setMobileOpen(false)
    if (status === 'authenticated') {
      router.push('/submit')
    } else {
      openModal('/submit')
    }
  }

  function handleSignIn() {
    setMobileOpen(false)
    openModal('/')
  }

  const isLoggedIn = status === 'authenticated' && session?.user
  const firstName = session?.user?.fullName?.split(' ')[0] ?? ''

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg tracking-tight">
              Lanka<span className="text-green-600">Fix</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen) }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-green-700">
                        {firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span>{firstName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-semibold text-gray-900 truncate">{session.user.fullName}</p>
                          <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                        </div>
                        <Link
                          href="/my-tickets"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-gray-400" />
                          My Reports
                        </Link>
                        {session.user.isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={handleSubmitReport}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Submit a Report
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 cursor-pointer px-3 py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Submit a Report
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-gray-100 mt-2 pt-3 flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-700">
                          {firstName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.user.fullName}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/my-tickets"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      My Reports
                    </Link>
                    {session.user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 cursor-pointer"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSubmitReport}
                      className="px-3 py-2.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 cursor-pointer text-center"
                    >
                      Submit a Report
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer text-center"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSignIn}
                      className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 cursor-pointer text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={handleSubmitReport}
                      className="px-3 py-2.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 cursor-pointer text-center"
                    >
                      Submit a Report
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
