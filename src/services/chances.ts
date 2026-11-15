import type { AdmissionStat, Dataset, Major } from '../domain/types'

export type Band = 'Guaranteed (TAG)' | 'Likely' | 'Target' | 'Reach' | 'Far reach'

export interface ChanceResult {
  major: Major
  latest: AdmissionStat
  history: AdmissionStat[]
  admitRate: number
  probability: number // 0..1
  band: Band
  tagEligible: boolean // major offers TAG and student meets min GPA
  tagMinGpa?: number
  tapBoost: boolean
  notes: string[]
}

const logit = (p: number) => Math.log(p / (1 - p))
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))

/**
 * Heuristic model (NOT a guarantee): admitted-student GPAs ~ Normal(median, IQR/1.349).
 * Chance = sigmoid(logit(admitRate) + 0.8 + 1.7·z), z = distance from admitted median in SDs.
 * TAG eligibility overrides to "guaranteed"; UCLA TAP adds a priority bump.
 */
export function estimateChance(d: Dataset, major: Major, gpa: number, opts: { honors: boolean; mesa: boolean }): ChanceResult {
  const history = d.admissionStats.filter((s) => s.majorId === major.id).sort((a, b) => a.year - b.year)
  const latest = history[history.length - 1]
  const admitRate = latest.admits / latest.applicants
  const median = (latest.gpa25 + latest.gpa75) / 2
  const sd = Math.max(0.08, (latest.gpa75 - latest.gpa25) / 1.349)
  const z = (gpa - median) / sd
  const tapBoost = major.tap && opts.honors
  let x = logit(Math.min(0.97, Math.max(0.02, admitRate))) + 0.8 + 1.7 * z + (tapBoost ? 0.5 : 0)
  let p = Math.min(0.97, Math.max(0.005, sigmoid(x)))
  if (gpa < latest.gpa25 - 4 * sd) p = 0.005

  const rule = d.tagRules.find((t) => t.ucId === major.ucId)
  const tagEligible = major.tag && !!rule && gpa >= rule.minGpa
  const notes: string[] = []
  if (major.tag && rule) notes.push(tagEligible ? `Meets TAG minimum GPA ${rule.minGpa.toFixed(1)} — apply Sept 1–30.` : `TAG offered: need GPA ≥ ${rule.minGpa.toFixed(1)}.`)
  if (rule && major.tag) notes.push(rule.note)
  if (tapBoost) notes.push('UCLA TAP: Honors/Scholars completion gives priority consideration (Letters & Science).')
  else if (major.tap) notes.push('TAP-eligible major — join your college Honors/Scholars program for priority at UCLA.')
  if (opts.mesa) notes.push('MESA: strengthens STEM application & support; not a formal admission guarantee.')
  if (major.transferPathway) notes.push(`Follows UC Transfer Pathway: ${major.transferPathway} — same prep works at every UC.`)

  const band: Band = tagEligible ? 'Guaranteed (TAG)' : p >= 0.7 ? 'Likely' : p >= 0.35 ? 'Target' : p >= 0.1 ? 'Reach' : 'Far reach'
  return { major, latest, history, admitRate, probability: tagEligible ? 0.99 : p, band, tagEligible, tagMinGpa: rule?.minGpa, tapBoost, notes }
}
