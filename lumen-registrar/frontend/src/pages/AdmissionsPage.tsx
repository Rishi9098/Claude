import { useNavigate } from "react-router-dom";
import { useCreateStudent } from "../lib/queries";
import { useToast } from "../components/feedback/Toast";
import { StudentForm } from "../features/students/StudentForm";
import { ApiError } from "../lib/api";
import type { StudentInput } from "../lib/types";

export function AdmissionsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const create = useCreateStudent();

  const onSubmit = async (values: StudentInput) => {
    const student = await create.mutateAsync(values);
    toast.success("Student enrolled", `${student.name} is now on the roster.`);
    navigate(`/students/${student.id}`);
  };

  return (
    <div className="page-enter">
      <header className="page-head">
        <div className="page-head__titles">
          <span className="page-head__eyebrow">Admissions</span>
          <h1 className="page-title">Enroll a student</h1>
          <p className="page-head__desc">
            Add a new student to the registrar. All fields are validated before submission.
          </p>
        </div>
      </header>

      <section className="panel" style={{ maxWidth: 720 }}>
        <div style={{ padding: "var(--space-5)" }}>
          <StudentForm
            submitLabel="Enroll student"
            onCancel={() => navigate("/students")}
            onSubmit={async (v) => {
              try {
                await onSubmit(v);
              } catch (e) {
                if (e instanceof ApiError && !e.fields) {
                  toast.error("Could not enroll student", e.message);
                } else if (!(e instanceof ApiError)) {
                  toast.error("Something went wrong");
                }
                throw e;
              }
            }}
          />
        </div>
      </section>
    </div>
  );
}
