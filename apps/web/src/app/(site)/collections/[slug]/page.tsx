import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site";
import { getCollections, getProducts } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collections = await getCollections();
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) return { title: "Collection introuvable — MOKHA", robots: { index: false } };
  return {
    title: `${collection.nom} — MOKHA`,
    description: collection.accroche ?? collection.description ?? undefined,
  };
}

export default async function CollectionDetail({ params }: Props) {
  const { slug } = await params;
  const [collections, produits] = await Promise.all([getCollections(), getProducts({ collection: slug })]);
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  return (
    <>
      <section className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={collection.imageUrl ?? "/images/hero.jpg"}
          alt={collection.nom}
          className="h-[50vh] min-h-[360px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 py-10 sm:px-8">
          <div className="mx-auto max-w-[1400px] text-ivory">
            {collection.saison && <p className="label-xs text-gold">{collection.saison}</p>}
            <h1 className="mt-3 text-4xl sm:text-5xl">{collection.nom}</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
        {collection.description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{collection.description}</p>
        )}

        {produits.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">
            Aucune pièce disponible dans cette collection pour le moment.
          </p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {produits.map((p, i) => (
              <ProductCard key={p.id} produit={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
