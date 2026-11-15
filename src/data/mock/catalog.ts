import type { CanonKey, Course, GETag } from '../../domain/types'

// Canonical course concepts. Real data would come from ASSIST course-to-course agreements;
// here each CC course maps to one concept, and equivalence = same concept.
interface Concept {
  key: CanonKey
  dept: string
  num: string // default course number at a CC
  title: string
  units: number
  ge: GETag[]
}

export const concepts: Concept[] = [
  { key: 'CALC1', dept: 'MATH', num: '110', title: 'Calculus I', units: 5, ge: ['2'] },
  { key: 'CALC2', dept: 'MATH', num: '111', title: 'Calculus II', units: 5, ge: ['2'] },
  { key: 'CALC3', dept: 'MATH', num: '112', title: 'Multivariable Calculus', units: 5, ge: ['2'] },
  { key: 'LINALG', dept: 'MATH', num: '115', title: 'Linear Algebra', units: 3, ge: ['2'] },
  { key: 'DIFFEQ', dept: 'MATH', num: '116', title: 'Differential Equations', units: 3, ge: ['2'] },
  { key: 'DISCRETE', dept: 'MATH', num: '120', title: 'Discrete Mathematics', units: 3, ge: ['2'] },
  { key: 'STATS', dept: 'MATH', num: '136', title: 'Introductory Statistics', units: 4, ge: ['2'] },
  { key: 'PHYS1', dept: 'PHYS', num: '101', title: 'Physics: Mechanics', units: 5, ge: ['5A', '5C'] },
  { key: 'PHYS2', dept: 'PHYS', num: '102', title: 'Physics: Electricity & Magnetism', units: 5, ge: ['5A', '5C'] },
  { key: 'PHYS3', dept: 'PHYS', num: '103', title: 'Physics: Waves, Optics & Modern', units: 5, ge: ['5A', '5C'] },
  { key: 'CHEM1', dept: 'CHEM', num: '101', title: 'General Chemistry I', units: 5, ge: ['5A', '5C'] },
  { key: 'CHEM2', dept: 'CHEM', num: '102', title: 'General Chemistry II', units: 5, ge: ['5A', '5C'] },
  { key: 'BIO1', dept: 'BIOL', num: '101', title: 'General Biology', units: 4, ge: ['5B', '5C'] },
  { key: 'CS1', dept: 'CS', num: '111', title: 'Programming in C++ / Java I', units: 4, ge: [] },
  { key: 'CS2', dept: 'CS', num: '112', title: 'Object-Oriented Programming II', units: 4, ge: [] },
  { key: 'CS3', dept: 'CS', num: '113', title: 'Data Structures', units: 4, ge: [] },
  { key: 'ASSEMBLY', dept: 'CS', num: '130', title: 'Computer Architecture & Assembly', units: 3, ge: [] },
  { key: 'PYDATA', dept: 'CS', num: '150', title: 'Python for Data Science', units: 3, ge: [] },
  { key: 'CIRCUITS', dept: 'ENGR', num: '120', title: 'Electric Circuits + Lab', units: 4, ge: [] },
  { key: 'STATICS', dept: 'ENGR', num: '130', title: 'Engineering Statics', units: 3, ge: [] },
  { key: 'CAD', dept: 'ENGR', num: '110', title: 'Engineering Graphics & CAD', units: 3, ge: [] },
  { key: 'MATLAB', dept: 'ENGR', num: '115', title: 'Programming for Engineers (MATLAB)', units: 3, ge: [] },
  { key: 'MATERIALS', dept: 'ENGR', num: '140', title: 'Materials Science', units: 3, ge: [] },
  // GE fillers
  { key: 'ENGL1A', dept: 'ENGL', num: '101', title: 'Freshman Composition', units: 4, ge: ['1A'] },
  { key: 'CRIT', dept: 'ENGL', num: '102', title: 'Critical Thinking & Writing', units: 3, ge: ['1B'] },
  { key: 'SPEECH', dept: 'COMM', num: '101', title: 'Public Speaking', units: 3, ge: ['1C'] },
  { key: 'ARTHIST', dept: 'ART', num: '101', title: 'Art History Survey', units: 3, ge: ['3A'] },
  { key: 'MUSIC', dept: 'MUSIC', num: '101', title: 'Music Appreciation', units: 3, ge: ['3A'] },
  { key: 'PHIL', dept: 'PHIL', num: '101', title: 'Introduction to Philosophy', units: 3, ge: ['3B'] },
  { key: 'ETHICS', dept: 'PHIL', num: '120', title: 'Ethics & Technology', units: 3, ge: ['3B'] },
  { key: 'HIST', dept: 'HIST', num: '117', title: 'U.S. History', units: 3, ge: ['3B', '4'] },
  { key: 'PSYCH', dept: 'PSYC', num: '101', title: 'General Psychology', units: 3, ge: ['4'] },
  { key: 'SOC', dept: 'SOC', num: '101', title: 'Introduction to Sociology', units: 3, ge: ['4'] },
  { key: 'ECON', dept: 'ECON', num: '102', title: 'Principles of Macroeconomics', units: 3, ge: ['4'] },
  { key: 'POLI', dept: 'POLS', num: '101', title: 'American Government', units: 3, ge: ['4'] },
  { key: 'ETHNIC', dept: 'ETHS', num: '101', title: 'Introduction to Ethnic Studies', units: 3, ge: ['ETH', '4'] },
  { key: 'ASTRO', dept: 'ASTR', num: '101', title: 'Astronomy', units: 3, ge: ['5A'] },
  { key: 'SPAN', dept: 'SPAN', num: '102', title: 'Elementary Spanish II', units: 5, ge: ['3B', 'LOTE'] },
  { key: 'ARMN', dept: 'ARMN', num: '102', title: 'Elementary Armenian II', units: 5, ge: ['3B', 'LOTE'] },
]

