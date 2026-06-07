import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCourses } from "../../lib/queries";
import { studentSchema, type StudentFormValues } from "../../lib/schemas";
import { ApiError } from "../../lib/api";
import type { StudentInput } from "../../lib/types";
import { Button } from "../../components/ui/Button";
import { FieldWrap, SelectInput, TextInput } from "../../components/ui/Field";
import "./student-form.css";

interface StudentFormProps {
  defaultValues?: Partial<StudentFormValues>;
  submitLabel: string;
  onSubmit: (values: StudentInput) => Promise<void>;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function StudentForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  onDirtyChange,
}: StudentFormProps) {
  const { data: courses, isLoading: coursesLoading } = useCourses();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      courseId: undefined,
      enrollmentYear: undefined,
      ...defaultValues,
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({
        name: values.name,
        email: values.email,
        phone: values.phone ?? "",
        dob: values.dob,
        courseId: Number(values.courseId),
        enrollmentYear: Number(values.enrollmentYear),
      });
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        for (const [k, msg] of Object.entries(e.fields)) {
          setError(k as keyof StudentFormValues, { message: msg });
        }
      }
      throw e;
    }
  });

  return (
    <form className="student-form" onSubmit={submit} noValidate>
      <fieldset className="student-form__group">
        <legend className="section-label">Identity</legend>
        <FieldWrap label="Full name" htmlFor="name" required error={errors.name?.message}>
          <TextInput
            id="name"
            autoFocus
            placeholder="e.g. Amara Okafor"
            invalid={!!errors.name}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </FieldWrap>
        <FieldWrap label="Date of birth" htmlFor="dob" required error={errors.dob?.message}>
          <TextInput
            id="dob"
            type="date"
            className="tnum"
            invalid={!!errors.dob}
            aria-invalid={!!errors.dob}
            {...register("dob")}
          />
        </FieldWrap>
      </fieldset>

      <fieldset className="student-form__group">
        <legend className="section-label">Contact</legend>
        <FieldWrap label="Email address" htmlFor="email" required error={errors.email?.message}>
          <TextInput
            id="email"
            type="email"
            placeholder="name@lumen.edu"
            invalid={!!errors.email}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FieldWrap>
        <FieldWrap
          label="Phone"
          htmlFor="phone"
          hint="Optional"
          error={errors.phone?.message}
        >
          <TextInput
            id="phone"
            type="tel"
            className="tnum"
            placeholder="+1 (415) 555-0100"
            invalid={!!errors.phone}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
        </FieldWrap>
      </fieldset>

      <fieldset className="student-form__group">
        <legend className="section-label">Academic</legend>
        <FieldWrap label="Program / course" htmlFor="courseId" required error={errors.courseId?.message}>
          <SelectInput
            id="courseId"
            invalid={!!errors.courseId}
            aria-invalid={!!errors.courseId}
            disabled={coursesLoading}
            defaultValue=""
            {...register("courseId")}
          >
            <option value="" disabled>
              {coursesLoading ? "Loading courses…" : "Select a program"}
            </option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </SelectInput>
        </FieldWrap>
        <FieldWrap
          label="Year of enrollment"
          htmlFor="enrollmentYear"
          required
          error={errors.enrollmentYear?.message}
        >
          <TextInput
            id="enrollmentYear"
            type="number"
            className="tnum"
            placeholder="2024"
            invalid={!!errors.enrollmentYear}
            aria-invalid={!!errors.enrollmentYear}
            {...register("enrollmentYear")}
          />
        </FieldWrap>
      </fieldset>

      <div className="student-form__actions">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isValid}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
