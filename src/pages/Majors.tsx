import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import { FiltersSidebar } from './Planner'
import { MajorBadges, SourceLink } from '../components/Badges'
import { buildMatrix, coverage, matchMajors } from '../services/planner'
import { collegesInScope } from '../services/selection'

type SortKey = 'uc' | 'gpa' | 'rate' | 'coverage' | 'reqs'

export default function Majors() {
  const { d } = useData()
  const p = useProfile()
  const [sort, setSort] = useState<SortKey>('coverage')
  const collegeIds = collegesInScope(p, d).map((s) => s.college.id)
  const rows = useMemo(() => {
    return matchMajors(d, p.targetUcIds, p.keyword).map((m) => {
      const stats = d.admissionStats.filter((s) => s.majorId === m.id).sort((a, b) => b.year - a.year)[0]
      const reqs = d.requirements.filter((r) => r.majorId === m.id)
      const cov = coverage(buildMatrix(d, m, collegeIds, p.homeCollegeId))
      return { m, uc: d.colleges.find((c) => c.id === m.ucId)!, stats, rate: stats.admits / stats.applicants, required: reqs.filter((r) => r.kind === 'required').length, recommended: reqs.filter((r) => r.kind === 'recommended').length, cov }
    })
  }, [d, p.targetUcIds, p.keyword, collegeIds.join(), p.homeCollegeId])

  const sorted = [...rows].sort((a, b) => {
    switch (sort) {
      case 'uc': return a.uc.short.localeCompare(b.uc.short)
      case 'gpa': return (b.stats.gpa25 + b.stats.gpa75) - (a.stats.gpa25 + a.stats.gpa75)
      case 'rate': return b.rate - a.rate
      case 'reqs': return a.required - b.required
      default: return b.cov.covered / b.cov.required - a.cov.covered / a.cov.required
    }
  })

  const th = (k: SortKey, label: string) => (
    <th className="cursor-pointer whitespace-nowrap px-3 py-2 hover:text-indigo-600" onClick={() => setSort(k)}>{label}{sort === k ? ' ▾' : ''}</th>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <FiltersSidebar />
      <section className="min-w-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Major Explorer</h1>
          <p className="text-sm text-slate-500">All majors related to “{p.keyword || 'any'}” at your selected UCs, compared side by side. Click a column to sort.</p>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                {th('uc', 'UC')}
                <th className="px-3 py-2">Major</th>
                {th('reqs', 'Prep courses')}
                {th('coverage', 'Available near you')}
                {th('gpa', 'Admit GPA (25–75%)')}
                {th('rate', 'Admit rate')}
                <th className="px-3 py-2">Programs</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ m, uc, stats, rate, required, recommended, cov }) => (
                <tr key={m.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2"><span className="badge bg-slate-900 text-white">{uc.short}</span></td>
                  <td className="min-w-[230px] px-3 py-2">
                    <div className="font-medium">{m.name} <span className="text-slate-400">{m.degree}</span></div>
                    <div className="text-xs text-slate-500">{m.school}</div>
                    <SourceLink major={m} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{required} req · <span className="text-slate-500">{recommended} rec</span></td>
                  <td className="min-w-[160px] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${cov.covered === cov.required ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${(cov.covered / cov.required) * 100}%` }} /></div>
                      <span className="text-xs">{cov.covered}/{cov.required}</span>
                    </div>
                    {cov.missing.length > 0 && <div className="mt-1 text-xs text-rose-600">Missing: {cov.missing.map((r) => r.label).join(', ')}</div>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{stats.gpa25.toFixed(2)} – {stats.gpa75.toFixed(2)}</td>
                  <td className="px-3 py-2">{(rate * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2"><MajorBadges major={m} /></td>
                  <td className="px-3 py-2">
                    <button className={p.targetMajorIds.includes(m.id) ? 'chip-on' : 'chip-off'} onClick={() => p.toggle('targetMajorIds', m.id)}>{p.targetMajorIds.includes(m.id) ? '★' : '☆'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && <p className="p-6 text-center text-slate-500">No majors match.</p>}
        </div>
        <p className="text-xs text-slate-500">★ adds a major to your targets (used by Admission Chances and My Progress). <Link className="text-indigo-600 underline" to="/planner">Open the course-by-course matrix →</Link></p>
      </section>
    </div>
  )
}
