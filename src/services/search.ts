import type { Course, Dataset, Section, Term } from '../domain/types'
import { milesBetween, type Point } from './geo'

export interface SearchHit { course: Course; collegeName: string; collegeShort: string; miles: number; sections: Section[]; isSource: boolean }

/** Parse "PHYS 103 GCC" / "calculus" / "MATH 5A" → matching source courses. */
export function findSourceCourses(d: Dataset, query: string): Course[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const collegeHit = d.colleges.find((c) => c.type === 'CC' && q.split(/\s+/).includes(c.short.toLowerCase()))
  const rest = collegeHit ? q.replace(new RegExp(`\\b${collegeHit.short.toLowerCase()}\\b`), '').trim() : q
  const compact = (s: string) => s.toLowerCase().replace(/[\s/]/g, '')
  return d.courses.filter((c) => (!collegeHit || c.collegeId === collegeHit.id) && rest && (compact(c.code).includes(compact(rest)) || c.title.toLowerCase().includes(rest)))
}

export function findEquivalents(d: Dataset, source: Course, origin: Point, collegeIds: string[], term: Term | 'Any', openOnly: boolean): SearchHit[] {
  const allowed = new Set(collegeIds)
  return d.courses
    .filter((c) => c.canon === source.canon && (allowed.has(c.collegeId) || c.collegeId === source.collegeId))
    .map((course) => {
      const col = d.colleges.find((x) => x.id === course.collegeId)!
      const sections = d.sections.filter((s) => s.courseId === course.id && (term === 'Any' || s.term === term) && (!openOnly || s.seats > 0))
      return { course, collegeName: col.name, collegeShort: col.short, miles: milesBetween(origin, col), sections, isSource: course.id === source.id }
    })
    .sort((a, b) => a.miles - b.miles)
}
