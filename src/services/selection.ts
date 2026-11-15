import type { College, Dataset } from '../domain/types'
import type { Profile } from '../state/profile'
import { milesBetween, type Point } from './geo'

export function resolveOrigin(p: Profile, d: Dataset): { point: Point; label: string } {
  if (p.originMode === 'gps' && p.gps) return { point: p.gps, label: 'My location' }
  if (p.originMode === 'zip') {
    const z = d.zips.find((z) => z.zip === p.zip)
    if (z) return { point: z, label: `${z.zip} · ${z.city}` }
  }
  const home = d.colleges.find((c) => c.id === p.homeCollegeId) ?? d.colleges[0]
  return { point: home, label: home.name }
}

export interface CollegeInScope { college: College; miles: number; isHome: boolean }

/** Community colleges the student is considering: radius around origin, or manual checkboxes. */
export function collegesInScope(p: Profile, d: Dataset): CollegeInScope[] {
  const { point } = resolveOrigin(p, d)
  const ccs = d.colleges.filter((c) => c.type === 'CC')
  const list = ccs
    .map((college) => ({ college, miles: milesBetween(point, college), isHome: college.id === p.homeCollegeId }))
    .filter((x) => (p.selectionMode === 'manual' ? p.manualCollegeIds.includes(x.college.id) : x.miles <= p.radius || x.isHome))
  return list.sort((a, b) => Number(b.isHome) - Number(a.isHome) || a.miles - b.miles)
}
