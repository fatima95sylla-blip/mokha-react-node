import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Journal — MOKHA",
  description: "Les écrits de la maison MOKHA : héritage, savoir-faire et style.",
};

type Article = {
  id: string;
  slug: string;
  titre: string;
  extrait: string | null;
  imageUrl: string | null;
  publieLe: string | null;
  category: { nom: string } | null;
};

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Journal() {
  const articles = await getArticles();

  return (
    <>
      <section className="border-b border-border bg-secondary/40 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <p className="label-xs text-gold">Le Journal</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Écrits de la maison</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun article publié pour le moment.</p>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal as="article" key={a.id} delay={i * 90}>
                <Link href={`/journal/${a.slug}`} className="group block">
                  {a.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.imageUrl}
                      alt={a.titre}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-opacity group-hover:opacity-90"
                    />
                  )}
                  <p className="label-xs mt-4 text-gold">
                    {a.category?.nom ?? "Journal"}
                    {a.publieLe ? ` · ${new Date(a.publieLe).toLocaleDateString("fr-FR")}` : ""}
                  </p>
                  <h2 className="mt-2 font-display text-2xl leading-snug">{a.titre}</h2>
                  {a.extrait && <p className="mt-2 text-sm text-muted-foreground">{a.extrait}</p>}
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
