import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ClusterData, HotzoneResult } from '@/types'

interface Point {
  lat: number
  lng: number
  category: string
}

function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2)
}

function kMeanspp(points: Point[], k: number): { centroid: { lat: number; lng: number }; members: Point[] }[] {
  if (points.length === 0 || k === 0) return []

  const centroids: { lat: number; lng: number }[] = []
  const first = points[Math.floor(Math.random() * points.length)]
  centroids.push({ lat: first.lat, lng: first.lng })

  for (let i = 1; i < k; i++) {
    const dists = points.map((p) => {
      const d = Math.min(...centroids.map((c) => distance(p, c)))
      return d * d
    })
    const total = dists.reduce((s, d) => s + d, 0)
    let r = Math.random() * total
    let chosen = 0
    for (let j = 0; j < dists.length; j++) {
      r -= dists[j]
      if (r <= 0) { chosen = j; break }
    }
    centroids.push({ lat: points[chosen].lat, lng: points[chosen].lng })
  }

  for (let iter = 0; iter < 150; iter++) {
    const clusters: Point[][] = Array.from({ length: k }, () => [])
    for (const p of points) {
      let minD = Infinity, nearest = 0
      for (let i = 0; i < k; i++) {
        const d = distance(p, centroids[i])
        if (d < minD) { minD = d; nearest = i }
      }
      clusters[nearest].push(p)
    }
    let converged = true
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue
      const newLat = clusters[i].reduce((s, p) => s + p.lat, 0) / clusters[i].length
      const newLng = clusters[i].reduce((s, p) => s + p.lng, 0) / clusters[i].length
      if (Math.abs(newLat - centroids[i].lat) > 1e-6 || Math.abs(newLng - centroids[i].lng) > 1e-6) converged = false
      centroids[i] = { lat: newLat, lng: newLng }
    }
    if (converged) break
  }

  const final: Point[][] = Array.from({ length: k }, () => [])
  for (const p of points) {
    let minD = Infinity, nearest = 0
    for (let i = 0; i < k; i++) {
      const d = distance(p, centroids[i])
      if (d < minD) { minD = d; nearest = i }
    }
    final[nearest].push(p)
  }

  return centroids.map((centroid, i) => ({ centroid, members: final[i] }))
}

// ── Elbow method ─────────────────────────────────────────────────────────────
// Runs KMeans++ `runs` times per k and takes the best (lowest) WCSS for
// stability, then picks the inflection point via second derivative.

function computeWCSS(points: Point[], k: number, runs = 3): number {
  let best = Infinity
  for (let r = 0; r < runs; r++) {
    const clusters = kMeanspp(points, k)
    let wcss = 0
    for (const cluster of clusters) {
      for (const p of cluster.members) {
        wcss += distance(p, cluster.centroid) ** 2
      }
    }
    if (wcss < best) best = wcss
  }
  return best
}

function findOptimalK(points: Point[]): { k: number; wcssValues: number[] } {
  const n = points.length
  if (n <= 2) return { k: n, wcssValues: [] }

  const kMax = Math.min(10, n)
  const wcssValues: number[] = []

  for (let k = 1; k <= kMax; k++) {
    wcssValues.push(computeWCSS(points, k))
  }

  // Second derivative: find index with maximum curvature (the "elbow")
  // wcssValues[i] corresponds to k = i + 1
  let maxCurvature = -Infinity
  let elbowIndex = 1 // default k = 2

  for (let i = 1; i < wcssValues.length - 1; i++) {
    const curvature = wcssValues[i - 1] - 2 * wcssValues[i] + wcssValues[i + 1]
    if (curvature > maxCurvature) {
      maxCurvature = curvature
      elbowIndex = i
    }
  }

  return { k: Math.max(2, elbowIndex + 1), wcssValues }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const deptId = searchParams.get('departmentId') ? Number(searchParams.get('departmentId')) : undefined
  const dateRange = searchParams.get('dateRange') || 'all'

  let createdAtFilter: { gte: Date } | undefined
  const now = Date.now()
  if (dateRange === '30d')  createdAtFilter = { gte: new Date(now - 30  * 86400000) }
  if (dateRange === '90d')  createdAtFilter = { gte: new Date(now - 90  * 86400000) }
  if (dateRange === '180d') createdAtFilter = { gte: new Date(now - 180 * 86400000) }

  const rows = await prisma.complaint.findMany({
    where: {
      latitude:  { not: null },
      longitude: { not: null },
      ...(deptId        && { category: { departmentId: deptId } }),
      ...(createdAtFilter && { createdAt: createdAtFilter }),
    },
    select: {
      latitude:  true,
      longitude: true,
      category:  { select: { name: true } },
    },
  })

  if (rows.length < 2) {
    const result: HotzoneResult = {
      clusters: [],
      heatmap_points: [],
      k_used: 0,
      elbow_wcss: [],
      total_complaints: rows.length,
      generated_at: new Date().toISOString(),
    }
    return NextResponse.json(result)
  }

  const points: Point[] = rows.map((r) => ({
    lat:      r.latitude!,
    lng:      r.longitude!,
    category: r.category.name,
  }))

  // Elbow method selects optimal k automatically
  const { k, wcssValues } = findOptimalK(points)
  const raw = kMeanspp(points, k)
  const maxCount = Math.max(...raw.map((r) => r.members.length), 1)

  const clusters: ClusterData[] = raw
    .filter((r) => r.members.length > 0)
    .map((r, i) => {
      const freq: Record<string, number> = {}
      for (const m of r.members) freq[m.category] = (freq[m.category] || 0) + 1
      const topCategory = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
      const ratio = r.members.length / maxCount
      const priority: ClusterData['priority'] =
        ratio >= 0.75 ? 'Critical' : ratio >= 0.5 ? 'High' : ratio >= 0.25 ? 'Medium' : 'Low'
      return {
        cluster_id:    i + 1,
        centroid_lat:  r.centroid.lat,
        centroid_lng:  r.centroid.lng,
        complaint_count: r.members.length,
        top_category:  topCategory,
        priority,
      }
    })
    .sort((a, b) => b.complaint_count - a.complaint_count)

  // Heatmap intensity is proportional to the density of the cluster the point belongs to
  const heatmapPoints: [number, number, number][] = points.map((p) => {
    let minD = Infinity, clusterIdx = 0
    for (let i = 0; i < raw.length; i++) {
      const d = distance(p, raw[i].centroid)
      if (d < minD) { minD = d; clusterIdx = i }
    }
    const intensity = 0.2 + (raw[clusterIdx].members.length / maxCount) * 0.8
    return [p.lat, p.lng, intensity]
  })

  const result: HotzoneResult = {
    clusters,
    heatmap_points: heatmapPoints,
    k_used:         k,
    elbow_wcss:     wcssValues,
    total_complaints: points.length,
    generated_at:   new Date().toISOString(),
  }

  return NextResponse.json(result)
}
