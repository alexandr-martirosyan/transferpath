// Core domain model. Every data source (mock today, ASSIST / UC InfoCenter / college feeds
// tomorrow) must produce these shapes. UI and services depend only on this file.

export type CollegeType = 'CC' | 'UC'

export interface College {
  id: string // e.g. "gcc", "ucla"
  name: string // "Glendale Community College"
  short: string // "GCC"
  type: CollegeType
  city: string
  lat: number
  lng: number
  assistId?: number // ASSIST institution id (future real-data join key)
}

/** Canonical course concept used to link equivalents across colleges (e.g. "CALC1"). */
export type CanonKey = string

/** GE tags a CC course can carry. Audits map tags → Cal-GETC / IGETC areas. */
export type GETag = '1A' | '1B' | '1C' | '2' | '3A' | '3B' | '4' | '5A' | '5B' | '5C' | 'ETH' | 'LOTE'

export interface Course {
  id: string // `${collegeId}:${code}`
  collegeId: string
  code: string // "PHYS 103"
  dept: string // "PHYS" (used for "different disciplines" GE rules)
  title: string
  units: number
  canon: CanonKey
  ge: GETag[]
  ucTransferable: boolean
}

export interface Major {
  id: string // "ucla-cs"
  ucId: string
  name: string // "Computer Science"
  degree: string // "B.S."
  school: string // "Samueli School of Engineering"
  keywords: string[] // search terms: "computer science", "engineering", ...
  tag: boolean // TAG (Transfer Admission Guarantee) available for this major
  tap: boolean // UCLA TAP (Transfer Alliance Program) priority applies
  transferPathway?: string // UC Transfer Pathway name if aligned
  assistUrl: string // link to verify the agreement
  agreementYear: string // "2025-2026"
}

export interface Requirement {
  id: string
  majorId: string
  ucCourse: string // UC-side course, e.g. "MATH 31A"
  label: string // "Calculus I"
  kind: 'required' | 'recommended'
  canon: CanonKey
}

/** One CC ↔ UC requirement articulation. `courseIds` null = no equivalent at that college. */
export interface Articulation {
  requirementId: string
  collegeId: string
  courseIds: string[] | null
}

export interface AdmissionStat {
  majorId: string
  year: number // fall admit year
  applicants: number
  admits: number
  gpa25: number // 25th percentile admitted GPA
  gpa75: number // 75th percentile admitted GPA
}

export type Term = 'Fall' | 'Winter' | 'Spring' | 'Summer'

export interface Section {
  id: string
  courseId: string
  term: Term
  year: number
  days: string // "MW"
  time: string // "9:30–11:20 AM"
  modality: 'In person' | 'Online' | 'Hybrid'
  seats: number // open seats
  capacity: number
  instructor: string
}

export interface TagRule {
  ucId: string
  minGpa: number
  note: string
}

export interface ZipLocation {
  zip: string
  city: string
  lat: number
  lng: number
}

/** Everything the UI needs; loaded once through DataRepository.load(). */
export interface Dataset {
  colleges: College[]
  courses: Course[]
  majors: Major[]
  requirements: Requirement[]
  articulations: Articulation[]
  admissionStats: AdmissionStat[]
  sections: Section[]
  tagRules: TagRule[]
  zips: ZipLocation[]
  meta: { source: 'mock' | 'api'; generatedAt: string; note: string }
}

// ---------- Student-side ----------

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F' | 'P' | 'IP' | 'PLAN'

export interface TakenCourse {
  courseId: string
  grade: Grade // IP = in progress, PLAN = planned before transfer
}
