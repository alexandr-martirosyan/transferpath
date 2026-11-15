import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import MajorPicker from '../components/MajorPicker'
import { collegesInScope } from '../services/selection'

const DISTANCES: [number, string][] = [[0, 'Only my college'], [10, '10 miles'], [25, '25 miles'], [50, '50 miles']]
const TAG_UCS = new Set(['ucd', 'uci', 'ucm', 'ucr', 'ucsb', 'ucsc'])

export default function Start() {
  const { d } = useData()
  const p = useProfile()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const ccs = d.colleges.filter((c) => c.type === 'CC')
  const ucs = d.colleges.filter((c) => c.type === 'UC')
  const nearby = collegesInScope(p, d).length

  const steps = [
    {
      title: 'Where do you go to college?',
      hint: 'We’ll also look for the same classes at colleges near you.',
      ok: true,
      body: (
        <div className="space-y-5">
          <select className="input !py-2.5 !text-base" value={p.homeCollegeId} onChange={(e) => p.set({ homeCollegeId: e.target.value, originMode: 'college' })}>
            {ccs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div>
            <p className="mb-2 font-medium">How far would you travel for a class?</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DISTANCES.map(([mi, label]) => (
                <button key={mi} onClick={() => p.set({ radius: mi, selectionMode: 'radius' })}
                  className={`rounded-xl border-2 p-3 text-sm font-medium ${p.selectionMode === 'radius' && p.radius === mi ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-200 hover:border-indigo-300'}`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-500">→ {nearby} {nearby === 1 ? 'college' : 'colleges'} will be included. You can fine-tune this later.</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Which UCs would you like to transfer to?',
      hint: 'Pick as many as you want. “TAG for some majors” means the campus offers a guaranteed-admission agreement, but not for every major — the next step shows exactly which of your majors qualify.',
      ok: p.targetUcIds.length > 0,
      body: (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ucs.map((u) => {
            const on = p.targetUcIds.includes(u.id)
            return (
              <button key={u.id} onClick={() => p.toggle('targetUcIds', u.id)}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left ${on ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                <span className={`grid h-5 w-5 place-items-center rounded border text-xs ${on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>{on ? '✓' : ''}</span>
                <span className="flex-1 font-medium">{u.name}</span>
                {TAG_UCS.has(u.id) && <span className="badge bg-emerald-50 text-emerald-700" title="Transfer Admission Guarantee — only for some majors at this campus">TAG for some majors</span>}
              </button>
            )
          })}
        </div>
      ),
    },
    {
      title: 'What do you want to study?',
      hint: 'Type a subject, then tick the programs you want. Each UC names them a bit differently.',
      ok: p.targetMajorIds.length > 0,
      body: <MajorPicker showUCs={false} />,
    },
    {
      title: 'Almost done — a bit about you',
      hint: 'This decides which GE pattern applies. You can add your classes on the GE & GPA page.',
      ok: true,
      body: (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="label">When did you start college?</span>
            <select className="input !py-2.5" value={p.startYear} onChange={(e) => p.set({ startYear: Number(e.target.value) })}>
              {[2021, 2022, 2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>Fall {y}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-500">{p.startYear >= 2025 ? 'You’ll follow Cal-GETC.' : 'You can use IGETC or Cal-GETC.'}</p>
          </div>
          <div>
            <span className="label">Current college GPA (optional)</span>
            <input type="number" min={0} max={4} step={0.01} className="input !py-2.5" placeholder="e.g. 3.4" value={p.gpaOverride ?? ''} onChange={(e) => p.set({ gpaOverride: e.target.value === '' ? null : Number(e.target.value) })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-indigo-600" checked={p.honors} onChange={(e) => p.set({ honors: e.target.checked })} /> I’m in an Honors / Scholars program <span className="text-xs text-slate-500">(UCLA TAP priority)</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-indigo-600" checked={p.mesa} onChange={(e) => p.set({ mesa: e.target.checked })} /> I’m a MESA student</label>
          </div>
        </div>
      ),
    },
  ]
  const s = steps[step]
  const last = step === steps.length - 1

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex gap-2">
        {steps.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />)}
      </div>
      <p className="text-sm font-medium text-indigo-600">Step {step + 1} of {steps.length}</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">{s.title}</h1>
      <p className="mb-6 mt-1 text-slate-500">{s.hint}</p>
      <div className="card p-5">{s.body}</div>
      <div className="mt-6 flex items-center justify-between">
        <button className="btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
        <button className="btn-primary !px-6 !py-2.5 disabled:opacity-40" disabled={!s.ok}
          onClick={() => { if (last) { p.set({ onboarded: true }); nav('/plan') } else setStep(step + 1) }}>
          {last ? 'See my plan →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
