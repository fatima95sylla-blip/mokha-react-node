"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

/**
 * Protection CÔTÉ CLIENT : elle évite d'afficher une page vide à une visiteuse
 * non connectée. Ce n'est PAS une mesure de sécurité — toute donnée sensible
 * reste protégée par l'API (middleware requireAuth/requireAdmin) et par les
 * policies RLS de Supabase.
 */
export function RouteProtegee({
  children,
  adminRequis = false,
}: {
  children: ReactNode;
  adminRequis?: boolean;
}) {
  const { user, profil, chargement, estAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (chargement) return;
    if (!user) {
      router.replace(`/connexion?suite=${encodeURIComponent(pathname ?? "/compte")}`);
      return;
    }
    if (adminRequis && profil && !estAdmin) {
      router.replace("/compte");
    }
  }, [chargement, user, profil, estAdmin, adminRequis, router, pathname]);

  if (chargement || !user || (adminRequis && !estAdmin)) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-8">
        <p className="label-xs text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  return <>{children}</>;
}
