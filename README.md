# 🎓 TransferPath: plan your UC transfer in one place

California community college students currently open ASSIST.org once for **every college × UC pair**, read hard-to-use admissions dashboards, and fill out GE worksheets by hand. TransferPath puts all of it in one place.

## Features
- **Transfer Planner:** choose several UCs and a major keyword ("computer science", "engineering"). It shows a matrix of every UC requirement against its equivalent at your home college and at every college within *N* miles, or at colleges you pick by hand on a map. Courses with no equivalent are flagged.
- **Best college combo:** the fewest nearby colleges that cover every required prep course (greedy set cover).
- **Take these first:** the courses required by the most of your target majors.
- **Major Explorer:** every related major across UCs in one sortable table (prep load, coverage near you, admit GPA, admit rate, TAG / TAP / Transfer Pathway).
- **Admission Chances:** historical admitted-student GPA ranges and an estimate of your chance (Reach / Target / Likely). It also shows TAG guarantees (Davis, Irvine, Merced, Riverside, Santa Barbara, Santa Cruz), UCLA TAP for Honors/Scholars students, and a MESA badge.
- **My Progress:** add courses from any college. You get a **Cal-GETC** audit (or **IGETC** if you started before Fall 2025), a unit counter toward 60, a major-prep checklist, and a **GPA projection** ("if I average 3.5 on 15 more units…").
- **Course Search:** for example "PHYS 103 GCC". It finds equivalents nearby by term (Winter included), with days, times, modality and open seats.
- **Counselor export:** a printable version of the plan. There's also a deadlines strip, an agreement year with an ASSIST link on every major, and a disclaimer.

## Run locally
```bash
npm install
npm run dev
```

## Architecture
Vite + React + TypeScript + Tailwind. The UI reads only through a `DataRepository` interface. Today that is a `MockRepository` (12 LA-area community colleges, all 9 UCs, about 31 majors). Moving to real ASSIST, UC InfoCenter and college schedule data means replacing one class. See [AGENTS.md](AGENTS.md).

> ⚠️ Demo data is illustrative. Always verify on [ASSIST.org](https://assist.org) and with a counselor.
