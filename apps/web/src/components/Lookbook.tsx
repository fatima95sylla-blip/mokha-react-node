"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { looks } from "@/data/mokha";
import type { Product } from "@/data/mokha";
import { useBoutique } from "@/lib/boutique-store";
import { formatPrice } from "@/lib/currency";

export function Lookbook({ produits }: { produits: Product[] }) {
  const [actif, setActif] = useState(0);
  const { devise } = useBoutique();
  const parSlug = new Map(produits.map((p) => [p.slug, p]));
  const look = looks[actif]!;

  return (
    <section className="bg-ink py-20 text-ivory md:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="label-xs text-gold">Lookbook interactif</p>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl">Shop the Silhouette</h2>
          </div>
          <p className="max-w-sm text-sm text-ivory/60">
            Survolez les repères dorés pour découvrir les pièces qui composent chaque silhouette.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={look.image}
              alt={look.titre}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover"
            />
            {look.points.map((pt) => {
              const p = parSlug.get(pt.productSlug);
              if (!p) return null;
              return (
                <Link
                  key={pt.productSlug}
                  href={`/boutique/${pt.productSlug}`}
                  style={{ top: pt.top, left: pt.left }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <span className="grid h-8 w-8 place-items-center border border-gold bg-ink/70 text-gold transition-colors group-hover:bg-gold group-hover:text-ink">
                    <Plus className="h-4 w-4" />
                  </span>
                  <span className="pointer-events-none absolute left-10 top-0 w-48 border border-gold/40 bg-ink/95 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="block font-display text-base">{p.nom}</span>
                    <span className="block text-xs text-gold">{formatPrice(p.prix, devise)}</span>
                  </span>
                </Link>
              );
            })}
          </Reveal>

          <div className="flex flex-col justify-center">
            <p className="label-xs text-gold">
              Look {actif + 1} / {looks.length}
            </p>
            <h3 className="mt-4 text-3xl md:text-4xl">{look.titre}</h3>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/70">{look.description}</p>

            <ul className="mt-8 divide-y divide-ivory/10 border-y border-ivory/10">
              {look.points.map((pt) => {
                const p = parSlug.get(pt.productSlug);
                if (!p) return null;
                return (
                  <li key={pt.productSlug}>
                    <Link
                      href={`/boutique/${pt.productSlug}`}
                      className="flex items-center gap-4 py-4 transition-colors hover:text-gold"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt="" loading="lazy" className="h-20 w-14 object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-lg">{p.nom}</span>
                        <span className="block text-xs text-ivory/50">
                          {formatPrice(p.prix, devise)}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setActif((a: number) => (a - 1 + looks.length) % looks.length)}
                className="label-xs border border-ivory/30 px-5 py-3 transition-colors hover:border-gold hover:text-gold"
              >
                Look précédent
              </button>
              <button
                onClick={() => setActif((a: number) => (a + 1) % looks.length)}
                className="label-xs border border-ivory/30 px-5 py-3 transition-colors hover:border-gold hover:text-gold"
              >
                Look suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
