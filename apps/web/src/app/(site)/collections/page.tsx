import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getCollections } from "@/lib/api";

export const metadata: Metadata = {
  title: "Collections — MOKHA",
  description: "Les collections de la maison MOKHA : Héritage, Lumière Dorée, Silhouette Noire.",
};

export default async function Collections() {
  const collections = await getCollections();

  return (
    <>
      <section className="border-b border-border bg-secondary/40 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <p className="label-xs text-gold">Les collections</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Trois univers, une même exigence</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
        {collections.length === 0 ? (
          <p className="text-sm text-muted-foreground">Les collections sont momentanément indisponibles.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {collections.map((c, i) => (
              <Reveal key={c.slug} delay={i * 110}>
                <Link href={`/collections/${c.slug}`} className="group block">
                  <div className="overflow-hidden bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.imageUrl ?? "/images/hero.jpg"}
                      alt={c.nom}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    />
                  </div>
                  {c.saison && <p className="label-xs mt-4 text-gold">{c.saison}</p>}
                  <h2 className="mt-2 font-display text-2xl">{c.nom}</h2>
                  {c.accroche && <p className="mt-2 text-sm text-muted-foreground">{c.accroche}</p>}
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
