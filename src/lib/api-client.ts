const sessionStorageKey = "lander-distribution.session";

export interface StoredApiSession {
  token: string;
  organizationId: string | null;
  expiresAt: string;
}

const configuredApiBaseUrl =
  typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.trim().length > 0
    ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/$/, "")
    : null;

export function isApiConfigured(): boolean {
  return configuredApiBaseUrl !== null;
}

function clearLegacyPersistentSession(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(sessionStorageKey);
}

export function readApiSession(): StoredApiSession | null {
  if (typeof window === "undefined") return null;
  clearLegacyPersistentSession();
  const raw = window.sessionStorage.getItem(sessionStorageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredApiSession;
    if (!parsed.token || !parsed.expiresAt || new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.sessionStorage.removeItem(sessionStorageKey);
      return null;
    }
    return parsed;
  } catch {
    window.sessionStorage.removeItem(sessionStorageKey);
    return null;
  }
}

export function writeApiSession(session: StoredApiSession): void {
  clearLegacyPersistentSession();
  window.sessionStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

export function clearApiSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(sessionStorageKey);
  window.localStorage.removeItem(sessionStorageKey);
}

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly payload: unknown,
  ) {
    super(`API_REQUEST_FAILED:${status}`);
  }
}

export async function apiRequest(
  path: string,
  init: RequestInit = {},
  options: { organizationScoped?: boolean } = {},
): Promise<Response> {
  if (!configuredApiBaseUrl) throw new Error("API_NOT_CONFIGURED");

  const session = readApiSession();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.token) headers.set("Authorization", `Bearer ${session.token}`);
  if (options.organizationScoped !== false && session?.organizationId) {
    headers.set("X-Organization-Id", session.organizationId);
  }

  const response = await fetch(`${configuredApiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.clone().json();
    } catch {
      payload = null;
    }
    if (response.status === 401 && session?.token) clearApiSession();
    throw new ApiRequestError(response.status, payload);
  }

  return response;
}
