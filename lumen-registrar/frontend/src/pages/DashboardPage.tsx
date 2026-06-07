import { useNavigate } from "react-router-dom";
import { useCourses, useStats } from "../lib/queries";
import { formatGpa } from "../lib/grades";
import { Button } from "../components/ui/Button";
import { GradeChip } from "../components/ui/Chip";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { DistributionChart } from "../features/dashboard/DistributionChart";
import "../features/dashboard/dashboard.css";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const day = 86_400_000;
  const days = Math.floor(diff / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useStats();
  const { data: courses } = useCourses();
  const courseIdByCode = new Map(courses?.map((c) => [c.code, c.id]));

  return (
    <div className="page-enter">
      <header className="page-head">
        <div className="page-head__titles">
          <span className="page-head__eyebrow">Office of the Registrar</span>
          <h1 className="page-title">Overview</h1>
          <p className="page-head__desc">
            A snapshot of enrollment, programs, and recent registrar activity.
          </p>
        </div>
        <div className="page-head__actions">
          <Button variant="primary" onClick={() => navigate("/students/new")}>
            Enroll a student
          </Button>
        </div>
      </header>

      {isError ? (
        <section className="panel">
          <ErrorState error={error} onRetry={() => refetch()} />
        </section>
      ) : (
        <>
          <section className="metric-row">
            <MetricCard
              label="Active students"
              value={data?.totalStudents}
              loading={isLoading}
              onClick={() => navigate("/students")}
            />
            <MetricCard
              label="Programs"
              value={data?.totalCourses}
              loading={isLoading}
              onClick={() => navigate("/courses")}
            />
            <MetricCard
              label="Grades on file"
              value={data?.totalGrades}
              loading={isLoading}
              onClick={() => navigate("/grades")}
            />
            <MetricCard
              label="Cohort GPA"
              value={data ? formatGpa(data.overallGpa) : undefined}
              loading={isLoading}
              chip={data?.overallGpa != null ? gpaLetter(data.overallGpa) : undefined}
            />
          </section>

          <div className="dash-grid">
            <section className="panel dash-panel">
              <div className="panel__head">
                <h2 className="panel__title">Students by program</h2>
                <span className="dash-panel__hint">Click a bar to filter</span>
              </div>
              <div className="dash-panel__body">
                {isLoading ? (
                  <ChartSkeleton rows={6} />
                ) : data && data.courseDistribution.length > 0 ? (
                  <DistributionChart
                    data={data.courseDistribution}
                    onSelect={(code) => {
                      const id = courseIdByCode.get(code);
                      navigate(id ? `/students?course=${id}` : "/students");
                    }}
                  />
                ) : (
                  <EmptyState
                    title="No enrollment yet"
                    message="Enroll students to see how they distribute across programs."
                    action={
                      <Button size="sm" variant="secondary" onClick={() => navigate("/students/new")}>
                        Enroll a student
                      </Button>
                    }
                  />
                )}
              </div>
            </section>

            <section className="panel dash-panel">
              <div className="panel__head">
                <h2 className="panel__title">Enrollment by year</h2>
              </div>
              <div className="dash-panel__body">
                {isLoading ? (
                  <ChartSkeleton rows={5} />
                ) : data && data.yearDistribution.length > 0 ? (
                  <DistributionChart
                    data={data.yearDistribution}
                    onSelect={(year) => navigate(`/students?year=${year}`)}
                  />
                ) : (
                  <p className="dash-empty-line">No enrollment data.</p>
                )}
              </div>
            </section>

            <section className="panel dash-panel">
              <div className="panel__head">
                <h2 className="panel__title">Recent admissions</h2>
                <button
                  className="dash-panel__link"
                  onClick={() => navigate("/students?sort=createdAt&dir=desc")}
                >
                  View all
                </button>
              </div>
              <div className="dash-list">
                {isLoading ? (
                  <ListSkeleton rows={5} />
                ) : data && data.recentStudents.length > 0 ? (
                  data.recentStudents.map((s) => (
                    <button
                      key={s.id}
                      className="dash-list__row"
                      onClick={() => navigate(`/students/${s.id}`)}
                    >
                      <span className="avatar avatar--sm" aria-hidden>
                        {initials(s.name)}
                      </span>
                      <span className="dash-list__primary">
                        <span className="dash-list__name">{s.name}</span>
                        <span className="dash-list__meta">
                          {s.courseCode} · enrolled {s.enrollmentYear}
                        </span>
                      </span>
                      <span className="dash-list__time tnum">
                        {relativeTime(s.createdAt)}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="dash-empty-line">No admissions yet.</p>
                )}
              </div>
            </section>

            <section className="panel dash-panel">
              <div className="panel__head">
                <h2 className="panel__title">Recent grade activity</h2>
                <button
                  className="dash-panel__link"
                  onClick={() => navigate("/grades")}
                >
                  View all
                </button>
              </div>
              <div className="dash-list">
                {isLoading ? (
                  <ListSkeleton rows={5} />
                ) : data && data.recentGrades.length > 0 ? (
                  data.recentGrades.map((g) => (
                    <button
                      key={g.id}
                      className="dash-list__row dash-list__row--grade"
                      onClick={() => navigate(`/students/${g.studentId}`)}
                    >
                      <GradeChip letter={g.letter} />
                      <span className="dash-list__primary">
                        <span className="dash-list__name">{g.subject}</span>
                        <span className="dash-list__meta">
                          {g.studentName ?? "Student"} · {g.term}
                        </span>
                      </span>
                      <span className="dash-list__score tnum">{g.score}</span>
                    </button>
                  ))
                ) : (
                  <p className="dash-empty-line">No grades recorded yet.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  loading,
  onClick,
  chip,
}: {
  label: string;
  value?: number | string;
  loading?: boolean;
  onClick?: () => void;
  chip?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className={`metric-card ${onClick ? "metric-card--link" : ""}`}
      {...(onClick ? { type: "button" as const, onClick } : {})}
    >
      <span className="metric-card__label">{label}</span>
      <span className="metric-card__value tnum">
        {loading ? (
          <Skeleton width={56} height={26} />
        ) : (
          <>
            {chip && <GradeChip letter={chip} />}
            {value ?? "—"}
          </>
        )}
      </span>
    </Tag>
  );
}

function ChartSkeleton({ rows }: { rows: number }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-3)", padding: "var(--space-2) 0" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={18} />
      ))}
    </div>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-3)", padding: "var(--space-3)" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={20} />
      ))}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function gpaLetter(gpa: number): string {
  if (gpa >= 3.7) return "A";
  if (gpa >= 2.7) return "B";
  if (gpa >= 1.7) return "C";
  if (gpa >= 0.7) return "D";
  return "F";
}
