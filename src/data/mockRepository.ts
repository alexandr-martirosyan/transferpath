import type { Articulation, Dataset, Section, Term } from '../domain/types'
import type { DataRepository } from './repository'
import { colleges, zips } from './mock/colleges'
import { buildCourses } from './mock/catalog'
import { admissionStats, majors, requirements, tagRules } from './mock/majors'
import { mulberry32 } from '../services/rng'

const INSTRUCTORS = ['A. Petrosyan', 'M. Garcia', 'J. Kim', 'S. Nguyen', 'R. Patel', 'L. Johnson', 'D. Hakobyan', 'T. Lopez', 'E. Chen', 'K. Williams']
const SLOTS: [string, string][] = [['MW', '8:00–9:50 AM'], ['MW', '10:00–11:50 AM'], ['TTh', '9:30–11:20 AM'], ['TTh', '1:00–2:50 PM'], ['MW', '6:00–8:50 PM'], ['F', '9:00 AM–1:50 PM'], ['Sa', '8:00 AM–12:50 PM'], ['—', 'Asynchronous']]
const TERMS: Term[] = ['Winter', 'Spring', 'Summer', 'Fall']

export class MockRepository implements DataRepository {
  async load(): Promise<Dataset> {
    const ccIds = colleges.filter((c) => c.type === 'CC').map((c) => c.id)
    const courses = buildCourses(ccIds)

    // Articulation = CC course with the same canonical concept. A few hand-picked
    // "no articulation" exceptions mimic real ASSIST gaps.
    // "@*" = no community college articulates it (e.g. UCB CS 70 is rarely articulated).
    const exceptions = new Set([
      'ucb-cs:DISCRETE@*', 'ucb-eecs:DISCRETE@*',
      'ucla-cs:ASSEMBLY@gcc', 'ucla-cse:ASSEMBLY@gcc', 'ucsd-cs:ASSEMBLY@gcc', 'uci-cs:DISCRETE@gcc',
      'ucb-cs:ASSEMBLY@lacc', 'ucla-cs:ASSEMBLY@elac', 'ucsd-cs:CS3@citrus', 'ucla-cs:PHYS3@lavc',
    ])
    const byCollegeCanon = new Map<string, string>()
    courses.forEach((c) => byCollegeCanon.set(`${c.collegeId}|${c.canon}`, c.id))
    const articulations: Articulation[] = []
    for (const r of requirements) {
      for (const cc of ccIds) {
        const id = byCollegeCanon.get(`${cc}|${r.canon}`)
        const blocked = exceptions.has(`${r.id}@${cc}`) || exceptions.has(`${r.id}@*`)
        articulations.push({ requirementId: r.id, collegeId: cc, courseIds: id && !blocked ? [id] : null })
      }
    }

    // Deterministic fake schedule: most courses offered in most terms.
    const rand = mulberry32(42)
    const sections: Section[] = []
    for (const c of courses) {
      for (const term of TERMS) {
        if (rand() < (term === 'Summer' ? 0.55 : term === 'Winter' ? 0.4 : 0.15)) continue
        const n = 1 + Math.floor(rand() * (term === 'Winter' || term === 'Summer' ? 2 : 3))
        for (let i = 0; i < n; i++) {
          const [days, time] = SLOTS[Math.floor(rand() * SLOTS.length)]
          const capacity = [30, 35, 40, 45][Math.floor(rand() * 4)]
          const seats = rand() < 0.3 ? 0 : Math.floor(rand() * capacity * 0.6)
          sections.push({
            id: `${c.id}|${term}|${i}`,
            courseId: c.id,
            term,
            year: term === 'Fall' ? 2027 : 2027,
            days,
            time,
            modality: days === '—' ? 'Online' : rand() < 0.2 ? 'Hybrid' : 'In person',
            seats,
            capacity,
            instructor: INSTRUCTORS[Math.floor(rand() * INSTRUCTORS.length)],
          })
        }
      }
    }

    return {
      colleges, courses, majors, requirements, articulations, admissionStats, sections, tagRules, zips,
      meta: { source: 'mock', generatedAt: new Date().toISOString(), note: 'Illustrative demo data — verify with ASSIST.org and a counselor.' },
    }
  }
}
