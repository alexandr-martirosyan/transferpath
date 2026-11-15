import type { AdmissionStat, CanonKey, Major, Requirement, TagRule } from '../../domain/types'

type Kind = 'required' | 'recommended'
type ReqTpl = [CanonKey, Kind]

const R: Kind = 'required'
const O: Kind = 'recommended'

const TEMPLATES: Record<string, ReqTpl[]> = {
  cs: [['CALC1', R], ['CALC2', R], ['CALC3', O], ['LINALG', R], ['DISCRETE', R], ['CS1', R], ['CS2', R], ['CS3', R], ['ASSEMBLY', R], ['PHYS1', O], ['PHYS2', O]],
  csEng: [['CALC1', R], ['CALC2', R], ['CALC3', R], ['LINALG', R], ['DIFFEQ', R], ['DISCRETE', R], ['PHYS1', R], ['PHYS2', R], ['PHYS3', O], ['CS1', R], ['CS2', R], ['CS3', R], ['ASSEMBLY', R], ['CHEM1', O]],
  ce: [['CALC1', R], ['CALC2', R], ['CALC3', R], ['LINALG', R], ['DIFFEQ', R], ['PHYS1', R], ['PHYS2', R], ['PHYS3', O], ['CS1', R], ['CS2', R], ['CS3', R], ['ASSEMBLY', R], ['CIRCUITS', R], ['DISCRETE', O]],
  ee: [['CALC1', R], ['CALC2', R], ['CALC3', R], ['LINALG', R], ['DIFFEQ', R], ['PHYS1', R], ['PHYS2', R], ['PHYS3', R], ['CHEM1', R], ['CS1', R], ['CIRCUITS', R], ['MATLAB', O]],
  me: [['CALC1', R], ['CALC2', R], ['CALC3', R], ['LINALG', R], ['DIFFEQ', R], ['PHYS1', R], ['PHYS2', R], ['PHYS3', O], ['CHEM1', R], ['STATICS', R], ['CAD', R], ['MATLAB', R], ['MATERIALS', O]],
  ds: [['CALC1', R], ['CALC2', R], ['LINALG', R], ['STATS', R], ['CS1', R], ['CS2', R], ['PYDATA', R], ['DISCRETE', O], ['CALC3', O]],
  se: [['CALC1', R], ['CALC2', R], ['LINALG', R], ['DISCRETE', R], ['STATS', R], ['CS1', R], ['CS2', R], ['CS3', R], ['ASSEMBLY', O]],
  mathComp: [['CALC1', R], ['CALC2', R], ['CALC3', R], ['LINALG', R], ['DIFFEQ', R], ['CS1', R], ['CS2', R], ['DISCRETE', O]],
}

const LABELS: Record<CanonKey, string> = {
  CALC1: 'Calculus I', CALC2: 'Calculus II', CALC3: 'Multivariable Calculus', LINALG: 'Linear Algebra',
  DIFFEQ: 'Differential Equations', DISCRETE: 'Discrete Mathematics', STATS: 'Statistics',
  PHYS1: 'Physics — Mechanics', PHYS2: 'Physics — E&M', PHYS3: 'Physics — Waves/Modern',
  CHEM1: 'General Chemistry I', CS1: 'Intro Programming', CS2: 'OOP / Programming II', CS3: 'Data Structures',
  ASSEMBLY: 'Computer Architecture / Assembly', PYDATA: 'Programming for Data Science',
  CIRCUITS: 'Electric Circuits', STATICS: 'Statics', CAD: 'Engineering Graphics / CAD',
  MATLAB: 'Programming for Engineers', MATERIALS: 'Materials Science',
}

