import { useData } from '../state/data'
import { useProfile } from '../state/profile'

export default function UCPicker() {
  const { d } = useData()
  const p = useProfile()
  const ucs = d.colleges.filter((c) => c.type === 'UC')
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="label !mb-0">Target UCs</span>
        <button className="text-xs text-indigo-600 hover:underline" onClick={() => p.set({ targetUcIds: p.targetUcIds.length === ucs.length ? [] : ucs.map((u) => u.id) })}>
          {p.targetUcIds.length === ucs.length ? 'Clear' : 'All UCs'}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ucs.map((u) => (
          <button key={u.id} className={p.targetUcIds.includes(u.id) ? 'chip-on' : 'chip-off'} onClick={() => p.toggle('targetUcIds', u.id)}>{u.short}</button>
        ))}
      </div>
    </div>
  )
}

export function KeywordInput() {
  const p = useProfile()
  const presets = ['computer science', 'engineering', 'data science', 'mechanical', 'electrical']
  return (
    <div>
      <span className="label">Major keyword</span>
      <input className="input" value={p.keyword} onChange={(e) => p.set({ keyword: e.target.value })} placeholder="e.g. computer science, engineering" />
      <div className="mt-1.5 flex flex-wrap gap-1">
        {presets.map((k) => <button key={k} className={p.keyword === k ? 'chip-on' : 'chip-off'} onClick={() => p.set({ keyword: k })}>{k}</button>)}
      </div>
    </div>
  )
}
