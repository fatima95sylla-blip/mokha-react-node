"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useBoutique } from "@/lib/boutique-store";
import { formatPrice } from "@/lib/currency";

export function CartDrawer() {
  const { panierOuvert, setPanierOuvert, lignes, retirer, changerQuantite, sousTotal, devise } =
    useBoutique();

  return (
    <Sheet open={panierOuvert} onOpenChange={setPanierOuvert}>
      <SheetContent className="flex w-full flex-col gap-0 border-l border-border bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="label-xs font-sans text-foreground">
            Votre sélection ({lignes.length})
          </SheetTitle>
        </SheetHeader>

        {lignes.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-muted-foreground">Votre sélection est vide.</p>
            <Button asChild variant="outline" onClick={() => setPanierOuvert(false)}>
              <Link href="/boutique">Découvrir la boutique</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-border">
                {lignes.map((l) => (
                  <li key={l.key} className="grid grid-cols-[80px_minmax(0,1fr)_auto] gap-4 py-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={l.image}
                      alt={l.nom}
                      loading="lazy"
                      className="h-28 w-20 shrink-0 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-display text-lg leading-tight">{l.nom}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {l.couleur} · Taille {l.taille}
                      </p>
                      <p className="label-xs mt-1 text-gold">
                        {l.mode === "sur-mesure" ? "Sur mesure" : "Prêt-à-porter"}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          aria-label="Diminuer"
                          onClick={() => changerQuantite(l.key, l.quantite - 1)}
                          className="border border-border p-1 transition-colors hover:border-gold"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-sm">{l.quantite}</span>
                        <button
                          aria-label="Augmenter"
                          onClick={() => changerQuantite(l.key, l.quantite + 1)}
                          className="border border-border p-1 transition-colors hover:border-gold"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end justify-between">
                      <button
                        aria-label="Retirer"
                        onClick={() => retirer(l.key)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <span className="text-sm">
                        {formatPrice(l.prixUnitaire * l.quantite, devise)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-border px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="label-xs text-muted-foreground">Sous-total</span>
                <span className="font-display text-2xl">{formatPrice(sousTotal, devise)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Livraison et taxes calculées à l'étape suivante.
              </p>
              <div className="mt-5 grid gap-2">
                <Button asChild className="rounded-none" onClick={() => setPanierOuvert(false)}>
                  <Link href="/commande">Passer la commande</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-none" onClick={() => setPanierOuvert(false)}>
                  <Link href="/panier">Voir le panier</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
