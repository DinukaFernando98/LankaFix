'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CtaBanner() {
  return (
    <section className="py-24 bg-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Ready to make Sri Lanka better?
          </h2>
          <p className="mt-4 text-green-100 text-lg max-w-xl mx-auto leading-relaxed">
            Join thousands of citizens who are actively improving their communities through
            LankaFix.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/submit"
              className="flex items-center justify-center gap-2 bg-white text-green-700 hover:bg-green-50 font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors duration-200 cursor-pointer w-full sm:w-auto group"
            >
              Report an Issue Today
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/track"
              className="flex items-center justify-center bg-transparent text-white border border-green-400 hover:border-white hover:bg-green-700 font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors duration-200 cursor-pointer w-full sm:w-auto"
            >
              Track Your Report
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
