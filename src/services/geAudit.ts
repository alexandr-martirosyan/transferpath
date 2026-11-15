import type { Course, GETag } from '../domain/types'

export interface AreaRule {
  id: string
  name: string
  count: number // courses required
  tags: GETag[] // a course with any of these tags can count
  mustInclude?: GETag[][] // each inner list: at least one chosen course must carry one of the tags
  distinctDepts?: number
  labRequired?: boolean
  optional?: string // shown as note instead of required
  desc: string // plain-language rule shown to students
}

export const TAG_NAMES: Record<string, string> = {
  '1A': 'English Composition', '1B': 'Critical Thinking', '1C': 'Oral Communication', '2': 'Math/Statistics',
  '3A': 'Arts', '3B': 'Humanities', '4': 'Social & Behavioral Science', '5A': 'Physical Science',
  '5B': 'Biological Science', '5C': 'Lab', ETH: 'Ethnic Studies', LOTE: 'Language other than English',
}

export interface GEPatternDef { id: 'calgetc' | 'igetc'; name: string; summary: string; areas: AreaRule[] }

export const CAL_GETC: GEPatternDef = {
  id: 'calgetc',
  name: 'Cal-GETC',
  summary: 'For students who began college Fall 2025 or later. 11 courses, 34 semester units, same pattern for UC and CSU.',
  areas: [
    { id: '1A', name: 'English Composition', count: 1, tags: ['1A'], desc: '1 course (3 units) in college-level English composition.' },
    { id: '1B', name: 'Critical Thinking & Composition', count: 1, tags: ['1B'], desc: '1 course (3 units) in critical thinking and writing.' },
    { id: '1C', name: 'Oral Communication', count: 1, tags: ['1C'], desc: '1 course (3 units) in oral communication, e.g. public speaking.' },
    { id: '2', name: 'Mathematical Concepts & Quantitative Reasoning', count: 1, tags: ['2'], desc: '1 course (3 units) in math or statistics above intermediate algebra.' },
    { id: '3', name: 'Arts & Humanities', count: 2, tags: ['3A', '3B'], mustInclude: [['3A'], ['3B']], desc: '2 courses (6 units): at least 1 Arts course (art, music, theater) and 1 Humanities course (philosophy, literature, history, language).' },
    { id: '4', name: 'Social & Behavioral Sciences', count: 2, tags: ['4'], distinctDepts: 2, desc: '2 courses (6 units) from 2 different subjects, e.g. psychology + sociology or economics + political science.' },
    { id: '5', name: 'Physical & Biological Sciences', count: 2, tags: ['5A', '5B'], mustInclude: [['5A'], ['5B']], labRequired: true, desc: '2 courses (7+ units): 1 Physical Science (physics, chemistry, astronomy, geology) and 1 Biological Science. At least one must include a lab.' },
    { id: '6', name: 'Ethnic Studies', count: 1, tags: ['ETH'], desc: '1 course (3 units) in Ethnic Studies.' },
  ],
}

export const IGETC: GEPatternDef = {
  id: 'igetc',
  name: 'IGETC',
  summary: 'For students who began college before Fall 2025 (UC version). 1C is CSU-only.',
  areas: [
    { id: '1A', name: 'English Composition', count: 1, tags: ['1A'], desc: '1 course (3 units) in college-level English composition.' },
    { id: '1B', name: 'Critical Thinking & Composition', count: 1, tags: ['1B'], desc: '1 course (3 units) in critical thinking and writing.' },
    { id: '1C', name: 'Oral Communication', count: 1, tags: ['1C'], optional: 'CSU only — not required for UC', desc: '1 oral communication course. Required only for CSU, not for UC.' },
    { id: '2', name: 'Mathematical Concepts & Quantitative Reasoning', count: 1, tags: ['2'], desc: '1 course (3 units) in math or statistics above intermediate algebra.' },
    { id: '3', name: 'Arts & Humanities', count: 3, tags: ['3A', '3B'], mustInclude: [['3A'], ['3B']], desc: '3 courses (9 units): at least 1 Arts and 1 Humanities course.' },
    { id: '4', name: 'Social & Behavioral Sciences', count: 3, tags: ['4', 'ETH'], distinctDepts: 2, desc: '3 courses (9 units) from at least 2 different subjects.' },
    { id: '5', name: 'Physical & Biological Sciences', count: 2, tags: ['5A', '5B'], mustInclude: [['5A'], ['5B']], labRequired: true, desc: '2 courses (7+ units): 1 Physical Science (physics, chemistry, astronomy, geology) and 1 Biological Science. At least one must include a lab.' },
    { id: '6', name: 'Language Other Than English', count: 1, tags: ['LOTE'], optional: 'May be met by 2 years of the same high-school language (C or better)', desc: 'Proficiency in a language other than English: 2 years of the same language in high school (C or better), or 1 college course at the 2nd-semester level.' },
  ],
}

