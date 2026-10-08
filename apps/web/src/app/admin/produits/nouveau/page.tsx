"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProduitForm } from "@/components/admin/ProduitForm";

export default function NouveauProduit() {
  return (
    <div className="p-6 sm:p-10">
      <Link href="/admin/produits" className="label-xs flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Retour aux produits
      </Link>
      <h1 className="mt-4 text-3xl">Nouveau produit</h1>
      <div className="mt-8 max-w-3xl">
        <ProduitForm />
      </div>
    </div>
  );
}
