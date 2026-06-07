import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../../lib/queries";
import { GradeChip } from "../ui/Chip";
import "./palette.css";

interface PaletteAction {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
  group: string;
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data } = useStudents({
    search: q.trim() || undefined,
    pageSize: 6,
    sort: "name",
  });

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const navActions: PaletteAction[] = useMemo(
    () => [
      { id: "go-dash", label: "Go to Dashboard", group: "Navigate", run: () => navigate("/") },
      { id: "go-students", label: "Go to Students", group: "Navigate", run: () => navigate("/students") },
      { id: "go-grades", label: "Go to Grades", group: "Navigate", run: () => navigate("/grades") },
      { id: "go-courses", label: "Go to Courses", group: "Navigate", run: () => navigate("/courses") },
      {
        id: "new-student",
        label: "Enroll a new student",
        hint: "Admissions",
        group: "Actions",
        run: () => navigate("/students/new"),
      },
    ],
    [navigate],
  );

  const filteredNav = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return navActions;
    return navActions.filter((a) => a.label.toLowerCase().includes(term));
  }, [navActions, q]);

  const studentActions: PaletteAction[] = (data?.rows ?? []).map((s) => ({
    id: `student-${s.id}`,
    label: s.name,
    hint: `${s.courseCode ?? ""} · #${s.id}`,
    group: "Students",
    run: () => navigate(`/students/${s.id}`),
  }));

  const all = [...filteredNav, ...studentActions];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, all.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = all[active];
        if (item) {
          item.run();
          onClose();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, all, active, onClose]);

  useEffect(() => setActive(0), [q]);

  if (!open) return null;

  let runningIndex = -1;
  const groups = ["Navigate", "Actions", "Students"];

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette__search">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className="palette__input"
            placeholder="Search students or type a command…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Command palette search"
          />
          <kbd>ESC</kbd>
        </div>

        <div className="palette__results">
          {all.length === 0 && (
            <p className="palette__empty">No matches for “{q}”.</p>
          )}
          {groups.map((group) => {
            const items = all.filter((a) => a.group === group);
            if (items.length === 0) return null;
            return (
              <div className="palette__group" key={group}>
                <p className="palette__group-label">{group}</p>
                {items.map((item) => {
                  runningIndex += 1;
                  const idx = runningIndex;
                  const isStudent = item.group === "Students";
                  const student = isStudent
                    ? data?.rows.find((s) => `student-${s.id}` === item.id)
                    : undefined;
                  return (
                    <button
                      key={item.id}
                      className={`palette__item ${idx === active ? "is-active" : ""}`}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => {
                        item.run();
                        onClose();
                      }}
                    >
                      <span className="palette__label">{item.label}</span>
                      {student?.gpa != null && (
                        <GradeChip letter={gpaToLetter(student.gpa)} />
                      )}
                      {item.hint && <span className="palette__hint">{item.hint}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function gpaToLetter(gpa: number): string {
  if (gpa >= 3.7) return "A";
  if (gpa >= 2.7) return "B";
  if (gpa >= 1.7) return "C";
  if (gpa >= 0.7) return "D";
  return "F";
}
