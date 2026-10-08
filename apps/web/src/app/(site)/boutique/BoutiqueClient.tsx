"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/site";
import { Input } from "@/components/ui/input";
import type { Product } from "@/data/mokha";
import { useBoutique } from "@/lib/boutique-store";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

type CollectionResume = { slug: string; nom: string };

const CATEGORIES = ["Toutes", "Robes", "Ensembles", "Boubous", "Tailleurs", "Jupes"] as const;
const TAILLES = ["36", "38", "40", "42", "44", "Unique"];
const DISPOS = ["En stock", "Sur commande", "Édition limitée"];
const TRIS = [
  { v: "nouveautes", l: "Nouveautés" },
  { v: "prix-asc", l: "Prix croissant" },
  { v: "prix-desc", l: "Prix décroissant" },
  { v: "populaires", l: "Les plus demandées" },
] as const;

function Chip({
  actif,
  children,
  onClick,
}: {
  actif: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "label-xs border px-3 py-2 transition-colors",
        actif ? "border-foreground bg-foreground text-background" : "border-border hover:border-gold",
      )}
    >
      {children}
    </button>
  );
}

export default function BoutiqueClient({
  produits,
  collections,
}: {
  produits: Product[];
  collections: CollectionResume[];
}) {
  const { devise } = useBoutique();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Toutes");
  const [col, setCol] = useState<string[]>([]);
  const [tailles, setTailles] = useState<string[]>([]);
  const [couleurs, setCouleurs] = useState<string[]>([]);
  const [dispos, setDispos] = useState<string[]>([]);
  const [prixMax, setPrixMax] = useState(450000);
  const [tri, setTri] = useState<string>("nouveautes");
  const [page, setPage] = useState(1);
  const parPage = 6;

  const toutesCouleurs = useMemo(
    () => [...new Set(produits.flatMap((p) => p.couleurs))].sort(),
    [produits],
  );

  const bascule = (setter: React.Dispatch<React.SetStateAction<string[]>>, v: string) => {
    setPage(1);
    setter((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const resultats = useMemo(() => {
    const liste = produits.filter((p) => {
      if (q && !`${p.nom} ${p.description} ${p.reference}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (cat !== "Toutes" && p.categorie !== cat) return false;
      if (col.length && !col.includes(p.collection)) return false;
      if (tailles.length && !p.tailles.some((t) => tailles.includes(t))) return false;
      if (couleurs.length && !p.couleurs.some((c) => couleurs.includes(c))) return false;
      if (dispos.length && !dispos.includes(p.disponibilite)) return false;
      if (p.prix > prixMax) return false;
      return true;
    });
    const trie = [...liste];
    if (tri === "prix-asc") trie.sort((a, b) => a.prix - b.prix);
    if (tri === "prix-desc") trie.sort((a, b) => b.prix - a.prix);
    if (tri === "populaires") trie.sort((a, b) => b.populaire - a.populaire);
    if (tri === "nouveautes") trie.sort((a, b) => Number(b.nouveaute) - Number(a.nouveaute));
    return trie;
  }, [produits, q, cat, col, tailles, couleurs, dispos, prixMax, tri]);

  const pages = Math.max(1, Math.ceil(resultats.length / parPage));
  const visibles = resultats.slice((page - 1) * parPage, page * parPage);
  const filtresActifs =
    col.length + tailles.length + couleurs.length + dispos.length + (cat !== "Toutes" ? 1 : 0);

  return (
    <>
      <section className="border-b border-border bg-secondary/40 px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <p className="label-xs text-gold">La boutique</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Créations disponibles</h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            Chaque pièce peut être commandée en prêt-à-porter ou confectionnée à vos mesures.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-8">
          <div>
            <label className="label-xs text-muted-foreground" htmlFor="recherche">
              Recherche
            </label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="recherche"
                value={q}
                maxLength={60}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Robe, kaftan, référence…"
                className="rounded-none pl-9"
              />
            </div>
          </div>

          <div>
            <p className="label-xs text-muted-foreground">Catégorie</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  actif={cat === c}
                  onClick={() => {
                    setCat(c);
                    setPage(1);
                  }}
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="label-xs text-muted-foreground">Collection</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {collections.map((c) => (
                <Chip key={c.slug} actif={col.includes(c.slug)} onClick={() => bascule(setCol, c.slug)}>
                  {c.nom}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="label-xs text-muted-foreground">Taille</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TAILLES.map((t) => (
                <Chip key={t} actif={tailles.includes(t)} onClick={() => bascule(setTailles, t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="label-xs text-muted-foreground">Couleur</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {toutesCouleurs.map((c) => (
                <Chip key={c} actif={couleurs.includes(c)} onClick={() => bascule(setCouleurs, c)}>
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="label-xs text-muted-foreground">Disponibilité</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DISPOS.map((d) => (
                <Chip key={d} actif={dispos.includes(d)} onClick={() => bascule(setDispos, d)}>
                  {d}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="label-xs text-muted-foreground">
              Prix maximum · {formatPrice(prixMax, devise)}
            </p>
            <input
              type="range"
              min={100000}
              max={450000}
              step={5000}
              value={prixMax}
              onChange={(e) => {
                setPrixMax(Number(e.target.value));
                setPage(1);
              }}
              className="mt-3 w-full accent-[var(--gold)]"
            />
          </div>

          {filtresActifs > 0 && (
            <button
              onClick={() => {
                setCat("Toutes");
                setCol([]);
                setTailles([]);
                setCouleurs([]);
                setDispos([]);
                setPrixMax(450000);
                setPage(1);
              }}
              className="label-xs flex items-center gap-2 text-gold"
            >
              <X className="h-3 w-3" /> Réinitialiser les filtres
            </button>
          )}
        </aside>

        <section>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border pb-4">
            <p className="label-xs truncate text-muted-foreground">
              {resultats.length} création{resultats.length > 1 ? "s" : ""}
            </p>
            <select
              aria-label="Trier"
              value={tri}
              onChange={(e) => setTri(e.target.value)}
              className="label-xs shrink-0 border border-border bg-transparent px-3 py-2 outline-none"
            >
              {TRIS.map((t) => (
                <option key={t.v} value={t.v}>
                  {t.l}
                </option>
              ))}
            </select>
          </div>

          {visibles.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">
              Aucune création ne correspond à votre recherche.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-3">
              {visibles.map((p, i) => (
                <ProductCard key={p.id} produit={p} index={i} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    "label-xs h-10 w-10 border transition-colors",
                    n === page
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-gold",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
