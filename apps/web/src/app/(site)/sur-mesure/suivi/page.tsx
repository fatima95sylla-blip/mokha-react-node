"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Demande = {
  numero: string;
  statut: string;
  typeVetement: string;
  dateSouhaitee: string | null;
};

// Le parcours métier d'une demande, dans l'ordre. `annulee` est traité à part
// car ce n'est pas une étape du parcours mais une sortie.
const PARCOURS = [
  { cle: "nouvelle", label: "Demande reçue", texte: "Votre projet nous est parvenu." },
  { cle: "en_etude", label: "À l'étude", texte: "Fatoumata étudie votre projet." },
  { cle: "devis_envoye", label: "Proposition envoyée", texte: "Une proposition vous a été transmise." },
  { cle: "acceptee", label: "Projet validé", texte: "Votre pièce entre en préparation." },
  { cle: "en_confection", label: "En confection", texte: "Votre pièce est en cours de réalisation." },
  { cle: "prete", label: "Prête", texte: "Votre pièce vous attend à l'atelier." },
  { cle: "livree", label: "Livrée", texte: "Votre pièce vous a été remise." },
];

function Suivi() {
  const params = useSearchParams();
  const [numero, setNumero] = useState(params.get("numero") ?? "");
  const [demande, setDemande] = useState<Demande | null>(null);
  const [recherche, setRecherche] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function chercher(ref: string) {
    const propre = ref.trim().toUpperCase();
    if (!propre) return;

    setRecherche(true);
    setErreur(null);
    setDemande(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sur-mesure/${encodeURIComponent(propre)}`,
      );
      if (res.status === 404) {
        setErreur("Aucune demande ne correspond à cette référence.");
        return;
      }
      if (!res.ok) throw new Error();
      setDemande(await res.json());
    } catch {
      setErreur("Le suivi est momentanément indisponible. Merci de réessayer.");
    } finally {
      setRecherche(false);
    }
  }

  // Recherche automatique si l'on arrive depuis la confirmation d'envoi.
  useEffect(() => {
    const initial = params.get("numero");
    if (initial) chercher(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const indexActuel = demande ? PARCOURS.findIndex((p) => p.cle === demande.statut) : -1;
  const annulee = demande?.statut === "annulee";

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          chercher(numero);
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="min-w-0 flex-1">
          <Label htmlFor="ref" className="label-xs">Référence de votre demande</Label>
          <Input
            id="ref"
            value={numero}
            maxLength={20}
            placeholder="SM-2026-0001"
            onChange={(e) => setNumero(e.target.value)}
            className="mt-2 rounded-none"
          />
        </div>
        <Button type="submit" disabled={recherche} className="rounded-none py-6">
          {recherche ? "Recherche…" : "Suivre"}
        </Button>
      </form>

      {erreur && (
        <p role="alert" className="mt-8 border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {erreur}
        </p>
      )}

      {demande && (
        <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-5">
            <div>
              <p className="label-xs text-muted-foreground">Référence</p>
              <p className="mt-1 font-display text-3xl text-gold">{demande.numero}</p>
            </div>
            <div className="text-right">
              <p className="label-xs text-muted-foreground">Pièce</p>
              <p className="mt-1 text-sm">{demande.typeVetement}</p>
            </div>
          </div>

          {annulee ? (
            <p className="mt-8 border border-border p-6 text-sm text-muted-foreground">
              Cette demande a été annulée. N'hésitez pas à nous contacter si vous souhaitez la
              relancer ou en formuler une nouvelle.
            </p>
          ) : (
            <ol className="mt-10">
              {PARCOURS.map((p, i) => {
                const franchie = i <= indexActuel;
                const courante = i === indexActuel;
                return (
                  <li key={p.cle} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center border text-xs",
                          courante
                            ? "border-gold bg-gold text-ink"
                            : franchie
                              ? "border-foreground bg-foreground text-background"
                              : "border-border text-muted-foreground",
                        )}
                      >
                        {i + 1}
                      </span>
                      {i < PARCOURS.length - 1 && (
                        <span
                          className={cn(
                            "mt-1 w-px flex-1",
                            franchie ? "bg-foreground" : "bg-border",
                          )}
                        />
                      )}
                    </div>
                    <div className={cn("pb-2", !franchie && "opacity-50")}>
                      <p className={cn("font-display text-xl", courante && "text-gold")}>{p.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{p.texte}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </>
  );
}

export default function PageSuivi() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <p className="label-xs text-gold">Sur mesure</p>
      <h1 className="mt-4 text-4xl">Suivre ma demande</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Saisissez la référence qui vous a été communiquée lors de votre demande.
      </p>
      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
          <Suivi />
        </Suspense>
      </div>
    </section>
  );
}
