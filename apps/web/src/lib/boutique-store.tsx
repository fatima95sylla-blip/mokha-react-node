"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { BASE_CURRENCY, type Currency } from "@/lib/currency";

// Une ligne de panier embarque un INSTANTANÉ du produit (nom, prix unitaire,
// image) au moment de l'ajout. Deux raisons :
//  1. le panier ne dépend plus d'un catalogue statique côté client ;
//  2. la cliente voit le prix qu'elle a accepté, même si le back-office modifie
//     le prix entre-temps.
// Ce prix reste indicatif : il sera REVALIDÉ côté serveur au moment du checkout,
// à partir de la base, avant toute création de commande ou de paiement.
export type CartLine = {
  key: string;
  slug: string;
  nom: string;
  image: string;
  prixUnitaire: number;
  taille: string;
  couleur: string;
  mode: "pret-a-porter" | "sur-mesure";
  quantite: number;
};

type Boutique = {
  lignes: CartLine[];
  favoris: string[];
  devise: Currency;
  panierOuvert: boolean;
  setPanierOuvert: (v: boolean) => void;
  setDevise: (c: Currency) => void;
  ajouter: (l: Omit<CartLine, "key">) => void;
  retirer: (key: string) => void;
  changerQuantite: (key: string, q: number) => void;
  viderPanier: () => void;
  basculerFavori: (slug: string) => void;
  remplacerFavoris: (slugs: string[]) => void;
  estFavori: (slug: string) => boolean;
  sousTotal: number;
  nbArticles: number;
};

const Ctx = createContext<Boutique | null>(null);
// v2 : le format des lignes a changé (ajout de l'instantané produit).
const KEY = "mokha-boutique-v2";

/**
 * Répercute un ajout/retrait de favori sur le compte, si une session est
 * ouverte. Silencieux en cas d'échec : l'état local reste la référence
 * d'affichage et `useSyncFavoris` réconciliera à la prochaine ouverture.
 */
async function synchroniserFavori(slug: string, ajout: boolean) {
  try {
    const { supabase } = await import("@/lib/supabase");
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return; // visiteuse non connectée : favoris purement locaux

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compte/wishlist/${encodeURIComponent(slug)}`, {
      method: ajout ? "POST" : "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    /* hors ligne : on ne bloque jamais l'interaction */
  }
}

export function BoutiqueProvider({ children }: { children: ReactNode }) {
  const [lignes, setLignes] = useState<CartLine[]>([]);
  const [favoris, setFavoris] = useState<string[]>([]);
  const [devise, setDevise] = useState<Currency>(BASE_CURRENCY);
  const [panierOuvert, setPanierOuvert] = useState(false);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw) as {
          lignes?: CartLine[];
          favoris?: string[];
          devise?: Currency;
        };
        // On ignore les lignes d'un ancien format incomplet plutôt que d'afficher
        // un panier à 0 F ou sans visuel.
        setLignes((data.lignes ?? []).filter((l) => typeof l.prixUnitaire === "number" && l.nom));
        setFavoris(data.favoris ?? []);
        setDevise(data.devise ?? BASE_CURRENCY);
      }
    } catch {
      /* stockage indisponible (navigation privée, quota) */
    }
    setCharge(true);
  }, []);

  useEffect(() => {
    if (!charge) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ lignes, favoris, devise }));
    } catch {
      /* stockage indisponible */
    }
  }, [lignes, favoris, devise, charge]);

  const value = useMemo<Boutique>(() => {
    const sousTotal = lignes.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0);

    return {
      lignes,
      favoris,
      devise,
      panierOuvert,
      setPanierOuvert,
      setDevise,
      ajouter: (l) =>
        setLignes((prev) => {
          const key = `${l.slug}|${l.taille}|${l.couleur}|${l.mode}`;
          const existe = prev.find((x) => x.key === key);
          if (existe) {
            return prev.map((x) =>
              x.key === key ? { ...x, quantite: x.quantite + l.quantite } : x,
            );
          }
          return [...prev, { ...l, key }];
        }),
      retirer: (key) => setLignes((prev) => prev.filter((l) => l.key !== key)),
      changerQuantite: (key, q) =>
        setLignes((prev) =>
          prev.flatMap((l) => (l.key === key ? (q <= 0 ? [] : [{ ...l, quantite: q }]) : [l])),
        ),
      viderPanier: () => setLignes([]),
      basculerFavori: (slug) =>
        setFavoris((prev) => {
          const presente = prev.includes(slug);
          // Écriture optimiste côté serveur si une session est ouverte. Le
          // localStorage reste la source pour les visiteuses non connectées.
          void synchroniserFavori(slug, !presente);
          return presente ? prev.filter((s) => s !== slug) : [...prev, slug];
        }),
      remplacerFavoris: (slugs) => setFavoris(slugs),
      estFavori: (slug) => favoris.includes(slug),
      sousTotal,
      nbArticles: lignes.reduce((s, l) => s + l.quantite, 0),
    };
  }, [lignes, favoris, devise, panierOuvert]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBoutique() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBoutique doit être utilisé dans BoutiqueProvider");
  return ctx;
}
