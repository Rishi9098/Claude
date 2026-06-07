import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStats, useStudents } from "../lib/queries";
import { Button } from "../components/ui/Button";
import { GradeChip } from "../components/ui/Chip";
import { EmptyState, ErrorState, TableSkeleton } from "../components/ui/States";
import "../features/grades/grades-page.css";

export function GradesPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, error, refetch } = useStats();
  const [pickerOpen, setPickerOpen] = useState(false);

  const grades = stats?.recentGrades ?? [];

  return (
    <div className="page-enter">
      <header className="page-head">
        <div className="page-head__titles">
          <span className="page-head__eyebrow">Academic record</span>
          <h1 className="page-title">Grades</h1>
          <p className="page-head__desc">
            Recent grading activity across the registrar. Open a student to post
            or revise their transcript.
          </p>
        </div>
        <div className="page-head__actions">
          <Button variant="primary" onClick={() => setPickerOpen((v) => !v)}>
            Add a grade
          </Button>
        </div>
      </header>

      {pickerOpen && <StudentPicker onClose={() => setPickerOpen(false)} />}

      <section className="panel grades-panel">
        <div className="panel__head">
          <h2 className="panel__title">Recent activity</h2>
          {stats && (
            <span className="grades-panel__count tnum">
              {stats.totalGrades} grades on file · cohort GPA{" "}
              {stats.overallGpa?.toFixed(2) ?? "—"}
            </span>
          )}
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : grades.length === 0 ? (
          <EmptyState
            title="No grades recorded yet"
            message="Once grades are posted to student transcripts, the latest activity will appear here."
            action={
              <Button size="sm" variant="secondary" onClick={() => setPickerOpen(true)}>
                Post the first grade
              </Button>
            }
          />
        ) : (
          <div className="dtable-scroll">
            <table className="dtable grades-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Term</th>
                  <th className="num">Score</th>
                  <th>Grade</th>
                  <th className="num">Credits</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr
                    key={g.id}
                    className="dtable__row"
                    tabIndex={0}
                    role="link"
                    onClick={() => navigate(`/students/${g.studentId}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/students/${g.studentId}`);
                    }}
                  >
                    <td className="grades-table__student">
                      {g.studentName ?? `#${g.studentId}`}
                    </td>
                    <td>{g.subject}</td>
                    <td className="dtable__muted">{g.term}</td>
                    <td className="num tnum">{g.score}</td>
                    <td>
                      <GradeChip letter={g.letter} />
                    </td>
                    <td className="num tnum">{g.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StudentPicker({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data } = useStudents({ search: q.trim() || undefined, pageSize: 8, sort: "name" });
  const rows = useMemo(() => data?.rows ?? [], [data]);

  return (
    <div className="grade-picker" role="group" aria-label="Choose a student to grade">
      <div className="grade-picker__head">
        <p className="grade-picker__title">Which student are you grading?</p>
        <button className="grade-picker__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <input
        className="grade-picker__input"
        autoFocus
        placeholder="Search by name, email, or ID…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search students"
      />
      <ul className="grade-picker__list" role="list">
        {rows.length === 0 ? (
          <li className="grade-picker__empty">No students match “{q}”.</li>
        ) : (
          rows.map((s) => (
            <li key={s.id}>
              <button
                className="grade-picker__item"
                onClick={() => navigate(`/students/${s.id}`)}
              >
                <span className="grade-picker__name">{s.name}</span>
                <span className="grade-picker__meta">
                  {s.courseCode} · #{String(s.id).padStart(4, "0")}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
      <p className="grade-picker__hint">
        Opens the student’s transcript, where you can add the grade.
      </p>
    </div>
  );
}
