"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Profil = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: "client" | "admin";
};

type AuthContexte = {
  user: User | null;
  session: Session | null;
  profil: Profil | null;
  chargement: boolean;
  estAdmin: boolean;
  inscription: (p: {
    email: string;
    motDePasse: string;
    nomComplet: string;
    telephone?: string;
  }) => Promise<{ erreur?: string; confirmationRequise?: boolean }>;
  connexion: (email: string, motDePasse: string) => Promise<{ erreur?: string }>;
  deconnexion: () => Promise<void>;
  motDePasseOublie: (email: string) => Promise<{ erreur?: string }>;
  rafraichirProfil: () => Promise<void>;
};

const Ctx = createContext<AuthContexte | null>(null);

// Traduction des messages Supabase (anglais) vers un français lisible par la
// cliente, sans révéler si un compte existe ou non (anti-énumération).
function messageErreur(brut: string): string {
  const m = brut.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (m.includes("email not confirmed")) return "Veuillez confirmer votre e-mail avant de vous connecter.";
  if (m.includes("user already registered")) return "Un compte existe déjà avec cet e-mail.";
  if (m.includes("password should be at least")) return "Le mot de passe est trop court (8 caractères minimum).";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Trop de tentatives. Merci de réessayer dans quelques minutes.";
  return "Une erreur est survenue. Merci de réessayer.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [chargement, setChargement] = useState(true);

  const chargerProfil = useCallback(async (userId: string, accessToken: string) => {
    // Le profil (et surtout le RÔLE) est lu depuis l'API, jamais déduit côté
    // client : c'est le serveur qui fait autorité.
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compte/profil`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(String(res.status));
      setProfil((await res.json()) as Profil);
    } catch {
      setProfil(null);
    }
  }, []);

  useEffect(() => {
    let actif = true;

    if (!supabase) {
      setChargement(false);
      return () => {
        actif = false;
      };
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!actif) return;
      setSession(data.session);
      if (data.session?.user) {
        await chargerProfil(data.session.user.id, data.session.access_token);
      }
      setChargement(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, s) => {
      if (!actif) return;
      setSession(s);
      if (s?.user) {
        await chargerProfil(s.user.id, s.access_token);
      } else {
        setProfil(null);
      }
    });

    return () => {
      actif = false;
      sub.subscription.unsubscribe();
    };
  }, [chargerProfil]);

  const value = useMemo<AuthContexte>(
    () => ({
      user: session?.user ?? null,
      session,
      profil,
      chargement,
      estAdmin: profil?.role === "admin",

      inscription: async ({ email, motDePasse, nomComplet, telephone }) => {
        if (!supabase) return { erreur: "L’authentification n’est pas configurée sur cette installation." };
        const { data, error } = await supabase.auth.signUp({
          email,
          password: motDePasse,
          options: {
            data: { full_name: nomComplet, phone: telephone ?? null },
            emailRedirectTo:
              typeof window !== "undefined" ? `${window.location.origin}/compte` : undefined,
          },
        });
        if (error) return { erreur: messageErreur(error.message) };
        // Si la confirmation d'e-mail est activée dans Supabase, aucune session
        // n'est ouverte tant que la cliente n'a pas cliqué sur le lien.
        return { confirmationRequise: !data.session };
      },

      connexion: async (email, motDePasse) => {
        if (!supabase) return { erreur: "L’authentification n’est pas configurée sur cette installation." };
        const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
        if (error) return { erreur: messageErreur(error.message) };
        return {};
      },

      deconnexion: async () => {
        if (supabase) await supabase.auth.signOut();
        setProfil(null);
      },

      motDePasseOublie: async (email) => {
        if (!supabase) return { erreur: "L’authentification n’est pas configurée sur cette installation." };
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/compte/nouveau-mot-de-passe`
              : undefined,
        });
        if (error) return { erreur: messageErreur(error.message) };
        return {};
      },

      rafraichirProfil: async () => {
        if (supabase && session?.user) await chargerProfil(session.user.id, session.access_token);
      },
    }),
    [session, profil, chargement, chargerProfil],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
