# Evaluation Rubric: Lumen Registrar (College ERP — Student Management)

> Scoring model: each dimension is scored 0–10, then combined into a weighted 0–10 overall score.
> Final = Σ(dimension_score × weight). This is a CRUD-heavy internal admin/ERP tool, so
> Functionality and Craft dominate; Design is professional-polish; Originality is product judgment.
> A demo that does not run against the real Flask + SQLite backend caps the overall score at 4.0.

## Dimensions & Weights

| Dimension | Weight |
|---|---|
| Functionality & Correctness | 0.35 |
| Craft & Polish | 0.30 |
| Design Quality | 0.20 |
| Product Judgment / Originality | 0.15 |

---

## 1. Functionality & Correctness — weight 0.35

What to verify (against the running app + API):

- [ ] Admissions form creates a persisted student with ALL six fields (name, email, phone, DOB, course, year of enrollment).
- [ ] Client AND server validation reject invalid input (bad email, future DOB, out-of-range year, empty required fields).
- [ ] Students list loads real DB data with working search, filter by course, filter by year, sort, and pagination.
- [ ] Filter/sort/pagination state is reflected in the URL (back button + shareable).
- [ ] Profile view renders every stored field; edit persists and re-renders; dirty-state guard prevents accidental loss.
- [ ] Grades: add, view (transcript table), edit, and delete all function and persist.
- [ ] GPA / average recomputes correctly after every grade mutation.
- [ ] Edge cases: empty DB, no-search-results, invalid/unknown student ID → 404, duplicate email handled.
- [ ] Full critical path works: enroll → list → profile → edit → add grade → summary updates → delete grade → summary updates → delete/archive student.

Scoring guide:
- 9–10: Entire critical path + edge cases work flawlessly, both-side validation, correct GPA math.
- 7–8: Core CRUD + grades work; minor edge-case or validation gaps.
- 5–6: Main create/read works but edit, grades, or filtering is partial/buggy.
- 3–4: Only some endpoints wired; data does not reliably persist; or frontend uses mock data instead of the real API.
- 0–2: Does not run, or core features broken/absent.

## 2. Craft & Polish — weight 0.30

What to verify:

- [ ] Every async surface has loading (skeletons preferred over bare spinners), empty, and error states.
- [ ] Empty state ≠ no-results state (distinct, helpful copy + action).
- [ ] Forms: inline per-field validation, disabled-until-valid submit, keyboard submit, focus management, helpful error copy.
- [ ] Tables: sticky header, tabular numerals on numeric/date columns, sensible row height, sort affordances, designed hover/active/selected states.
- [ ] Optimistic updates with visible rollback + toast on failure; success feedback present.
- [ ] Accessibility: semantic HTML, labeled inputs, keyboard navigable, visible focus rings, WCAG AA contrast.
- [ ] No console errors; no layout shift on load; responsive to 768px with no overflow.

Scoring guide:
- 9–10: All three states everywhere, polished interaction states, a11y solid, zero console errors, no CLS.
- 7–8: Most states present, good forms/tables, minor a11y or polish gaps.
- 5–6: Happy path styled but missing loading/empty/error states or interaction states feel default.
- 3–4: Bare spinners, unhandled errors/blank screens, no focus/hover design.
- 0–2: Unstyled interactions, broken layout, console errors throughout.

## 3. Design Quality — weight 0.20

What to verify (professional, intentional admin UI — NOT marketing flash):

- [ ] Coherent design-token system (color, type, spacing) applied consistently; minimal one-off hardcoded styles.
- [ ] Clear hierarchy via scale contrast + intentional spacing rhythm (section gaps > field gaps; not uniform padding).
- [ ] Registrar identity present: serif page titles/wordmark + tabular figures in data; disciplined palette near the spec.
- [ ] Coherent status/grade chip system; if a dashboard chart exists, it is styled to the design system (not a default chart-lib look).
- [ ] Persistent, legible navigation with an unmistakable active state.

Banned AI-slop patterns (each present pattern subtracts from this dimension):
- [ ] Gradient hero blobs / decorative gradients on an admin tool
- [ ] Stock illustrations or generic mascot art
- [ ] Generic uniform card grid with no hierarchy
- [ ] Shadow soup / glassmorphism with no purpose
- [ ] Purely decorative animation that distracts from data
- [ ] Unstyled default-template look (raw shadcn/Tailwind defaults passed off as finished)

Scoring guide:
- 9–10: Looks like a real, tasteful institutional product; tokens + identity + hierarchy all intentional; zero slop.
- 7–8: Clearly professional and intentional; small consistency gaps.
- 5–6: Acceptable but generic; weak hierarchy or partial token use.
- 3–4: Default-template feel or one or more banned patterns present.
- 0–2: Unstyled or visually broken.

## 4. Product Judgment / Originality — weight 0.15

What to verify (smart, opinionated choices a real registrar would value):

- [ ] Seed data so the app never demos empty.
- [ ] Course as a real FK dropdown (not free text).
- [ ] Computed values surfaced (age from DOB, GPA/weighted average from grades).
- [ ] Power features: command palette (⌘K), CSV export of filtered view, shareable filtered URLs, transcript/print view.
- [ ] Sensible API design: consistent response envelope, correct HTTP status codes, pagination/sort/filter params.
- [ ] A coherent point of view about the registrar workflow rather than a generic form-over-table dump.

Scoring guide:
- 9–10: Several thoughtful, well-executed power features + clean data/API design; clear product POV.
- 7–8: A couple of smart touches beyond the brief; solid data model.
- 5–6: Meets the brief literally with little extra judgment.
- 3–4: Generic CRUD with awkward data model or free-text course.
- 0–2: No evidence of product thinking.

---

## Overall Scoring

```
overall = 0.35 * functionality
        + 0.30 * craft
        + 0.20 * design
        + 0.15 * product_judgment
```

Hard caps:
- If the app does not run against the real Flask + SQLite backend (e.g. frontend-only with mocked data): cap overall at 4.0.
- If the admissions form, profiles, or grades feature is entirely missing: cap overall at 5.0.
- If there are unhandled runtime/console errors on the critical path: subtract 1.0 from overall.

Interpretation bands:
- 9.0–10: Ship-ready registrar tool.
- 7.0–8.9: Strong; minor follow-ups.
- 5.0–6.9: Functional but needs another iteration.
- < 5.0: Significant gaps; regenerate.