interface CollegeCatalogSpec {
  /** concepts this college does NOT offer */
  missing?: CanonKey[]
  /** custom course numbers, "DEPT NUM" */
  codes?: Record<CanonKey, string>
}

// Deliberate gaps make the multi-college comparison meaningful.
const specs: Record<string, CollegeCatalogSpec> = {
  gcc: { missing: ['STATICS', 'MATERIALS', 'PYDATA'], codes: { CALC1: 'MATH 103', CALC2: 'MATH 104', CALC3: 'MATH 105', CS1: 'CS/IS 135', CS2: 'CS/IS 165', CS3: 'CS/IS 166', ASSEMBLY: 'CS/IS 212' } },
  pcc: { missing: ['ARMN', 'MATLAB'], codes: { CALC1: 'MATH 5A', CALC2: 'MATH 5B', CALC3: 'MATH 5C', PHYS1: 'PHYS 1A', PHYS2: 'PHYS 1B', PHYS3: 'PHYS 1C', CS1: 'CS 002', CS2: 'CS 003A', CS3: 'CS 003B' } },
  lavc: { missing: ['ASSEMBLY', 'CIRCUITS', 'PYDATA', 'ARMN'], codes: { CALC1: 'MATH 261', CALC2: 'MATH 262', CALC3: 'MATH 263' } },
  lacc: { missing: ['CIRCUITS', 'STATICS', 'MATERIALS', 'CAD', 'MATLAB', 'ARMN'], codes: { CALC1: 'MATH 261', CALC2: 'MATH 262', CALC3: 'MATH 263' } },
  elac: { missing: ['PYDATA', 'ARMN', 'MATERIALS'], codes: { CALC1: 'MATH 261', CALC2: 'MATH 262', CALC3: 'MATH 263' } },
  smc: { missing: ['ARMN', 'MATERIALS'], codes: { CALC1: 'MATH 7', CALC2: 'MATH 8', CALC3: 'MATH 11', LINALG: 'MATH 13', DIFFEQ: 'MATH 15', PHYS1: 'PHYS 21', PHYS2: 'PHYS 22', PHYS3: 'PHYS 23', CS1: 'CS 52', CS2: 'CS 53', CS3: 'CS 20A', ASSEMBLY: 'CS 17' } },
  piercecc: { missing: ['ASSEMBLY', 'DISCRETE', 'ARMN', 'PYDATA'], codes: { CALC1: 'MATH 261', CALC2: 'MATH 262', CALC3: 'MATH 263' } },
  citrus: { missing: ['ASSEMBLY', 'MATERIALS', 'ARMN', 'LINALG'] },
  mtsac: { missing: ['ARMN'], codes: { CALC1: 'MATH 180', CALC2: 'MATH 181', CALC3: 'MATH 280' } },
  riohondo: { missing: ['ASSEMBLY', 'CIRCUITS', 'STATICS', 'MATERIALS', 'PYDATA', 'ARMN'] },
  coc: { missing: ['ARMN', 'PYDATA'] },
  elcamino: { missing: ['ARMN'], codes: { CALC1: 'MATH 190', CALC2: 'MATH 191', CALC3: 'MATH 220' } },
}

// Courses that are typically not UC-transferable in this mock (none of the above concepts are,
// but keep the hook so real data can mark e.g. basic skills courses).
const notTransferable = new Set<CanonKey>([])

export function buildCourses(collegeIds: string[]): Course[] {
  const out: Course[] = []
  for (const collegeId of collegeIds) {
    const spec = specs[collegeId] ?? {}
    for (const c of concepts) {
      if (spec.missing?.includes(c.key)) continue
      const code = spec.codes?.[c.key] ?? `${c.dept} ${c.num}`
      out.push({
        id: `${collegeId}:${code}`,
        collegeId,
        code,
        dept: code.split(' ')[0],
        title: c.title,
        units: c.units,
        canon: c.key,
        ge: c.ge,
        ucTransferable: !notTransferable.has(c.key),
      })
    }
  }
  return out
}
