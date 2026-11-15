# TransferPath: UC Transfer Planner (hackathon plan)

**Deadline:** 18:00 today. **MVP rule:** every feature runs on mock data behind a data-access interface, so real sources (ASSIST, UC InfoCenter, college schedules) can replace the mocks later without UI changes.

---

## 1. Problem

California community college (CC) students planning a UC transfer have to:
1. Open ASSIST.org separately for **every CC × UC pair** to see which courses articulate. There is no way to see several UCs or several nearby colleges at once.
2. Dig through the UC "Transfers by Major" dashboard for historical admit GPAs. It is hard to read and gives no personal estimate.
3. Fill out the Cal-GETC/IGETC worksheet by hand to see which GE areas are still missing, across several colleges.
4. Search every nearby college's schedule by hand to find an equivalent course, for example PHYS 103 in winter.

## 2. Product: five tools, one student profile

A shared **Student Profile** (home college or ZIP, search radius, target UCs, major keyword, courses taken, GPA, MESA/Honors flags) is saved in the browser and used by every tool.

| # | Tool | What it does | MVP priority |
|---|------|--------------|--------------|
| A | **Transfer Planner** | Choose several UCs, a major keyword ("computer science", "engineering"), and a home CC plus a radius in miles (or tick colleges by hand). Output: for each matched UC major, a **requirements × colleges matrix** showing which course meets each requirement at each college, which are required or recommended, and which have **no equivalent** anywhere in range. | P0 (core demo) |
| B | **Major Explorer** | A keyword plus a set of UCs (or all UCs within range) returns every related major (CS, CSE, Computer Engineering, Data Science, and so on), compared side by side: requirement count, admit GPA, TAG eligibility. | P0 (shares logic with A) |
| C | **Admission Chances** | Historical admit GPA (25th–75th percentile), admit rate, and trend for each UC major. Enter a GPA to get a **Reach / Target / Likely** estimate with a probability. Flags show **TAG** eligibility (Davis, Irvine, Merced, Riverside, Santa Barbara, Santa Cruz; not Berkeley, UCLA or San Diego) and **UCLA TAP** (Honors/Scholars, Letters & Science majors). MESA is shown as a support badge only. | P1 |
| D | **My Progress** | Enter courses taken (at any colleges) with grades. Output: a **Cal-GETC audit** (areas 1A, 1B, 1C, 2, 3, 4, 5, 6, with remaining items highlighted), a major-prep checklist for each target UC, unit totals (60 UC-transferable units needed), and a **GPA projection** ("if I take X more units and average 3.5, my GPA becomes …"). IGETC is a toggle for students who started before Fall 2025. | P1 |
| E | **Course Search** | Global search ("PHYS 103 GCC") returns equivalent courses at colleges within the radius, with term filter (Fall/Winter/Spring/Summer), days and times, modality, open seats, and instructor. Seat data is mock now, with a clear "data from partner college" model for later. | P2 |

### Extra features (I recommend these)
- **"Best college combo" optimizer:** the smallest set of nearby colleges that covers all requirements for every selected UC (greedy set cover). Strong demo moment.
- **Map view:** Leaflet map with the radius circle and color-coded college pins.
- **Counselor export:** print or PDF version of the plan to take to a counseling appointment.
- **Source + year on every row:** "Agreement 2025–26 · view on ASSIST" link, to build trust.
- **Transfer Pathways badge:** shows when a UC major follows a UC Transfer Pathway, meaning the same prep works across all UCs.
- **Deadlines strip:** TAG Sept 1–30, UC application Oct 1 – Dec 1, Cal Grant / FAFSA.
- **AI assistant (future):** "What should I take next semester?" answered from the profile plus the matrix.
- Prominent disclaimer: estimates only; check with a counselor and ASSIST.

## 3. Architecture

```
Vite + React + TypeScript + Tailwind (SPA, no backend for MVP)

src/
  domain/types.ts            College, Course, Major, Requirement, Articulation,
                             AdmissionStat, Section, GEArea, StudentProfile
  data/
    repository.ts            interface DataRepository { getColleges(), getMajors(q),
                             getArticulations(majorIds, collegeIds), getAdmissionStats(),
                             searchSections(q, term, collegeIds), getGEAreas() ... }
    mock/                    JSON/TS mock datasets
    mockRepository.ts        implements DataRepository from mock/
    (future) apiRepository.ts → backend that ingests ASSIST / UC InfoCenter / schedules
  services/  (pure, unit-testable logic)
    geo.ts                   haversine distance, colleges within radius
    planner.ts               requirement × college matrix, coverage, set-cover optimizer
    chances.ts               GPA → probability (logistic fit on 25/50/75 + admit rate), TAG/TAP rules
    geAudit.ts               Cal-GETC / IGETC area completion
    gpa.ts                   cumulative + projected GPA
    search.ts                course-equivalent lookup + section filter
  state/profile.ts           Zustand store, persisted to localStorage
  pages/                     Planner, Majors, Chances, Progress, Search, Home
  components/                MultiSelect, RadiusPicker, CollegeMap, RequirementMatrix,
                             ChanceGauge, GEChecklist, CourseCard ...
```

**Extensibility:** the UI calls only `DataRepository`. Moving to real data means writing a new repository (or backend) plus ingestion scripts. Pages and services stay as they are.

