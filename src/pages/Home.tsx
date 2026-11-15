import { Link } from 'react-router-dom'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'

const TOOLS = [
  ['/courses', '📋', 'What to take', 'One checklist of every prep course for all your UC majors, and the best college to take each one.'],
  ['/majors', '🔎', 'Explore majors', 'Compare related majors across UCs, or see which majors your courses already fit.'],
  ['/chances', '📊', 'My chances', 'Your GPA vs. past admitted students, plus TAG guarantees and UCLA TAP.'],
  ['/progress', '✅', 'GE & GPA', 'Add classes from any college. See what’s left for Cal-GETC/IGETC and your projected GPA.'],
  ['/search', '📅', 'Find a class', 'Need PHYS 103 in winter? Find it nearby with times and open seats.'],
] as const

export default function Home() {
  const { d } = useData()
  const onboarded = useProfile((s) => s.onboarded)
  const ccs = d.colleges.filter((c) => c.type === 'CC').length
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-500 px-6 py-12 text-white md:px-12">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-100">For California community college students</p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">Plan your UC transfer in one place — not 50 ASSIST tabs.</h1>
        <p className="mt-4 max-w-2xl text-indigo-100">Compare requirements across every UC and every nearby college at once, see your admission chances, and track what’s left for Cal-GETC.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {onboarded ? (
            <>
              <Link to="/plan" className="btn bg-white !px-5 !py-2.5 text-indigo-700 hover:bg-indigo-50">Continue to my plan →</Link>
              <Link to="/start" className="btn border border-white/40 !px-5 !py-2.5 text-white hover:bg-white/10">Redo setup</Link>
            </>
          ) : (
            <>
              <Link to="/start" className="btn bg-white !px-5 !py-2.5 text-indigo-700 hover:bg-indigo-50">Get started — 2 minutes →</Link>
            </>
          )}
        </div>
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-indigo-100">
          <span><b className="text-2xl text-white">9</b> UC campuses</span>
          <span><b className="text-2xl text-white">{ccs}</b> community colleges (demo region)</span>
          <span><b className="text-2xl text-white">{d.majors.length}</b> majors</span>
          <span><b className="text-2xl text-white">{d.sections.length.toLocaleString()}</b> class sections</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map(([to, icon, title, desc]) => (
          <Link key={to} to={to} className="card group p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
            <div className="text-3xl">{icon}</div>
            <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-indigo-700">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{desc}</p>
          </Link>
        ))}
        <div className="card border-dashed p-5 text-sm text-slate-600">
          <div className="text-3xl">🚀</div>
          <h3 className="mt-2 font-semibold text-slate-900">Coming next</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>Live ASSIST agreements for all 116 CA community colleges</li>
            <li>Real UC “Transfers by Major” data</li>
            <li>Live seats from college class schedules</li>
            <li>AI counselor: semester-by-semester plan</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['1', 'Answer 4 questions', 'Your college, how far you’d travel, your UCs, and your major.'],
          ['2', 'Get your plan', 'What to take next, where, and your chances, all on one page.'],
          ['3', 'Keep it updated', 'Add classes as you take them and watch your GE and GPA update.'],
        ].map(([n, t, s]) => (
          <div key={n} className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">{n}</span>
            <div><b>{t}</b><p className="text-sm text-slate-600">{s}</p></div>
          </div>
        ))}
      </section>
    </div>
  )
}
