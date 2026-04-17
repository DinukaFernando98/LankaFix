'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Phone, MapPin, Clock, Send, CheckCircle2,
  MessageSquare, AlertCircle,
} from 'lucide-react'

const INFO_CARDS = [
  {
    icon: Mail,
    label: 'Email Us',
    value: 'support@lankafix.lk',
    sub: 'We reply within 24 hours',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+94 11 234 5678',
    sub: 'Mon – Fri, 9 am – 5 pm',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: MapPin,
    label: 'Our Office',
    value: 'Colombo 03, Sri Lanka',
    sub: 'Visits by appointment only',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Clock,
    label: 'Support Hours',
    value: 'Mon – Fri',
    sub: '9:00 am – 5:00 pm (IST)',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
]

const SUBJECTS = [
  'General Enquiry',
  'Report a Technical Issue',
  'Complaint Status Query',
  'Department / Authority Collaboration',
  'Media & Press',
  'Other',
]

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

const EMPTY: FormState = { name: '', email: '', subject: '', message: '' }

export default function ContactClient() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  function validate(): boolean {
    const e: Partial<FormState> = {}
    if (!form.name.trim()) e.name = 'Please enter your name.'
    if (!form.email.trim()) e.email = 'Please enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.subject) e.subject = 'Please select a subject.'
    if (!form.message.trim()) e.message = 'Please enter a message.'
    else if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')
    // Simulate network delay — replace with real API call if needed
    await new Promise((r) => setTimeout(r, 1200))
    setStatus('sent')
    setForm(EMPTY)
    setErrors({})
  }

  function field(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const inputBase =
    'w-full px-4 py-3 text-sm text-gray-900 bg-white border rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400'
  const inputOk = 'border-gray-200'
  const inputErr = 'border-red-300 bg-red-50'

  return (
    <>
      {/* Hero */}
      <section className="bg-white pt-24 pb-12 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full border border-green-200 mb-5">
              <MessageSquare className="w-3.5 h-3.5" />
              Get in Touch
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Contact Us
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              Have a question, suggestion, or need help with a report? We&apos;d love to hear from
              you. Our team is ready to assist.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info cards */}
      <section className="bg-gray-50 py-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {INFO_CARDS.map(({ icon: Icon, label, value, sub, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-white py-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-1">Send us a message</h2>
            <p className="text-sm text-gray-500 mb-8">
              Fill in the form below and we&apos;ll get back to you as soon as possible.
            </p>

            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Message sent!</h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-6">
                    Thanks for reaching out. We&apos;ll review your message and get back to you
                    within 24 hours.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="px-5 py-2.5 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-200 cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5"
                >
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Kamal Perera"
                        value={form.name}
                        onChange={(e) => field('name', e.target.value)}
                        className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="kamal@example.com"
                        value={form.email}
                        onChange={(e) => field('email', e.target.value)}
                        className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => field('subject', e.target.value)}
                      className={`${inputBase} ${errors.subject ? inputErr : inputOk} cursor-pointer`}
                    >
                      <option value="">Select a subject…</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Describe your question or issue in detail…"
                      value={form.message}
                      onChange={(e) => field('message', e.target.value)}
                      className={`${inputBase} resize-none ${errors.message ? inputErr : inputOk}`}
                    />
                    <div className="flex items-start justify-between mt-1.5">
                      {errors.message ? (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.message}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        {form.message.length} chars
                      </span>
                    </div>
                  </div>

                  {/* Error banner */}
                  {status === 'error' && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors duration-200 cursor-pointer"
                  >
                    {status === 'sending' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </>
  )
}
