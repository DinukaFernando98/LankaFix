'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import Link from 'next/link'
import { MapPin, CheckCircle, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'

type Tab = 'signin' | 'register'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  mobile: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignInFormData = z.infer<typeof signInSchema>
type RegisterFormData = z.infer<typeof registerSchema>

const leftBullets = [
  'Report civic issues in seconds',
  'Track your reports in real-time',
  'Get notified at every status update',
  'Help build a better community',
]

const formVariants: Variants = {
  hidden: (direction: number) => ({ opacity: 0, x: direction * 14 }),
  visible: { opacity: 1, x: 0, transition: { duration: 0.22 } },
  exit: (direction: number) => ({ opacity: 0, x: direction * -14, transition: { duration: 0.18 } }),
}

function inputClass(hasError?: boolean) {
  return `w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
    hasError
      ? 'border-red-300 focus:ring-red-400 focus:border-transparent'
      : 'border-gray-200 focus:ring-green-500 focus:border-transparent'
  }`
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 text-xs text-red-500"
    >
      {message}
    </motion.p>
  )
}

function AuthPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const { status } = useSession()
  const [tab, setTab] = useState<Tab>('signin')
  const [direction, setDirection] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const signInForm = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) })
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  function switchTab(newTab: Tab) {
    setDirection(newTab === 'register' ? 1 : -1)
    setTab(newTab)
    setServerError('')
    setShowPassword(false)
  }

  async function onSignIn(data: SignInFormData) {
    setServerError('')
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (result?.error) {
      setServerError('Invalid email or password. Please try again.')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  async function onRegister(data: RegisterFormData) {
    setServerError('')
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await response.json()
    if (!response.ok) {
      setServerError(json.error || 'Registration failed. Please try again.')
      return
    }
    const signInResult = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (signInResult?.error) {
      switchTab('signin')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[42%] bg-green-600 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">LankaFix</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-white leading-snug mb-8">
            Join thousands making<br />Sri Lanka better
          </h1>
          <ul className="space-y-4">
            {leftBullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-200 flex-shrink-0" />
                <span className="text-green-100 text-sm">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-green-200 text-xs">
          &copy; {new Date().getFullYear()} LankaFix. Free civic reporting platform.
        </p>
      </div>

      <div className="w-full lg:w-[58%] flex flex-col">
        <div className="lg:hidden px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg tracking-tight">
              Lanka<span className="text-green-600">Fix</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {tab === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {tab === 'signin'
                  ? 'Sign in to report and track civic issues.'
                  : 'Start reporting civic issues in your community.'}
              </p>
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
              {(['signin', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                    tab === t
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
              >
                {serverError}
              </motion.div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              {tab === 'signin' ? (
                <motion.form
                  key="signin"
                  custom={-direction}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={signInForm.handleSubmit(onSignIn)}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={inputClass(!!signInForm.formState.errors.email)}
                      {...signInForm.register('email')}
                    />
                    <FieldError message={signInForm.formState.errors.email?.message} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className={`${inputClass(!!signInForm.formState.errors.password)} pr-12`}
                        {...signInForm.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <FieldError message={signInForm.formState.errors.password?.message} />
                  </div>

                  <button
                    type="submit"
                    disabled={signInForm.formState.isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed mt-1"
                  >
                    {signInForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500 pt-1">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('register')}
                      className="text-green-600 hover:text-green-700 font-medium cursor-pointer transition-colors duration-200"
                    >
                      Create one
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  custom={direction}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      autoComplete="name"
                      className={inputClass(!!registerForm.formState.errors.fullName)}
                      {...registerForm.register('fullName')}
                    />
                    <FieldError message={registerForm.formState.errors.fullName?.message} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={inputClass(!!registerForm.formState.errors.email)}
                      {...registerForm.register('email')}
                    />
                    <FieldError message={registerForm.formState.errors.email?.message} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mobile number{' '}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+94 7X XXX XXXX"
                      autoComplete="tel"
                      className={inputClass(!!registerForm.formState.errors.mobile)}
                      {...registerForm.register('mobile')}
                    />
                    <FieldError message={registerForm.formState.errors.mobile?.message} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                        className={`${inputClass(!!registerForm.formState.errors.password)} pr-12`}
                        {...registerForm.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <FieldError message={registerForm.formState.errors.password?.message} />
                  </div>

                  <button
                    type="submit"
                    disabled={registerForm.formState.isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed mt-1"
                  >
                    {registerForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500 pt-1">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('signin')}
                      className="text-green-600 hover:text-green-700 font-medium cursor-pointer transition-colors duration-200"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      }
    >
      <AuthPageInner />
    </Suspense>
  )
}