### Core data model (short form)
- `College { id, name, short, type: 'CC'|'UC', lat, lng, city }`
- `Course { id, collegeId, code, title, units, geAreas[], ucTransferable }`
- `Major { id, ucId, name, keywords[], college (L&S/Engineering), tag: boolean, tap: boolean, transferPathway?: string }`
- `Requirement { id, majorId, label, kind: 'required'|'recommended', ucCourse, group? (choose N of) }`
- `Articulation { requirementId, collegeId, options: courseId[][] /* OR of ANDs */ | null /* no equivalent */ }`
- `AdmissionStat { majorId, year, applicants, admits, gpa25, gpa75 }`
- `Section { courseId, term, days, time, modality, seats, capacity, instructor }`
- `GEArea { id: '1A'..'6', name, required: { courses, units } }`

### Mock data scope
- **UCs:** all 9 undergraduate campuses (Berkeley, UCLA, San Diego, Davis, Irvine, Santa Barbara, Santa Cruz, Riverside, Merced).
- **CCs:** about 10 LA-area colleges with real coordinates (Glendale, Pasadena City, LA Valley, LA City, ELAC, Santa Monica, Citrus, Mt. San Antonio, LA Pierce, Rio Hondo).
- **Majors:** CS, CSE/Computer Engineering, EE, ME, Data Science, and similar, about 25 UC majors.
- **Courses:** math series, physics series, chemistry, CS programming/data structures/discrete/assembly, English, and GE fillers, articulated per college with some deliberate gaps.
- **Admission stats:** plausible 25th–75th percentile GPAs, labeled "illustrative" until real UC InfoCenter data is imported.

## 4. UI layout

- **Top nav:** Planner · Majors · Chances · My Progress · Course Search, plus a profile chip on the right.
- **Home:** hero ("Plan your UC transfer in one place"), a 3-step onboarding (home college/ZIP → target UCs + major → courses taken), and cards for the five tools.
- **Planner page:** left filter panel (UC multi-select, major keyword, home CC, radius slider 0–100 mi, small map, checkbox list of colleges in range). Main area: one accordion per UC major containing the requirement matrix. Rows are requirements and columns are colleges. Cells are course codes: **green** means available at the home college, **blue** at a nearby college, **red** means no equivalent anywhere in range. A summary bar shows coverage %, missing requirements, and the "best combo" result.
- **Chances page:** major cards with a GPA band bar (25th–75th percentile, plus the student's GPA marker), a probability gauge, and TAG/TAP badges.
- **Progress page:** Cal-GETC checklist grid, unit counter ring, GPA projector (sliders), and per-UC prep checklist.
- **Search page:** search box, term filter, results list sorted by distance with seats and time.
- Clean, card-based design, mobile-friendly, dark mode.

## 5. Timeline (now → 18:00)

| Time | Work |
|------|------|
| 15:35–15:50 | Scaffold (Vite/React/TS/Tailwind/router/Zustand), domain types, repository interface, git init |
| 15:50–16:20 | Mock data: colleges, UCs, majors, requirements, articulations, GE areas, stats, sections |
| 16:20–16:55 | **Planner + Major Explorer** (geo radius, matrix, coverage, optimizer) |
| 16:55–17:20 | **Chances** (stats view, probability, TAG/TAP) |
| 17:20–17:40 | **My Progress** (course entry, Cal-GETC audit, GPA projection) + **Search** (simple) |
| 17:40–17:52 | Polish, home page, README, deploy (Vercel/Netlify) or local demo |
| 17:52–18:00 | Buffer and submit |

If time runs short, cut in this order: Search → map → optimizer → IGETC toggle.

## 6. Future roadmap (for the pitch)
1. Ingest real ASSIST articulation agreements (scheduled sync), with agreement year shown.
2. Import UC InfoCenter "Transfers by Major" data for real admit GPA and rate.
3. Partner API for colleges' live schedule and seat data (Banner/PeopleSoft feeds).
4. Accounts plus transcript import, shared plans with counselors.
5. AI counselor that builds a semester-by-semester plan.
6. Add CSU (ADT degrees) and private-university transfer agreements.

## 7. Decisions (confirmed)
- **Scope:** all five tools are in the MVP, running on mock or limited data. They are built in priority order A → B → C → D → E, so a working demo exists at every point.
- **Stack:** Vite + React + TypeScript + Tailwind, Zustand, React Router, Leaflet. No backend.
- **Builder:** Claude builds it all. The code must be easy for another agent (Codex) to continue:
  - `AGENTS.md` at the root: how to run, folder map, conventions, how to add a data source, open TODOs.
  - The progress checklist below is kept up to date after each step.
  - Small, single-purpose files with pure logic in `services/`, and mock data only behind `DataRepository`.
  - Commit after each finished step with a clear message.
- **Demo:** live URL on Vercel. The user runs `vercel login` themselves; Claude runs the deploy.

## 8. Progress checklist (handoff source of truth)
- [x] 1. Scaffold + types + repository interface + AGENTS.md + git init
- [x] 2. Mock data (colleges, UCs, majors, requirements, articulations, GE, stats, sections)
- [x] 3. Profile store + layout/nav + Home
- [x] 4. Planner + Major Explorer (radius, manual selection, matrix, coverage, optimizer, map)
- [x] 5. Admission Chances (bands, probability, TAG/TAP/MESA)
- [x] 6. My Progress (course entry, Cal-GETC/IGETC audit, units, GPA projection)
- [x] 7. Course Search (equivalents in radius, term filter, sections)
- [x] 8a. Polish + README + AGENTS.md
- [ ] 8b. Vercel deploy (after `vercel login`)

## 9. Assumptions (correct me if wrong)
- "GCC" = Glendale Community College; "VC" = other community colleges (for example LA Valley College). All are treated as CCs.
- Cal-GETC is the default GE pattern (students starting Fall 2025+), with IGETC as an option.
- No login. The profile lives in localStorage.
