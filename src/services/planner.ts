import type { College, Course, Dataset, Major, Requirement } from '../domain/types'

const norm = (s: string) => s.toLowerCase().trim()

export function matchMajors(d: Dataset, ucIds: string[], keyword: string): Major[] {
  const q = norm(keyword)
  return d.majors.filter(
    (m) => (ucIds.length === 0 || ucIds.includes(m.ucId)) && (!q || m.keywords.some((k) => k.includes(q) || q.includes(k)) || norm(m.name).includes(q)),
  )
}

/**
 * Split keyword matches: "main" = the major's name equals (or, if none, contains) the keyword,
 * "related" = matched only through related keywords (e.g. Software Engineering for "computer science").
 */
export function classifyMajors(d: Dataset, ucIds: string[], keyword: string) {
  const q = norm(keyword)
  const all = matchMajors(d, ucIds, keyword)
  // Exact program name wins ("computer science" → only "Computer Science"); otherwise names containing it.
  const exact = all.filter((m) => norm(m.name) === q)
  const main = !q ? all : exact.length ? exact : all.filter((m) => norm(m.name).includes(q))
  const related = all.filter((m) => !main.includes(m))
  return { main, related }
}

/** Majors actually in the plan: main ones unless unticked, related ones only if ticked. */
export function plannedMajors(d: Dataset, ucIds: string[], keyword: string, overrides: Record<string, boolean>) {
  const { main, related } = classifyMajors(d, ucIds, keyword)
  return {
    main,
    related,
    selected: [...main.filter((m) => overrides[m.id] !== false), ...related.filter((m) => overrides[m.id] === true)],
  }
}

export interface MatrixCell { courses: Course[] }
export interface MatrixRow { req: Requirement; cells: Record<string, MatrixCell>; covered: boolean; coveredAtHome: boolean }

export function buildMatrix(d: Dataset, major: Major, collegeIds: string[], homeId?: string): MatrixRow[] {
  const courseById = new Map(d.courses.map((c) => [c.id, c]))
  const reqs = d.requirements.filter((r) => r.majorId === major.id)
  return reqs
    .map((req) => {
      const cells: Record<string, MatrixCell> = {}
      for (const cid of collegeIds) {
        const art = d.articulations.find((a) => a.requirementId === req.id && a.collegeId === cid)
        cells[cid] = { courses: (art?.courseIds ?? []).map((id) => courseById.get(id)!).filter(Boolean) }
      }
      const covered = collegeIds.some((cid) => cells[cid].courses.length > 0)
      const coveredAtHome = !!homeId && (cells[homeId]?.courses.length ?? 0) > 0
      return { req, cells, covered, coveredAtHome }
    })
    .sort((a, b) => (a.req.kind === b.req.kind ? 0 : a.req.kind === 'required' ? -1 : 1))
}

export function coverage(rows: MatrixRow[]) {
  const req = rows.filter((r) => r.req.kind === 'required')
  return {
    required: req.length,
    covered: req.filter((r) => r.covered).length,
    atHome: req.filter((r) => r.coveredAtHome).length,
    missing: req.filter((r) => !r.covered).map((r) => r.req),
  }
}

export interface ComboStep { college: College; adds: Requirement[] }

/**
 * Greedy set cover: smallest set of colleges that covers every required UC requirement
 * (per major — articulation differs by UC) across all selected majors. Home college first.
 */
export function bestCombo(d: Dataset, majors: Major[], collegeIds: string[], homeId?: string) {
  const majorIds = new Set(majors.map((m) => m.id))
  const reqs = d.requirements.filter((r) => majorIds.has(r.majorId) && r.kind === 'required')
  const reqById = new Map(reqs.map((r) => [r.id, r]))
  const offers = new Map<string, Set<string>>()
  for (const cid of collegeIds) offers.set(cid, new Set())
  for (const a of d.articulations) {
    if (a.courseIds && offers.has(a.collegeId) && reqById.has(a.requirementId)) offers.get(a.collegeId)!.add(a.requirementId)
  }
  const remaining = new Set(reqById.keys())
  const steps: ComboStep[] = []
  const take = (cid: string) => {
    const adds = [...offers.get(cid)!].filter((k) => remaining.has(k))
    adds.forEach((k) => remaining.delete(k))
    steps.push({ college: d.colleges.find((c) => c.id === cid)!, adds: adds.map((id) => reqById.get(id)!) })
    offers.delete(cid)
  }
  if (homeId && offers.has(homeId)) take(homeId)
  while (remaining.size > 0 && offers.size > 0) {
    let best: string | null = null
    let bestN = 0
    for (const [cid, set] of offers) {
      const n = [...set].filter((k) => remaining.has(k)).length
      if (n > bestN) { best = cid; bestN = n }
    }
    if (!best) break
    take(best)
  }
  return { steps, uncovered: [...remaining].map((id) => reqById.get(id)!), totalNeeded: reqById.size, distinctCourses: new Set(reqs.map((r) => r.canon)).size }
}

/** Describe a set of requirements compactly: "Calculus I · Data Structures (UCLA, UCSD)". */
export function summarizeReqs(reqs: Requirement[], ucShort: (majorId: string) => string, allMajors: number) {
  const byCanon = new Map<string, { label: string; ucs: Set<string>; n: number }>()
  for (const r of reqs) {
    const e = byCanon.get(r.canon) ?? { label: r.label, ucs: new Set<string>(), n: 0 }
    e.ucs.add(ucShort(r.majorId)); e.n++
    byCanon.set(r.canon, e)
  }
  return [...byCanon.values()].map((e) => (e.n >= allMajors ? e.label : `${e.label} (${[...e.ucs].join(', ')})`))
}

/** Course concepts shared by many selected majors → "take these first". */
export function sharedRequirements(d: Dataset, majors: Major[]) {
  const ids = new Set(majors.map((m) => m.id))
  const counts = new Map<string, { label: string; required: number; recommended: number }>()
  for (const r of d.requirements) {
    if (!ids.has(r.majorId)) continue
    const e = counts.get(r.canon) ?? { label: r.label, required: 0, recommended: 0 }
    e[r.kind]++
    counts.set(r.canon, e)
  }
  return [...counts.entries()]
    .map(([canon, v]) => ({ canon, ...v, total: v.required + v.recommended }))
    .sort((a, b) => b.required - a.required || b.total - a.total)
}
