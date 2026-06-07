import type { ReactNode } from "react";
import { letterBand } from "../../lib/grades";
import "./chip.css";

type ChipTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted"
  | "primary";

export function Chip({
  tone = "muted",
  children,
}: {
  tone?: ChipTone;
  children: ReactNode;
}) {
  return <span className={`chip chip--${tone}`}>{children}</span>;
}

export function GradeChip({ letter }: { letter: string }) {
  const band = letterBand(letter);
  return <span className={`chip chip--grade chip--grade-${band}`}>{letter}</span>;
}

export function StatusChip({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "success"
      : status === "archived"
        ? "muted"
        : "warning";
  return (
    <span className={`chip chip--${tone}`}>
      <span className="chip__dot" aria-hidden />
      {status}
    </span>
  );
}