// UC-side course numbers (illustrative, partly real) — falls back to the label.
const UC_COURSES: Record<string, Partial<Record<CanonKey, string>>> = {
  ucla: { CALC1: 'MATH 31A', CALC2: 'MATH 31B', CALC3: 'MATH 32A', LINALG: 'MATH 33A', DIFFEQ: 'MATH 33B', DISCRETE: 'MATH 61', PHYS1: 'PHYSICS 1A', PHYS2: 'PHYSICS 1B', PHYS3: 'PHYSICS 1C', CS1: 'COM SCI 31', CS2: 'COM SCI 32', CS3: 'COM SCI 32', ASSEMBLY: 'COM SCI 33', CHEM1: 'CHEM 20A', CIRCUITS: 'EC ENGR 10' },
  ucb: { CALC1: 'MATH 1A', CALC2: 'MATH 1B', CALC3: 'MATH 53', LINALG: 'MATH 54', DIFFEQ: 'MATH 54', DISCRETE: 'COMPSCI 70', PHYS1: 'PHYSICS 7A', PHYS2: 'PHYSICS 7B', CS1: 'COMPSCI 61A', CS2: 'COMPSCI 61B', CS3: 'COMPSCI 61B', ASSEMBLY: 'COMPSCI 61C', STATS: 'DATA C8', PYDATA: 'DATA C100' },
  ucsd: { CALC1: 'MATH 20A', CALC2: 'MATH 20B', CALC3: 'MATH 20C', LINALG: 'MATH 18', DIFFEQ: 'MATH 20D', DISCRETE: 'CSE 20', PHYS1: 'PHYS 2A', PHYS2: 'PHYS 2B', PHYS3: 'PHYS 2C', CS1: 'CSE 8A', CS2: 'CSE 11', CS3: 'CSE 12', ASSEMBLY: 'CSE 30' },
  uci: { CALC1: 'MATH 2A', CALC2: 'MATH 2B', CALC3: 'MATH 2D', LINALG: 'MATH 3A', DIFFEQ: 'MATH 3D', DISCRETE: 'I&C SCI 6B', STATS: 'STATS 67', CS1: 'I&C SCI 31', CS2: 'I&C SCI 32', CS3: 'I&C SCI 33', ASSEMBLY: 'I&C SCI 51' },
  ucd: { CALC1: 'MAT 21A', CALC2: 'MAT 21B', CALC3: 'MAT 21C', LINALG: 'MAT 22A', DIFFEQ: 'MAT 22B', CS1: 'ECS 32A', CS2: 'ECS 32B', CS3: 'ECS 36C', ASSEMBLY: 'ECS 50', DISCRETE: 'ECS 20' },
  ucsb: { CALC1: 'MATH 3A', CALC2: 'MATH 3B', CALC3: 'MATH 4B', LINALG: 'MATH 4A', CS1: 'CMPSC 16', CS2: 'CMPSC 24', CS3: 'CMPSC 32', ASSEMBLY: 'CMPSC 64', DISCRETE: 'CMPSC 40' },
  ucsc: { CALC1: 'MATH 19A', CALC2: 'MATH 19B', CALC3: 'MATH 23A', LINALG: 'AM 10', CS1: 'CSE 20', CS2: 'CSE 30', CS3: 'CSE 101', ASSEMBLY: 'CSE 12', DISCRETE: 'CSE 16' },
  ucr: { CALC1: 'MATH 9A', CALC2: 'MATH 9B', CALC3: 'MATH 10A', LINALG: 'MATH 31', CS1: 'CS 010A', CS2: 'CS 010B', CS3: 'CS 010C', ASSEMBLY: 'CS 061', DISCRETE: 'CS 011' },
  ucm: { CALC1: 'MATH 21', CALC2: 'MATH 22', CALC3: 'MATH 23', LINALG: 'MATH 24', CS1: 'CSE 022', CS2: 'CSE 024', CS3: 'CSE 030', ASSEMBLY: 'CSE 031', DISCRETE: 'CSE 015' },
}

interface MajorSpec {
  id: string
  ucId: string
  name: string
  degree?: string
  school: string
  tpl: keyof typeof TEMPLATES
  keywords: string[]
  tag?: boolean
  tap?: boolean
  pathway?: string
  /** admission profile: median admitted GPA, IQR width, admit rate, applicants */
  adm: [number, number, number, number]
}

const KW_CS = ['computer science', 'cs', 'computing', 'software', 'programming']
const KW_ENG = ['engineering']
const KW_DS = ['data science', 'statistics', 'data', 'computing']

