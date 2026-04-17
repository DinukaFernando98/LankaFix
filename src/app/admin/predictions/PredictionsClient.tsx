'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Brain, RefreshCw, Info, MapPin, ArrowRight, CheckCircle2,
  AlertCircle, Eye,
} from 'lucide-react'
import type { PredictionResult, DistrictPrediction } from '@/types'

interface Props { departmentId: number | null }

type Tab = 'simple' | 'full'

// ── Shared config ─────────────────────────────────────────────────────────────

const RISK_CONFIG = {
  High:   { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  Medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  Low:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
}

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const card: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

// ── Shared helpers ────────────────────────────────────────────────────────────

function MiniBarChart({ weeks, color = 'bg-green-500', predicted = false }:
  { weeks: { label: string; count: number }[]; color?: string; predicted?: boolean }) {
  const max = Math.max(...weeks.map((w) => w.count), 1)
  return (
    <div className="flex items-end gap-0.5 h-10">
      {weeks.map((w, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative">
          <div
            className={`w-full rounded-sm ${color} ${predicted ? 'opacity-40' : 'opacity-75'}`}
            style={{ height: `${Math.max(2, (w.count / max) * 40)}px` }}
          />
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex z-10 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
              {w.label}: {w.count}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TrendIcon({ trend, size = 'sm' }: { trend: DistrictPrediction['trend']; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  if (trend === 'rising')  return <TrendingUp  className={`${cls} text-red-500`} />
  if (trend === 'falling') return <TrendingDown className={`${cls} text-green-500`} />
  return <Minus className={`${cls} text-gray-400`} />
}

// ── Simplified view ───────────────────────────────────────────────────────────

function trendSentence(p: DistrictPrediction): string {
  const nextWeek = p.predictedWeeks[0]?.count ?? 0
  const avg = p.avgWeekly
  if (p.trend === 'rising')
    return `Complaints are increasing. Expect around ${nextWeek} next week (up from ${avg}/wk avg).`
  if (p.trend === 'falling')
    return `Complaints are decreasing. Expect around ${nextWeek} next week — things are improving.`
  return `Complaints are steady at around ${avg} per week. No major change expected.`
}

function actionSentence(p: DistrictPrediction): string {
  if (p.riskLevel === 'High' && p.trend === 'rising')
    return `Prioritise resources here — volume is rising fast. Focus on ${p.topCategory}.`
  if (p.riskLevel === 'High')
    return `High complaint volume. Ensure sufficient staff are assigned to ${p.topCategory}.`
  if (p.riskLevel === 'Medium' && p.trend === 'rising')
    return `Monitor closely. If the upward trend continues, allocate additional resources.`
  if (p.trend === 'falling')
    return `Current efforts are working well. Maintain existing resource levels.`
  return `Routine monitoring is sufficient for this district.`
}

function SimpleView({ data }: { data: PredictionResult }) {
  const urgent  = data.predictions.filter((p) => p.riskLevel === 'High')
  const watch   = data.predictions.filter((p) => p.riskLevel === 'Medium')
  const fine    = data.predictions.filter((p) => p.riskLevel === 'Low')

  const nextWeekTotal = data.predictions.reduce(
    (s, p) => s + (p.predictedWeeks[0]?.count ?? 0), 0
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Plain-English summary banner */}
      <motion.div variants={card} className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
        <p className="text-sm font-semibold text-blue-900 mb-1">What to expect next week</p>
        <p className="text-sm text-blue-700">
          Based on the past 12 weeks of data, approximately{' '}
          <span className="font-bold">{nextWeekTotal} complaints</span> are expected across{' '}
          <span className="font-bold">{data.predictions.length} districts</span>.{' '}
          {urgent.length > 0
            ? `${urgent.length} district${urgent.length > 1 ? 's need' : ' needs'} immediate attention.`
            : 'No districts are currently at high risk.'}
        </p>
      </motion.div>

      {/* Needs attention */}
      {urgent.length > 0 && (
        <motion.div variants={card}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-gray-900">Needs Attention ({urgent.length})</h2>
          </div>
          <div className="space-y-3">
            {urgent.map((p) => (
              <div key={p.district} className="bg-white border border-red-100 rounded-2xl p-4 flex gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{p.district}</p>
                    <TrendIcon trend={p.trend} />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{trendSentence(p)}</p>
                  <div className="flex items-start gap-1.5">
                    <ArrowRight className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-red-700">{actionSentence(p)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-gray-900">{p.predictedWeeks[0]?.count ?? 0}</p>
                  <p className="text-xs text-gray-400">next week</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Keep an eye on */}
      {watch.length > 0 && (
        <motion.div variants={card}>
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-yellow-500" />
            <h2 className="text-sm font-bold text-gray-900">Keep an Eye On ({watch.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {watch.map((p) => (
              <div key={p.district} className="bg-white border border-yellow-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{p.district}</p>
                    <TrendIcon trend={p.trend} />
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {p.predictedWeeks[0]?.count ?? 0}
                    <span className="text-xs font-normal text-gray-400 ml-1">next wk</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{trendSentence(p)}</p>
                <div className="flex items-start gap-1.5">
                  <ArrowRight className="w-3 h-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">{actionSentence(p)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Doing well */}
      {fine.length > 0 && (
        <motion.div variants={card}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h2 className="text-sm font-bold text-gray-900">Doing Well ({fine.length})</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {fine.map((p) => (
              <div key={p.district} className="bg-white border border-green-100 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-700 truncate">{p.district}</p>
                  <TrendIcon trend={p.trend} />
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {p.predictedWeeks[0]?.count ?? 0}
                  <span className="text-xs font-normal text-gray-400 ml-1">next wk</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{p.topCategory}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={card}>
        <p className="text-xs text-gray-400 text-center">
          Generated {new Date(data.generatedAt).toLocaleString('en-GB')} ·
          Figures are estimates based on historical complaint trends.
        </p>
      </motion.div>
    </motion.div>
  )
}

// ── Full analysis view ────────────────────────────────────────────────────────

function FullAnalysisView({ data }: { data: PredictionResult }) {
  const highRisk = data.predictions.filter((p) => p.riskLevel === 'High').length
  const rising   = data.predictions.filter((p) => p.trend === 'rising').length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Algorithm info */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-purple-700 space-y-1">
          <p className="font-semibold">How predictions are generated</p>
          <p>
            Each district&apos;s weekly complaint counts over the past 12 weeks are fitted to a
            linear regression model (Ordinary Least Squares). The fitted trend line is extrapolated
            4 weeks forward. The R² score indicates goodness-of-fit (1.0 = perfect).
            Districts with fewer than 3 complaints are excluded.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Districts Analysed', value: data.predictions.length, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'High Risk Districts', value: highRisk,               color: 'text-red-600',    bg: 'bg-red-50'    },
          { label: 'Rising Trend',        value: rising,                 color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Weeks Forecast',      value: 4,                      color: 'text-blue-600',   bg: 'bg-blue-50'   },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <span className={`text-sm font-bold ${color}`}>{value}</span>
            </div>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* District cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.predictions.map((p) => {
          const risk = RISK_CONFIG[p.riskLevel]
          const predictedTotal = p.predictedWeeks.reduce((s, w) => s + w.count, 0)
          const trendCfg = {
            rising:  { text: 'Rising',  cls: 'text-red-600 bg-red-50 border-red-200' },
            falling: { text: 'Falling', cls: 'text-green-700 bg-green-50 border-green-200' },
            stable:  { text: 'Stable',  cls: 'text-gray-600 bg-gray-50 border-gray-200' },
          }[p.trend]
          return (
            <motion.div
              key={p.district}
              variants={card}
              className={`bg-white rounded-2xl border ${risk.border} shadow-sm p-5`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{p.district}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Top issue: {p.topCategory}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${risk.bg} ${risk.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                    {p.riskLevel} Risk
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${trendCfg.cls}`}>
                    <TrendIcon trend={p.trend} />
                    {trendCfg.text}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1.5">
                  Last {p.historicalWeeks.length} weeks
                  <span className="mx-1.5 text-gray-200">·</span>
                  {p.totalHistorical} total · {p.avgWeekly}/wk avg
                </p>
                <MiniBarChart weeks={p.historicalWeeks} color="bg-indigo-400" />
              </div>

              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Forecast
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1.5">
                  Next 4 weeks
                  <span className="mx-1.5 text-gray-200">·</span>
                  ~{predictedTotal} predicted
                </p>
                <MiniBarChart
                  weeks={p.predictedWeeks}
                  color={p.trend === 'rising' ? 'bg-red-400' : p.trend === 'falling' ? 'bg-green-400' : 'bg-gray-400'}
                  predicted
                />
              </div>

              <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                <span>Slope: {p.slopePerWeek > 0 ? '+' : ''}{p.slopePerWeek} complaints/week</span>
                <span>
                  R² = {p.r2}
                  {p.r2 >= 0.7 ? ' (good fit)' : p.r2 >= 0.4 ? ' (moderate)' : ' (weak fit)'}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Generated {new Date(data.generatedAt).toLocaleString('en-GB')} ·
        Predictions are statistical estimates based on historical trend lines.
      </p>
    </motion.div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function PredictionsClient({ departmentId }: Props) {
  const [tab, setTab] = useState<Tab>('simple')
  const [data, setData] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  function load() {
    setIsLoading(true)
    setError(false)
    const url = departmentId
      ? `/api/admin/predictions?departmentId=${departmentId}`
      : '/api/admin/predictions'
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [departmentId])

  return (
    <main className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Complaint Predictions</h1>
          </div>
          <p className="text-sm text-gray-500 ml-10">
            AI-powered forecast based on the last 12 weeks of complaint data.
          </p>
        </div>
        <button
          onClick={load}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {([
          { key: 'simple', label: 'Overview' },
          { key: 'full',   label: 'Full Analysis' },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
              tab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Running linear regression analysis…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24">
          <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm text-gray-500">Failed to load predictions.</p>
        </div>
      )}

      {/* Empty */}
      {data && !isLoading && data.predictions.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Brain className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">Not enough data yet</p>
          <p className="text-xs text-gray-400">
            At least 3 complaints with district information are needed to generate predictions.
          </p>
        </div>
      )}

      {/* Tab content */}
      {data && !isLoading && data.predictions.length > 0 && (
        <AnimatePresence mode="wait">
          {tab === 'simple' ? (
            <motion.div
              key="simple"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SimpleView data={data} />
            </motion.div>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <FullAnalysisView data={data} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </main>
  )
}
