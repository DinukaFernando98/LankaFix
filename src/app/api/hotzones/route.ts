import { NextResponse } from 'next/server'
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

  // K-Means++ initialisation
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
      if (r <= 0) {
        chosen = j
        break
      }
    }
    centroids.push({ lat: points[chosen].lat, lng: points[chosen].lng })
  }

  // Iterate
  for (let iter = 0; iter < 150; iter++) {
    const clusters: Point[][] = Array.from({ length: k }, () => [])

    for (const p of points) {
      let minD = Infinity
      let nearest = 0
      for (let i = 0; i < k; i++) {
        const d = distance(p, centroids[i])
        if (d < minD) {
          minD = d
          nearest = i
        }
      }
      clusters[nearest].push(p)
    }

    let converged = true
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue
      const newLat = clusters[i].reduce((s, p) => s + p.lat, 0) / clusters[i].length
      const newLng = clusters[i].reduce((s, p) => s + p.lng, 0) / clusters[i].length
      if (Math.abs(newLat - centroids[i].lat) > 1e-6 || Math.abs(newLng - centroids[i].lng) > 1e-6) {
        converged = false
      }
      centroids[i] = { lat: newLat, lng: newLng }
    }

    if (converged) break
  }

  // Final assignment
  const final: Point[][] = Array.from({ length: k }, () => [])
  for (const p of points) {
    let minD = Infinity
    let nearest = 0
    for (let i = 0; i < k; i++) {
      const d = distance(p, centroids[i])
      if (d < minD) {
        minD = d
        nearest = i
      }
    }
    final[nearest].push(p)
  }

  return centroids.map((centroid, i) => ({ centroid, members: final[i] }))
}

export async function GET() {
  const rows = await prisma.complaint.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      latitude: true,
      longitude: true,
      category: { select: { name: true } },
    },
  })

  if (rows.length === 0) {
    const result: HotzoneResult = {
      clusters: [],
      heatmap_points: [],
      k_used: 0,
      total_complaints: 0,
      generated_at: new Date().toISOString(),
    }
    return NextResponse.json(result)
  }

  const points: Point[] = rows.map((r) => ({
    lat: r.latitude!,
    lng: r.longitude!,
    category: r.category.name,
  }))

  const k = Math.max(1, Math.min(5, points.length))
  const raw = kMeanspp(points, k)

  const counts = raw.map((r) => r.members.length)
  const maxCount = Math.max(...counts, 1)

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
        cluster_id: i + 1,
        centroid_lat: r.centroid.lat,
        centroid_lng: r.centroid.lng,
        complaint_count: r.members.length,
        top_category: topCategory,
        priority,
      }
    })
    .sort((a, b) => b.complaint_count - a.complaint_count)

  const heatmap_points: [number, number, number][] = points.map((p) => [p.lat, p.lng, 0.6])

  const result: HotzoneResult = {
    clusters,
    heatmap_points,
    k_used: k,
    total_complaints: points.length,
    generated_at: new Date().toISOString(),
  }

  return NextResponse.json(result)
}
