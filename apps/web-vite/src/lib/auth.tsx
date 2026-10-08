import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

export type AuthUser = { id: string; email: string; name?: string; fullName?: string; [key: string]: unknown };
type AuthResponse = { accessToken?: string; access_token?: string; token?: string; user?: AuthUser; profile?: AuthUser };
type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<AuthUser | null>;
  logout: () => void;
};

const STORAGE_KEY = "mokha-auth-v1";
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): { token: string; user: AuthUser | null } | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as { token?: unknown; user?: AuthUser | null };
    return typeof parsed.token === "string" ? { token: parsed.token, user: parsed.user ?? null } : null;
  } catch {
    return null;
  }
}

function saveResponse(response: AuthResponse) {
  const token = response.accessToken || response.access_token || response.token;
  if (!token) throw new Error("Réponse d'authentification invalide : jeton absent.");
  const stored = { token, user: response.profile ?? response.user ?? null };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return stored;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ token: string; user: AuthUser | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const stored = readStoredSession();
    if (!stored) {
      setLoading(false);
      return () => { active = false; };
    }
    setSession(stored);
    apiFetch<AuthUser>("/auth/me", {}, stored.token)
      .then((user) => {
        if (!active) return;
        const refreshed = { ...stored, user };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
        setSession(refreshed);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function login(email: string, password: string): Promise<AuthUser | null> {
    const response = await apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    const stored = saveResponse(response);
    setSession(stored);
    return stored.user;
  }

  async function register(input: { name: string; email: string; password: string; phone?: string }): Promise<AuthUser | null> {
    const response = await apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ ...input, fullName: input.name }) });
    const stored = saveResponse(response);
    setSession(stored);
    return stored.user;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }

  return <AuthContext.Provider value={{ user: session?.user ?? null, token: session?.token ?? null, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return value;
}
