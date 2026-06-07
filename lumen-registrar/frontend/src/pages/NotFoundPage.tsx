import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="page-enter">
      <section
        className="panel"
        style={{
          maxWidth: 520,
          margin: "var(--space-7) auto",
          padding: "var(--space-7) var(--space-6)",
          textAlign: "center",
        }}
      >
        <p
          className="page-head__eyebrow"
          style={{ justifyContent: "center", marginBottom: "var(--space-3)" }}
        >
          Error 404
        </p>
        <h1 className="page-title" style={{ marginBottom: "var(--space-2)" }}>
          We couldn’t find that record
        </h1>
        <p
          style={{
            color: "var(--color-ink-secondary)",
            lineHeight: 1.55,
            margin: "0 auto var(--space-5)",
            maxWidth: 380,
          }}
        >
          The page or student you’re looking for isn’t in the registrar. It may
          have been archived, deleted, or never existed.
        </p>
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            justifyContent: "center",
          }}
        >
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button variant="primary" onClick={() => navigate("/students")}>
            Open student roster
          </Button>
        </div>
      </section>
    </div>
  );
}
