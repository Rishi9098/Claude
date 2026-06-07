import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import "./topbar.css";

const CRUMB_LABELS: Record<string, string> = {
  "": "Dashboard",
  students: "Students",
  grades: "Grades",
  courses: "Courses",
  new: "New",
  edit: "Edit",
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "Dashboard", to: "/" }];
  const crumbs: { label: string; to: string }[] = [];
  let acc = "";
  for (const p of parts) {
    acc += `/${p}`;
    const label = CRUMB_LABELS[p] ?? (/^\d+$/.test(p) ? `#${p}` : p);
    crumbs.push({ label, to: acc });
  }
  return crumbs;
}

export function Topbar({
  onMenu,
  onOpenPalette,
}: {
  onMenu: () => void;
  onOpenPalette: () => void;
}) {
  const crumbs = useBreadcrumbs();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu" onClick={onMenu} aria-label="Toggle navigation">
          <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
            <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c.to} className="breadcrumb__item">
              {i > 0 && <span className="breadcrumb__sep" aria-hidden>/</span>}
              {i === crumbs.length - 1 ? (
                <span className="breadcrumb__current" aria-current="page">
                  {c.label}
                </span>
              ) : (
                <button className="breadcrumb__link" onClick={() => navigate(c.to)}>
                  {c.label}
                </button>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="topbar__right">
        <button className="topbar__search" onClick={onOpenPalette}>
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden>
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Search students, jump to…</span>
          <kbd className="topbar__kbd">⌘K</kbd>
        </button>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/students/new")}
          icon={
            <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden>
              <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          }
        >
          New student
        </Button>
      </div>
    </header>
  );
}
