import type { Major } from '../domain/types'

export function MajorBadges({ major }: { major: Major }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {major.tag && <span className="badge bg-emerald-100 text-emerald-800" title="This major is eligible for TAG (Transfer Admission Guarantee)">TAG ✓</span>}
      {major.tap && <span className="badge bg-sky-100 text-sky-800" title="UCLA Transfer Alliance Program (Honors/Scholars) priority">TAP</span>}
      {major.transferPathway && <span className="badge bg-violet-100 text-violet-800" title="UC Transfer Pathway — same prep for every UC">Pathway</span>}
    </span>
  )
}

export function SourceLink({ major }: { major: Major }) {
  return (
    <a href={major.assistUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
      Agreement {major.agreementYear} · verify on ASSIST ↗
    </a>
  )
}
