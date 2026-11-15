import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import { MajorBadges, SourceLink } from '../components/Badges'
import { bestCombo, buildMatrix, coverage, summarizeReqs } from '../services/planner'
import { buildCoursePlan, type PlanCourse } from '../services/coursePlan'
import { collegesInScope, resolveOrigin } from '../services/selection'

const STATUS = {
  todo: { title: 'Still need to take', icon: '⬜' },
  planned: { title: 'In progress / planned', icon: '🕒' },
  done: { title: 'Done', icon: '✅' },
} as const

export default function Courses() {
  const { d, collegeShort } = useData()
  const p = useProfile()
  const [tab, setTab] = useState<'list' | 'compare'>('list')
  const majors = d.majors.filter((m) => p.targetMajorIds.includes(m.id))
  const scope = collegesInScope(p, d)
  const collegeIds = scope.map((s) => s.college.id)
  const origin = resolveOrigin(p, d).point
  const plan = useMemo(() => buildCoursePlan(d, majors, collegeIds, p.homeCollegeId, origin, p.taken), [d, majors, collegeIds.join(), p.homeCollegeId, p.taken])
  const combo = useMemo(() => bestCombo(d, majors, collegeIds, p.homeCollegeId), [d, majors, collegeIds.join(), p.homeCollegeId])
  const ucOf = (majorId: string) => collegeShort(d.majors.find((m) => m.id === majorId)!.ucId)
  const homeShort = collegeShort(p.homeCollegeId)

  if (!majors.length) return <div className="card p-10 text-center text-slate-500">Add at least one major first. <Link className="text-indigo-600 underline" to="/start">Get started →</Link></div>

  const Row = ({ c }: { c: PlanCourse }) => {
    const ucs = [...new Set(c.requiredBy.map((m) => collegeShort(m.ucId)))]
    return (
      <li className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
        <div className="min-w-56 flex-1">
          <div className="font-medium">{STATUS[c.status].icon} {c.label} <span className="text-xs font-normal text-slate-400">{c.units} units</span></div>
          <div className="text-xs text-slate-500">
            {c.requiredBy.length ? <>Required for {c.requiredBy.length === majors.length ? `all ${majors.length} majors` : ucs.join(', ')}</> : <>Recommended for {[...new Set(c.recommendedBy.map((m) => collegeShort(m.ucId)))].join(', ')}</>}
            {c.takenAs && <> · taken as {collegeShort(c.takenAs.collegeId)} {c.takenAs.code}</>}
          </div>
          {c.missingFor.length > 0 && <div className="text-xs text-rose-600">⚠ No nearby college offers it for {c.missingFor.map((m) => collegeShort(m.ucId)).join(', ')}</div>}
        </div>
        {c.status === 'todo' && (
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {c.best ? (
              <>
                <span className="text-xs text-slate-500">Take</span>
                <span className={`badge !text-xs ${c.best.collegeId === p.homeCollegeId ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>{collegeShort(c.best.collegeId)} {c.best.course.code}</span>
                {!c.best.forAll && <span className="text-xs text-amber-700">(not for {majors.filter((m) => c.requiredBy.includes(m) && !c.best!.majorIds.includes(m.id)).map((m) => collegeShort(m.ucId)).join(', ')})</span>}
                {c.others.length > 0 && <span className="text-xs text-slate-400">also at {c.others.slice(0, 3).map((o) => collegeShort(o.collegeId)).join(', ')}{c.others.length > 3 ? ` +${c.others.length - 3}` : ''}</span>}
                <Link to={`/search?q=${encodeURIComponent(`${c.best.course.code} ${collegeShort(c.best.collegeId)}`)}`} className="text-xs text-indigo-600 hover:underline">times →</Link>
              </>
            ) : <span className="badge bg-rose-100 text-rose-700">not offered nearby</span>}
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">What to take</h1>
          <p className="text-slate-500">All prep courses for your {majors.length} majors, merged into one list — and where to take each.</p>
        </div>
        <div className="no-print flex gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {(['list', 'compare'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1 text-sm font-medium ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>
                {t === 'list' ? '📋 Checklist' : '🔀 Compare colleges'}
              </button>
            ))}
          </div>
          <button className="btn-ghost" onClick={() => window.print()}>🖨️ Print</button>
        </div>
      </div>

      <div className="card border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4">
        <h2 className="font-semibold text-indigo-900">✨ Where to take your classes</h2>
        <p className="mb-2 text-sm text-indigo-900/80">You need <b>{combo.distinctCourses} different courses</b>. The fewest colleges that cover them:</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {combo.steps.filter((s) => s.adds.length > 0).map((s, i) => (
            <span key={s.college.id} className="flex items-center gap-2">
              {i > 0 && <span className="text-slate-400">+</span>}
              <span className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1">
                <b>{s.college.short}</b>
                <span className="text-xs text-slate-500"> {i === 0 ? (s.college.id === p.homeCollegeId ? '(your college)' : '') : `for ${summarizeReqs(s.adds, ucOf, majors.length).join(', ')}`}</span>
              </span>
            </span>
          ))}
        </div>
        {combo.uncovered.length > 0 && (
          <p className="mt-2 text-xs text-rose-700">❌ Not offered at any selected college: <b>{summarizeReqs(combo.uncovered, ucOf, majors.length).join(', ')}</b> — increase the distance or take it after transferring.</p>
        )}
      </div>

      {tab === 'list' && (
        <div className="card px-5 py-2">
          {(['todo', 'planned', 'done'] as const).map((st) => {
            const items = plan.filter((c) => c.status === st)
            if (!items.length) return null
            return (
              <section key={st} className="border-b border-slate-100 py-3 last:border-0">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{STATUS[st].title} ({items.length})</h3>
                <ul className="divide-y divide-slate-100">{items.map((c) => <Row key={c.canon} c={c} />)}</ul>
              </section>
            )
          })}
          <p className="pb-2 text-xs text-slate-500">Mark courses as taken or planned on the <Link to="/progress" className="text-indigo-600 underline">GE & GPA</Link> page.</p>
        </div>
      )}

      {tab === 'compare' && (
        <>
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            <span><span className="badge bg-emerald-100 text-emerald-800">CODE</span> at {homeShort} (your college)</span>
            <span><span className="badge bg-sky-100 text-sky-800">CODE</span> at another college</span>
            <span><span className="badge bg-rose-100 text-rose-700">none</span> not offered anywhere selected</span>
          </div>
          {majors.map((m, idx) => {
            const rows = buildMatrix(d, m, collegeIds, p.homeCollegeId)
            const cov = coverage(rows)
            const uc = d.colleges.find((c) => c.id === m.ucId)!
            return (
              <details key={m.id} className="card overflow-hidden" open={idx === 0}>
                <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4">
                  <span className="badge bg-slate-900 text-white">{uc.short}</span>
                  <span className="font-semibold">{m.name}</span>
                  <MajorBadges major={m} />
                  <span className="ml-auto text-xs text-slate-500">{cov.atHome} of {cov.required} required courses at {homeShort}</span>
                </summary>
                <div className="overflow-x-auto border-t border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                      <tr>
                        <th className="sticky left-0 bg-slate-50 px-3 py-2">{uc.short} course</th>
                        {collegeIds.map((cid) => <th key={cid} className="whitespace-nowrap px-3 py-2">{collegeShort(cid)}{cid === p.homeCollegeId ? ' 🏠' : ''}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.req.id} className="border-t border-slate-100">
                          <td className="sticky left-0 bg-white px-3 py-2">
                            <div className="font-medium">{r.req.ucCourse}</div>
                            <div className="text-xs text-slate-500">{r.req.label}{r.req.kind === 'recommended' && <i> · recommended</i>}</div>
                          </td>
                          {collegeIds.map((cid) => {
                            const cell = r.cells[cid]
                            if (!r.covered) return <td key={cid} className="px-3 py-2"><span className="badge bg-rose-100 text-rose-700">none</span></td>
                            return (
                              <td key={cid} className="whitespace-nowrap px-3 py-2">
                                {cell.courses.length ? cell.courses.map((c) => <span key={c.id} title={c.title} className={`badge ${cid === p.homeCollegeId ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>{c.code}</span>) : <span className="text-slate-300">—</span>}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between border-t border-slate-100 px-4 py-2 text-xs text-slate-500"><span>{m.school}</span><SourceLink major={m} /></div>
              </details>
            )
          })}
        </>
      )}
    </div>
  )
}
