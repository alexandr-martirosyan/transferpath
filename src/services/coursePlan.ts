import type { Course, Dataset, Major, Requirement, TakenCourse } from '../domain/types'
import { milesBetween, type Point } from './geo'

export type CourseStatus = 'done' | 'planned' | 'todo'

export interface WhereOption { collegeId: string; course: Course; miles: number; forAll: boolean; majorIds: string[] }

export interface PlanCourse {
  canon: string
  label: string
  units: number
  requiredBy: Major[]
  recommendedBy: Major[]
  status: CourseStatus
  takenAs?: Course
  best?: WhereOption // where to take it (home if possible, else nearest that works for every major)
  others: WhereOption[]
  missingFor: Major[] // majors where no selected college articulates it
}

/**
 * Merge requirements of all "My majors" into ONE de-duplicated course checklist:
 * what to take, for which majors, its status, and where to take it.
 */
export function buildCoursePlan(d: Dataset, majors: Major[], collegeIds: string[], homeId: string, origin: Point, taken: TakenCourse[]): PlanCourse[] {
  const courseById = new Map(d.courses.map((c) => [c.id, c]))
  const reqs = d.requirements.filter((r) => majors.some((m) => m.id === r.majorId))
  const byCanon = new Map<string, Requirement[]>()
  reqs.forEach((r) => byCanon.set(r.canon, [...(byCanon.get(r.canon) ?? []), r]))
  const majorById = new Map(majors.map((m) => [m.id, m]))
  const takenByCanon = new Map<string, TakenCourse & { course: Course }>()
  for (const t of taken) {
    const c = courseById.get(t.courseId)
    if (c && t.grade !== 'F' && t.grade !== 'D') takenByCanon.set(c.canon, { ...t, course: c })
  }

  const out: PlanCourse[] = []
  for (const [canon, rs] of byCanon) {
    const required = rs.filter((r) => r.kind === 'required')
    const neededIds = (required.length ? required : rs).map((r) => r.majorId)
    // per college: which majors does it satisfy?
    const perCollege = new Map<string, { course: Course; majorIds: string[] }>()
    for (const r of rs) {
      for (const a of d.articulations) {
        if (a.requirementId !== r.id || !a.courseIds || !collegeIds.includes(a.collegeId)) continue
        const course = courseById.get(a.courseIds[0])!
        const e = perCollege.get(a.collegeId) ?? { course, majorIds: [] }
        e.majorIds.push(r.majorId)
        perCollege.set(a.collegeId, e)
      }
    }
    const options: WhereOption[] = [...perCollege.entries()].map(([collegeId, e]) => {
      const col = d.colleges.find((c) => c.id === collegeId)!
      return { collegeId, course: e.course, miles: milesBetween(origin, col), forAll: neededIds.every((id) => e.majorIds.includes(id)), majorIds: e.majorIds }
    }).sort((a, b) => Number(b.collegeId === homeId) - Number(a.collegeId === homeId) || Number(b.forAll) - Number(a.forAll) || a.miles - b.miles)
    const best = options.find((o) => o.forAll) ?? options[0]
    const covered = new Set(options.flatMap((o) => o.majorIds))
    const t = takenByCanon.get(canon)
    out.push({
      canon,
      label: rs[0].label,
      units: best?.course.units ?? d.courses.find((c) => c.canon === canon)?.units ?? 3,
      requiredBy: required.map((r) => majorById.get(r.majorId)!),
      recommendedBy: rs.filter((r) => r.kind === 'recommended').map((r) => majorById.get(r.majorId)!),
      status: !t ? 'todo' : t.grade === 'IP' || t.grade === 'PLAN' ? 'planned' : 'done',
      takenAs: t?.course,
      best,
      others: options.filter((o) => o !== best),
      missingFor: [...new Set(neededIds)].filter((id) => !covered.has(id)).map((id) => majorById.get(id)!),
    })
  }
  const statusOrder = { todo: 0, planned: 1, done: 2 }
  return out.sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || b.requiredBy.length - a.requiredBy.length || a.label.localeCompare(b.label))
}

export interface MajorFit {
  major: Major
  required: Requirement[]
  done: Requirement[] // completed or in progress/planned
  missing: Requirement[]
  pct: number
}

/**
 * "What else could I major in?" — rank every major by how much of its REQUIRED prep the
 * student's taken (incl. in-progress/planned) courses already satisfy. Uses course concepts,
 * so it works across colleges.
 */
export function majorFit(d: Dataset, taken: TakenCourse[], ucIds: string[] = []): MajorFit[] {
  const courseById = new Map(d.courses.map((c) => [c.id, c]))
  const have = new Set(taken.filter((t) => t.grade !== 'F' && t.grade !== 'D').map((t) => courseById.get(t.courseId)?.canon).filter(Boolean) as string[])
  return d.majors
    .filter((m) => !ucIds.length || ucIds.includes(m.ucId))
    .map((major) => {
      const required = d.requirements.filter((r) => r.majorId === major.id && r.kind === 'required')
      const done = required.filter((r) => have.has(r.canon))
      const missing = required.filter((r) => !have.has(r.canon))
      return { major, required, done, missing, pct: required.length ? done.length / required.length : 0 }
    })
    .sort((a, b) => a.missing.length - b.missing.length || b.pct - a.pct)
}
