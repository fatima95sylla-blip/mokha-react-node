import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Article = {
  id: string;
  slug: string;
  titre: string;
  extrait: string | null;
  contenu: string | null;
  imageUrl: string | null;
  publieLe: string | null;
  category: { nom: string } | null;
  similaires: { slug: string; titre: string; imageUrl: string | null }[];
};

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article introuvable — MOKHA", robots: { index: false } };
  return {
    title: `${article.titre} — MOKHA`,
    description: article.extrait ?? undefined,
  };
}

export default async function ArticleJournal({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        <nav className="label-xs text-muted-foreground">
          <Link href="/" className="hover:text-gold">Accueil</Link> ·{" "}
          <Link href="/journal" className="hover:text-gold">Journal</Link>
        </nav>
        <p className="label-xs mt-6 text-gold">
          {article.category?.nom ?? "Journal"}
          {article.publieLe ? ` · ${new Date(article.publieLe).toLocaleDateString("fr-FR")}` : ""}
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{article.titre}</h1>
      </section>

      {article.imageUrl && (
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.imageUrl} alt={article.titre} className="aspect-[16/9] w-full object-cover" />
        </div>
      )}

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        {(article.contenu ?? "").split("\n\n").map((paragraphe, i) => (
          <p key={i} className="mt-5 text-sm leading-relaxed text-muted-foreground first:mt-0">
            {paragraphe}
          </p>
        ))}
      </article>

      {article.similaires.length > 0 && (
        <section className="mx-auto max-w-[1400px] border-t border-border px-4 py-16 sm:px-8">
          <h2 className="text-2xl">À lire aussi</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {article.similaires.map((a) => (
              <Link key={a.slug} href={`/journal/${a.slug}`} className="group block">
                {a.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.imageUrl} alt={a.titre} className="aspect-[4/3] w-full object-cover transition-opacity group-hover:opacity-90" />
                )}
                <h3 className="mt-3 font-display text-xl">{a.titre}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
