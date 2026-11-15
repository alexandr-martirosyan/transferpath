import { useState } from 'react'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import type { Grade } from '../domain/types'
import { GRADE_LABELS } from '../services/gpa'

export const GRADES: Grade[] = ['A', 'B', 'C', 'D', 'F', 'P', 'IP', 'PLAN']

/** Add classes (major prep or GE) from any college + list/edit them. Used on GE page and in the setup drawer. */
export default function MyCourses() {
  const { d, courseById, collegeShort } = useData()
  const p = useProfile()
  const ccs = d.colleges.filter((c) => c.type === 'CC')
  const [college, setCollege] = useState(p.homeCollegeId)
  const [courseId, setCourseId] = useState('')
  const [grade, setGrade] = useState<Grade>('A')
  const taken = p.taken.map((t) => ({ t, c: courseById.get(t.courseId)! })).filter((x) => x.c)
  const add = () => {
    if (!courseId || p.taken.some((t) => t.courseId === courseId)) return
    p.set({ taken: [...p.taken, { courseId, grade }] })
    setCourseId('')
  }
  const update = (id: string, g: Grade) => p.set({ taken: p.taken.map((t) => (t.courseId === id ? { ...t, grade: g } : t)) })
  const remove = (id: string) => p.set({ taken: p.taken.filter((t) => t.courseId !== id) })

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-xl bg-slate-50 p-3">
        <span className="label">Add a class — major prep or GE, from any college</span>
        <select className="input" value={college} onChange={(e) => { setCollege(e.target.value); setCourseId('') }}>
          {ccs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">Select course…</option>
          {d.courses.filter((c) => c.collegeId === college).map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title} ({c.units}u)</option>)}
        </select>
        <div className="flex gap-2">
          <select className="input" value={grade} onChange={(e) => setGrade(e.target.value as Grade)}>
            {GRADES.map((g) => <option key={g} value={g}>{GRADE_LABELS[g]}</option>)}
          </select>
          <button className="btn-primary shrink-0" onClick={add}>Add</button>
        </div>
      </div>
      <div>
        <span className="label">My classes ({taken.length})</span>
        {taken.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">No classes yet. Use “In progress” for this term and “Planned” for future terms.</p>}
        <ul className="max-h-80 space-y-1 overflow-y-auto">
          {taken.map(({ t, c }) => (
            <li key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 text-sm">
              <span className="badge bg-slate-100 text-slate-600">{collegeShort(c.collegeId)}</span>
              <span className="flex-1 truncate" title={c.title}>{c.code} <span className="text-xs text-slate-400">{c.title}</span></span>
              <select className="rounded border border-slate-200 text-xs" value={t.grade} onChange={(e) => update(c.id, e.target.value as Grade)}>
                {GRADES.map((g) => <option key={g} value={g}>{GRADE_LABELS[g]}</option>)}
              </select>
              <button className="text-slate-400 hover:text-rose-600" onClick={() => remove(c.id)}>✕</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
