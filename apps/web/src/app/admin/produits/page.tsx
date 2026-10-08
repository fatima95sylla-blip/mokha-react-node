"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-fetch";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ProduitAdmin = {
  id: string;
  reference: string;
  nom: string;
  prix: string;
  disponibilite: string;
  publie: boolean;
  category: { nom: string } | null;
  images: { url: string }[];
};

export default function ListeProduits() {
  const [produits, setProduits] = useState<ProduitAdmin[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  function charger() {
    apiFetch("/produits/admin/liste").then(setProduits).catch((e) => setErreur(e.message));
  }

  useEffect(charger, []);

  async function basculerPublication(p: ProduitAdmin) {
    try {
      await apiFetch(`/produits/${p.id}`, { method: "PATCH", body: JSON.stringify({ publie: !p.publie }) });
      toast.success(p.publie ? "Produit dépublié." : "Produit publié.");
      charger();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function supprimer(p: ProduitAdmin) {
    if (!confirm(`Supprimer définitivement « ${p.nom} » ?`)) return;
    try {
      await apiFetch(`/produits/${p.id}`, { method: "DELETE" });
      toast.success("Produit supprimé.");
      charger();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl">Produits</h1>
        <Button asChild className="rounded-none">
          <Link href="/admin/produits/nouveau">
            <Plus className="mr-2 h-4 w-4" /> Nouveau produit
          </Link>
        </Button>
      </div>

      {erreur ? (
        <p className="mt-8 text-sm text-destructive">{erreur}</p>
      ) : produits === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Chargement…</p>
      ) : produits.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Aucun produit pour le moment.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="label-xs border-b border-border text-left text-muted-foreground">
                <th className="py-3"></th>
                <th className="py-3">Référence</th>
                <th className="py-3">Nom</th>
                <th className="py-3">Catégorie</th>
                <th className="py-3">Prix</th>
                <th className="py-3">Statut</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0]?.url ?? "/images/hero.jpg"}
                      alt=""
                      className="h-14 w-11 object-cover"
                    />
                  </td>
                  <td className="py-3 text-muted-foreground">{p.reference}</td>
                  <td className="py-3">
                    <Link href={`/admin/produits/${p.id}`} className="font-display text-lg hover:text-gold">
                      {p.nom}
                    </Link>
                  </td>
                  <td className="py-3">{p.category?.nom ?? "—"}</td>
                  <td className="py-3">{formatPrice(Number(p.prix))}</td>
                  <td className="py-3">
                    <span className={cn("label-xs", p.publie ? "text-gold" : "text-muted-foreground")}>
                      {p.publie ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-3">
                      <button
                        aria-label={p.publie ? "Dépublier" : "Publier"}
                        onClick={() => basculerPublication(p)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {p.publie ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        aria-label="Supprimer"
                        onClick={() => supprimer(p)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
