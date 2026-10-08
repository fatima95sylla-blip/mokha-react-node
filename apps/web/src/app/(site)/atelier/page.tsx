import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { images, etapesAtelier, BRAND } from "@/data/mokha";

export const metadata: Metadata = {
  title: "L'Atelier — MOKHA",
  description: "Du croquis à la pièce finie : le savoir-faire de l'atelier MOKHA, à Conakry.",
};

export default function Atelier() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <p className="label-xs text-gold">Savoir-faire</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">L'Atelier</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Chaque pièce MOKHA suit le même chemin, du crayon à la housse de livraison. Voici ce
            travail, habituellement invisible.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-8">
        <Reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images.atelier1} alt="Atelier MOKHA" className="aspect-[16/9] w-full object-cover" />
        </Reveal>

        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {etapesAtelier.map((e, i) => (
            <Reveal as="li" key={e.titre} delay={i * 90}>
              <p className="font-display text-4xl text-gold">{String(i + 1).padStart(2, "0")}</p>
              <div className="hairline my-4 w-12" />
              <h2 className="font-display text-xl">{e.titre}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.texte}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="border-t border-border bg-ink px-4 py-16 text-ivory sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-2xl leading-relaxed sm:text-3xl">
            « Le geste ne change pas. C'est le regard qu'on lui porte qui rend une pièce
            intemporelle. »
          </p>
          <p className="label-xs mt-6 text-gold">{BRAND.fondatrice}</p>
        </div>
      </section>
    </>
  );
}
