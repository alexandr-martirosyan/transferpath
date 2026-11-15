import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import type { Term } from '../domain/types'
import { findEquivalents, findSourceCourses } from '../services/search'
import { collegesInScope, resolveOrigin } from '../services/selection'

const TERMS: (Term | 'Any')[] = ['Any', 'Winter', 'Spring', 'Summer', 'Fall']

export default function Search() {
  const { d, collegeShort } = useData()
  const p = useProfile()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [college, setCollege] = useState(params.get('college') ?? p.homeCollegeId)
  const ccs = d.colleges.filter((c) => c.type === 'CC')
  const collegeCourses = d.courses.filter((c) => c.collegeId === college)
  const [term, setTerm] = useState<Term | 'Any'>('Winter')
  const [openOnly, setOpenOnly] = useState(false)
  const sources = useMemo(() => findSourceCourses(d, q, college), [d, q, college])
  const [picked, setPicked] = useState<string | null>(null)
  const source = sources.find((s) => s.id === picked) ?? sources[0]
  const origin = resolveOrigin(p, d).point
  const scope = collegesInScope(p, d).map((s) => s.college.id)
  const hits = source ? findEquivalents(d, source, origin, scope, term, openOnly) : []

  return (
    <div>
      <section className="min-w-0 space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Find a class</h1>
          <p className="text-slate-500">Can’t get a class at your college? Find the same class nearby, with times and open seats.</p>
        </div>
        <div className="card flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-56">
            <span className="label">College</span>
            <select className="input !py-2 !text-base" value={college} onChange={(e) => { setCollege(e.target.value); setPicked(null); setParams({ q, college: e.target.value }, { replace: true }) }}>
              {ccs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="min-w-56 flex-1">
            <span className="label">Course</span>
            <input list="college-courses" className="input !py-2 !text-base" value={q} onChange={(e) => { setQ(e.target.value); setPicked(null); setParams({ q: e.target.value, college }, { replace: true }) }} placeholder="e.g. PHYS 103, MATH 104, calculus" />
            <datalist id="college-courses">
              {collegeCourses.map((c) => <option key={c.id} value={c.code}>{c.title}</option>)}
            </datalist>
          </div>
          <div>
            <span className="label">Term</span>
            <div className="flex gap-1">{TERMS.map((t) => <button key={t} className={term === t ? 'chip-on' : 'chip-off'} onClick={() => setTerm(t)}>{t}</button>)}</div>
          </div>
          <label className="flex items-center gap-2 pb-1 text-sm"><input type="checkbox" className="accent-indigo-600" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> Open seats only</label>
        </div>

        {sources.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500">Matches:</span>
            {sources.slice(0, 12).map((s) => (
              <button key={s.id} className={source?.id === s.id ? 'chip-on' : 'chip-off'} onClick={() => setPicked(s.id)}>{collegeShort(s.collegeId)} {s.code}</button>
            ))}
          </div>
        )}

        {!q && <div className="card p-8 text-center text-slate-500">Pick a college, then type a course code like <b>PHYS 103</b>. We’ll show it and every equivalent class at colleges near you.</div>}
        {!source && q && <div className="card p-8 text-center text-slate-500">No course “{q}” at {d.colleges.find((c) => c.id === college)?.name}. Start typing to see its course list, or try a title like “data structures”.</div>}

        {source && (
          <>
            <div className="card bg-gradient-to-r from-indigo-50 to-white p-4">
              <div className="text-xs uppercase text-slate-500">Equivalents of</div>
              <div className="text-lg font-semibold">{collegeShort(source.collegeId)} {source.code} — {source.title} <span className="text-sm font-normal text-slate-500">({source.units} units)</span></div>
              <div className="text-xs text-slate-500">{hits.length} colleges in your selection offer it · {hits.reduce((n, h) => n + h.sections.length, 0)} sections {term !== 'Any' ? `in ${term}` : ''}</div>
            </div>
            <div className="space-y-3">
              {hits.map((h) => (
                <div key={h.course.id} className="card p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <b>{h.collegeName}</b> <span className="badge ml-1 bg-sky-100 text-sky-800">{h.course.code}</span>
                      {h.isSource && <span className="badge ml-1 bg-emerald-100 text-emerald-700">searched course</span>}
                    </div>
                    <span className="text-xs text-slate-500">{h.miles.toFixed(1)} mi away</span>
                  </div>
                  {h.sections.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-400">No {openOnly ? 'open ' : ''}sections {term !== 'Any' ? `in ${term}` : ''}.</p>
                  ) : (
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-left text-xs text-slate-400"><tr><th className="py-1 font-medium">Term</th><th className="font-medium">Days</th><th className="font-medium">Time</th><th className="font-medium">Mode</th><th className="font-medium">Instructor</th><th className="text-right font-medium">Seats</th></tr></thead>
                        <tbody>
                          {h.sections.map((s) => (
                            <tr key={s.id} className="border-t border-slate-100">
                              <td className="py-1.5">{s.term} {s.year}</td><td>{s.days}</td><td className="whitespace-nowrap">{s.time}</td><td>{s.modality}</td><td>{s.instructor}</td>
                              <td className="text-right"><span className={`badge ${s.seats === 0 ? 'bg-rose-100 text-rose-700' : s.seats < 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>{s.seats === 0 ? 'Full / waitlist' : `${s.seats}/${s.capacity} open`}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">Schedules and seats are demo data. Roadmap: live feeds from colleges (Banner / PeopleSoft class search) via a partner API.</p>
          </>
        )}
      </section>
    </div>
  )
}
