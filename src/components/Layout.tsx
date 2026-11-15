import { NavLink, Outlet } from 'react-router-dom'
import { useData } from '../state/data'

const NAV = [
  ['/planner', 'Transfer Planner'],
  ['/majors', 'Major Explorer'],
  ['/chances', 'Admission Chances'],
  ['/progress', 'My Progress'],
  ['/search', 'Course Search'],
] as const

const DEADLINES = [
  ['Aug 1', 'UC application opens (fill out)'],
  ['Sep 1–30', 'TAG submission window'],
  ['Oct 1', 'FAFSA / CA Dream Act open'],
  ['Oct 1 – Dec 1', 'UC transfer application filing'],
  ['Jan 31', 'Transfer Academic Update (TAU)'],
  ['Mar 2', 'Cal Grant GPA deadline'],
]

export default function Layout() {
  const { d } = useData()
  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-[1000] border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">🎓</span>
            TransferPath
          </NavLink>
          <nav className="flex flex-wrap gap-1 text-sm">
            {NAV.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `rounded-lg px-3 py-1.5 font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="border-t border-slate-100 bg-indigo-50/60">
          <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-1.5 text-xs text-indigo-900">
            <span className="shrink-0 font-semibold">📅 Deadlines</span>
            {DEADLINES.map(([date, what]) => (
              <span key={what} className="shrink-0"><b>{date}</b> · {what}</span>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-slate-500">
          ⚠️ {d.meta.note} TransferPath is a planning aid, not an official articulation or admission decision. Always confirm on{' '}
          <a className="text-indigo-600 underline" href="https://assist.org" target="_blank" rel="noreferrer">ASSIST.org</a> and with your counselor.
          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800">Data source: {d.meta.source}</span>
        </div>
      </footer>
    </div>
  )
}
