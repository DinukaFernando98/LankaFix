'use client'

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { ClusterData } from '@/types'

const PRIORITY_COLOR: Record<string, string> = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#ca8a04',
  Low: '#16a34a',
}

interface Props {
  clusters: ClusterData[]
  heatmapPoints: [number, number, number][]
}

export default function HotzoneMap({ clusters, heatmapPoints }: Props) {
  const maxCount = Math.max(...clusters.map((c) => c.complaint_count), 1)

  return (
    <MapContainer
      center={[7.8731, 80.7718]}
      zoom={8}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {heatmapPoints.map(([lat, lng], i) => (
        <CircleMarker
          key={i}
          center={[lat, lng]}
          radius={4}
          pathOptions={{
            color: '#6366f1',
            fillColor: '#6366f1',
            fillOpacity: 0.45,
            weight: 0,
          }}
        />
      ))}

      {clusters.map((cluster) => {
        const radius = 18 + (cluster.complaint_count / maxCount) * 34
        const color = PRIORITY_COLOR[cluster.priority]
        return (
          <CircleMarker
            key={cluster.cluster_id}
            center={[cluster.centroid_lat, cluster.centroid_lng]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.3,
              weight: 2.5,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, minWidth: 160 }}>
                <p style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>
                  Hotzone #{cluster.cluster_id}
                </p>
                <p style={{ margin: '2px 0' }}>
                  <strong>{cluster.complaint_count}</strong> complaints
                </p>
                <p style={{ margin: '2px 0' }}>Top issue: {cluster.top_category}</p>
                <p style={{ margin: '2px 0', color }}>
                  <strong>{cluster.priority} Priority</strong>
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
