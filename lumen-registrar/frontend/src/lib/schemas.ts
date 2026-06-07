import { z } from "zod";

const currentYear = new Date().getFullYear();
const MIN_YEAR = 1980;
const MAX_YEAR = currentYear + 1;
const MIN_AGE = 14;
const MAX_AGE = 100;

function ageFromDob(dob: string): number {
  const d = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export const studentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .min(2, "Name must be at least 2 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[+()\-\s\d]{7,20}$/.test(v),
      "Enter a valid phone number.",
    ),
  dob: z
    .string()
    .min(1, "Date of birth is required.")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date.")
    .refine((v) => new Date(v) <= new Date(), "Date of birth cannot be in the future.")
    .refine((v) => {
      const a = ageFromDob(v);
      return a >= MIN_AGE && a <= MAX_AGE;
    }, `Age must be between ${MIN_AGE} and ${MAX_AGE}.`),
  courseId: z.coerce
    .number({ invalid_type_error: "Select a course." })
    .int()
    .positive("Select a course."),
  enrollmentYear: z.coerce
    .number({ invalid_type_error: "Enter a valid enrollment year." })
    .int()
    .min(MIN_YEAR, `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`)
    .max(MAX_YEAR, `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`),
});

export type StudentFormValues = z.input<typeof studentSchema>;

export const gradeSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required."),
  term: z.string().trim().min(1, "Term is required."),
  score: z.coerce
    .number({ invalid_type_error: "Enter a numeric score." })
    .min(0, "Score must be between 0 and 100.")
    .max(100, "Score must be between 0 and 100."),
  credits: z.coerce
    .number({ invalid_type_error: "Enter valid credits." })
    .gt(0, "Credits must be greater than 0.")
    .max(12, "Credits must be 12 or fewer."),
});

export type GradeFormValues = z.input<typeof gradeSchema>;

export { MIN_YEAR, MAX_YEAR };
