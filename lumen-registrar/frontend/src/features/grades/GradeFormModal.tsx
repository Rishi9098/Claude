import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { gradeSchema, type GradeFormValues } from "../../lib/schemas";
import type { Grade, GradeInput } from "../../lib/types";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { FieldWrap, TextInput } from "../../components/ui/Field";

interface GradeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: GradeInput) => Promise<void>;
  editing?: Grade | null;
}

export function GradeFormModal({
  open,
  onClose,
  onSubmit,
  editing,
}: GradeFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    mode: "onChange",
    defaultValues: { subject: "", term: "", score: undefined, credits: 3 },
  });

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              subject: editing.subject,
              term: editing.term,
              score: editing.score,
              credits: editing.credits,
            }
          : { subject: "", term: "", score: undefined, credits: 3 },
      );
    }
  }, [open, editing, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      subject: values.subject,
      term: values.term,
      score: Number(values.score),
      credits: Number(values.credits),
    });
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit grade" : "Add grade"}
      width={460}
    >
      <form id="grade-form" onSubmit={submit} noValidate className="grade-form">
        <FieldWrap label="Subject" htmlFor="g-subject" required error={errors.subject?.message}>
          <TextInput
            id="g-subject"
            autoFocus
            placeholder="e.g. Algorithms"
            invalid={!!errors.subject}
            {...register("subject")}
          />
        </FieldWrap>
        <FieldWrap label="Term" htmlFor="g-term" required error={errors.term?.message}>
          <TextInput
            id="g-term"
            placeholder="e.g. Fall 2024"
            invalid={!!errors.term}
            {...register("term")}
          />
        </FieldWrap>
        <div className="grade-form__row">
          <FieldWrap
            label="Score (0–100)"
            htmlFor="g-score"
            required
            error={errors.score?.message}
          >
            <TextInput
              id="g-score"
              type="number"
              step="0.1"
              className="tnum"
              placeholder="88"
              invalid={!!errors.score}
              {...register("score")}
            />
          </FieldWrap>
          <FieldWrap
            label="Credits"
            htmlFor="g-credits"
            required
            error={errors.credits?.message}
          >
            <TextInput
              id="g-credits"
              type="number"
              step="0.5"
              className="tnum"
              invalid={!!errors.credits}
              {...register("credits")}
            />
          </FieldWrap>
        </div>
        <p className="grade-form__note">
          Letter grade is derived automatically from the score.
        </p>
      </form>
      <div className="grade-form__actions">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="grade-form"
          variant="primary"
          loading={isSubmitting}
          disabled={!isValid}
        >
          {editing ? "Save changes" : "Add grade"}
        </Button>
      </div>
    </Modal>
  );
}
