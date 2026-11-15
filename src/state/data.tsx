import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Course, Dataset } from '../domain/types'
import { repository } from '../data'

interface DataCtx { d: Dataset; courseById: Map<string, Course>; collegeName: (id: string) => string; collegeShort: (id: string) => string }
const Ctx = createContext<DataCtx | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [d, setD] = useState<Dataset | null>(null)
  useEffect(() => { repository.load().then(setD) }, [])
  const value = useMemo(() => {
    if (!d) return null
    const byId = new Map(d.colleges.map((c) => [c.id, c]))
    return { d, courseById: new Map(d.courses.map((c) => [c.id, c])), collegeName: (id: string) => byId.get(id)?.name ?? id, collegeShort: (id: string) => byId.get(id)?.short ?? id }
  }, [d])
  if (!value) return <div className="grid h-screen place-items-center text-slate-500">Loading transfer data…</div>
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useData() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useData outside DataProvider')
  return v
}
