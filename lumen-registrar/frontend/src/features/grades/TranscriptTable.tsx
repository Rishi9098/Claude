import type { Grade } from "../../lib/types";
import { formatScore } from "../../lib/grades";
import { GradeChip } from "../../components/ui/Chip";
import "./transcript.css";

interface TranscriptTableProps {
  grades: Grade[];
  onEdit: (grade: Grade) => void;
  onDelete: (grade: Grade) => void;
}

export function TranscriptTable({ grades, onEdit, onDelete }: TranscriptTableProps) {
  // Group by term, preserving recency-ish order.
  const byTerm = new Map<string, Grade[]>();
  for (const g of grades) {
    const list = byTerm.get(g.term) ?? [];
    list.push(g);
    byTerm.set(g.term, list);
  }

  return (
    <div className="transcript">
      <table className="transcript__table">
        <thead>
          <tr>
            <th>Subject</th>
            <th className="num">Credits</th>
            <th className="num">Score</th>
            <th>Grade</th>
            <th className="num">Points</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        {[...byTerm.entries()].map(([term, list]) => {
          const termCredits = list.reduce((a, g) => a + g.credits, 0);
          const termGpa =
            termCredits > 0
              ? list.reduce((a, g) => a + g.gradePoints * g.credits, 0) / termCredits
              : 0;
          return (
            <tbody key={term} className="transcript__term">
              <tr className="transcript__term-head">
                <th colSpan={5} scope="colgroup">
                  {term}
                </th>
                <td className="transcript__term-gpa num">
                  Term GPA <span className="tnum">{termGpa.toFixed(2)}</span>
                </td>
              </tr>
              {list.map((g) => (
                <tr key={g.id} className="transcript__row">
                  <td className="transcript__subject">{g.subject}</td>
                  <td className="num">{g.credits}</td>
                  <td className="num">{formatScore(g.score)}</td>
                  <td>
                    <GradeChip letter={g.letter} />
                  </td>
                  <td className="num transcript__points">{g.gradePoints.toFixed(1)}</td>
                  <td className="transcript__actions">
                    <button
                      className="icon-btn"
                      onClick={() => onEdit(g)}
                      aria-label={`Edit grade for ${g.subject}`}
                    >
                      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
                        <path d="M11 3l2 2-7 7-2.6.6.6-2.6z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      onClick={() => onDelete(g)}
                      aria-label={`Delete grade for ${g.subject}`}
                    >
                      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
                        <path d="M3.5 4.5h9M6 4.5V3.5h4v1M5 4.5l.5 8h5l.5-8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
