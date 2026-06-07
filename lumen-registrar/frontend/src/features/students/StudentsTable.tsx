import { useNavigate } from "react-router-dom";
import type { Student } from "../../lib/types";
import { formatGpa } from "../../lib/grades";
import { GradeChip, StatusChip } from "../../components/ui/Chip";
import "./students-table.css";

type SortDir = "asc" | "desc";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  numeric?: boolean;
  align?: "right";
}

const COLUMNS: Column[] = [
  { key: "name", label: "Student", sortable: true },
  { key: "id", label: "ID", sortable: true, numeric: true },
  { key: "course", label: "Program" },
  { key: "enrollmentYear", label: "Enrolled", sortable: true, numeric: true },
  { key: "gpa", label: "GPA", numeric: true, align: "right" },
  { key: "status", label: "Status", sortable: true },
];

export function StudentsTable({
  rows,
  sort,
  dir,
  onSort,
}: {
  rows: Student[];
  sort: string;
  dir: SortDir;
  onSort: (key: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="dtable-scroll">
      <table className="dtable">
        <thead>
          <tr>
            {COLUMNS.map((col) => {
              const active = col.sortable && sort === col.key;
              return (
                <th
                  key={col.key}
                  className={`${col.numeric ? "num" : ""} ${col.align === "right" ? "ralign" : ""}`}
                  aria-sort={
                    active ? (dir === "asc" ? "ascending" : "descending") : undefined
                  }
                >
                  {col.sortable ? (
                    <button
                      className={`dtable__sort ${active ? "is-active" : ""}`}
                      onClick={() => onSort(col.key)}
                    >
                      {col.label}
                      <span className="dtable__caret" data-dir={active ? dir : ""}>
                        <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden>
                          <path d="M2.5 6.2L5 3.6l2.5 2.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr
              key={s.id}
              className="dtable__row"
              onClick={() => navigate(`/students/${s.id}`)}
              tabIndex={0}
              role="link"
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/students/${s.id}`);
              }}
            >
              <td>
                <div className="dtable__student">
                  <span className="avatar" aria-hidden>
                    {initials(s.name)}
                  </span>
                  <div className="dtable__student-text">
                    <span className="dtable__name">{s.name}</span>
                    <span className="dtable__email">{s.email}</span>
                  </div>
                </div>
              </td>
              <td className="num dtable__muted">{String(s.id).padStart(4, "0")}</td>
              <td>
                <span className="dtable__program">
                  <span className="dtable__code">{s.courseCode}</span>
                  <span className="dtable__course">{s.courseName}</span>
                </span>
              </td>
              <td className="num">{s.enrollmentYear}</td>
              <td className="num ralign">
                {s.gpa != null ? (
                  <span className="dtable__gpa">
                    <GradeChip letter={gpaToLetter(s.gpa)} />
                    <span className="tnum">{formatGpa(s.gpa)}</span>
                  </span>
                ) : (
                  <span className="dtable__muted">—</span>
                )}
              </td>
              <td>
                <StatusChip status={s.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

function gpaToLetter(gpa: number): string {
  if (gpa >= 3.7) return "A";
  if (gpa >= 2.7) return "B";
  if (gpa >= 1.7) return "C";
  if (gpa >= 0.7) return "D";
  return "F";
}
