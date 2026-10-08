"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBoutique } from "@/lib/boutique-store";
import { formatPrice } from "@/lib/currency";

export default function Panier() {
  const { lignes, retirer, changerQuantite, sousTotal, devise } = useBoutique();

  if (lignes.length === 0) {
    return (
      <section className="mx-auto max-w-lg px-4 py-24 text-center sm:px-8">
        <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="mt-6 text-3xl">Votre panier est vide</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Parcourez nos créations et ajoutez vos pièces favorites.
        </p>
        <Button asChild className="mt-8 rounded-none">
          <Link href="/boutique">Découvrir la boutique</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1000px] px-4 py-16 sm:px-8">
      <p className="label-xs text-gold">Votre sélection</p>
      <h1 className="mt-4 text-4xl">Panier</h1>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {lignes.map((l) => (
          <li key={l.key} className="grid grid-cols-[96px_minmax(0,1fr)_auto] gap-5 py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.image} alt={l.nom} className="h-32 w-24 object-cover" />
            <div className="min-w-0">
              <p className="font-display text-xl leading-tight">{l.nom}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {l.couleur} · Taille {l.taille}
              </p>
              <p className="label-xs mt-1 text-gold">
                {l.mode === "sur-mesure" ? "Sur mesure" : "Prêt-à-porter"}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  aria-label="Diminuer"
                  onClick={() => changerQuantite(l.key, l.quantite - 1)}
                  className="border border-border p-1.5 transition-colors hover:border-gold"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-sm">{l.quantite}</span>
                <button
                  aria-label="Augmenter"
                  onClick={() => changerQuantite(l.key, l.quantite + 1)}
                  className="border border-border p-1.5 transition-colors hover:border-gold"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button
                aria-label="Retirer"
                onClick={() => retirer(l.key)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="font-display text-lg">
                {formatPrice(l.prixUnitaire * l.quantite, devise)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-1">
        <div className="flex items-baseline gap-4">
          <span className="label-xs text-muted-foreground">Sous-total</span>
          <span className="font-display text-3xl">{formatPrice(sousTotal, devise)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Livraison calculée à l'étape suivante.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button asChild variant="outline" className="rounded-none">
          <Link href="/boutique">Continuer mes achats</Link>
        </Button>
        <Button asChild className="rounded-none px-8">
          <Link href="/commande">Passer la commande</Link>
        </Button>
      </div>
    </section>
  );
}
