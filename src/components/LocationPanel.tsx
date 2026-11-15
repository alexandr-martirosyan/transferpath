import { useMemo } from 'react'
import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import { collegesInScope, resolveOrigin } from '../services/selection'
import { milesBetween } from '../services/geo'
import CollegeMap from './CollegeMap'

/** Home college / ZIP / GPS + radius or manual checkboxes. Shared by Planner, Majors, Search. */
export default function LocationPanel({ compact = false }: { compact?: boolean }) {
  const { d } = useData()
  const p = useProfile()
  const origin = resolveOrigin(p, d)
  const ccs = d.colleges.filter((c) => c.type === 'CC')
  const scope = collegesInScope(p, d)
  const selected = useMemo(() => new Set(scope.map((s) => s.college.id)), [scope])

  const toggleCollege = (id: string) => {
    if (p.selectionMode === 'radius') p.set({ selectionMode: 'manual', manualCollegeIds: [...selected].filter((x) => x !== id).concat(selected.has(id) ? [] : [id]) })
    else p.toggle('manualCollegeIds', id)
  }

  return (
    <div className="space-y-3">
      <div>
        <span className="label">Start from</span>
        <div className="flex gap-1">
          {(['college', 'zip', 'gps'] as const).map((m) => (
            <button key={m} className={p.originMode === m ? 'chip-on' : 'chip-off'}
              onClick={() => {
                if (m === 'gps') navigator.geolocation?.getCurrentPosition((pos) => p.set({ originMode: 'gps', gps: { lat: pos.coords.latitude, lng: pos.coords.longitude } }), () => alert('Location unavailable'))
                else p.set({ originMode: m })
              }}>
              {m === 'college' ? 'My college' : m === 'zip' ? 'ZIP code' : '📍 My location'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <span className="label">Home college</span>
          <select className="input" value={p.homeCollegeId} onChange={(e) => p.set({ homeCollegeId: e.target.value })}>
            {ccs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {p.originMode === 'zip' && (
          <div>
            <span className="label">ZIP code</span>
            <select className="input" value={p.zip} onChange={(e) => p.set({ zip: e.target.value })}>
              {d.zips.map((z) => <option key={z.zip} value={z.zip}>{z.zip} · {z.city}</option>)}
            </select>
          </div>
        )}
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="label !mb-0">Colleges to include</span>
          <div className="flex gap-1">
            <button className={p.selectionMode === 'radius' ? 'chip-on' : 'chip-off'} onClick={() => p.set({ selectionMode: 'radius' })}>Radius</button>
            <button className={p.selectionMode === 'manual' ? 'chip-on' : 'chip-off'} onClick={() => p.set({ selectionMode: 'manual' })}>Pick manually</button>
          </div>
        </div>
        {p.selectionMode === 'radius' && (
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={100} step={5} value={p.radius} onChange={(e) => p.set({ radius: Number(e.target.value) })} className="flex-1 accent-indigo-600" />
            <span className="w-16 text-right text-sm font-semibold">{p.radius} mi</span>
          </div>
        )}
        <p className="mt-1 text-xs text-slate-500">From <b>{origin.label}</b> · {scope.length} college{scope.length === 1 ? '' : 's'} selected</p>
      </div>
      {!compact && <CollegeMap origin={origin.point} radius={p.radius} colleges={ccs} selected={selected} showRadius={p.selectionMode === 'radius'} onToggle={toggleCollege} />}
      <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
        {ccs
          .map((c) => ({ c, mi: milesBetween(origin.point, c) }))
          .sort((a, b) => a.mi - b.mi)
          .map(({ c, mi }) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-slate-50">
              <input type="checkbox" className="accent-indigo-600" checked={selected.has(c.id)} onChange={() => toggleCollege(c.id)} />
              <span className="flex-1">{c.name}{c.id === p.homeCollegeId && <span className="badge ml-1 bg-emerald-100 text-emerald-700">home</span>}</span>
              <span className="text-xs text-slate-400">{mi.toFixed(0)} mi</span>
            </label>
          ))}
      </div>
    </div>
  )
}
