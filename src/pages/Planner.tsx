import { useMemo, type ReactNode } from 'react'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import LocationPanel from '../components/LocationPanel'
import UCPicker, { KeywordInput } from '../components/UCPicker'
import { MajorBadges, SourceLink } from '../components/Badges'
import { bestCombo, buildMatrix, coverage, plannedMajors, sharedRequirements, summarizeReqs } from '../services/planner'
import { collegesInScope } from '../services/selection'
import type { Major } from '../domain/types'

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">{n}</span>
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      {children}
    </div>
  )
}

export function FiltersSidebar() {
  return (
    <aside className="no-print card h-fit space-y-6 p-4 lg:sticky lg:top-28">
      <Step n={1} title="Which UCs do you want?"><UCPicker /></Step>
      <Step n={2} title="What do you want to study?"><KeywordInput /></Step>
      <Step n={3} title="Where can you take classes?"><LocationPanel /></Step>
    </aside>
  )
}

export default function Planner() {
  const { d, collegeShort, courseById } = useData()
  const p = useProfile()
  const scope = collegesInScope(p, d)
  const collegeIds = scope.map((s) => s.college.id)
  const { main, related, selected: majors } = useMemo(
    () => plannedMajors(d, p.targetUcIds, p.keyword, p.majorOverrides),
    [d, p.targetUcIds, p.keyword, p.majorOverrides],
  )
  const combo = useMemo(() => bestCombo(d, majors, collegeIds, p.homeCollegeId), [d, majors, collegeIds.join(), p.homeCollegeId])
  const shared = useMemo(() => sharedRequirements(d, majors).slice(0, 10), [d, majors])
  const ucOf = (majorId: string) => collegeShort(d.majors.find((m) => m.id === majorId)!.ucId)
  const takenCanon = new Set(p.taken.filter((t) => t.grade !== 'F' && t.grade !== 'D').map((t) => courseById.get(t.courseId)?.canon).filter(Boolean))
  const isOn = (m: Major) => majors.includes(m)
  const toggleMajor = (m: Major) => p.set({ majorOverrides: { ...p.majorOverrides, [m.id]: !isOn(m) } })
  // Courses the first college covers for ALL selected majors (articulation can differ per UC).
  const partial = new Set([...combo.steps.slice(1).flatMap((st) => st.adds), ...combo.uncovered].map((r) => r.canon))
  const homeFull = new Set((combo.steps[0]?.adds ?? []).map((r) => r.canon).filter((k) => !partial.has(k))).size
  const ucList = p.targetUcIds.map((id) => collegeShort(id)).join(', ') || 'all UCs'
  const homeName = d.colleges.find((c) => c.id === p.homeCollegeId)?.short

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <FiltersSidebar />
      <section className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transfer Planner</h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Showing what you need for <b>“{p.keyword || 'any major'}”</b> at <b>{ucList}</b>, and where you can take each class among{' '}
              <b>{scope.length} {scope.length === 1 ? 'college' : 'colleges'}</b>{p.selectionMode === 'radius' ? <> within <b>{p.radius} miles</b></> : ' you picked'}.
            </p>
          </div>
          <button className="btn-ghost no-print" onClick={() => window.print()}>🖨️ Print for counselor</button>
        </div>

        {/* Which majors are in the plan — explicit, toggleable */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold">Majors in this plan ({majors.length})</h2>
          <p className="mb-2 text-xs text-slate-500">Each UC names its program differently. Untick any you don't want.</p>
          {main.length === 0 && <p className="text-sm text-slate-500">No major named “{p.keyword}” at the selected UCs.</p>}
          <div className="flex flex-wrap gap-1.5">
            {main.map((m) => (
              <button key={m.id} className={isOn(m) ? 'chip-on' : 'chip-off'} onClick={() => toggleMajor(m)}>
                {isOn(m) ? '✓' : '+'} {collegeShort(m.ucId)} · {m.name}
              </button>
            ))}
          </div>
          {related.length > 0 && (
            <>
              <p className="mb-1.5 mt-3 text-xs text-slate-500">Related majors you could also consider:</p>
              <div className="flex flex-wrap gap-1.5">
                {related.map((m) => (
                  <button key={m.id} className={isOn(m) ? 'chip-on' : 'chip-off'} onClick={() => toggleMajor(m)}>
                    {isOn(m) ? '✓' : '+'} {collegeShort(m.ucId)} · {m.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {majors.length > 0 && scope.length > 0 && (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="card border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4">
              <h2 className="font-semibold text-indigo-900">✨&nbsp;Where to take your classes</h2>
              <p className="mb-3 text-xs text-indigo-800/80">
                Your {majors.length} {majors.length === 1 ? 'major needs' : 'majors need'} <b>{combo.distinctCourses} different courses</b>. The fewest colleges that offer all of them:
              </p>
              <ol className="space-y-2">
                {combo.steps.filter((s) => s.adds.length > 0).map((s, i) => (
                  <li key={s.college.id} className="flex gap-2 text-sm">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">{i + 1}</span>
                    <div>
                      <b>{s.college.name}</b>{s.college.id === p.homeCollegeId && <span className="text-slate-500"> (your college)</span>}
                      <span className="text-slate-500"> — {i === 0
                        ? <>{homeFull} of {combo.distinctCourses} courses{homeFull < combo.distinctCourses ? ' (for every major)' : ''}</>
                        : <>only for {summarizeReqs(s.adds, ucOf, majors.length).join(' · ')}</>}</span>
                    </div>
                  </li>
                ))}
              </ol>
              {combo.uncovered.length > 0 ? (
                <p className="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">
                  ❌ No college in your selection offers: <b>{summarizeReqs(combo.uncovered, ucOf, majors.length).join(', ')}</b>. Widen the distance, or plan to take it after you transfer.
                </p>
              ) : (
                <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700">✅ Every required course is offered within your selection.</p>
              )}
            </div>
            <div className="card p-4">
              <h2 className="font-semibold">🎯&nbsp;Take these first</h2>
              <p className="mb-3 text-xs text-slate-500">Courses needed by the most of your {majors.length} majors — one class, many doors.</p>
              <ul className="space-y-1.5">
                {shared.map((s) => (
                  <li key={s.canon} className="flex items-center gap-2 text-sm">
                    <span className="w-44 truncate">{takenCanon.has(s.canon) ? '✅ ' : ''}{s.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(s.required / majors.length) * 100}%` }} />
                    </div>
                    <span className="w-24 text-right text-xs text-slate-500">{s.required} of {majors.length} majors</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {majors.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="font-semibold">How to read the tables:</span>
            <span><span className="badge bg-emerald-100 text-emerald-800">MATH 103</span> offered at {homeName ?? 'your college'}</span>
            <span><span className="badge bg-sky-100 text-sky-800">MATH 5A</span> offered at another college</span>
            <span><span className="badge bg-rose-100 text-rose-700">none</span> not offered anywhere you selected</span>
            <span>✅ you already took it</span>
          </div>
        )}

        {majors.map((m, idx) => {
          const rows = buildMatrix(d, m, collegeIds, p.homeCollegeId)
          const cov = coverage(rows)
          const uc = d.colleges.find((c) => c.id === m.ucId)!
          const starred = p.targetMajorIds.includes(m.id)
          return (
            <details key={m.id} className="card overflow-hidden" open={idx < 2}>
              <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4">
                <span className="badge bg-slate-900 text-white">{uc.short}</span>
                <span className="font-semibold">{m.name} <span className="font-normal text-slate-500">({m.degree})</span></span>
                <MajorBadges major={m} />
                <span className="ml-auto flex items-center gap-3 text-xs">
                  <span className={cov.covered === cov.required ? 'text-emerald-700' : 'text-rose-700'}>
                    {cov.atHome} of {cov.required} required at {homeName} · {cov.covered} of {cov.required} nearby
                  </span>
                  <button className={`no-print ${starred ? 'chip-on' : 'chip-off'}`} onClick={(e) => { e.preventDefault(); p.toggle('targetMajorIds', m.id) }}>
                    {starred ? '★ My target' : '☆ Save as target'}
                  </button>
                </span>
              </summary>
              <div className="overflow-x-auto border-t border-slate-100">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="sticky left-0 bg-slate-50 px-3 py-2">{uc.short} course you need</th>
                      {collegeIds.map((cid) => <th key={cid} className="whitespace-nowrap px-3 py-2">{collegeShort(cid)}{cid === p.homeCollegeId ? ' 🏠' : ''}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.req.id} className="border-t border-slate-100">
                        <td className="sticky left-0 bg-white px-3 py-2">
                          <div className="font-medium">{takenCanon.has(r.req.canon) ? '✅ ' : ''}{r.req.ucCourse}</div>
                          <div className="text-xs text-slate-500">{r.req.label} · <span className={r.req.kind === 'required' ? 'text-slate-700' : 'italic'}>{r.req.kind}</span></div>
                        </td>
                        {collegeIds.map((cid) => {
                          const cell = r.cells[cid]
                          if (!r.covered) return <td key={cid} className="px-3 py-2"><span className="badge bg-rose-100 text-rose-700">none</span></td>
                          return (
                            <td key={cid} className="whitespace-nowrap px-3 py-2">
                              {cell.courses.length ? (
                                cell.courses.map((c) => <span key={c.id} title={`${c.title} · ${c.units} units`} className={`badge ${cid === p.homeCollegeId ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>{c.code}</span>)
                              ) : <span className="text-slate-300">—</span>}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                <span>{m.school}</span>
                <SourceLink major={m} />
              </div>
            </details>
          )
        })}
      </section>
    </div>
  )
}
