'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Loader2, AlertCircle, MapPin, Zap, Clock, TrendingUp } from 'lucide-react'
import type { HotzoneResult, ClusterData } from '@/types'

const HotzoneMap = dynamic(() => import('@/components/HotzoneMap'), { ssr: false })

const PRIORITY_CONFIG: Record<
  ClusterData['priority'],
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Critical: {
    label: 'Critical',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  High: {
    label: 'High',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  Medium: {
    label: 'Medium',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
  Low: {
    label: 'Low',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function HotzoneClient() {
  const [data, setData] = useState<HotzoneResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/hotzones')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <main className="flex-1 bg-white">
      <section className="bg-white pt-24 pb-12 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-sm font-medium px-3 py-1.5 rounded-full border border-red-200 mb-5">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Analysis
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Civic Issue Hotzone Map
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              Complaint locations are clustered using the K-Means algorithm to reveal the areas
              with the highest concentration of unresolved civic issues.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {isLoading && (
            <div className="flex items-center justify-center h-[520px] bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center">
                <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Running K-Means analysis…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-[520px] bg-white rounded-2xl border border-gray-100 shadow-sm">
              <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
              <p className="text-sm text-gray-500">Failed to load hotzone data.</p>
            </div>
          )}

          {data && !isLoading && (
            <>
              {data.total_complaints === 0 ? (
                <div className="flex flex-col items-center justify-center h-[520px] bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <MapPin className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">No location data yet</p>
                  <p className="text-xs text-gray-400 text-center max-w-xs">
                    Hotzones appear once complaints with map pin locations have been submitted.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-5">
                    {[
                      {
                        label: 'Complaints Mapped',
                        value: data.total_complaints,
                        icon: <MapPin className="w-4 h-4" />,
                        color: 'text-green-600',
                        bg: 'bg-green-50',
                      },
                      {
                        label: 'Clusters (K)',
                        value: data.k_used,
                        icon: <TrendingUp className="w-4 h-4" />,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50',
                      },
                      {
                        label: 'Critical Zones',
                        value: data.clusters.filter((c) => c.priority === 'Critical').length,
                        icon: <Zap className="w-4 h-4" />,
                        color: 'text-red-600',
                        bg: 'bg-red-50',
                      },
                    ].map(({ label, value, icon, color, bg }) => (
                      <div
                        key={label}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                          <span className={color}>{icon}</span>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{value}</p>
                          <p className="text-xs text-gray-500">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <div className="h-[480px]">
                      <HotzoneMap
                        clusters={data.clusters}
                        heatmapPoints={data.heatmap_points}
                      />
                    </div>
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-3 h-3 rounded-full bg-indigo-400 opacity-70" />
                          Individual complaint
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-3 h-3 rounded-full border-2 border-red-500 bg-red-100" />
                          Cluster centroid
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(data.generated_at).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">
                      Cluster Breakdown
                    </h2>
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {data.clusters.map((cluster) => {
                        const cfg = PRIORITY_CONFIG[cluster.priority]
                        return (
                          <motion.div
                            key={cluster.cluster_id}
                            variants={item}
                            className={`bg-white rounded-2xl border ${cfg.border} shadow-sm p-5`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-mono font-medium text-gray-400">
                                Cluster #{cluster.cluster_id}
                              </span>
                              <span
                                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-0.5">
                              {cluster.complaint_count}
                            </p>
                            <p className="text-xs text-gray-500 mb-3">complaints in this zone</p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>
                                <span className="text-gray-400">Top issue:</span>{' '}
                                {cluster.top_category}
                              </p>
                              <p>
                                <span className="text-gray-400">Centre:</span>{' '}
                                {cluster.centroid_lat.toFixed(4)},{' '}
                                {cluster.centroid_lng.toFixed(4)}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
