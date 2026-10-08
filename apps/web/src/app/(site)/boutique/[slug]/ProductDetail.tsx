"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Ruler, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductCard } from "@/components/site";
import type { Product } from "@/data/mokha";
import { useBoutique } from "@/lib/boutique-store";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

const MESURES = [
  { taille: "36", poitrine: "84", tailleCm: "66", hanches: "92" },
  { taille: "38", poitrine: "88", tailleCm: "70", hanches: "96" },
  { taille: "40", poitrine: "92", tailleCm: "74", hanches: "100" },
  { taille: "42", poitrine: "96", tailleCm: "78", hanches: "104" },
  { taille: "44", poitrine: "100", tailleCm: "82", hanches: "108" },
];

export function ProductDetail({
  produit,
  associes,
  collection,
}: {
  produit: Product;
  associes: Product[];
  collection: { slug: string; nom: string } | null;
}) {
  const { ajouter, setPanierOuvert, basculerFavori, estFavori, devise } = useBoutique();
  const [imageActive, setImageActive] = useState(0);
  const [taille, setTaille] = useState(produit.tailles[0]!);
  const [couleur, setCouleur] = useState(produit.couleurs[0]!);
  const [mode, setMode] = useState<"pret-a-porter" | "sur-mesure">("pret-a-porter");

  const prix = mode === "sur-mesure" ? Math.round(produit.prix * 1.25) : produit.prix;

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8">
        <nav className="label-xs text-muted-foreground">
          <Link href="/" className="hover:text-gold">Accueil</Link> ·{" "}
          <Link href="/boutique" className="hover:text-gold">Boutique</Link> · {produit.nom}
        </nav>
      </div>

      <section className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-20 sm:px-8 lg:grid-cols-2">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={produit.images[imageActive]}
            alt={produit.nom}
            className="aspect-[3/4] w-full bg-secondary object-cover"
          />
          {produit.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {produit.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setImageActive(i)}
                  className={cn(
                    "w-20 border-2",
                    i === imageActive ? "border-gold" : "border-transparent",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pl-6">
          {collection && (
            <Link href={`/collections/${collection.slug}`} className="label-xs text-gold">
              Collection {collection.nom}
            </Link>
          )}
          <h1 className="mt-3 text-4xl sm:text-5xl">{produit.nom}</h1>
          <p className="label-xs mt-3 text-muted-foreground">Référence {produit.reference}</p>
          <p className="mt-6 font-display text-3xl">{formatPrice(prix, devise)}</p>
          <p className="label-xs mt-2 text-muted-foreground">{produit.disponibilite}</p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{produit.description}</p>

          {/* MODE */}
          <div className="mt-8">
            <p className="label-xs text-muted-foreground">Réalisation</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { v: "pret-a-porter", t: "Prêt-à-porter", d: produit.delai },
                  { v: "sur-mesure", t: "Sur mesure", d: "À vos mesures · +25 %" },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setMode(o.v)}
                  className={cn(
                    "border p-4 text-left transition-colors",
                    mode === o.v ? "border-gold bg-secondary/60" : "border-border hover:border-gold",
                  )}
                >
                  <span className="label-xs block">{o.t}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{o.d}</span>
                </button>
              ))}
            </div>
          </div>

          {/* COULEUR */}
          <div className="mt-8">
            <p className="label-xs text-muted-foreground">Couleur · {couleur}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {produit.couleurs.map((c) => (
                <button
                  key={c}
                  onClick={() => setCouleur(c)}
                  className={cn(
                    "label-xs border px-4 py-2 transition-colors",
                    c === couleur ? "border-foreground bg-foreground text-background" : "border-border hover:border-gold",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* TAILLE */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="label-xs text-muted-foreground">Taille</p>
              <Dialog>
                <DialogTrigger className="label-xs flex items-center gap-2 text-gold">
                  <Ruler className="h-3 w-3" /> Guide des tailles
                </DialogTrigger>
                <DialogContent className="max-w-xl rounded-none">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Guide des tailles MOKHA</DialogTitle>
                  </DialogHeader>
                  <table className="mt-2 w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="label-xs py-2">Taille</th>
                        <th className="label-xs py-2">Poitrine</th>
                        <th className="label-xs py-2">Taille (cm)</th>
                        <th className="label-xs py-2">Hanches</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MESURES.map((m) => (
                        <tr
                          key={m.taille}
                          className={cn(
                            "border-b border-border/60",
                            m.taille === taille && "bg-secondary/60",
                          )}
                        >
                          <td className="py-2">{m.taille}</td>
                          <td className="py-2">{m.poitrine} cm</td>
                          <td className="py-2">{m.tailleCm} cm</td>
                          <td className="py-2">{m.hanches} cm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Entre deux tailles, nous recommandons la plus grande, ou la confection sur mesure.
                    Mesurez-vous en sous-vêtements, le mètre à plat sans serrer.
                  </p>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {produit.tailles.map((t) => (
                <button
                  key={t}
                  onClick={() => setTaille(t)}
                  className={cn(
                    "label-xs min-w-12 border px-4 py-2 transition-colors",
                    t === taille ? "border-foreground bg-foreground text-background" : "border-border hover:border-gold",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Button
              className="rounded-none py-6"
              onClick={() => {
                ajouter({
                  slug: produit.slug,
                  nom: produit.nom,
                  image: produit.images[0] ?? "",
                  prixUnitaire: prix,
                  taille,
                  couleur,
                  mode,
                  quantite: 1,
                });
                setPanierOuvert(true);
                toast.success(`${produit.nom} ajoutée à votre sélection.`);
              }}
            >
              Ajouter au panier
            </Button>
            <Button
              variant="outline"
              className="rounded-none py-6"
              onClick={() => basculerFavori(produit.slug)}
            >
              <Heart className={cn("mr-2 h-4 w-4", estFavori(produit.slug) && "fill-gold text-gold")} />
              Favori
            </Button>
          </div>

          <div className="mt-4 border border-gold/40 bg-secondary/40 p-5">
            <p className="font-display text-xl">
              Vous aimez cette pièce mais souhaitez une adaptation ?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Longueur, encolure, manches, tissu : nous adaptons cette création à votre morphologie et
              à votre occasion.
            </p>
            <Link
              href={`/sur-mesure?piece=${encodeURIComponent(produit.nom)}`}
              className="label-xs mt-4 inline-block border border-foreground px-6 py-3 transition-colors hover:bg-foreground hover:text-background"
            >
              Demander sur mesure
            </Link>
          </div>

          <p className="label-xs mt-6 flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4 text-gold" /> {produit.delai}
          </p>

          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="matiere">
              <AccordionTrigger className="label-xs">Matière</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{produit.matiere}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="confection">
              <AccordionTrigger className="label-xs">Confection</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{produit.confection}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="entretien">
              <AccordionTrigger className="label-xs">Entretien</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{produit.entretien}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="livraison">
              <AccordionTrigger className="label-xs">Livraison & retours</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Expédition suivie depuis Dakar. Échange possible sous 14 jours pour les pièces du
                catalogue ; les pièces sur mesure ne sont pas échangeables.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] border-t border-border px-4 py-16 sm:px-8">
        <h2 className="text-3xl">Pièces associées</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {associes.map((p, i) => (
            <ProductCard key={p.id} produit={p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
