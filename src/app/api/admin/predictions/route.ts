import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { PredictionResult, DistrictPrediction, WeeklyCount } from '@/types'

// ── Linear regression (Ordinary Least Squares) ───────────────────────────────
function linearRegression(y: number[]): { slope: number; intercept: number; r2: number } {
  const n = y.length
  if (n < 2) return { slope: 0, intercept: y[0] ?? 0, r2: 0 }

  const xMean = (n - 1) / 2
  const yMean = y.reduce((a, b) => a + b, 0) / n

  let ssXY = 0, ssXX = 0, ssTot = 0
  for (let i = 0; i < n; i++) {
    ssXY += (i - xMean) * (y[i] - yMean)
    ssXX += (i - xMean) ** 2
    ssTot += (y[i] - yMean) ** 2
  }

  const slope = ssXX > 0 ? ssXY / ssXX : 0
  const intercept = yMean - slope * xMean

  let ssRes = 0
  for (let i = 0; i < n; i++) {
    ssRes += (y[i] - (slope * i + intercept)) ** 2
  }
  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0

  return { slope, intercept, r2 }
}

// ── Week label helpers ────────────────────────────────────────────────────────
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay()) // Sunday-anchored week
  return d
}

function weekLabel(weekStart: Date): string {
  return weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + weeks * 7)
  return d
}

// ─────────────────────────────────────────────────────────────────────────────

const WEEKS_HISTORY = 12
const WEEKS_PREDICT = 4
const MIN_COMPLAINTS = 3 // districts below this threshold are excluded

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const deptId = searchParams.get('departmentId') ? Number(searchParams.get('departmentId')) : undefined

  const since = new Date()
  since.setDate(since.getDate() - WEEKS_HISTORY * 7)

  const complaints = await prisma.complaint.findMany({
    where: {
      createdAt: { gte: since },
      district:  { not: null },
      ...(deptId && { category: { departmentId: deptId } }),
    },
    select: {
      district:  true,
      createdAt: true,
      category:  { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Build ordered list of the last WEEKS_HISTORY week-start dates
  const now = new Date()
  const currentWeekStart = getWeekStart(now)
  const weekStarts: Date[] = []
  for (let i = WEEKS_HISTORY - 1; i >= 0; i--) {
    weekStarts.push(addWeeks(currentWeekStart, -i))
  }

  // Index complaints by district → week index
  const districtData: Record<string, { counts: number[]; categories: string[] }> = {}

  for (const c of complaints) {
    const district = c.district!
    if (!districtData[district]) {
      districtData[district] = { counts: new Array(WEEKS_HISTORY).fill(0), categories: [] }
    }
    const cWeekStart = getWeekStart(c.createdAt)
    const weekIdx = weekStarts.findIndex(
      (ws) => ws.getTime() === cWeekStart.getTime()
    )
    if (weekIdx >= 0) districtData[district].counts[weekIdx]++
    districtData[district].categories.push(c.category.name)
  }

  const predictions: DistrictPrediction[] = []

  for (const [district, { counts, categories }] of Object.entries(districtData)) {
    const total = counts.reduce((a, b) => a + b, 0)
    if (total < MIN_COMPLAINTS) continue

    const { slope, intercept, r2 } = linearRegression(counts)

    // Historical weeks
    const historicalWeeks: WeeklyCount[] = weekStarts.map((ws, i) => ({
      label: weekLabel(ws),
      count: counts[i],
    }))

    // Predicted weeks (project forward)
    const predictedWeeks: WeeklyCount[] = []
    for (let i = 0; i < WEEKS_PREDICT; i++) {
      const weekIndex = WEEKS_HISTORY + i
      const predicted = Math.max(0, Math.round(slope * weekIndex + intercept))
      predictedWeeks.push({
        label: weekLabel(addWeeks(currentWeekStart, i + 1)),
        count: predicted,
      })
    }

    // Trend classification: slope > 0.3/week = rising, < -0.3 = falling
    const trend: DistrictPrediction['trend'] =
      slope > 0.3 ? 'rising' : slope < -0.3 ? 'falling' : 'stable'

    // Risk level based on predicted average
    const predictedAvg = predictedWeeks.reduce((s, w) => s + w.count, 0) / WEEKS_PREDICT
    const riskLevel: DistrictPrediction['riskLevel'] =
      predictedAvg >= 5 ? 'High' : predictedAvg >= 2 ? 'Medium' : 'Low'

    // Top category
    const catFreq: Record<string, number> = {}
    for (const cat of categories) catFreq[cat] = (catFreq[cat] || 0) + 1
    const topCategory = Object.entries(catFreq).sort((a, b) => b[1] - a[1])[0][0]

    predictions.push({
      district,
      historicalWeeks,
      predictedWeeks,
      trend,
      slopePerWeek: Math.round(slope * 100) / 100,
      riskLevel,
      r2: Math.round(r2 * 100) / 100,
      avgWeekly: Math.round((total / WEEKS_HISTORY) * 10) / 10,
      topCategory,
      totalHistorical: total,
    })
  }

  // Sort: High risk first, then by predicted total descending
  predictions.sort((a, b) => {
    const riskOrder = { High: 0, Medium: 1, Low: 2 }
    const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
    if (riskDiff !== 0) return riskDiff
    const aTotal = a.predictedWeeks.reduce((s, w) => s + w.count, 0)
    const bTotal = b.predictedWeeks.reduce((s, w) => s + w.count, 0)
    return bTotal - aTotal
  })

  const result: PredictionResult = {
    predictions,
    weeksAnalyzed: WEEKS_HISTORY,
    generatedAt: new Date().toISOString(),
  }

  return NextResponse.json(result)
}
