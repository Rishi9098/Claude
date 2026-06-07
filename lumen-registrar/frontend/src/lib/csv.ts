import { api } from "./api";
import type { Student } from "./types";

interface ExportParams {
  search?: string;
  course?: number;
  year?: number;
  sort?: string;
  dir?: string;
}

function toQuery(p: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function escapeCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportStudentsCsv(params: ExportParams): Promise<void> {
  // Pull the full filtered set (up to backend max) for export.
  const res = await api.get<Student[]>(
    `/students${toQuery({ ...params, pageSize: 100, page: 1 })}`,
  );
  const rows = res.data;

  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Date of Birth",
    "Age",
    "Program Code",
    "Program",
    "Enrollment Year",
    "GPA",
    "Status",
  ];
  const lines = [headers.join(",")];
  for (const s of rows) {
    lines.push(
      [
        s.id,
        s.name,
        s.email,
        s.phone ?? "",
        s.dob,
        s.age ?? "",
        s.courseCode ?? "",
        s.courseName ?? "",
        s.enrollmentYear,
        s.gpa ?? "",
        s.status,
      ]
        .map(escapeCell)
        .join(","),
    );
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lumen-students-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
