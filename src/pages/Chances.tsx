import { useMemo, useState } from 'react'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import UCPicker, { KeywordInput } from '../components/UCPicker'
import { MajorBadges, SourceLink } from '../components/Badges'
import { estimateChance, type Band } from '../services/chances'
import { matchMajors } from '../services/planner'
import { computeGpa } from '../services/gpa'

const BAND_STYLE: Record<Band, string> = {
  'Guaranteed (TAG)': 'bg-emerald-600 text-white',
  Likely: 'bg-emerald-100 text-emerald-800',
  Target: 'bg-amber-100 text-amber-800',
  Reach: 'bg-orange-100 text-orange-800',
  'Far reach': 'bg-rose-100 text-rose-700',
}

const MIN = 2.0, MAX = 4.0
const pos = (g: number) => `${((Math.min(MAX, Math.max(MIN, g)) - MIN) / (MAX - MIN)) * 100}%`

export default function Chances() {
  const { d, courseById } = useData()
  const p = useProfile()
  const [view, setView] = useState<'targets' | 'matching'>(p.targetMajorIds.length ? 'targets' : 'matching')
  const computed = computeGpa(p.taken, courseById)
  const gpa = p.gpaOverride ?? (computed.gradedUnits ? Math.round(computed.gpa * 100) / 100 : 3.5)
  const majors = view === 'targets' ? d.majors.filter((m) => p.targetMajorIds.includes(m.id)) : matchMajors(d, p.targetUcIds, p.keyword)
  const results = useMemo(() => majors.map((m) => estimateChance(d, m, gpa, { honors: p.honors, mesa: p.mesa })).sort((a, b) => b.probability - a.probability), [majors, gpa, p.honors, p.mesa])
  const ucName = (id: string) => d.colleges.find((c) => c.id === id)!

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="card h-fit space-y-5 p-4 lg:sticky lg:top-28">
        <div>
          <span className="label">Your transfer GPA</span>
          <div className="flex items-center gap-3">
            <input type="range" min={2} max={4} step={0.01} value={gpa} onChange={(e) => p.set({ gpaOverride: Number(e.target.value) })} className="flex-1 accent-indigo-600" />
            <input type="number" min={0} max={4} step={0.01} value={gpa} onChange={(e) => p.set({ gpaOverride: Number(e.target.value) })} className="input !w-20 text-center font-bold" />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {p.gpaOverride == null ? `Calculated from My Progress (${computed.gradedUnits} graded units).` : <>Manual value. <button className="text-indigo-600 underline" onClick={() => p.set({ gpaOverride: null })}>Use My Progress GPA</button></>}
          </p>
        </div>
        <div className="space-y-2">
          <span className="label">Programs</span>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-indigo-600" checked={p.honors} onChange={(e) => p.set({ honors: e.target.checked })} /> Honors / Scholars program (UCLA TAP)</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-indigo-600" checked={p.mesa} onChange={(e) => p.set({ mesa: e.target.checked })} /> MESA member</label>
        </div>
        <div>
          <span className="label">Show</span>
          <div className="flex gap-1">
            <button className={view === 'targets' ? 'chip-on' : 'chip-off'} onClick={() => setView('targets')}>★ My targets ({p.targetMajorIds.length})</button>
            <button className={view === 'matching' ? 'chip-on' : 'chip-off'} onClick={() => setView('matching')}>All matching</button>
          </div>
        </div>
        {view === 'matching' && <><UCPicker /><KeywordInput /></>}
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          <p className="mb-1 font-semibold text-slate-800">TAG — Transfer Admission Guarantee</p>
          Offered by <b>UC Davis, Irvine, Merced, Riverside, Santa Barbara, Santa Cruz</b>. Not offered by Berkeley, UCLA, or San Diego. Submit Sept 1–30; one campus only.
          <p className="mb-1 mt-2 font-semibold text-slate-800">TAP — UCLA Transfer Alliance Program</p>
          Finish your college's Honors/Scholars program → priority consideration for UCLA College of Letters & Science majors (not Engineering).
        </div>
      </aside>

      <section className="min-w-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admission Chances</h1>
          <p className="text-sm text-slate-500">Based on historical admitted-student GPAs (25th–75th percentile) and admit rates. An estimate, not a guarantee — essays, major prep, and context matter.</p>
        </div>
        {results.length === 0 && <div className="card p-8 text-center text-slate-500">No majors yet — star some in Major Explorer or switch to “All matching”.</div>}
        <div className="grid gap-4 xl:grid-cols-2">
          {results.map((r) => {
            const uc = ucName(r.major.ucId)
            return (
              <div key={r.major.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><span className="badge bg-slate-900 text-white">{uc.short}</span><MajorBadges major={r.major} /></div>
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
                    {r.tagMinGpa && r.major.tag && <div className="absolute -top-1 h-5 w-0.5 bg-emerald-600" style={{ left: pos(r.tagMinGpa) }} title={`TAG min ${r.tagMinGpa}`} />}
                    <div className="absolute -top-1.5 h-6 w-1.5 -translate-x-1/2 rounded bg-slate-900" style={{ left: pos(gpa) }} title={`You: ${gpa}`} />
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>2.0</span><span>Admitted middle 50%: {r.latest.gpa25.toFixed(2)}–{r.latest.gpa75.toFixed(2)} · you {gpa.toFixed(2)}</span><span>4.0</span></div>
                </div>
                <table className="mt-3 w-full text-xs">
                  <thead className="text-slate-400"><tr><th className="text-left font-medium">Fall</th><th className="text-right font-medium">Applicants</th><th className="text-right font-medium">Admits</th><th className="text-right font-medium">Rate</th><th className="text-right font-medium">GPA 25–75%</th></tr></thead>
                  <tbody>
                    {r.history.map((h) => (
                      <tr key={h.year}><td>{h.year}</td><td className="text-right">{h.applicants.toLocaleString()}</td><td className="text-right">{h.admits.toLocaleString()}</td><td className="text-right">{((h.admits / h.applicants) * 100).toFixed(0)}%</td><td className="text-right">{h.gpa25.toFixed(2)}–{h.gpa75.toFixed(2)}</td></tr>
                    ))}
                  </tbody>
                </table>
                {r.notes.length > 0 && <ul className="mt-3 space-y-1 text-xs text-slate-600">{r.notes.map((n) => <li key={n}>• {n}</li>)}</ul>}
                <div className="mt-2"><SourceLink major={r.major} /></div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
