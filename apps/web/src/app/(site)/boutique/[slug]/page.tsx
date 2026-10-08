import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollections, getProductBySlug, getProducts } from "@/lib/api";
import { ProductDetail } from "./ProductDetail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produit = await getProductBySlug(slug);
  if (!produit) {
    return { title: "Création introuvable — MOKHA", robots: { index: false } };
  }
  return {
    title: `${produit.nom} — MOKHA`,
    description: produit.description.slice(0, 155),
    openGraph: {
      title: `${produit.nom} — MOKHA`,
      description: produit.description.slice(0, 155),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const produit = await getProductBySlug(slug);
  if (!produit) notFound();

  const [memeCollection, collections] = await Promise.all([
    getProducts({ collection: produit.collection }),
    getCollections(),
  ]);
  const associes = memeCollection.filter((p) => p.id !== produit.id).slice(0, 4);
  const collection = collections.find((c) => c.slug === produit.collection) ?? null;

  return <ProductDetail produit={produit} associes={associes} collection={collection} />;
}

