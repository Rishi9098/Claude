import type { ApiErrorBody, Envelope } from "./types";

const BASE = "/api";

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(body: ApiErrorBody, status: number) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.fields = body.fields;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<Envelope<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError(
      {
        message: "Cannot reach the registrar service. Is the API running?",
        code: "network_error",
      },
      0,
    );
  }

  let json: Envelope<T>;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiError(
      { message: "The server returned an unreadable response.", code: "parse_error" },
      res.status,
    );
  }

  if (!res.ok || json.error) {
    throw new ApiError(
      json.error ?? { message: "Request failed.", code: "unknown" },
      res.status,
    );
  }
  return json;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
