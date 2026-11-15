import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import { MajorBadges, SourceLink } from '../components/Badges'
import { estimateChance } from '../services/chances'
import { computeGpa } from '../services/gpa'
import { BAND_STYLE } from './Plan'

const MIN = 2.0, MAX = 4.0
const pos = (g: number) => `${((Math.min(MAX, Math.max(MIN, g)) - MIN) / (MAX - MIN)) * 100}%`

export default function Chances() {
  const { d, courseById, collegeShort } = useData()
  const p = useProfile()
  const computed = computeGpa(p.taken, courseById)
  const gpa = p.gpaOverride ?? (computed.gradedUnits ? Math.round(computed.gpa * 100) / 100 : 3.5)
  const majors = d.majors.filter((m) => p.targetMajorIds.includes(m.id))
  const results = useMemo(() => majors.map((m) => estimateChance(d, m, gpa, { honors: p.honors, mesa: p.mesa })).sort((a, b) => b.probability - a.probability), [majors, gpa, p.honors, p.mesa])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My chances</h1>
        <p className="text-slate-500">How your GPA compares with students admitted in past years. An estimate, not a promise.</p>
      </div>

      <div className="card flex flex-wrap items-center gap-x-8 gap-y-3 p-4">
        <div className="flex min-w-72 flex-1 items-center gap-3">
          <span className="text-sm font-semibold">My GPA</span>
          <input type="range" min={2} max={4} step={0.01} value={gpa} onChange={(e) => p.set({ gpaOverride: Number(e.target.value) })} className="flex-1 accent-indigo-600" />
          <input type="number" min={0} max={4} step={0.01} value={gpa} onChange={(e) => p.set({ gpaOverride: Number(e.target.value) })} className="input !w-20 text-center font-bold" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-indigo-600" checked={p.honors} onChange={(e) => p.set({ honors: e.target.checked })} /> Honors / Scholars (UCLA TAP)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-indigo-600" checked={p.mesa} onChange={(e) => p.set({ mesa: e.target.checked })} /> MESA</label>
        <p className="w-full text-xs text-slate-500">
          {p.gpaOverride == null ? `Calculated from your courses (${computed.gradedUnits} graded units). Drag to try other GPAs.` : <>Using a GPA you set. <button className="text-indigo-600 underline" onClick={() => p.set({ gpaOverride: null })}>Use GPA from my courses</button></>}
        </p>
      </div>

      {results.length === 0 && <div className="card p-8 text-center text-slate-500">No majors in your plan yet. <Link to="/majors" className="text-indigo-600 underline">Add some →</Link></div>}

      <div className="grid gap-4 xl:grid-cols-2">
        {results.map((r) => (
          <div key={r.major.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2"><span className="badge bg-slate-900 text-white">{collegeShort(r.major.ucId)}</span><MajorBadges major={r.major} /></div>
                <h3 className="mt-1 font-semibold">{r.major.name}</h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold tabular-nums">{r.probability >= 0.99 ? '99' : r.probability < 0.01 ? '<1' : Math.round(r.probability * 100)}%</div>
                <span className={`badge ${BAND_STYLE[r.band]}`}>{r.band}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative h-3 rounded-full bg-slate-100">
                <div className="absolute h-3 rounded-full bg-indigo-200" style={{ left: pos(r.latest.gpa25), width: `calc(${pos(r.latest.gpa75)} - ${pos(r.latest.gpa25)})` }} />
                {r.tagMinGpa && r.major.tag && <div className="absolute -top-1 h-5 w-0.5 bg-emerald-600" style={{ left: pos(r.tagMinGpa) }} title={`TAG minimum ${r.tagMinGpa}`} />}
                <div className="absolute -top-1.5 h-6 w-1.5 -translate-x-1/2 rounded bg-slate-900" style={{ left: pos(gpa) }} title={`You: ${gpa}`} />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                <span>2.0</span>
                <span><span className="inline-block h-2 w-3 rounded bg-indigo-200" /> most admitted students: {r.latest.gpa25.toFixed(2)}–{r.latest.gpa75.toFixed(2)} · <b>▮ you {gpa.toFixed(2)}</b>{r.major.tag && r.tagMinGpa ? <> · <span className="text-emerald-700">| TAG {r.tagMinGpa}</span></> : null}</span>
                <span>4.0</span>
              </div>
            </div>
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer text-slate-500">Past years</summary>
              <table className="mt-1 w-full">
                <thead className="text-slate-400"><tr><th className="text-left font-medium">Fall</th><th className="text-right font-medium">Applied</th><th className="text-right font-medium">Admitted</th><th className="text-right font-medium">Rate</th><th className="text-right font-medium">Middle 50% GPA</th></tr></thead>
                <tbody>{r.history.map((h) => <tr key={h.year}><td>{h.year}</td><td className="text-right">{h.applicants.toLocaleString()}</td><td className="text-right">{h.admits.toLocaleString()}</td><td className="text-right">{((h.admits / h.applicants) * 100).toFixed(0)}%</td><td className="text-right">{h.gpa25.toFixed(2)}–{h.gpa75.toFixed(2)}</td></tr>)}</tbody>
              </table>
            </details>
            {r.notes.length > 0 && <ul className="mt-2 space-y-1 text-xs text-slate-600">{r.notes.map((n) => <li key={n}>• {n}</li>)}</ul>}
            <div className="mt-2"><SourceLink major={r.major} /></div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4 text-sm text-slate-600">
          <h3 className="mb-1 font-semibold text-slate-900">🤝 TAG: Transfer Admission Guarantee</h3>
          Guaranteed admission if you meet the requirements. Offered by <b>UC Davis, Irvine, Merced, Riverside, Santa Barbara and Santa Cruz</b>, not by Berkeley, UCLA or San Diego. Apply Sept 1–30; you can use TAG at one campus only.
        </div>
        <div className="card p-4 text-sm text-slate-600">
          <h3 className="mb-1 font-semibold text-slate-900">⭐ TAP: UCLA Transfer Alliance Program</h3>
          Complete your college’s Honors/Scholars program to get priority consideration for UCLA College of Letters & Science majors (not Engineering).
        </div>
      </div>
    </div>
  )
}
