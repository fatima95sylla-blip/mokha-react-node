"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { ArrowLeft } from "lucide-react";
import { ProduitForm, type ProduitFormValues } from "@/components/admin/ProduitForm";
import { apiFetch } from "@/lib/api-fetch";

type ProduitApi = {
  id: string;
  nom: string;
  reference: string;
  prix: string;
  categoryId: string | null;
  collectionId: string | null;
  description: string | null;
  matiere: string | null;
  entretien: string | null;
  delai: string | null;
  confection: string | null;
  disponibilite: string;
  surMesureDisponible: boolean;
  nouveaute: boolean;
  publie: boolean;
  images: { url: string }[];
  variants: { stock: number; prixOverride: string | null; size: { label: string } | null; color: { label: string } | null }[];
};

export default function EditerProduit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [valeurs, setValeurs] = useState<ProduitFormValues | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/produits/admin/detail/${id}`)
      .then((p: ProduitApi) =>
        setValeurs({
          id: p.id,
          nom: p.nom,
          reference: p.reference,
          prix: p.prix,
          categoryId: p.categoryId ?? "",
          collectionId: p.collectionId ?? "",
          description: p.description ?? "",
          matiere: p.matiere ?? "",
          entretien: p.entretien ?? "",
          delai: p.delai ?? "",
          confection: p.confection ?? "",
          disponibilite: p.disponibilite,
          surMesureDisponible: p.surMesureDisponible,
          nouveaute: p.nouveaute,
          publie: p.publie,
          images: p.images.map((i) => i.url),
          variantes: p.variants.map((v) => ({
            taille: v.size?.label ?? "",
            couleur: v.color?.label ?? "",
            stock: v.stock,
            prixOverride: v.prixOverride ? Number(v.prixOverride) : undefined,
          })),
        }),
      )
      .catch((e) => setErreur(e.message));
  }, [id]);

  return (
    <div className="p-6 sm:p-10">
      <Link href="/admin/produits" className="label-xs flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Retour aux produits
      </Link>
      <h1 className="mt-4 text-3xl">Modifier le produit</h1>
      <div className="mt-8 max-w-3xl">
        {erreur ? (
          <p className="text-sm text-destructive">{erreur}</p>
        ) : !valeurs ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <ProduitForm initial={valeurs} />
        )}
      </div>
    </div>
  );
}
