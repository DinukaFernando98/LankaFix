'use client'

import { motion } from 'framer-motion'
import { Camera, Map, BarChart3, Bell, Brain, Eye } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Camera,
    title: 'Photo Evidence',
    description:
      'Attach photos directly from your device to provide clear visual proof of the civic issue.',
  },
  {
    icon: Map,
    title: 'Interactive Map',
    description:
      'Drop a pin to precisely mark where the issue is located on an interactive Sri Lanka map.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Tracking',
    description:
      'Follow your complaint from submission through in-progress to full resolution with live status.',
  },
  {
    icon: Bell,
    title: 'Instant Notifications',
    description:
      'Receive SMS and email alerts automatically whenever the status of your report changes.',
  },
  {
    icon: Brain,
    title: 'AI Hotzone Detection',
    description:
      'Machine learning identifies problem clusters, helping authorities prioritise high-impact areas.',
  },
  {
    icon: Eye,
    title: 'Public Transparency',
    description:
      'All resolved reports are publicly visible, holding authorities accountable to citizens.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-green-600 text-sm font-semibold uppercase tracking-widest">
            Features
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Why Choose LankaFix?
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto leading-relaxed">
            A complete civic reporting platform built for the unique needs of Sri Lankan
            communities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group p-6 sm:p-7 rounded-2xl border border-gray-100 bg-white hover:border-green-200 hover:shadow-lg transition-all duration-300 cursor-default"
              >
                <div className="w-11 h-11 bg-green-50 group-hover:bg-green-100 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
