import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TakenCourse } from '../domain/types'

export type OriginMode = 'college' | 'zip' | 'gps'
export type GEPattern = 'calgetc' | 'igetc'

export interface Profile {
  originMode: OriginMode
  homeCollegeId: string
  zip: string
  gps: { lat: number; lng: number } | null
  radius: number // miles
  selectionMode: 'radius' | 'manual'
  manualCollegeIds: string[]
  targetUcIds: string[]
  keyword: string
  targetMajorIds: string[] // "My majors" — the ONE list every page uses
  onboarded: boolean // finished the Get-started wizard
  taken: TakenCourse[]
  startYear: number // first CC term year (Fall)
  gePattern: GEPattern
  mesa: boolean
  honors: boolean // Honors / Scholars program (UCLA TAP)
  gpaOverride: number | null
  expectedAvg: number
}

interface ProfileStore extends Profile {
  set: (patch: Partial<Profile>) => void
  toggle: (key: 'manualCollegeIds' | 'targetUcIds' | 'targetMajorIds', id: string) => void
  reset: () => void
}

export const defaultProfile: Profile = {
  originMode: 'college',
  homeCollegeId: 'gcc',
  zip: '91201',
  gps: null,
  radius: 25,
  selectionMode: 'radius',
  manualCollegeIds: ['gcc', 'pcc'],
  targetUcIds: ['ucla', 'ucb', 'ucsd', 'uci', 'ucd'],
  keyword: 'computer science',
  targetMajorIds: ['ucla-cs', 'ucb-cs', 'ucsd-cs', 'uci-cs', 'ucd-cs'],
  onboarded: false,
  taken: [
    { courseId: 'gcc:MATH 103', grade: 'A' },
    { courseId: 'gcc:MATH 104', grade: 'B' },
    { courseId: 'gcc:ENGL 101', grade: 'A' },
    { courseId: 'gcc:CS/IS 135', grade: 'A' },
    { courseId: 'gcc:PSYC 101', grade: 'B' },
    { courseId: 'pcc:PHYS 1A', grade: 'IP' },
    { courseId: 'gcc:MATH 105', grade: 'PLAN' },
  ],
  startYear: 2025,
  gePattern: 'calgetc',
  mesa: false,
  honors: false,
  gpaOverride: null,
  expectedAvg: 3.5,
}

export const useProfile = create<ProfileStore>()(
  persist(
    (set) => ({
      ...defaultProfile,
      set: (patch) => set(patch),
      toggle: (key, id) =>
        set((s) => ({ [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id] }) as Partial<Profile>),
      reset: () => set(defaultProfile),
    }),
    { name: 'transferpath-profile-v3' },
  ),
)
