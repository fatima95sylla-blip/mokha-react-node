"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/site";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/mokha";
import { adapterProduit, type ApiProduct } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useBoutique } from "@/lib/boutique-store";
import { useSyncFavoris } from "@/lib/use-sync-favoris";

export default function Favoris() {
  // Réconcilie les favoris locaux avec le compte dès qu'une session existe.
  useSyncFavoris();

  const { favoris } = useBoutique();
  const { session, chargement: chargementAuth } = useAuth();

  const [produits, setProduits] = useState<Product[] | null>(null);
  const [erreur, setErreur] = useState(false);

  // Les favoris ne sont que des slugs : on va chercher les fiches complètes.
  useEffect(() => {
    if (favoris.length === 0) {
      setProduits([]);
      return;
    }
    let actif = true;
    setErreur(false);

    Promise.all(
      favoris.map((slug) =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/produits/${encodeURIComponent(slug)}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ),
    )
      .then((liste) => {
        if (!actif) return;
        const valides = liste.filter(Boolean);
        if (valides.length === 0 && favoris.length > 0) setErreur(true);
        setProduits(valides.map((p: ApiProduct) => adapterProduit(p)));
      })
      .catch(() => actif && setErreur(true));

    return () => {
      actif = false;
    };
  }, [favoris]);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
      <p className="label-xs text-gold">Votre sélection</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Mes favoris</h1>

      {!chargementAuth && !session && favoris.length > 0 && (
        <p className="mt-6 max-w-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          Vos favoris sont enregistrés sur cet appareil uniquement.{" "}
          <Link href="/connexion?suite=/favoris" className="text-gold hover:underline">
            Connectez-vous
          </Link>{" "}
          pour les retrouver partout.
        </p>
      )}

      {erreur ? (
        <p className="mt-16 text-center text-muted-foreground">
          Vos favoris sont momentanément indisponibles. Merci de réessayer plus tard.
        </p>
      ) : produits === null ? (
        <p className="mt-16 text-center text-muted-foreground">Chargement…</p>
      ) : produits.length === 0 ? (
        <div className="mt-16 border border-border px-6 py-20 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-6 text-muted-foreground">
            Vous n'avez pas encore de pièce favorite.
          </p>
          <Button asChild className="mt-8 rounded-none">
            <Link href="/boutique">Découvrir les créations</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="label-xs mt-6 text-muted-foreground">
            {produits.length} pièce{produits.length > 1 ? "s" : ""}
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {produits.map((p, i) => (
              <ProductCard key={p.id} produit={p} index={i} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
