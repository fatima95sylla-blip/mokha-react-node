import type { Product } from "@/data/mokha";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Forme brute renvoyée par l'API Express/Prisma (apps/api/src/routes/catalogue.ts)
export type ApiProduct = {
  id: string;
  slug: string;
  nom: string;
  reference: string;
  description: string | null;
  matiere: string | null;
  entretien: string | null;
  delai: string | null;
  confection: string | null;
  prix: string | number;
  disponibilite: string;
  surMesureDisponible: boolean;
  nouveaute: boolean;
  populaire: number;
  category: { slug: string; nom: string } | null;
  collection: { slug: string; nom: string } | null;
  images: { url: string; ordre: number }[];
  variants: { size: { label: string } | null; color: { label: string } | null }[];
};

// Le reste de l'app (ProductCard, la page /boutique, la fiche produit) a été
// écrit contre la forme "Product" statique d'origine. Plutôt que de réécrire
// ces composants, on adapte ici la réponse de l'API à cette même forme : les
// futures évolutions du back-office n'auront donc pas à toucher à l'UI.
export function adapterProduit(p: ApiProduct): Product {
  const tailles = [...new Set(p.variants.map((v) => v.size?.label).filter((x): x is string => !!x))];
  const couleurs = [...new Set(p.variants.map((v) => v.color?.label).filter((x): x is string => !!x))];
  return {
    id: p.id,
    slug: p.slug,
    nom: p.nom,
    reference: p.reference,
    prix: Number(p.prix),
    categorie: (p.category?.nom ?? "Robes") as Product["categorie"],
    collection: p.collection?.slug ?? "",
    couleurs,
    tailles,
    images: p.images.sort((a, b) => a.ordre - b.ordre).map((i) => i.url),
    description: p.description ?? "",
    matiere: p.matiere ?? "",
    entretien: p.entretien ?? "",
    delai: p.delai ?? "",
    confection: p.confection ?? "",
    disponibilite: p.disponibilite as Product["disponibilite"],
    populaire: p.populaire,
    nouveaute: p.nouveaute,
    surMesureDisponible: p.surMesureDisponible,
  };
}

async function fetchJson<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`Échec de l'appel API ${path} (${res.status})`);
  }
  return res.json();
}

export async function getProducts(params?: {
  categorie?: string;
  collection?: string;
  q?: string;
}): Promise<Product[]> {
  const search = new URLSearchParams();
  if (params?.categorie) search.set("categorie", params.categorie);
  if (params?.collection) search.set("collection", params.collection);
  if (params?.q) search.set("q", params.q);
  const qs = search.toString();
  try {
    const data = await fetchJson<ApiProduct[]>(`/produits${qs ? `?${qs}` : ""}`);
    return data.map(adapterProduit);
  } catch (e) {
    // L'API indisponible ne doit pas produire une page 500 : la page s'affiche
    // avec un catalogue vide et son état "aucune création" prévu pour cela.
    console.error("[MOKHA] catalogue indisponible :", e);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const data = await fetchJson<ApiProduct>(`/produits/${slug}`);
    return adapterProduit(data);
  } catch {
    return null;
  }
}

export async function getCollections() {
  try {
    return await fetchJson<
      {
        slug: string;
        nom: string;
        saison: string | null;
        accroche: string | null;
        description: string | null;
        imageUrl: string | null;
      }[]
    >("/collections");
  } catch (e) {
    console.error("[MOKHA] collections indisponibles :", e);
    return [];
  }
}
