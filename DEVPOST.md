# Devpost submission: copy & paste

## Project name
TransferPath

## Elevator pitch / tagline (≤ 200 chars)
Plan your UC transfer in one place, not 50 ASSIST tabs. See what to take, where to take it nearby, your admission chances, and what's left for GE.

## Built with (tags)
react, typescript, vite, tailwindcss, zustand, leaflet, openstreetmap, vercel, claude-code

## Try it out (links)
- Live demo: <YOUR VERCEL URL>
- Code: https://github.com/alexandr-martirosyan/transferpath

## Video demo link
<YOUR YOUTUBE (UNLISTED) / LOOM / CAP LINK>

---

## About the project (story)

### Inspiration
We're community college students at Glendale Community College. Planning a transfer to a UC means opening ASSIST.org separately for **every college × UC pair**, digging through hard-to-read admissions dashboards, and filling out the Cal-GETC worksheet by hand. If a class is full at GCC, you have to search every nearby college's schedule yourself. Many students, especially first-generation students, give up or take classes that don't count.

### What it does
TransferPath turns a 4-question setup (your college, how far you'd travel, target UCs, major) into one plan:
- **My Plan:** a dashboard with your progress, the next courses to take, and your chances for each major.
- **What to Take:** every UC's major prep merged into **one de-duplicated checklist**, with the best place to take each course. A "fewest colleges" optimizer (for example, *GCC + PCC*) and a side-by-side comparison across many colleges show what ASSIST can't.
- **Explore Majors:** compare related majors across UCs. **"Fits my courses"** shows majors you're only a few classes away from.
- **My Chances:** your GPA compared with past admitted students' GPAs, **TAG** guarantees (per major), **UCLA TAP** (Honors/Scholars) and MESA notes.
- **GE & GPA:** add classes from any college. You get a **Cal-GETC / IGETC** checklist with plain-language rules, what's missing, and clickable courses that count, plus GPA projection ("what average do I need?").
- **Find a Class:** pick a college and a course (for example GCC PHYS 103) and find equivalent classes nearby, with term, time, modality and open seats.

### How we built it
React + TypeScript + Vite + Tailwind, with Zustand for the student profile (saved in the browser) and Leaflet/OpenStreetMap for the distance map. All data goes through a single `DataRepository` interface. The MVP uses realistic demo data (12 LA-area community colleges, all 9 UCs, about 31 majors), and real ASSIST agreements, UC InfoCenter admissions data and college schedule feeds can replace it without changing the UI. Planning logic runs as pure functions: distance filtering, requirement × college matrices, a greedy set-cover optimizer, an admissions estimate, and a GE auditor. We built it with Claude Code.

### Challenges we ran into
- Each UC names and articulates majors differently. The same CC course can count for UCB but not for UCLA, so the plan has to work per requirement, not per course.
- Making a lot of data feel simple. We redesigned the UI around one "My majors" list and a guided setup.
- Modeling GE rules (Arts + Humanities, 2 disciplines, lab requirement) so each course counts in only one area.

### Accomplishments that we're proud of
- One view comparing **many UCs × many colleges** at once, plus the "fewest colleges" optimizer.
- Telling students which **other majors** their current courses already fit.
- A GE checklist that explains the rules and suggests courses, so students don't need the PDF.

### What we learned
Articulation, TAG/TAP and GE rules are complex, but students mostly need answers to three questions: what to take, where, and whether it counts.

### What's next for TransferPath
1. Import real **ASSIST** agreements for all 116 CA community colleges, plus CSUs.
2. Real **UC InfoCenter "Transfers by Major"** admissions data.
3. **Partner colleges** (starting with GCC) sharing live schedules and seat counts.
4. Accounts, a database, and plans shared with counselors.
5. An **AI counselor** that builds a semester-by-semester plan.

---

## Judging criteria cheat sheet
- **Technical execution (40%):** working multi-page app, an optimizer, a GE auditor, an admissions model, and a data layer ready for real sources.
- **Local impact (20%):** built for Glendale CC (the host college) and LA-area students transferring to UC.
- **Feasibility (15%):** public data sources exist (ASSIST, UC InfoCenter, college class search).
- **Creativity (10%):** multi-college comparison, "fits my courses", one plan across all UCs.

## Media to add
- Thumbnail (3:2): a screenshot of My Plan or the What to Take checklist.
- Gallery: Get started step 3, My Plan, What to Take (Compare colleges), My Chances, GE & GPA checklist, Find a Class.
