import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStudent, useUpdateStudent } from "../lib/queries";
import { ApiError } from "../lib/api";
import type { StudentInput } from "../lib/types";
import { useToast } from "../components/feedback/Toast";
import { StudentForm } from "../features/students/StudentForm";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ErrorState, Skeleton } from "../components/ui/States";

export function StudentEditPage() {
  const { id } = useParams();
  const studentId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();

  const { data: student, isLoading, isError, error, refetch } =
    useStudent(studentId);
  const update = useUpdateStudent(studentId);

  const [dirty, setDirty] = useState(false);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const guardedNavigate = (to: string) => {
    if (dirty) {
      setLeaveTo(to);
    } else {
      navigate(to);
    }
  };

  if (Number.isNaN(studentId)) {
    navigate("/404", { replace: true });
    return null;
  }

  const onSubmit = async (values: StudentInput) => {
    try {
      const updated = await update.mutateAsync(values);
      setDirty(false);
      toast.success("Changes saved", `${updated.name}’s record is up to date.`);
      navigate(`/students/${studentId}`);
    } catch (e) {
      if (e instanceof ApiError && !e.fields) {
        toast.error("Could not save changes", e.message);
      } else if (!(e instanceof ApiError)) {
        toast.error("Something went wrong");
      }
      throw e;
    }
  };

  return (
    <div className="page-enter">
      <header className="page-head">
        <div className="page-head__titles">
          <span className="page-head__eyebrow">
            Edit · #{String(studentId).padStart(4, "0")}
          </span>
          <h1 className="page-title">
            {isLoading ? <Skeleton width={220} height={28} /> : `Edit ${student?.name}`}
          </h1>
          <p className="page-head__desc">
            Update student details. Changes are validated and persisted to the registrar.
          </p>
        </div>
      </header>

      <section className="panel" style={{ maxWidth: 720 }}>
        <div style={{ padding: "var(--space-5)" }}>
          {isLoading ? (
            <>
              <Skeleton height={16} width="30%" />
              <div style={{ height: 14 }} />
              <Skeleton height={38} />
              <div style={{ height: 16 }} />
              <Skeleton height={38} />
              <div style={{ height: 16 }} />
              <Skeleton height={38} />
            </>
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : student ? (
            <StudentForm
              submitLabel="Save changes"
              onDirtyChange={setDirty}
              defaultValues={{
                name: student.name,
                email: student.email,
                phone: student.phone ?? "",
                dob: student.dob,
                courseId: student.courseId,
                enrollmentYear: student.enrollmentYear,
              }}
              onCancel={() => guardedNavigate(`/students/${studentId}`)}
              onSubmit={onSubmit}
            />
          ) : null}
        </div>
      </section>

      <ConfirmDialog
        open={!!leaveTo}
        title="Discard unsaved changes?"
        message="You have edits that haven’t been saved. Leaving now will discard them."
        confirmLabel="Discard changes"
        destructive
        onConfirm={() => {
          const to = leaveTo;
          setDirty(false);
          setLeaveTo(null);
          if (to) navigate(to);
        }}
        onCancel={() => setLeaveTo(null)}
      />
    </div>
  );
}
