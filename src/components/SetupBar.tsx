import { useData } from '../state/data'
import { useProfile } from '../state/profile'
import { useUI } from '../state/ui'
import { collegesInScope, resolveOrigin } from '../services/selection'
import LocationPanel from './LocationPanel'
import MajorPicker, { MyMajorsChips } from './MajorPicker'
import MyCourses from './MyCourses'

/** One-line summary of the student's setup, shown on every tool page. */
export function SetupBar() {
  const { d, collegeShort } = useData()
  const p = useProfile()
  const open = useUI((s) => s.openSetup)
  const scope = collegesInScope(p, d)
  const origin = resolveOrigin(p, d)
  const ucs = [...new Set(d.majors.filter((m) => p.targetMajorIds.includes(m.id)).map((m) => collegeShort(m.ucId)))]
  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm">
      <span>📍 <b>{origin.label}</b> <span className="text-slate-500">+ {scope.length - 1} colleges {p.selectionMode === 'radius' ? `within ${p.radius} mi` : 'picked'}</span></span>
      <span>🎓 <b>{p.targetMajorIds.length} {p.targetMajorIds.length === 1 ? 'major' : 'majors'}</b> <span className="text-slate-500">{ucs.length ? `at ${ucs.join(', ')}` : ''}</span></span>
      <span>📚 <b>{p.taken.length} {p.taken.length === 1 ? 'class' : 'classes'}</b></span>
      <button className="btn-primary ml-auto" onClick={open}>+ Add classes</button>
      <button className="btn-ghost" onClick={open}>✏️ Change</button>
    </div>
  )
}

/** Slide-over panel to edit majors + location from anywhere. */
export function SetupDrawer() {
  const { setupOpen, closeSetup } = useUI()
  if (!setupOpen) return null
  return (
    <div className="fixed inset-0 z-[2000] flex justify-end bg-slate-900/40" onClick={closeSetup}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Your setup</h2>
          <button className="btn-primary" onClick={closeSetup}>Done</button>
        </div>
        <section className="space-y-3">
          <h3 className="font-semibold">🎓 My majors</h3>
          <MyMajorsChips />
          <details className="rounded-xl border border-slate-200 p-3" open>
            <summary className="cursor-pointer text-sm font-medium text-indigo-700">Find & add majors</summary>
            <div className="mt-3"><MajorPicker /></div>
          </details>
        </section>
        <section className="mt-6 space-y-3">
          <h3 className="font-semibold">📚 My classes</h3>
          <MyCourses />
        </section>
        <section className="mt-6 space-y-3">
          <h3 className="font-semibold">📍 Where I can take classes</h3>
          <LocationPanel />
        </section>
      </div>
    </div>
  )
}
