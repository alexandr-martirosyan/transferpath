# AGENTS.md — handoff guide for coding agents (Codex, Claude, etc.)

TransferPath: UC transfer planner for California community college students.
Read `PLAN.md` for the product vision and the progress checklist (section 8). Keep that checklist current.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc (must pass before commit)
npm run build      # production build → dist/
```
Deploy: Vercel (static SPA). `vercel.json` rewrites all routes to `index.html`.

## Stack
Vite + React 19 + TypeScript + Tailwind v4 (`@tailwindcss/vite`) + React Router 7 + Zustand (persisted) + react-leaflet.
Custom CSS utilities (`card`, `btn-primary`, `chip-on`, `badge`, `input`, `label`…) are defined in `src/index.css` with `@utility` (Tailwind v4 — plain `.class {}` cannot be `@apply`'d).

## Architecture (golden rules)
1. **UI never imports mock data.** All data flows: `DataRepository.load()` → `Dataset` → `useData()` context.
2. **Business logic lives in `src/services/*`** as pure functions over `Dataset` (no React). Put new logic there.
3. **Domain types** in `src/domain/types.ts` are the contract between data sources and UI. Extend, don't break.
4. **One list of majors:** `profile.targetMajorIds` ("My majors") drives every page. UC picks + keyword are only for *finding* majors.
5. **Student state** (`src/state/profile.ts`) is a persisted Zustand store shared by all pages. Bump the storage key version if you change its shape incompatibly.

```
src/
  domain/types.ts          College, Course, Major, Requirement, Articulation, AdmissionStat, Section, TagRule, Dataset
  data/repository.ts       DataRepository interface
  data/mockRepository.ts   builds Dataset from mock/*, generates articulations + seeded schedule
  data/mock/colleges.ts    12 LA-area CCs + 9 UCs (real coords), demo ZIPs
  data/mock/catalog.ts     canonical course concepts → per-college catalogs (gaps + custom codes)
  data/mock/majors.ts      ~31 UC majors, requirement templates, UC course numbers, admission stats, TAG rules
  data/index.ts            ← swap repository implementation here
  services/
    geo.ts                 haversine miles, radius filter
    selection.ts           origin (college/ZIP/GPS) + colleges in scope (radius or manual)
    planner.ts             matchMajors, buildMatrix, coverage, bestCombo (greedy set cover), sharedRequirements
    chances.ts             GPA → probability heuristic, bands, TAG/TAP/MESA notes
    geAudit.ts             Cal-GETC & IGETC rule definitions + greedy audit
    gpa.ts                 GPA, projection, required average
    search.ts              query parsing, equivalents + sections
  state/profile.ts         persisted student profile
  state/data.tsx           DataProvider / useData()
  services/coursePlan.ts   buildCoursePlan (merged course checklist + where to take), majorFit ("majors my courses fit")
  state/ui.ts              non-persisted UI state (setup drawer)
  components/              Layout (nav, deadlines, SetupBar, disclaimer), SetupBar/SetupDrawer, MajorPicker,
                           LocationPanel, CollegeMap, UCPicker, Badges
  pages/                   Home, Start (4-step wizard), Plan (dashboard), Courses (checklist + compare matrix),
                           Majors (search + fits-my-courses), Chances, Progress (GE & GPA), Search (find a class)
```

## How equivalence works (mock)
Each CC course maps to a canonical concept (`Course.canon`, e.g. `CALC1`). Each UC `Requirement` has a `canon`.
`MockRepository` generates an `Articulation` per (requirement × CC): the CC course with the same canon, unless listed
in `exceptions` (`"<requirementId>@<collegeId>"` or `@*` for "no CC articulates it").
Real data will provide `Articulation` rows directly from ASSIST — services already consume `Articulation`, not `canon`
(except Course Search, which uses `canon` to find equivalents; switch it to ASSIST course-to-course data later).

## Adding real data (roadmap)
- **ASSIST agreements** → write `ApiRepository implements DataRepository` (or an ingestion script producing a `Dataset` JSON per region). Fill `College.assistId`, `Major.assistUrl`, `Major.agreementYear`.
- **UC "Transfers by Major"** (UC InfoCenter) → `AdmissionStat` rows.
- **Class schedules / seats** → `Section` rows (partner feeds from colleges).
- **All CA public colleges** → add rows to colleges; nothing else changes.
- For large data, add lazy methods to `DataRepository` (e.g. `getArticulations(majorIds, collegeIds)`) and keep `load()` for reference data.

## Conventions
- Small focused files; Tailwind classes inline; no CSS modules.
- Keep everything deterministic (seeded RNG in `services/rng.ts`).
- All admission/TAG numbers are illustrative — UI must keep the disclaimer + "verify on ASSIST" links.
- Commit after each finished feature; update `PLAN.md` checklist.

## Open TODOs (next steps)
- [ ] Deploy to Vercel (`npx vercel` after `vercel login`).
- [ ] Real ASSIST deep links per agreement (needs institution/agreement ids).
- [ ] Course-to-course "series" articulation (e.g. UCB CS 61B = two CC courses), OR-options in a cell.
- [ ] Unit tests for `services/*` (vitest).
- [ ] Mobile layout polish for the requirement matrix.
- [ ] AI counselor (semester plan from profile + matrix) using the Claude API.
- [ ] Accounts + transcript import; share plan link with a counselor.