export function patternFor(startYear: number, chosen: 'calgetc' | 'igetc'): { pattern: GEPatternDef; canChoose: boolean } {
  if (startYear >= 2025) return { pattern: CAL_GETC, canChoose: false }
  return { pattern: chosen === 'igetc' ? IGETC : CAL_GETC, canChoose: true }
}

export interface AreaResult { rule: AreaRule; used: Course[]; done: boolean; missing: string[] }

/** Greedy allocation: each course counts in at most one area (matches certification rules). */
export function auditGE(pattern: GEPatternDef, courses: Course[]): AreaResult[] {
  const used = new Set<string>()
  // Allocate scarce areas first so a multi-tag course (e.g. Ethnic Studies) lands where it is unique.
  const special = (r: AreaRule) => (r.tags.includes('ETH') && r.tags.length === 1) || r.tags.includes('LOTE') ? 0 : 1
  const order = [...pattern.areas].sort((a, b) => special(a) - special(b) || a.tags.length - b.tags.length)
  const results = new Map<string, AreaResult>()
  for (const rule of order) {
    const pool = courses.filter((c) => !used.has(c.id) && c.ge.some((t) => rule.tags.includes(t)))
    const picked: Course[] = []
    // satisfy mustInclude first
    for (const group of rule.mustInclude ?? []) {
      const c = pool.find((x) => !picked.includes(x) && x.ge.some((t) => group.includes(t)) && (!rule.labRequired || x.ge.includes('5C') || picked.some((p) => p.ge.includes('5C'))))
        ?? pool.find((x) => !picked.includes(x) && x.ge.some((t) => group.includes(t)))
      if (c) picked.push(c)
    }
    for (const c of pool) {
      if (picked.length >= rule.count) break
      if (picked.includes(c)) continue
      if (rule.distinctDepts && picked.length < rule.distinctDepts && picked.some((p) => p.dept === c.dept)) continue
      picked.push(c)
    }
    for (const c of pool) { if (picked.length >= rule.count) break; if (!picked.includes(c)) picked.push(c) }
    picked.forEach((c) => used.add(c.id))

    const missing: string[] = []
    if (picked.length < rule.count) missing.push(`${rule.count - picked.length} more course${rule.count - picked.length > 1 ? 's' : ''}`)
    rule.mustInclude?.forEach((g) => { if (!picked.some((c) => c.ge.some((t) => g.includes(t)))) missing.push(`1 ${g.map((t) => TAG_NAMES[t]).join('/')} course`) })
    if (rule.distinctDepts && new Set(picked.map((c) => c.dept)).size < rule.distinctDepts) missing.push(`courses from ${rule.distinctDepts} different subjects`)
    if (rule.labRequired && !picked.some((c) => c.ge.includes('5C'))) missing.push('a course with a lab')
    results.set(rule.id, { rule, used: picked, done: missing.length === 0, missing })
  }
  return pattern.areas.map((a) => results.get(a.id)!)
}

/** Courses (not yet used) that would help complete this area, most useful first. */
export function suggestFor(result: AreaResult, candidates: Course[]): Course[] {
  const { rule, used } = result
  let pool = candidates.filter((c) => c.ge.some((t) => rule.tags.includes(t)))
  const unmet = (rule.mustInclude ?? []).filter((g) => !used.some((c) => c.ge.some((t) => g.includes(t))))
  if (unmet.length) pool = pool.filter((c) => unmet.some((g) => c.ge.some((t) => g.includes(t))))
  const depts = new Set(used.map((c) => c.dept))
  if (rule.distinctDepts && depts.size < rule.distinctDepts) pool = pool.filter((c) => !depts.has(c.dept))
  const needLab = rule.labRequired && !used.some((c) => c.ge.includes('5C'))
  return pool.sort((a, b) => (needLab ? Number(b.ge.includes('5C')) - Number(a.ge.includes('5C')) : 0))
}
