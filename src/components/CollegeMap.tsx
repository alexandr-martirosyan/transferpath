import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import type { College } from '../domain/types'
import type { Point } from '../services/geo'

function Fit({ center, radius }: { center: Point; radius: number }) {
  const map = useMap()
  useEffect(() => {
    const deg = Math.max(0.15, radius / 55)
    map.fitBounds([[center.lat - deg, center.lng - deg * 1.2], [center.lat + deg, center.lng + deg * 1.2]])
  }, [map, center.lat, center.lng, radius])
  return null
}

export default function CollegeMap({ origin, radius, colleges, selected, showRadius, onToggle }: {
  origin: Point; radius: number; colleges: College[]; selected: Set<string>; showRadius: boolean; onToggle?: (id: string) => void
}) {
  return (
    <MapContainer center={[origin.lat, origin.lng]} zoom={10} scrollWheelZoom={false} className="h-56 w-full rounded-xl">
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Fit center={origin} radius={radius} />
      {showRadius && <Circle center={[origin.lat, origin.lng]} radius={radius * 1609.34} pathOptions={{ color: '#4f46e5', weight: 1, fillOpacity: 0.06 }} />}
      <CircleMarker center={[origin.lat, origin.lng]} radius={5} pathOptions={{ color: '#111827', fillOpacity: 1 }}>
        <Tooltip>You</Tooltip>
      </CircleMarker>
      {colleges.map((c) => {
        const on = selected.has(c.id)
        return (
          <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={on ? 8 : 6}
            eventHandlers={{ click: () => onToggle?.(c.id) }}
            pathOptions={{ color: on ? '#4f46e5' : '#94a3b8', fillColor: on ? '#6366f1' : '#cbd5e1', fillOpacity: 0.9 }}>
            <Tooltip>{c.short} — {c.name}</Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
