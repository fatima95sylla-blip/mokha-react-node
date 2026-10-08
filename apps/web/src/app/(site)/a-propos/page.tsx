import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/site";
import { BRAND, images } from "@/data/mokha";

export const metadata: Metadata = {
  title: "La Maison — MOKHA",
  description: "L'histoire de MOKHA et de sa fondatrice Fatoumata Sylla, styliste et modéliste diplômée.",
};

export default function APropos() {
  return (
    <>
      <section className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images.fondatrice} alt="Fatoumata Sylla" className="h-[60vh] min-h-[420px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-[1400px] text-ivory">
            <p className="label-xs text-gold">La Maison</p>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl">MOKHA, Maison de Création</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-8">
        <Reveal>
          <p className="label-xs text-gold">Fondatrice</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">{BRAND.fondatrice}</h2>
          <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              Styliste et modéliste diplômée, {BRAND.fondatrice} fonde MOKHA dans le prolongement
              d'un héritage familial de couture. Les premières pièces sont cousues pour les femmes
              de sa famille, à l'occasion des fêtes et des grandes étapes de la vie.
            </p>
            <p>
              Sa formation lui donne la rigueur du patronage et de la coupe ; son histoire familiale
              lui donne le sens du geste transmis. MOKHA naît de cette rencontre : des pièces
              contemporaines, construites avec les méthodes du sur-mesure traditionnel.
            </p>
            <p>
              Installée à Conakry, la maison confectionne aujourd'hui pour des clientes en Guinée et
              au-delà, sans changer de méthode : peu de pièces, beaucoup de soin, une attention
              portée à chaque essayage.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-border bg-secondary/40 px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <SectionTitle
            surtitre="Notre vision"
            titre="Une élégance qui se transmet"
            texte="MOKHA rassemble quatre exigences : l'élégance, la féminité, le savoir-faire et l'authenticité. Chaque collection cherche l'équilibre entre l'héritage et une allure résolument contemporaine."
          />
        </div>
      </section>
    </>
  );
}
