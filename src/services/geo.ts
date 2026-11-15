import type { College } from '../domain/types'

export interface Point { lat: number; lng: number }

export function milesBetween(a: Point, b: Point): number {
  const R = 3958.8
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function withinRadius(origin: Point, colleges: College[], miles: number) {
  return colleges
    .map((c) => ({ college: c, miles: milesBetween(origin, c) }))
    .filter((x) => x.miles <= miles)
    .sort((a, b) => a.miles - b.miles)
}