const specs: MajorSpec[] = [
  { id: 'ucb-cs', ucId: 'ucb', name: 'Computer Science', degree: 'B.A.', school: 'College of Computing, Data Science & Society', tpl: 'cs', keywords: KW_CS, pathway: 'Computer Science', adm: [3.93, 0.1, 0.1, 2900] },
  { id: 'ucb-eecs', ucId: 'ucb', name: 'Electrical Engineering & Computer Sciences', school: 'College of Engineering', tpl: 'csEng', keywords: [...KW_CS, ...KW_ENG, 'electrical'], adm: [3.95, 0.07, 0.05, 2100] },
  { id: 'ucb-me', ucId: 'ucb', name: 'Mechanical Engineering', school: 'College of Engineering', tpl: 'me', keywords: [...KW_ENG, 'mechanical'], pathway: 'Mechanical Engineering', adm: [3.85, 0.14, 0.19, 900] },
  { id: 'ucb-ds', ucId: 'ucb', name: 'Data Science', degree: 'B.A.', school: 'College of Computing, Data Science & Society', tpl: 'ds', keywords: KW_DS, adm: [3.88, 0.12, 0.17, 1500] },

  { id: 'ucla-cs', ucId: 'ucla', name: 'Computer Science', school: 'Samueli School of Engineering', tpl: 'csEng', keywords: KW_CS, pathway: 'Computer Science', adm: [3.93, 0.09, 0.07, 3000] },
  { id: 'ucla-cse', ucId: 'ucla', name: 'Computer Science & Engineering', school: 'Samueli School of Engineering', tpl: 'ce', keywords: [...KW_CS, ...KW_ENG], adm: [3.92, 0.1, 0.08, 900] },
  { id: 'ucla-ee', ucId: 'ucla', name: 'Electrical Engineering', school: 'Samueli School of Engineering', tpl: 'ee', keywords: [...KW_ENG, 'electrical'], pathway: 'Electrical Engineering', adm: [3.82, 0.15, 0.22, 700] },
  { id: 'ucla-me', ucId: 'ucla', name: 'Mechanical Engineering', school: 'Samueli School of Engineering', tpl: 'me', keywords: [...KW_ENG, 'mechanical'], pathway: 'Mechanical Engineering', adm: [3.82, 0.15, 0.2, 800] },
  { id: 'ucla-mathcomp', ucId: 'ucla', name: 'Mathematics of Computation', school: 'College of Letters & Science', tpl: 'mathComp', keywords: [...KW_CS, 'math'], tap: true, adm: [3.8, 0.16, 0.25, 700] },
  { id: 'ucla-ds', ucId: 'ucla', name: 'Statistics & Data Science', school: 'College of Letters & Science', tpl: 'ds', keywords: KW_DS, tap: true, adm: [3.78, 0.18, 0.28, 900] },

  { id: 'ucsd-cs', ucId: 'ucsd', name: 'Computer Science', school: 'Jacobs School of Engineering', tpl: 'cs', keywords: KW_CS, pathway: 'Computer Science', adm: [3.85, 0.14, 0.18, 2600] },
  { id: 'ucsd-ce', ucId: 'ucsd', name: 'Computer Engineering', school: 'Jacobs School of Engineering', tpl: 'ce', keywords: [...KW_CS, ...KW_ENG], adm: [3.8, 0.16, 0.24, 800] },
  { id: 'ucsd-ds', ucId: 'ucsd', name: 'Data Science', school: 'Halıcıoğlu Data Science Institute', tpl: 'ds', keywords: KW_DS, adm: [3.78, 0.17, 0.27, 900] },
  { id: 'ucsd-me', ucId: 'ucsd', name: 'Mechanical Engineering', school: 'Jacobs School of Engineering', tpl: 'me', keywords: [...KW_ENG, 'mechanical'], pathway: 'Mechanical Engineering', adm: [3.7, 0.2, 0.35, 700] },

  { id: 'uci-cs', ucId: 'uci', name: 'Computer Science', school: 'Donald Bren School of ICS', tpl: 'cs', keywords: KW_CS, pathway: 'Computer Science', adm: [3.82, 0.15, 0.22, 2400] },
  { id: 'uci-ce', ucId: 'uci', name: 'Computer Engineering', school: 'Samueli School of Engineering', tpl: 'ce', keywords: [...KW_CS, ...KW_ENG], tag: true, adm: [3.65, 0.22, 0.4, 600] },
  { id: 'uci-se', ucId: 'uci', name: 'Software Engineering', school: 'Donald Bren School of ICS', tpl: 'se', keywords: [...KW_CS, 'software engineering'], adm: [3.75, 0.18, 0.3, 900] },
  { id: 'uci-ds', ucId: 'uci', name: 'Data Science', school: 'Donald Bren School of ICS', tpl: 'ds', keywords: KW_DS, adm: [3.7, 0.2, 0.33, 600] },
  { id: 'uci-me', ucId: 'uci', name: 'Mechanical Engineering', school: 'Samueli School of Engineering', tpl: 'me', keywords: [...KW_ENG, 'mechanical'], tag: true, pathway: 'Mechanical Engineering', adm: [3.6, 0.24, 0.45, 600] },

  { id: 'ucd-cs', ucId: 'ucd', name: 'Computer Science', school: 'College of Letters & Science', tpl: 'cs', keywords: KW_CS, tag: true, pathway: 'Computer Science', adm: [3.65, 0.24, 0.38, 1700] },
  { id: 'ucd-cse', ucId: 'ucd', name: 'Computer Science & Engineering', school: 'College of Engineering', tpl: 'ce', keywords: [...KW_CS, ...KW_ENG], tag: true, adm: [3.62, 0.25, 0.4, 900] },
  { id: 'ucd-me', ucId: 'ucd', name: 'Mechanical Engineering', school: 'College of Engineering', tpl: 'me', keywords: [...KW_ENG, 'mechanical'], tag: true, pathway: 'Mechanical Engineering', adm: [3.55, 0.27, 0.48, 600] },

  { id: 'ucsb-cs', ucId: 'ucsb', name: 'Computer Science', school: 'College of Engineering', tpl: 'cs', keywords: KW_CS, pathway: 'Computer Science', adm: [3.85, 0.13, 0.14, 1800] },
  { id: 'ucsb-ds', ucId: 'ucsb', name: 'Statistics & Data Science', school: 'College of Letters & Science', tpl: 'ds', keywords: KW_DS, tag: true, adm: [3.55, 0.27, 0.5, 500] },

  { id: 'ucsc-cs', ucId: 'ucsc', name: 'Computer Science', school: 'Baskin School of Engineering', tpl: 'cs', keywords: KW_CS, tag: true, pathway: 'Computer Science', adm: [3.5, 0.3, 0.55, 1600] },
  { id: 'ucsc-ce', ucId: 'ucsc', name: 'Computer Engineering', school: 'Baskin School of Engineering', tpl: 'ce', keywords: [...KW_CS, ...KW_ENG], tag: true, adm: [3.45, 0.32, 0.6, 400] },

  { id: 'ucr-cs', ucId: 'ucr', name: 'Computer Science', school: 'Bourns College of Engineering', tpl: 'cs', keywords: KW_CS, tag: true, pathway: 'Computer Science', adm: [3.4, 0.32, 0.6, 1500] },
  { id: 'ucr-ce', ucId: 'ucr', name: 'Computer Engineering', school: 'Bourns College of Engineering', tpl: 'ce', keywords: [...KW_CS, ...KW_ENG], tag: true, adm: [3.35, 0.34, 0.65, 400] },
  { id: 'ucr-ds', ucId: 'ucr', name: 'Data Science', school: 'College of Natural & Agricultural Sciences', tpl: 'ds', keywords: KW_DS, tag: true, adm: [3.35, 0.34, 0.66, 300] },

  { id: 'ucm-cse', ucId: 'ucm', name: 'Computer Science & Engineering', school: 'School of Engineering', tpl: 'ce', keywords: [...KW_CS, ...KW_ENG], tag: true, adm: [3.2, 0.4, 0.8, 900] },
  { id: 'ucm-me', ucId: 'ucm', name: 'Mechanical Engineering', school: 'School of Engineering', tpl: 'me', keywords: [...KW_ENG, 'mechanical'], tag: true, pathway: 'Mechanical Engineering', adm: [3.15, 0.42, 0.82, 400] },
]

