# Generator State — Iteration 001

## What Was Built
Lumen Registrar — a college registrar admin tool (React + Vite + TypeScript frontend, Flask + SQLAlchemy + SQLite backend). This iteration picked up substantial existing scaffolding (backend complete, frontend components + 2 pages) and wired it into a running, demoable application.

### Backend (verified working, not rewritten)
- App factory, JSON envelope (`{data, error, meta}`), CORS, error handlers (404/405/500).
- Blueprints: students (list/create/get/update/archive/restore), grades (nested + flat CRUD), courses, stats.
- Pagination/sort/filter/search; duplicate-email guard; server-side validation; GPA computation; seed data (16 students, 8 courses, grades).

### Frontend — newly created this iteration
- `src/main.tsx` — entry point: QueryClientProvider + BrowserRouter + ToastProvider.
- `src/App.tsx` — React Router routes for all pages incl. SPA 404 fallback.
- `pages/DashboardPage.tsx` + `features/dashboard/` — overview with 4 metric cards, two on-brand horizontal distribution charts (students-by-program, enrollment-by-year, both clickable to filtered roster), recent admissions, recent grade activity. Hand-rolled chart, not a chart-lib default.
- `pages/StudentProfilePage.tsx` + `features/students/StudentSummaryCard.tsx` + `student-profile.css` — two-column profile: transcript panel (add/edit/delete grade, GPA recompute) + sticky right inspector panel (GPA/age/grade-count stats, grouped identity/contact/academic detail rows). 404 empty-state for unknown students.
- `pages/StudentEditPage.tsx` — pre-filled StudentForm, optimistic update with rollback, dirty-state guard (in-app confirm dialog + beforeunload).
- `pages/GradesPage.tsx` + `features/grades/grades-page.css` — cross-student recent grade activity table + inline student-picker to jump to a transcript for grading.
- `pages/CoursesPage.tsx` + `features/courses/courses.css` — program list with student counts, rows link to filtered roster.
- `pages/NotFoundPage.tsx` — 404 page with personality.

### Frontend — modified this iteration
- `features/students/StudentForm.tsx` — wired `onDirtyChange` to react-hook-form `isDirty`.
- `lib/queries.ts` — added optimistic `onMutate`/rollback to `useUpdateStudent`; widened `toQuery` typing.

## What Changed This Iteration
- Fixed BLOCKING gap: created the missing `main.tsx` and `App.tsx` so the app boots at all.
- Added the missing pages (dashboard, profile view+edit, grades, courses, 404).
- Added optimistic student edits and dirty-state navigation guard.
- `tsc --noEmit` clean; `vite build` succeeds (142 modules, 6.2kB gzip CSS, 105kB gzip JS).

## Verified End-to-End (via Vite proxy on :5173 -> Flask :5050)
- Frontend serves; SPA deep links (`/students/1`, `/students/1/edit`) fall back to index.html.
- Students list returns real paginated data; `pageSize` honored.
- Profile returns computed age + GPA.
- Grade add -> GPA 3.59->3.65, count 5->6; delete -> back to 3.59/5 (recompute correct).
- Invalid grade (score 150) -> 422; duplicate email -> 422 with field error; valid create -> 201; hard-delete cleanup works.
- 404 for unknown student id.
- Restored seed DB to clean state after testing.

## Known Issues / Deferred
- A harmless Tailwind warning appears in `vite build`, leaked from the unrelated root Jerry project's `tailwind.config.js`/`postcss.config.js`. No Tailwind is used by Lumen; CSS output is correct. Could isolate with a local postcss config next iteration.
- Courses page is read-only; full course CRUD (create/edit/delete) deferred (should-have #14).
- Grade analytics trend chart on profile (should-have #15) deferred.
- Grades page uses stats `recentGrades` (no global grade-list endpoint yet) — fine for demo, could add a dedicated endpoint later.
- No automated tests yet (Vitest/Playwright/pytest) — deferred to a hardening iteration.
- Browser-level console-error check not run (no Playwright installed); verified via Vite transform 200s + clean tsc + production build.

## Dev Servers
- Backend API: http://127.0.0.1:5050  (cd lumen-registrar/backend && source .venv/bin/activate && python wsgi.py) — running
- Frontend: http://localhost:5173  (cd lumen-registrar/frontend && npm run dev) — running
- Frontend proxies `/api` -> backend.
