import type { Course, Grade, TakenCourse } from '../domain/types'

export const GRADE_POINTS: Partial<Record<Grade, number>> = { A: 4, B: 3, C: 2, D: 1, F: 0 }
export const GRADE_LABELS: Record<Grade, string> = { A: 'A', B: 'B', C: 'C', D: 'D', F: 'F', P: 'Pass', IP: 'In progress', PLAN: 'Planned' }

export function computeGpa(taken: TakenCourse[], courseById: Map<string, Course>) {
  let points = 0, graded = 0, completed = 0, pending = 0
  for (const t of taken) {
    const c = courseById.get(t.courseId)
    if (!c) continue
    const gp = GRADE_POINTS[t.grade]
    if (gp !== undefined) { points += gp * c.units; graded += c.units }
    if (gp !== undefined || t.grade === 'P') { if (t.grade !== 'F') completed += c.units }
    if (t.grade === 'IP' || t.grade === 'PLAN') pending += c.units
  }
  return { gpa: graded ? points / graded : 0, gradedUnits: graded, completedUnits: completed, pendingUnits: pending }
}

export function projectGpa(current: number, currentUnits: number, newUnits: number, expectedAvg: number) {
  const total = currentUnits + newUnits
  return total ? (current * currentUnits + expectedAvg * newUnits) / total : expectedAvg
}

/** Average grade needed on `newUnits` to reach `target`. May be > 4 (impossible). */
export function requiredAvg(current: number, currentUnits: number, newUnits: number, target: number) {
  return newUnits ? (target * (currentUnits + newUnits) - current * currentUnits) / newUnits : NaN
}
