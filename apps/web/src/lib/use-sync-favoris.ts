"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useBoutique } from "@/lib/boutique-store";

/**
 * Réconcilie les favoris enregistrés hors connexion (localStorage) avec ceux du
 * compte, une seule fois par session ouverte.
 *
 * Règle retenue : on FUSIONNE, jamais on n'écrase. Une cliente qui ajoute des
 * pièces avant de se connecter ne doit pas les perdre, et celles déjà
 * enregistrées sur son compte doivent réapparaître sur un nouvel appareil.
 */
export function useSyncFavoris() {
  const { session } = useAuth();
  const { favoris, remplacerFavoris } = useBoutique();
  const dejaFusionne = useRef<string | null>(null);

  useEffect(() => {
    if (!session) {
      dejaFusionne.current = null;
      return;
    }
    // Une fusion par session (l'identifiant change à chaque connexion).
    if (dejaFusionne.current === session.user.id) return;
    dejaFusionne.current = session.user.id;

    const base = process.env.NEXT_PUBLIC_API_URL;
    const entetes = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };

    (async () => {
      try {
        if (favoris.length) {
          await fetch(`${base}/compte/wishlist/fusion`, {
            method: "POST",
            headers: entetes,
            body: JSON.stringify({ slugs: favoris }),
          });
        }
        const res = await fetch(`${base}/compte/wishlist`, { headers: entetes });
        if (!res.ok) return;
        const produits = (await res.json()) as { slug: string }[];
        remplacerFavoris(produits.map((p) => p.slug));
      } catch {
        // Hors ligne ou API indisponible : on garde les favoris locaux, ils
        // seront resynchronisés à la prochaine ouverture.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
}
