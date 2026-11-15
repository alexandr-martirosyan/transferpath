import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import { classifyMajors } from '../services/planner'
import UCPicker, { KeywordInput } from './UCPicker'
import { MajorBadges } from './Badges'
import type { Major } from '../domain/types'

/** "My majors" chips with remove buttons. */
export function MyMajorsChips() {
  const { d, collegeShort } = useData()
  const p = useProfile()
  const mine = d.majors.filter((m) => p.targetMajorIds.includes(m.id))
  if (!mine.length) return <p className="text-sm text-slate-500">No majors yet.</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {mine.map((m) => (
        <span key={m.id} className="chip border-indigo-200 bg-indigo-50 text-indigo-800">
          {collegeShort(m.ucId)} · {m.name}
          <button className="ml-0.5 text-indigo-400 hover:text-rose-600" title="Remove" onClick={() => p.toggle('targetMajorIds', m.id)}>✕</button>
        </span>
      ))}
    </div>
  )
}

function Row({ m }: { m: Major }) {
  const { collegeShort } = useData()
  const p = useProfile()
  const on = p.targetMajorIds.includes(m.id)
  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${on ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
      <input type="checkbox" className="accent-indigo-600" checked={on} onChange={() => p.toggle('targetMajorIds', m.id)} />
      <span className="badge bg-slate-900 text-white">{collegeShort(m.ucId)}</span>
      <span className="flex-1">{m.name} <span className="text-xs text-slate-400">{m.degree}</span></span>
      <MajorBadges major={m} />
    </label>
  )
}

/** Choose UCs + keyword, then tick the majors to keep. Writes to profile.targetMajorIds. */
export default function MajorPicker({ showUCs = true }: { showUCs?: boolean }) {
  const { d } = useData()
  const p = useProfile()
  const { main, related } = classifyMajors(d, p.targetUcIds, p.keyword)
  const addAll = () => p.set({ targetMajorIds: [...new Set([...p.targetMajorIds, ...main.map((m) => m.id)])] })
  return (
    <div className="space-y-4">
      {showUCs && <UCPicker />}
      <KeywordInput />
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="label !mb-0">Matching majors — tick the ones you want</span>
          {p.keyword.trim() && main.length > 1 && <button className="text-xs text-indigo-600 hover:underline" onClick={addAll}>Select all</button>}
        </div>
        {!p.keyword.trim() ? <p className="text-sm text-slate-500">Type a subject above or tap a suggestion.</p> : main.length === 0 && related.length === 0 && <p className="text-sm text-slate-500">Nothing found. Try “computer science” or “engineering”, or pick more UCs.</p>}
        {p.keyword.trim() && <div className="space-y-1.5">{main.map((m) => <Row key={m.id} m={m} />)}</div>}
        {p.keyword.trim() && related.length > 0 && (
          <>
            <p className="mb-1.5 mt-3 text-xs text-slate-500">Related majors you might also like:</p>
            <div className="space-y-1.5">{related.map((m) => <Row key={m.id} m={m} />)}</div>
          </>
        )}
      </div>
    </div>
  )
}
