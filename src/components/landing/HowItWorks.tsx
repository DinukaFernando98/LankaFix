'use client'

import { motion } from 'framer-motion'
import { FileText, GitBranch, Wrench, Bell } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Step {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: '01',
    icon: FileText,
    title: 'Submit Your Report',
    description:
      'Describe the issue, add a photo, and drop a pin on the map to pinpoint the exact location.',
  },
  {
    number: '02',
    icon: GitBranch,
    title: 'Assigned to Department',
    description:
      'Your report is automatically routed to the relevant government department or authority.',
  },
  {
    number: '03',
    icon: Wrench,
    title: 'Action is Taken',
    description:
      'The responsible team is notified and dispatched to assess and resolve the reported issue.',
  },
  {
    number: '04',
    icon: Bell,
    title: 'You Are Notified',
    description:
      'Receive SMS and email updates at every stage — from acknowledgement to full resolution.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-green-600 text-sm font-semibold uppercase tracking-widest">
            Process
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto leading-relaxed">
            Four simple steps from spotting an issue to seeing it resolved in your community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-3xl font-bold text-green-100 leading-none select-none">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
