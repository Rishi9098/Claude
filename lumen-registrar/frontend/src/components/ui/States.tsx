import type { ReactNode } from "react";
import { ApiError } from "../../lib/api";
import { Button } from "./Button";
import "./states.css";

export function Skeleton({
  width,
  height = 14,
  radius = 4,
}: {
  width?: number | string;
  height?: number;
  radius?: number;
}) {
  return (
    <span
      className="skeleton"
      style={{
        width: width ?? "100%",
        height,
        borderRadius: radius,
      }}
    />
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="state-skel-table" aria-hidden>
      {Array.from({ length: rows }).map((_, r) => (
        <div className="state-skel-row" key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width={c === 0 ? "70%" : "55%"} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-empty" role="status">
      <div className="state-empty__mark">{icon ?? <DefaultMark />}</div>
      <h3 className="state-empty__title">{title}</h3>
      <p className="state-empty__msg">{message}</p>
      {action && <div className="state-empty__action">{action}</div>}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Something went wrong while loading this data.";
  return (
    <div className="state-error" role="alert">
      <div className="state-error__mark">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
          <path
            d="M12 8v5M12 16.2v.1M12 3l9 16H3z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="state-error__title">We hit a snag</h3>
      <p className="state-error__msg">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

function DefaultMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        d="M5 4h11l3 3v13H5zM16 4v3h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 12h8M8 15.5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
