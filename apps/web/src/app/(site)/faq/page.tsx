import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Questions fréquentes — MOKHA",
  description: "Livraison, sur mesure, paiement, retours : les réponses aux questions les plus fréquentes.",
};

type FaqItem = { id: string; question: string; reponse: string };

async function getFaq(): Promise<FaqItem[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faq`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Faq() {
  const faqs = await getFaq();

  return (
    <>
      <section className="border-b border-border bg-secondary/40 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-[1000px]">
          <p className="label-xs text-gold">Besoin d'aide</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Questions fréquentes</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-4 py-16 sm:px-8">
        {faqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            La FAQ est momentanément indisponible. Contactez-nous directement pour toute question.
          </p>
        ) : (
          <Accordion type="single" collapsible>
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left font-display text-lg">{f.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.reponse}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </>
  );
}
