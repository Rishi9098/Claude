export type GradeBand = "a" | "b" | "c" | "d" | "f";

export function letterBand(letter: string): GradeBand {
  const head = letter.charAt(0).toUpperCase();
  if (head === "A") return "a";
  if (head === "B") return "b";
  if (head === "C") return "c";
  if (head === "D") return "d";
  return "f";
}

export function formatGpa(gpa: number | null | undefined): string {
  if (gpa === null || gpa === undefined) return "—";
  return gpa.toFixed(2);
}

export function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

const STATUS_TINTS: Record<string, string> = {
  active: "success",
  archived: "muted",
  inactive: "warning",
};

export function statusTone(status: string): string {
  return STATUS_TINTS[status] ?? "info";
}
