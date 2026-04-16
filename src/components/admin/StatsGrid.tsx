'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { FileText, AlertCircle, Clock, CheckCircle, Zap, TrendingUp } from 'lucide-react'

interface Props {
  total: number
  open: number
  inProgress: number
  resolved: number
  urgent: number
  thisMonth: number
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

interface CardProps {
  label: string
  value: number
  icon: React.ReactNode
  iconColor: string
  iconBg: string
}

function StatCard({ label, value, icon, iconColor, iconBg }: CardProps) {
  return (
    <motion.div
      variants={item}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </motion.div>
  )
}

export default function StatsGrid({ total, open, inProgress, resolved, urgent, thisMonth }: Props) {
  const cards: CardProps[] = [
    {
      label: 'Total Complaints',
      value: total,
      icon: <FileText className="w-4 h-4" />,
      iconColor: 'text-gray-600',
      iconBg: 'bg-gray-100',
    },
    {
      label: 'Open',
      value: open,
      icon: <AlertCircle className="w-4 h-4" />,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-50',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: <Clock className="w-4 h-4" />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Resolved',
      value: resolved,
      icon: <CheckCircle className="w-4 h-4" />,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
    },
    {
      label: 'Urgent',
      value: urgent,
      icon: <Zap className="w-4 h-4" />,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
    },
    {
      label: 'This Month',
      value: thisMonth,
      icon: <TrendingUp className="w-4 h-4" />,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </motion.div>
  )
}
