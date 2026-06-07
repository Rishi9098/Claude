import { useNavigate } from "react-router-dom";
import { useCourses } from "../lib/queries";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, TableSkeleton } from "../components/ui/States";
import "../features/courses/courses.css";

export function CoursesPage() {
  const navigate = useNavigate();
  const { data: courses, isLoading, isError, error, refetch } = useCourses();

  return (
    <div className="page-enter">
      <header className="page-head">
        <div className="page-head__titles">
          <span className="page-head__eyebrow">Programs</span>
          <h1 className="page-title">Courses</h1>
          <p className="page-head__desc">
            The academic programs students enroll in. The admissions form binds
            to this list.
          </p>
        </div>
      </header>

      <section className="panel courses-panel">
        {isLoading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !courses || courses.length === 0 ? (
          <EmptyState
            title="No programs defined"
            message="Add academic programs so students can be enrolled against them."
          />
        ) : (
          <div className="dtable-scroll">
            <table className="dtable courses-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Program</th>
                  <th>Department</th>
                  <th className="num ralign">Students</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr
                    key={c.id}
                    className="dtable__row"
                    tabIndex={0}
                    role="link"
                    onClick={() => navigate(`/students?course=${c.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/students?course=${c.id}`);
                    }}
                  >
                    <td>
                      <span className="courses-table__code">{c.code}</span>
                    </td>
                    <td className="courses-table__name">{c.name}</td>
                    <td className="dtable__muted">{c.department ?? "—"}</td>
                    <td className="num ralign tnum">
                      {c.studentCount > 0 ? (
                        <span className="courses-table__count">{c.studentCount}</span>
                      ) : (
                        <span className="dtable__muted">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="courses-foot">
        Tip: select a program to view its enrolled students.{" "}
        <Button variant="ghost" size="sm" onClick={() => navigate("/students/new")}>
          Enroll a student
        </Button>
      </p>
    </div>
  );
}
