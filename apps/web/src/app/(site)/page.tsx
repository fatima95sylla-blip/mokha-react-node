import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Lookbook } from "@/components/Lookbook";
import { ProductCard, SectionTitle } from "@/components/site";
import { BRAND, images, processusSurMesure } from "@/data/mokha";
import { getCollections, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "MOKHA — Maison de Création",
  description:
    "Collections féminines et confection sur mesure imaginées par Fatoumata Sylla, styliste et modéliste diplômée.",
};

type ArticleTeaser = {
  id: string;
  slug: string;
  titre: string;
  extrait: string | null;
  imageUrl: string | null;
  category: { nom: string } | null;
};

async function getArticlesRecents(): Promise<ArticleTeaser[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const tous = (await res.json()) as ArticleTeaser[];
    return tous.slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Accueil() {
  const [produits, collections, articles] = await Promise.all([
    getProducts(),
    getCollections(),
    getArticlesRecents(),
  ]);
  const signatures = [...produits].sort((a, b) => b.populaire - a.populaire).slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images.hero}
          alt="Création MOKHA en soie ivoire brodée d'or"
          width={1600}
          height={1008}
          className="h-[78vh] min-h-[520px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
            <div className="max-w-xl text-ivory">
              <p className="label-xs text-gold">{BRAND.baseline}</p>
              <h1 className="mt-5 text-5xl leading-[1.02] sm:text-6xl md:text-7xl">
                L'élégance
                <br />
                se transmet
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/80">
                Collections féminines et confection sur mesure imaginées par {BRAND.fondatrice},
                styliste et modéliste. Chaque pièce est coupée à l'atelier, à la main.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/collections"
                  className="label-xs border border-gold bg-gold px-7 py-4 text-ink transition-colors hover:bg-transparent hover:text-gold"
                >
                  Découvrir la collection
                </Link>
                <Link
                  href="/sur-mesure"
                  className="label-xs border border-ivory/50 px-7 py-4 transition-colors hover:border-gold hover:text-gold"
                >
                  Créer sur mesure
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTE */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-8 md:py-28">
        <Reveal>
          <div className="hairline mx-auto w-24" />
          <p className="mt-8 font-display text-2xl leading-relaxed sm:text-3xl">
            « Je ne dessine pas des vêtements, je dessine des femmes qui entrent dans une pièce. »
          </p>
          <p className="label-xs mt-6 text-muted-foreground">{BRAND.fondatrice}, fondatrice</p>
        </Reveal>
      </section>

      {/* COLLECTIONS */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <SectionTitle surtitre="Les collections" titre="Trois univers, une même exigence" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {collections.map((c, i) => (
            <Reveal key={c.slug} delay={i * 110}>
              <Link href={`/collections/${c.slug}`} className="group block">
                <div className="overflow-hidden bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.imageUrl ?? ""}
                    alt={c.nom}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                </div>
                <p className="label-xs mt-4 text-gold">{c.saison}</p>
                <h3 className="mt-2 font-display text-2xl">{c.nom}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.accroche}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="py-20 md:py-28">
        <Lookbook produits={produits} />
      </div>

      {/* SIGNATURES */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
          <SectionTitle surtitre="Créations signatures" titre="Les pièces que l'on garde" />
          <Link href="/boutique" className="label-xs text-gold hover:text-foreground">
            Toute la boutique →
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {signatures.map((p, i) => (
            <ProductCard key={p.id} produit={p} index={i} />
          ))}
        </div>
      </section>

      {/* SUR MESURE */}
      <section className="mt-24 border-y border-border bg-secondary/50 py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <SectionTitle
            surtitre="Votre pièce, votre histoire"
            titre="La confection sur mesure, étape par étape"
            texte="De la première inspiration à la remise de votre pièce sous housse, cinq temps qui vous appartiennent."
          />
          <ol className="mt-14 grid gap-8 md:grid-cols-5">
            {processusSurMesure.map((e, i) => (
              <Reveal as="li" key={e.n} delay={i * 90}>
                <p className="font-display text-4xl text-gold">{e.n}</p>
                <div className="hairline my-4 w-12" />
                <h3 className="font-display text-xl">{e.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.texte}</p>
              </Reveal>
            ))}
          </ol>
          <div className="mt-12">
            <Link
              href="/sur-mesure"
              className="label-xs inline-flex border border-foreground px-7 py-4 transition-colors hover:bg-foreground hover:text-background"
            >
              Commencer mon projet
            </Link>
          </div>
        </div>
      </section>

      {/* SAVOIR-FAIRE */}
      <section className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-24 sm:px-8 lg:grid-cols-2">
        <Reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images.atelier1} alt="Atelier MOKHA" loading="lazy" className="w-full object-cover" />
        </Reveal>
        <Reveal delay={120}>
          <SectionTitle
            surtitre="Savoir-faire"
            titre="Le modélisme comme point de départ"
            texte="Fatoumata Sylla construit chaque patron à plat avant de le corriger sur mannequin. C'est ce travail invisible qui donne aux pièces MOKHA leur tombé si particulier."
          />
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li>— Patronage sur mesure et essayages intermédiaires</li>
            <li>— Ourlets, boutonnières et finitions réalisés à la main</li>
            <li>— Tissus sélectionnés pièce par pièce : soie, bazin riche, jacquard, wax premium</li>
          </ul>
          <Link href="/atelier" className="label-xs mt-8 inline-block text-gold hover:text-foreground">
            Entrer dans l'atelier →
          </Link>
        </Reveal>
      </section>

      {/* HISTOIRE */}
      <section className="bg-ink py-24 text-ivory">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.fondatrice}
              alt="Fatoumata Sylla dans son atelier"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </Reveal>
          <Reveal delay={120}>
            <p className="label-xs text-gold">Notre histoire</p>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl">Une maison de famille</h2>
            <p className="mt-6 text-sm leading-relaxed text-ivory/70">
              MOKHA naît de la rencontre entre un héritage familial de couture et une formation
              rigoureuse en stylisme et modélisme. Les premières pièces ont été cousues pour les
              femmes de la famille, à l'occasion des fêtes.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70">
              Aujourd'hui la maison habille des clientes à Dakar, Abidjan, Paris et Montréal, sans
              rien changer à sa méthode : peu de pièces, beaucoup de soin.
            </p>
            <Link href="/a-propos" className="label-xs mt-8 inline-block text-gold hover:text-ivory">
              Découvrir la Maison →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* JOURNAL */}
      <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-8">
        <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
          <SectionTitle surtitre="Le Journal" titre="Écrits de la maison" />
          <Link href="/journal" className="label-xs text-gold hover:text-foreground">
            Tous les articles →
          </Link>
        </div>
        {articles.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">Aucun article publié pour le moment.</p>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal as="article" key={a.id} delay={i * 110}>
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
                  <p className="label-xs mt-4 text-gold">{a.category?.nom ?? "Journal"}</p>
                  <h3 className="mt-2 font-display text-2xl leading-snug">{a.titre}</h3>
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
