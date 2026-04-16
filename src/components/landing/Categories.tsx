'use client'

import { motion } from 'framer-motion'
import {
  Construction,
  Zap,
  Droplets,
  Trash2,
  Droplet,
  Building2,
  Leaf,
  ClipboardList,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CategoryItem {
  icon: LucideIcon
  label: string
  color: string
  bg: string
}

const categories: CategoryItem[] = [
  { icon: Construction, label: 'Roads & Highways', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Zap, label: 'Electrical', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { icon: Droplets, label: 'Drainage & Flooding', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Trash2, label: 'Waste Management', color: 'text-red-600', bg: 'bg-red-50' },
  { icon: Droplet, label: 'Water Supply', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { icon: Building2, label: 'Public Property', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Leaf, label: 'Environment', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: ClipboardList, label: 'General Issues', color: 'text-gray-600', bg: 'bg-gray-100' },
]

export default function Categories() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-green-600 text-sm font-semibold uppercase tracking-widest">
            Categories
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Browse Issue Categories
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto leading-relaxed">
            Report issues across eight key civic categories, each routed directly to the
            responsible department.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat, index) => {
            const Icon = cat.icon
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border border-gray-100 bg-white hover:border-green-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div
                  className={`w-12 h-12 ${cat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center leading-snug">
                  {cat.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
