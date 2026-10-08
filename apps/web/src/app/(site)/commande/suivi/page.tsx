"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/currency";
import { BASE_CURRENCY } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Commande = {
  numero: string;
  statut: string;
  sousTotal: string;
  fraisLivraison: string;
  total: string;
  createdAt: string;
  items: { id: string; nomProduit: string; taille: string | null; couleur: string | null; quantite: number; prixUnitaire: string }[];
  payments: { provider: string; statut: string }[];
};

const PARCOURS = [
  { cle: "nouvelle", label: "Reçue" },
  { cle: "confirmee", label: "Confirmée" },
  { cle: "en_preparation", label: "En préparation" },
  { cle: "prete", label: "Prête" },
  { cle: "expediee", label: "Expédiée" },
  { cle: "livree", label: "Livrée" },
  { cle: "terminee", label: "Terminée" },
];

const LIBELLES_PAIEMENT: Record<string, string> = {
  orange_money: "Orange Money",
  mtn_money: "MTN Mobile Money",
  especes: "Espèces",
};

function Suivi() {
  const params = useSearchParams();
  const [numero, setNumero] = useState(params.get("numero") ?? "");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [commande, setCommande] = useState<Commande | null>(null);
  const [recherche, setRecherche] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function chercher(n: string, e: string) {
    if (!n.trim() || !e.includes("@")) return;
    setRecherche(true);
    setErreur(null);
    setCommande(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/commandes/${encodeURIComponent(n.trim().toUpperCase())}?email=${encodeURIComponent(e.trim())}`,
      );
      if (res.status === 404) {
        setErreur("Aucune commande ne correspond à ces informations.");
        return;
      }
      if (!res.ok) throw new Error();
      setCommande(await res.json());
    } catch {
      setErreur("Le suivi est momentanément indisponible.");
    } finally {
      setRecherche(false);
    }
  }

  useEffect(() => {
    if (params.get("numero") && params.get("email")) chercher(params.get("numero")!, params.get("email")!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const annulee = commande?.statut === "annulee";
  const indexActuel = commande ? PARCOURS.findIndex((p) => p.cle === commande.statut) : -1;
  const paiement = commande?.payments[0];

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          chercher(numero, email);
        }}
        className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
      >
        <div>
          <Label htmlFor="num" className="label-xs">Numéro de commande</Label>
          <Input
            id="num"
            value={numero}
            placeholder="MK-2026-0001"
            onChange={(e) => setNumero(e.target.value)}
            className="mt-2 rounded-none"
          />
        </div>
        <div>
          <Label htmlFor="mail" className="label-xs">E-mail utilisé à la commande</Label>
          <Input
            id="mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

      {commande && (
        <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-5">
            <div>
              <p className="label-xs text-muted-foreground">Référence</p>
              <p className="mt-1 font-display text-3xl text-gold">{commande.numero}</p>
            </div>
            <div className="text-right">
              <p className="label-xs text-muted-foreground">Total</p>
              <p className="mt-1 text-sm">{formatPrice(Number(commande.total), BASE_CURRENCY)}</p>
            </div>
          </div>

          {paiement && (
            <p
              className={cn(
                "mt-6 border p-4 text-sm",
                paiement.statut === "valide"
                  ? "border-gold/40 bg-secondary/40"
                  : "border-border bg-secondary/20 text-muted-foreground",
              )}
            >
              Paiement {LIBELLES_PAIEMENT[paiement.provider] ?? paiement.provider} :{" "}
              {paiement.statut === "valide" ? "confirmé" : "en attente de confirmation"}
            </p>
          )}

          {annulee ? (
            <p className="mt-8 border border-border p-6 text-sm text-muted-foreground">
              Cette commande a été annulée. Contactez-nous si vous souhaitez plus d'informations.
            </p>
          ) : (
            <ol className="mt-10 flex flex-wrap gap-x-2 gap-y-4">
              {PARCOURS.map((p, i) => {
                const franchie = i <= indexActuel;
                return (
                  <li key={p.cle} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center border text-[10px]",
                        franchie ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className={cn("label-xs", !franchie && "text-muted-foreground")}>{p.label}</span>
                    {i < PARCOURS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
                  </li>
                );
              })}
            </ol>
          )}

          <ul className="mt-10 divide-y divide-border border-y border-border">
            {commande.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                <span>
                  {it.nomProduit}
                  {it.couleur ? ` · ${it.couleur}` : ""}
                  {it.taille ? ` · Taille ${it.taille}` : ""} × {it.quantite}
                </span>
                <span>{formatPrice(Number(it.prixUnitaire) * it.quantite, BASE_CURRENCY)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default function PageSuiviCommande() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <p className="label-xs text-gold">Commande</p>
      <h1 className="mt-4 text-4xl">Suivre ma commande</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Saisissez votre numéro de commande et l'e-mail utilisé lors de la commande.
      </p>
      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
          <Suivi />
        </Suspense>
      </div>
    </section>
  );
}