export const majors: Major[] = specs.map((s) => ({
  id: s.id,
  ucId: s.ucId,
  name: s.name,
  degree: s.degree ?? 'B.S.',
  school: s.school,
  keywords: [s.name.toLowerCase(), ...s.keywords],
  tag: !!s.tag,
  tap: !!s.tap,
  transferPathway: s.pathway,
  assistUrl: 'https://assist.org/',
  agreementYear: '2025–2026',
}))

export const requirements: Requirement[] = specs.flatMap((s) =>
  TEMPLATES[s.tpl].map(([canon, kind]) => ({
    id: `${s.id}:${canon}`,
    majorId: s.id,
    canon,
    kind,
    label: LABELS[canon] ?? canon,
    ucCourse: UC_COURSES[s.ucId]?.[canon] ?? LABELS[canon] ?? canon,
  })),
)

const round2 = (n: number) => Math.round(n * 100) / 100

export const admissionStats: AdmissionStat[] = specs.flatMap((s) => {
  const [mid, iqr, rate, apps] = s.adm
  return [2022, 2023, 2024].map((year, i) => {
    const drift = (i - 2) * 0.02 // admit GPAs creeping up over time
    const applicants = Math.round(apps * (0.9 + i * 0.06))
    return {
      majorId: s.id,
      year,
      applicants,
      admits: Math.round(applicants * rate * (1.08 - i * 0.04)),
      gpa25: round2(Math.min(4, mid + drift - iqr / 2)),
      gpa75: round2(Math.min(4, mid + drift + iqr / 2)),
    }
  })
})

// TAG: 6 participating campuses. Minimum GPAs are approximate — verify each year.
export const tagRules: TagRule[] = [
  { ucId: 'ucd', minGpa: 3.2, note: 'Most majors; some (e.g. Engineering) need extra major prep.' },
  { ucId: 'uci', minGpa: 3.4, note: 'Excludes Computer Science and other ICS majors; Engineering requires higher GPA in prep.' },
  { ucId: 'ucm', minGpa: 2.8, note: 'All majors; engineering majors need specific math/physics.' },
  { ucId: 'ucr', minGpa: 2.7, note: 'All majors; Engineering & CS need 3.0 and completed prep.' },
  { ucId: 'ucsb', minGpa: 3.4, note: 'Not available for College of Engineering or Creative Studies majors.' },
  { ucId: 'ucsc', minGpa: 3.0, note: 'Most majors; CS/CE have additional course-grade criteria.' },
]
