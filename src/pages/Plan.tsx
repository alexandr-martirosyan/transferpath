import { Link } from 'react-router-dom'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import { buildCoursePlan, majorFit } from '../services/coursePlan'
import { collegesInScope, resolveOrigin } from '../services/selection'
import { estimateChance, type Band } from '../services/chances'
import { auditGE, patternFor } from '../services/geAudit'
import { computeGpa } from '../services/gpa'
import { MajorBadges } from '../components/Badges'

export const BAND_STYLE: Record<Band, string> = {
  'Guaranteed (TAG)': 'bg-emerald-600 text-white',
  Likely: 'bg-emerald-100 text-emerald-800',
  Target: 'bg-amber-100 text-amber-800',
  Reach: 'bg-orange-100 text-orange-800',
  'Far reach': 'bg-rose-100 text-rose-700',
}

function Tile({ label, value, sub, to }: { label: string; value: string; sub: string; to: string }) {
  return (
    <Link to={to} className="card p-4 transition hover:border-indigo-300">
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-slate-400">{sub}</div>
    </Link>
  )
}

export default function Plan() {
  const { d, courseById, collegeShort } = useData()
  const p = useProfile()
  const majors = d.majors.filter((m) => p.targetMajorIds.includes(m.id))
  if (!majors.length) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <div className="text-5xl">🎓</div>
        <h1 className="mt-3 text-2xl font-bold">Let’s build your plan</h1>
        <p className="mt-1 text-slate-500">Answer 4 quick questions and we’ll show what to take, where, and your chances.</p>
        <Link to="/start" className="btn-primary mt-5 !px-6 !py-2.5">Get started →</Link>
      </div>
    )
  }
  const scope = collegesInScope(p, d)
  const origin = resolveOrigin(p, d).point
  const plan = buildCoursePlan(d, majors, scope.map((s) => s.college.id), p.homeCollegeId, origin, p.taken)
  const required = plan.filter((c) => c.requiredBy.length > 0)
  const done = required.filter((c) => c.status === 'done').length
  const planned = required.filter((c) => c.status === 'planned').length
  const next = required.filter((c) => c.status === 'todo').slice(0, 5)
  const stats = computeGpa(p.taken, courseById)
  const gpa = p.gpaOverride ?? (stats.gradedUnits ? stats.gpa : null)
  const { pattern } = patternFor(p.startYear, p.gePattern)
  const ge = auditGE(pattern, p.taken.filter((t) => t.grade !== 'F' && t.grade !== 'D').map((t) => courseById.get(t.courseId)!).filter(Boolean))
  const geDone = ge.filter((a) => a.done || a.rule.optional).length
  const fits = p.taken.length === 0 ? [] : majorFit(d, p.taken).filter((f) => !p.targetMajorIds.includes(f.major.id) && f.missing.length <= 5).slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Your transfer plan</h1>
        <p className="text-slate-500">Everything at a glance. Click any box for details.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Major prep" value={`${done}/${required.length}`} sub={`courses done${planned ? ` · ${planned} in progress` : ''}`} to="/courses" />
        <Tile label={pattern.name} value={`${geDone}/${pattern.areas.length}`} sub="GE areas complete" to="/progress" />
        <Tile label="Transfer GPA" value={gpa ? gpa.toFixed(2) : '—'} sub={gpa ? (p.gpaOverride != null ? 'entered by you' : 'from your courses') : 'add courses to calculate'} to="/progress" />
        <Tile label="Units" value={`${stats.completedUnits}/60`} sub="UC-transferable units" to="/progress" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">👉 Take next</h2>
            <Link to="/courses" className="text-sm text-indigo-600 hover:underline">Full course list →</Link>
          </div>
          <p className="mb-3 text-sm text-slate-500">Courses you still need, most useful first.</p>
          {next.length === 0 && <p className="text-emerald-700">🎉 All required prep is done or in progress!</p>}
          <ul className="divide-y divide-slate-100">
            {next.map((c) => (
              <li key={c.canon} className="flex items-center gap-3 py-2.5">
                <div className="flex-1">
                  <div className="font-medium">{c.label}</div>
                  <div className="text-xs text-slate-500">Needed by {c.requiredBy.length} of your {majors.length} majors</div>
                </div>
                {c.best ? (
                  <div className="text-right text-sm">
                    <span className={`badge ${c.best.collegeId === p.homeCollegeId ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>{collegeShort(c.best.collegeId)} {c.best.course.code}</span>
                    <div className="text-xs text-slate-400">{c.best.collegeId === p.homeCollegeId ? 'at your college' : `${c.best.miles.toFixed(0)} mi away`}</div>
                  </div>
                ) : <span className="badge bg-rose-100 text-rose-700">not offered nearby</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">🎯 My majors</h2>
            <Link to="/chances" className="text-sm text-indigo-600 hover:underline">Chances →</Link>
          </div>
          <p className="mb-3 text-sm text-slate-500">{gpa ? `Admission estimate with GPA ${gpa.toFixed(2)}.` : 'Add your GPA to see admission estimates.'}</p>
          <ul className="space-y-3">
            {majors.map((m) => {
              const reqs = d.requirements.filter((r) => r.majorId === m.id && r.kind === 'required')
              const doneN = reqs.filter((r) => plan.find((c) => c.canon === r.canon)?.status === 'done').length
              const ch = gpa ? estimateChance(d, m, gpa, { honors: p.honors, mesa: p.mesa }) : null
              return (
                <li key={m.id}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="badge bg-slate-900 text-white">{collegeShort(m.ucId)}</span>
                    <span className="flex-1 font-medium">{m.name}</span>
                    <MajorBadges major={m} />
                    {ch && <span className={`badge ${BAND_STYLE[ch.band]}`}>{ch.band}</span>}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-indigo-500" style={{ width: `${(doneN / reqs.length) * 100}%` }} /></div>
                    <span className="text-xs text-slate-500">{doneN}/{reqs.length} prep</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {fits.length > 0 && (
        <div className="card border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">💡 Your courses also fit these majors</h2>
            <Link to="/majors?view=fit" className="text-sm text-indigo-600 hover:underline">See all →</Link>
          </div>
          <p className="mb-3 text-sm text-slate-500">Based on classes you’ve taken or planned — just a few more and you’d be ready.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {fits.map((f) => (
              <div key={f.major.id} className="flex items-start gap-3 rounded-xl border border-violet-100 bg-white p-3">
                <div className="flex-1">
                  <div className="text-sm font-medium">{collegeShort(f.major.ucId)} · {f.major.name}</div>
                  <div className="text-xs text-slate-500">{f.missing.length === 0 ? 'All required prep done!' : `Need ${f.missing.length} more: ${f.missing.map((r) => r.label).join(', ')}`}</div>
                </div>
                <button className="chip-off shrink-0" onClick={() => p.toggle('targetMajorIds', f.major.id)}>+ Add</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ['/courses', '📋', 'What to take', 'Full checklist & compare colleges'],
          ['/search', '📅', 'Find a class', 'Times & open seats near you'],
          ['/progress', '✅', 'GE & GPA', 'Add courses, GE checklist, GPA projection'],
        ].map(([to, icon, t, s]) => (
          <Link key={to} to={to} className="card flex items-center gap-3 p-4 hover:border-indigo-300">
            <span className="text-2xl">{icon}</span>
            <div><div className="font-semibold">{t}</div><div className="text-xs text-slate-500">{s}</div></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
