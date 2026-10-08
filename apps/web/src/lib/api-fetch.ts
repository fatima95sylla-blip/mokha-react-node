import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * Fetch authentifié : récupère le token de session au moment de l'appel
 * (jamais mis en cache) pour éviter d'utiliser un jeton expiré.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
  const token = data.session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erreur API (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}
