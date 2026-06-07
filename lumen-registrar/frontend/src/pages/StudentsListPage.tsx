import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCourses, useStudents } from "../lib/queries";
import { StudentsTable } from "../features/students/StudentsTable";
import { EmptyState, ErrorState, TableSkeleton } from "../components/ui/States";
import { Button } from "../components/ui/Button";
import { SelectInput } from "../components/ui/Field";
import { exportStudentsCsv } from "../lib/csv";
import "../features/students/students-list.css";

const PAGE_SIZES = [10, 25, 50];

export function StudentsListPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: courses } = useCourses();

  const search = params.get("search") ?? "";
  const course = params.get("course") ? Number(params.get("course")) : undefined;
  const year = params.get("year") ? Number(params.get("year")) : undefined;
  const sort = params.get("sort") ?? "name";
  const dir = (params.get("dir") as "asc" | "desc") ?? "asc";
  const page = params.get("page") ? Number(params.get("page")) : 1;
  const pageSize = params.get("pageSize") ? Number(params.get("pageSize")) : 10;

  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<number>();

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const patch = (next: Record<string, string | undefined>, resetPage = true) => {
    const merged = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === "") merged.delete(k);
      else merged.set(k, v);
    }
    if (resetPage && !("page" in next)) merged.delete("page");
    setParams(merged, { replace: true });
  };

  const onSearchChange = (val: string) => {
    setSearchInput(val);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      patch({ search: val || undefined });
    }, 280);
  };

  const onSort = (key: string) => {
    if (sort === key) {
      patch({ sort: key, dir: dir === "asc" ? "desc" : "asc" }, false);
    } else {
      patch({ sort: key, dir: "asc" }, false);
    }
  };

  const queryParams = useMemo(
    () => ({ search: search || undefined, course, year, sort, dir, page, pageSize }),
    [search, course, year, sort, dir, page, pageSize],
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useStudents(queryParams);

  const meta = data?.meta;
  const rows = data?.rows ?? [];
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const hasFilters = !!(search || course || year);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: now - 2014 + 1 }, (_, i) => now - i);
  }, []);

  const onExport = async () => {
    await exportStudentsCsv({ search: search || undefined, course, year, sort, dir });
  };

  return (
    <div className="page-enter">
      <header className="page-head">
        <div className="page-head__titles">
          <span className="page-head__eyebrow">Roster</span>
          <h1 className="page-title">Students</h1>
          <p className="page-head__desc">
            {total > 0
              ? `${total} ${total === 1 ? "student" : "students"} on file${hasFilters ? " matching filters" : ""}.`
              : "Search, filter, and manage the registrar roster."}
          </p>
        </div>
        <div className="page-head__actions">
          <Button variant="secondary" onClick={onExport} disabled={rows.length === 0}>
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => navigate("/students/new")}>
            New student
          </Button>
        </div>
      </header>

      <div className="roster-toolbar">
        <div className="roster-search">
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden>
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className="roster-search__input"
            placeholder="Search by name, email, or ID…"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search students"
          />
          {searchInput && (
            <button
              className="roster-search__clear"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="roster-filter">
          <SelectInput
            aria-label="Filter by program"
            value={course ?? ""}
            onChange={(e) => patch({ course: e.target.value || undefined })}
          >
            <option value="">All programs</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </SelectInput>
        </div>

        <div className="roster-filter">
          <SelectInput
            aria-label="Filter by enrollment year"
            value={year ?? ""}
            onChange={(e) => patch({ year: e.target.value || undefined })}
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </SelectInput>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => patch({ search: undefined, course: undefined, year: undefined })}
          >
            Clear filters
          </Button>
        )}
        {isFetching && !isLoading && <span className="roster-syncing">Updating…</span>}
      </div>

      <section className="panel roster-panel">
        {isLoading ? (
          <TableSkeleton rows={pageSize > 10 ? 10 : pageSize} cols={6} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : rows.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={<NoResultsMark />}
              title="No students match"
              message="Try a different search term or relax the program / year filters."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    patch({ search: undefined, course: undefined, year: undefined })
                  }
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No students yet"
              message="The roster is empty. Enroll your first student to get started."
              action={
                <Button variant="primary" size="sm" onClick={() => navigate("/students/new")}>
                  Enroll a student
                </Button>
              }
            />
          )
        ) : (
          <>
            <StudentsTable rows={rows} sort={sort} dir={dir} onSort={onSort} />
            <footer className="roster-foot">
              <div className="roster-foot__left">
                <label className="roster-pagesize">
                  Rows
                  <SelectInput
                    value={pageSize}
                    onChange={(e) => patch({ pageSize: e.target.value, page: undefined })}
                    aria-label="Rows per page"
                  >
                    {PAGE_SIZES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </SelectInput>
                </label>
                <span className="roster-count tnum">
                  {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
                </span>
              </div>
              <div className="roster-pager">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => patch({ page: String(page - 1) }, false)}
                >
                  Previous
                </Button>
                <span className="roster-pageno tnum">
                  Page {page} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => patch({ page: String(page + 1) }, false)}
                >
                  Next
                </Button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}

function NoResultsMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 15.5L20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 10.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
