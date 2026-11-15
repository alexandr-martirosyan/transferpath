import { useMemo, useState } from 'react'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import type { Grade } from '../domain/types'
import { auditGE, patternFor } from '../services/geAudit'
import { computeGpa, GRADE_LABELS, projectGpa, requiredAvg } from '../services/gpa'
import { collegesInScope } from '../services/selection'

const GRADES: Grade[] = ['A', 'B', 'C', 'D', 'F', 'P', 'IP', 'PLAN']
const PASSING = new Set<Grade>(['A', 'B', 'C', 'P'])

export default function Progress() {
  const { d, courseById, collegeShort } = useData()
  const p = useProfile()
  const ccs = d.colleges.filter((c) => c.type === 'CC')
  const [college, setCollege] = useState(p.homeCollegeId)
  const [courseId, setCourseId] = useState('')
  const [grade, setGrade] = useState<Grade>('A')
  const [target, setTarget] = useState(3.7)

  const takenCourses = p.taken.map((t) => ({ t, c: courseById.get(t.courseId)! })).filter((x) => x.c)
  const stats = computeGpa(p.taken, courseById)
  const { pattern, canChoose } = patternFor(p.startYear, p.gePattern)
  const completed = takenCourses.filter((x) => PASSING.has(x.t.grade)).map((x) => x.c)
  const withPlanned = takenCourses.filter((x) => PASSING.has(x.t.grade) || x.t.grade === 'IP' || x.t.grade === 'PLAN').map((x) => x.c)
  const audit = useMemo(() => auditGE(pattern, withPlanned), [pattern, withPlanned.length, p.taken])
  const plannedIds = new Set(takenCourses.filter((x) => x.t.grade === 'IP' || x.t.grade === 'PLAN').map((x) => x.c.id))
  const [newUnits, setNewUnits] = useState<number | null>(null)
  const units = newUnits ?? stats.pendingUnits
  const projected = projectGpa(stats.gpa, stats.gradedUnits, units, p.expectedAvg)
  const needed = requiredAvg(stats.gpa, stats.gradedUnits, units, target)
  const scopeIds = collegesInScope(p, d).map((s) => s.college.id)

  const collegeCourses = d.courses.filter((c) => c.collegeId === college)
  const add = () => {
    if (!courseId || p.taken.some((t) => t.courseId === courseId)) return
    p.set({ taken: [...p.taken, { courseId, grade }] })
    setCourseId('')
  }
  const update = (id: string, g: Grade) => p.set({ taken: p.taken.map((t) => (t.courseId === id ? { ...t, grade: g } : t)) })
  const remove = (id: string) => p.set({ taken: p.taken.filter((t) => t.courseId !== id) })

  const doneAreas = audit.filter((a) => a.done || a.rule.optional).length

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside className="card h-fit space-y-4 p-4 lg:sticky lg:top-28">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="label">Started college</span>
            <select className="input" value={p.startYear} onChange={(e) => p.set({ startYear: Number(e.target.value) })}>
              {[2021, 2022, 2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>Fall {y}</option>)}
            </select>
          </div>
          <div>
            <span className="label">GE pattern</span>
            {canChoose ? (
              <select className="input" value={p.gePattern} onChange={(e) => p.set({ gePattern: e.target.value as 'calgetc' | 'igetc' })}>
                <option value="igetc">IGETC</option>
                <option value="calgetc">Cal-GETC</option>
              </select>
            ) : <div className="input bg-slate-50">Cal-GETC</div>}
          </div>
        </div>
        <p className="text-xs text-slate-500">{pattern.summary}</p>
        <div className="space-y-2 rounded-xl bg-slate-50 p-3">
          <span className="label">Add a course (any college)</span>
          <select className="input" value={college} onChange={(e) => { setCollege(e.target.value); setCourseId('') }}>
            {ccs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">Select course…</option>
            {collegeCourses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title} ({c.units}u)</option>)}
          </select>
          <div className="flex gap-2">
            <select className="input" value={grade} onChange={(e) => setGrade(e.target.value as Grade)}>
              {GRADES.map((g) => <option key={g} value={g}>{GRADE_LABELS[g]}</option>)}
            </select>
            <button className="btn-primary shrink-0" onClick={add}>Add</button>
          </div>
        </div>
        <div>
          <span className="label">My courses ({takenCourses.length})</span>
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {takenCourses.map(({ t, c }) => (
              <li key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 text-sm">
                <span className="badge bg-slate-100 text-slate-600">{collegeShort(c.collegeId)}</span>
                <span className="flex-1 truncate" title={c.title}>{c.code} <span className="text-xs text-slate-400">{c.units}u</span></span>
                <select className="rounded border border-slate-200 text-xs" value={t.grade} onChange={(e) => update(c.id, e.target.value as Grade)}>
                  {GRADES.map((g) => <option key={g} value={g}>{GRADE_LABELS[g]}</option>)}
                </select>
                <button className="text-slate-400 hover:text-rose-600" onClick={() => remove(c.id)}>✕</button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="min-w-0 space-y-5">
        <div><h1 className="text-3xl font-bold text-slate-900">GE & GPA</h1><p className="text-slate-500">Add every class you’ve taken or plan to take (from any college). We’ll track GE, units and GPA.</p></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ['Transfer GPA', stats.gradedUnits ? stats.gpa.toFixed(2) : '—', `${stats.gradedUnits} graded units`],
            ['Units completed', `${stats.completedUnits}/60`, 'UC-transferable units needed'],
            ['In progress + planned', `${stats.pendingUnits}u`, 'before transfer'],
            [`${pattern.name} areas`, `${doneAreas}/${pattern.areas.length}`, 'incl. planned courses'],
          ].map(([k, v, s]) => (
            <div key={k} className="card p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">{k}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{v}</div>
              <div className="text-xs text-slate-400">{s}</div>
            </div>
          ))}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, (stats.completedUnits / 60) * 100)}%` }} />
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-semibold">{pattern.name} checklist</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {audit.map((a) => {
              const planned = a.used.some((c) => plannedIds.has(c.id))
              const state = a.done ? (planned ? 'planned' : 'done') : a.rule.optional ? 'optional' : 'missing'
              const style = { done: 'border-emerald-200 bg-emerald-50', planned: 'border-amber-200 bg-amber-50', optional: 'border-slate-200 bg-slate-50', missing: 'border-rose-200 bg-rose-50' }[state]
              return (
                <div key={a.rule.id} className={`rounded-xl border p-3 ${style}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Area {a.rule.id} · {a.rule.name}</span>
                    <span className="text-xs">{state === 'done' ? '✅ Done' : state === 'planned' ? '🕒 Planned' : state === 'optional' ? 'ℹ️ Optional' : '❌ Missing'}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {a.used.map((c) => <span key={c.id} className="badge bg-white text-slate-700">{collegeShort(c.collegeId)} {c.code}</span>)}
                  </div>
                  {!a.done && <p className="mt-1 text-xs text-slate-600">{a.rule.optional ? a.rule.optional : `Need: ${a.missing.join(', ')}`}</p>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-semibold">📈 GPA projection</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <span className="label">Units left before transfer</span>
              <input type="number" className="input" value={units} min={0} max={60} onChange={(e) => setNewUnits(Number(e.target.value))} />
              <p className="mt-1 text-xs text-slate-400">Defaults to your in-progress + planned units.</p>
            </div>
            <div>
              <span className="label">Expected average: {p.expectedAvg.toFixed(2)}</span>
              <input type="range" min={2} max={4} step={0.05} value={p.expectedAvg} onChange={(e) => p.set({ expectedAvg: Number(e.target.value) })} className="w-full accent-indigo-600" />
              <p className="mt-1 text-sm">Projected GPA: <b className="text-lg text-indigo-700">{projected.toFixed(2)}</b> <span className="text-xs text-slate-500">({projected >= stats.gpa ? '+' : ''}{(projected - stats.gpa).toFixed(2)})</span></p>
            </div>
            <div>
              <span className="label">Target GPA</span>
              <input type="number" step={0.05} min={2} max={4} className="input" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
              <p className="mt-1 text-sm">{Number.isNaN(needed) ? 'Add units to plan.' : needed > 4 ? <span className="text-rose-600">Not reachable with {units} units (needs {needed.toFixed(2)})</span> : needed <= 0 ? <span className="text-emerald-700">Already there 🎉</span> : <>Need avg <b>{needed.toFixed(2)}</b> on remaining units</>}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-1 font-semibold">🎯 Major prep for my majors</h2>
          <p className="mb-3 text-xs text-slate-500">Missing courses show where to take them near you.</p>
          {p.targetMajorIds.length === 0 && <p className="text-sm text-slate-500">No majors in your plan yet.</p>}
          <div className="grid gap-4 xl:grid-cols-2">
            {d.majors.filter((m) => p.targetMajorIds.includes(m.id)).map((m) => {
              const reqs = d.requirements.filter((r) => r.majorId === m.id)
              const doneCanon = new Set(completed.map((c) => c.canon))
              const planCanon = new Set(takenCourses.filter((x) => plannedIds.has(x.c.id)).map((x) => x.c.canon))
              const doneN = reqs.filter((r) => r.kind === 'required' && doneCanon.has(r.canon)).length
              const reqN = reqs.filter((r) => r.kind === 'required').length
              return (
                <div key={m.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <b className="text-sm">{collegeShort(m.ucId)} · {m.name}</b>
                    <span className="text-xs text-slate-500">{doneN}/{reqN} required done</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {reqs.map((r) => {
                      const st = doneCanon.has(r.canon) ? '✅' : planCanon.has(r.canon) ? '🕒' : r.kind === 'required' ? '⬜' : '◽'
                      const where = !doneCanon.has(r.canon) && !planCanon.has(r.canon)
                        ? d.articulations.filter((a) => a.requirementId === r.id && a.courseIds && scopeIds.includes(a.collegeId)).sort((a) => (a.collegeId === p.homeCollegeId ? -1 : 1)).slice(0, 2)
                        : []
                      return (
                        <li key={r.id} className="flex flex-wrap items-center gap-1.5">
                          <span>{st}</span>
                          <span className={r.kind === 'recommended' ? 'text-slate-500' : ''}>{r.ucCourse} <span className="text-xs text-slate-400">{r.label}</span></span>
                          {where.map((a) => <span key={a.collegeId} className="badge bg-sky-50 text-sky-700">{collegeShort(a.collegeId)} {courseById.get(a.courseIds![0])?.code}</span>)}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
