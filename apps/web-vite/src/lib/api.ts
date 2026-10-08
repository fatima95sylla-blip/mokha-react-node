export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, { ...options, headers });
  } catch {
    throw new ApiError("Le serveur est momentanément inaccessible. Réessayez dans un instant.", 0);
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string; error?: string } | null;
    throw new ApiError(payload?.message || payload?.error || "Une erreur est survenue. Vérifiez vos informations et réessayez.", response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

declare global {
  interface ImportMetaEnv { readonly VITE_API_URL?: string }
  interface ImportMeta { readonly env: ImportMetaEnv }
}
