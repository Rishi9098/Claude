import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "./api";
import type {
  Course,
  Grade,
  GradeInput,
  Stats,
  Student,
  StudentInput,
} from "./types";

export interface StudentListParams {
  search?: string;
  course?: number;
  year?: number;
  sort?: string;
  dir?: string;
  page?: number;
  pageSize?: number;
}

function toQuery(params: Record<string, unknown> | StudentListParams): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ---- Courses ----
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get<Course[]>("/courses").then((r) => r.data),
    staleTime: 60_000,
  });
}

// ---- Students list ----
export function useStudents(params: StudentListParams) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () =>
      api.get<Student[]>(`/students${toQuery(params)}`).then((r) => ({
        rows: r.data,
        meta: r.meta,
      })),
    placeholderData: (prev) => prev,
  });
}

export function useStudent(id: number | undefined) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: () => api.get<Student>(`/students/${id}`).then((r) => r.data),
    enabled: id !== undefined && !Number.isNaN(id),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) =>
      api.post<Student>("/students", input).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateStudent(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) =>
      api.put<Student>(`/students/${id}`, input).then((r) => r.data),
    onMutate: async (input: StudentInput) => {
      await qc.cancelQueries({ queryKey: ["student", id] });
      const prev = qc.getQueryData<Student>(["student", id]);
      if (prev) {
        qc.setQueryData<Student>(["student", id], { ...prev, ...input });
      }
      return { prev };
    },
    onError: (_e, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(["student", id], ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(["student", id], data);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["student", id] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/students/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// ---- Grades ----
export interface GradesResult {
  grades: Grade[];
  summary: {
    gpa: number | null;
    totalCredits: number;
    count: number;
    averageScore: number | null;
  };
}

export function useGrades(studentId: number | undefined) {
  return useQuery({
    queryKey: ["grades", studentId],
    queryFn: () =>
      api.get<Grade[]>(`/students/${studentId}/grades`).then((r) => ({
        grades: r.data,
        summary: {
          gpa: r.meta?.gpa ?? null,
          totalCredits: r.meta?.totalCredits ?? 0,
          count: r.meta?.count ?? 0,
          averageScore: r.meta?.averageScore ?? null,
        },
      })),
    enabled: studentId !== undefined && !Number.isNaN(studentId),
  });
}

function invalidateGradeViews(
  qc: ReturnType<typeof useQueryClient>,
  studentId: number,
) {
  qc.invalidateQueries({ queryKey: ["grades", studentId] });
  qc.invalidateQueries({ queryKey: ["student", studentId] });
  qc.invalidateQueries({ queryKey: ["students"] });
  qc.invalidateQueries({ queryKey: ["stats"] });
}

export function useAddGrade(studentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GradeInput) =>
      api.post<Grade>(`/students/${studentId}/grades`, input).then((r) => r.data),
    onSuccess: () => invalidateGradeViews(qc, studentId),
  });
}

export function useUpdateGrade(studentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: GradeInput }) =>
      api.put<Grade>(`/grades/${id}`, input).then((r) => r.data),
    onSuccess: () => invalidateGradeViews(qc, studentId),
  });
}

export function useDeleteGrade(studentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/grades/${id}`),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: ["grades", studentId] });
      const prev = qc.getQueryData<GradesResult>(["grades", studentId]);
      if (prev) {
        qc.setQueryData<GradesResult>(["grades", studentId], {
          ...prev,
          grades: prev.grades.filter((g) => g.id !== id),
        });
      }
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["grades", studentId], ctx.prev);
    },
    onSettled: () => invalidateGradeViews(qc, studentId),
  });
}

// ---- Stats ----
export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => api.get<Stats>("/stats").then((r) => r.data),
  });
}
