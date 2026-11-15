import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import UCPicker, { KeywordInput } from '../components/UCPicker'
import { MajorBadges, SourceLink } from '../components/Badges'
import { buildMatrix, classifyMajors, coverage, matchMajors } from '../services/planner'
import { majorFit } from '../services/coursePlan'
import { collegesInScope } from '../services/selection'
import type { Major } from '../domain/types'

type SortKey = 'uc' | 'gpa' | 'rate' | 'coverage' | 'reqs'

function AddButton({ m }: { m: Major }) {
  const p = useProfile()
  const on = p.targetMajorIds.includes(m.id)
  return <button className={`shrink-0 ${on ? 'chip-on' : 'chip-off'}`} onClick={() => p.toggle('targetMajorIds', m.id)}>{on ? '✓ In my plan' : '+ Add to plan'}</button>
}

function SearchView() {
  const { d } = useData()
  const p = useProfile()
  const [sort, setSort] = useState<SortKey>('coverage')
  const collegeIds = collegesInScope(p, d).map((s) => s.college.id)
  const relatedIds = new Set(classifyMajors(d, p.targetUcIds, p.keyword).related.map((m) => m.id))
  const rows = useMemo(() => matchMajors(d, p.targetUcIds, p.keyword).map((m) => {
    const stats = d.admissionStats.filter((s) => s.majorId === m.id).sort((a, b) => b.year - a.year)[0]
    const reqs = d.requirements.filter((r) => r.majorId === m.id)
    const cov = coverage(buildMatrix(d, m, collegeIds, p.homeCollegeId))
    return { m, uc: d.colleges.find((c) => c.id === m.ucId)!, stats, rate: stats.admits / stats.applicants, required: reqs.filter((r) => r.kind === 'required').length, cov }
  }), [d, p.targetUcIds, p.keyword, collegeIds.join(), p.homeCollegeId])
  const sorted = [...rows].sort((a, b) => {
    switch (sort) {
      case 'uc': return a.uc.short.localeCompare(b.uc.short)
      case 'gpa': return a.stats.gpa25 + a.stats.gpa75 - (b.stats.gpa25 + b.stats.gpa75)
      case 'rate': return b.rate - a.rate
      case 'reqs': return a.required - b.required
      default: return b.cov.covered / b.cov.required - a.cov.covered / a.cov.required
    }
  })
  const th = (k: SortKey, label: string) => <th className="cursor-pointer whitespace-nowrap px-3 py-2 hover:text-indigo-600" onClick={() => setSort(k)}>{label}{sort === k ? ' ▾' : ''}</th>

  return (
    <>
      <div className="card grid gap-4 p-4 md:grid-cols-2"><UCPicker /><KeywordInput /></div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{th('uc', 'UC')}<th className="px-3 py-2">Major</th>{th('reqs', 'Prep courses')}{th('coverage', 'Offered near you')}{th('gpa', 'Typical admit GPA')}{th('rate', 'Admit rate')}<th className="px-3 py-2"></th></tr>
          </thead>
          <tbody>
            {sorted.map(({ m, uc, stats, rate, required, cov }) => (
              <tr key={m.id} className="border-t border-slate-100 align-top">
                <td className="px-3 py-3"><span className="badge bg-slate-900 text-white">{uc.short}</span></td>
                <td className="min-w-[220px] px-3 py-3">
                  <div className="font-medium">{m.name}{relatedIds.has(m.id) && <span className="badge ml-1 bg-slate-100 text-slate-500">related</span>}</div>
                  <div className="mt-0.5"><MajorBadges major={m} /></div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">{required} required</td>
                <td className="min-w-[150px] px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${cov.covered === cov.required ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${(cov.covered / cov.required) * 100}%` }} /></div>
                    <span className="text-xs">{cov.covered}/{cov.required}</span>
                  </div>
                  {cov.missing.length > 0 && <div className="mt-1 text-xs text-rose-600">Missing: {cov.missing.map((r) => r.label).join(', ')}</div>}
                </td>
                <td className="whitespace-nowrap px-3 py-3">{stats.gpa25.toFixed(2)} – {stats.gpa75.toFixed(2)}</td>
                <td className="px-3 py-3">{(rate * 100).toFixed(0)}%</td>
                <td className="px-3 py-3"><AddButton m={m} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <p className="p-6 text-center text-slate-500">No majors match.</p>}
      </div>
    </>
  )
}

function FitView() {
  const { d, collegeShort, courseById } = useData()
  const p = useProfile()
  const [onlyMyUcs, setOnlyMyUcs] = useState(false)
  const [maxMissing, setMaxMissing] = useState(5)
  const fits = majorFit(d, p.taken, onlyMyUcs ? p.targetUcIds : []).filter((f) => f.missing.length <= maxMissing)
  const counted = p.taken.filter((t) => t.grade !== 'F' && t.grade !== 'D').map((t) => courseById.get(t.courseId)).filter(Boolean)

  return (
    <>
      <div className="card space-y-3 p-4">
        <p className="text-sm text-slate-600">
          Using your <b>{counted.length} taken / planned courses</b>: {counted.map((c) => `${collegeShort(c!.collegeId)} ${c!.code}`).join(', ') || 'none yet'}.{' '}
          <Link to="/progress" className="text-indigo-600 underline">Edit courses</Link>
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-2">Show majors needing at most
            <select className="input !w-auto" value={maxMissing} onChange={(e) => setMaxMissing(Number(e.target.value))}>
              {[0, 1, 2, 3, 5, 8, 99].map((n) => <option key={n} value={n}>{n === 99 ? 'any number of' : n}</option>)}
            </select> more courses</span>
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-indigo-600" checked={onlyMyUcs} onChange={(e) => setOnlyMyUcs(e.target.checked)} /> Only UCs I picked</label>
        </div>
      </div>
      {counted.length === 0 ? <div className="card p-8 text-center text-slate-500">Add the courses you’ve taken on <Link to="/progress" className="text-indigo-600 underline">GE & GPA</Link> first — then we’ll show which majors they fit.</div>
        : fits.length === 0 && <div className="card p-8 text-center text-slate-500">No majors this close yet. Raise the limit or add more courses.</div>}
      <div className="grid gap-3 md:grid-cols-2">
        {(counted.length ? fits : []).map((f) => (
          <div key={f.major.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2"><span className="badge bg-slate-900 text-white">{collegeShort(f.major.ucId)}</span><MajorBadges major={f.major} /></div>
                <div className="mt-1 font-semibold">{f.major.name}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold tabular-nums">{Math.round(f.pct * 100)}%</div>
                <div className="text-xs text-slate-500">prep done</div>
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-violet-500" style={{ width: `${f.pct * 100}%` }} /></div>
            <p className="mt-2 text-sm">{f.missing.length === 0 ? <span className="text-emerald-700">✅ You have all the required prep.</span> : <>Need <b>{f.missing.length}</b> more: {f.missing.map((r) => r.label).join(', ')}</>}</p>
            <div className="mt-3 flex items-center justify-between"><SourceLink major={f.major} /><AddButton m={f.major} /></div>
          </div>
        ))}
      </div>
    </>
  )
}

export default function Majors() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'fit' ? 'fit' : 'search'
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore majors</h1>
          <p className="text-slate-500">{view === 'search' ? 'Compare related majors across UCs and add the ones you like to your plan.' : 'Majors you could switch to with the courses you already have.'}</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
          <button onClick={() => setParams({})} className={`rounded-md px-3 py-1 text-sm font-medium ${view === 'search' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>🔎 Search majors</button>
          <button onClick={() => setParams({ view: 'fit' })} className={`rounded-md px-3 py-1 text-sm font-medium ${view === 'fit' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>💡 Fits my courses</button>
        </div>
      </div>
      {view === 'search' ? <SearchView /> : <FitView />}
    </div>
  )
}
