import { useAuthStore } from "@/stores/auth-store";

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) throw new Error("No refresh token");
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    logout();
    throw new Error("Session expired");
  }
  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && typeof options.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(path, { ...options, headers });

  if (res.status === 401 && token && !path.includes("/auth/")) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    try {
      const newToken = await refreshPromise;
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(path, { ...options, headers });
    } catch {
      throw new ApiError(401, "Session expired, please sign in again");
    }
  }

  if (!res.ok) {
    let message = "Request failed";
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export const patch = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });

export const del = <T>(path: string) => api<T>(path, { method: "DELETE" });
