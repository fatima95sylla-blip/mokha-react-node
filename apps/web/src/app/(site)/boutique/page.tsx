import type { Metadata } from "next";
import { getCollections, getProducts } from "@/lib/api";
import BoutiqueClient from "./BoutiqueClient";

export const metadata: Metadata = {
  title: "Boutique — Créations MOKHA",
  description:
    "Parcourez les créations MOKHA : robes, ensembles, boubous et tailleurs. Filtres par collection, taille, couleur et disponibilité.",
  openGraph: {
    title: "Boutique — Créations MOKHA",
    description: "Robes, ensembles, boubous et tailleurs de la maison MOKHA.",
  },
};

export default async function Page() {
  const [produits, collections] = await Promise.all([getProducts(), getCollections()]);
  return <BoutiqueClient produits={produits} collections={collections} />;
}
