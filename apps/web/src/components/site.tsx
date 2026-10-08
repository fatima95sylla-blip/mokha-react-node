"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { useBoutique } from "@/lib/boutique-store";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/data/mokha";
import { cn } from "@/lib/utils";

export function SectionTitle({
  surtitre,
  titre,
  texte,
  centre = false,
  className,
}: {
  surtitre?: string;
  titre: string;
  texte?: string;
  centre?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(centre && "mx-auto max-w-2xl text-center", className)}>
      {surtitre && <p className="label-xs text-gold">{surtitre}</p>}
      <h2 className="mt-3 text-3xl leading-tight sm:text-4xl md:text-5xl">{titre}</h2>
      {texte && <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{texte}</p>}
    </div>
  );
}

export function PageHero({
  surtitre,
  titre,
  texte,
  image,
  enfants,
}: {
  surtitre: string;
  titre: string;
  texte?: string;
  image?: string;
  enfants?: ReactNode;
}) {
  return (
    <section className="relative border-b border-border bg-secondary/40">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-16 sm:px-8 md:py-24 lg:grid-cols-2">
        <Reveal>
          <p className="label-xs text-gold">{surtitre}</p>
          <h1 className="mt-4 text-4xl leading-[1.05] sm:text-5xl md:text-6xl">{titre}</h1>
          {texte && (
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">{texte}</p>
          )}
          {enfants && <div className="mt-8">{enfants}</div>}
        </Reveal>
        {image && (
          <Reveal delay={120} className="hidden lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function ProductCard({ produit, index = 0 }: { produit: Product; index?: number }) {
  const { basculerFavori, estFavori, devise } = useBoutique();
  const favori = estFavori(produit.slug);

  return (
    <Reveal as="article" delay={(index % 4) * 90} className="group relative">
      <Link href={`/boutique/${produit.slug}`} className="block">
        <div className="relative overflow-hidden bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={produit.images[0]}
            alt={produit.nom}
            loading="lazy"
            className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
          {produit.nouveaute && (
            <span className="label-xs absolute left-3 top-3 bg-background/90 px-2 py-1 text-foreground">
              Nouveauté
            </span>
          )}
          {produit.disponibilite === "Édition limitée" && (
            <span className="label-xs absolute left-3 top-3 bg-ink/90 px-2 py-1 text-gold">
              Édition limitée
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="label-xs text-muted-foreground">{produit.categorie}</p>
          <h3 className="mt-1 font-display text-xl leading-tight">{produit.nom}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{formatPrice(produit.prix, devise)}</p>
        </div>
      </Link>
      <button
        aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
        onClick={() => basculerFavori(produit.slug)}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center bg-background/85 transition-colors hover:bg-background"
      >
        <Heart className={cn("h-4 w-4", favori && "fill-gold text-gold")} />
      </button>
    </Reveal>
  );
}
