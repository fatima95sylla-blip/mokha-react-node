import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Services — MOKHA",
  description: "Confection sur mesure, stylisme, création de cérémonie et retouches par la maison MOKHA.",
};

type Service = { id: string; nom: string; description: string | null };

async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Services() {
  const services = await getServices();

  return (
    <>
      <section className="border-b border-border bg-secondary/40 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <p className="label-xs text-gold">Ce que propose la maison</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Services</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-4 py-16 sm:px-8">
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nos services sont momentanément indisponibles. Contactez-nous directement pour toute
            question.
          </p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {services.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 80} className="py-8">
                <h2 className="font-display text-2xl">{s.nom}</h2>
                {s.description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{s.description}</p>}
              </Reveal>
            ))}
          </ul>
        )}

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/sur-mesure" className="label-xs border border-foreground px-7 py-4 transition-colors hover:bg-foreground hover:text-background">
            Faire une demande sur mesure
          </Link>
          <Link href="/contact" className="label-xs border border-border px-7 py-4 transition-colors hover:border-gold">
            Nous contacter
          </Link>
        </div>
      </section>
    </>
  );
}
