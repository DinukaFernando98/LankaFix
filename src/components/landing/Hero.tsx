'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, MapPin, CheckCircle } from 'lucide-react'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const stats = [
  { value: '12,400+', label: 'Issues Reported' },
  { value: '8,900+', label: 'Resolved' },
  { value: '25', label: 'Districts' },
]

const trustPoints = ['Free to use', 'No sign-up to track', 'All 25 districts']

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_15%,#f0fdf4_0%,transparent_55%)] pointer-events-none" />
      <div className="absolute top-24 right-12 w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-24 left-12 w-56 h-56 bg-green-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full border border-green-200">
              <MapPin className="w-3.5 h-3.5" />
              Sri Lanka&apos;s Civic Issue Platform
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.08] tracking-tight"
          >
            Report. Track.{' '}
            <span className="text-green-600 italic">Resolve.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            Connecting citizens with local authorities to report and resolve civic issues across
            Sri Lanka — from potholes to broken streetlights.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/submit"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors duration-200 cursor-pointer w-full sm:w-auto group"
            >
              Report an Issue
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/track"
              className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:text-green-700 font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors duration-200 cursor-pointer w-full sm:w-auto"
            >
              Track a Report
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-sm text-gray-400"
          >
            {trustPoints.map((point) => (
              <span key={point} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                {point}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: 'easeOut' }}
          className="mt-20 grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 sm:p-5 text-center"
            >
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
