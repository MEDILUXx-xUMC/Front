import type { ApiErrorBody } from "../types/api";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: ApiErrorBody["fieldErrors"],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ApiErrorBody>;
  const fields = candidate.fieldErrors;

  return typeof candidate.code === "string"
    && typeof candidate.message === "string"
    && (fields === undefined || (
      typeof fields === "object" && fields !== null && !Array.isArray(fields)
      && Object.values(fields).every((message) => typeof message === "string")
    ));
}

export function createApiClient(
  baseUrl: string,
  options: { credentials?: RequestCredentials; fetcher?: typeof fetch } = {},
) {
  const root = baseUrl.replace(/\/+$/, "");
  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);

  return async function request<ResponseBody>(path: `/${string}`, init?: RequestInit): Promise<ResponseBody> {
    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");
    const config = options.credentials === undefined ? {} : { credentials: options.credentials };
    const response = await fetcher(`${root}${path}`, { ...config, ...init, headers });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      if (isApiErrorBody(body)) {
        throw new ApiError(response.status, body.code, body.message, body.fieldErrors);
      }
      throw new ApiError(response.status, "UNEXPECTED_RESPONSE", "서버 응답을 처리할 수 없어요.");
    }

    return (response.status === 204 ? undefined : await response.json()) as ResponseBody;
  };
}
