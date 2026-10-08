"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api-fetch";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Adresse = { fullName: string; phone: string; line1: string; line2?: string; city: string; country: string };

type CommandeDetail = {
  id: string;
  numero: string;
  statut: string;
  sousTotal: string;
  fraisLivraison: string;
  total: string;
  contactEmail: string;
  contactPhone: string;
  notes: string | null;
  createdAt: string;
  adresseLivraison: Adresse;
  profile: { email: string; fullName: string | null } | null;
  items: {
    id: string;
    nomProduit: string;
    taille: string | null;
    couleur: string | null;
    mode: string;
    quantite: number;
    prixUnitaire: string;
  }[];
  payments: { id: string; provider: string; statut: string; montant: string }[];
};

const STATUTS_COMMANDE = [
  "nouvelle",
  "confirmee",
  "en_preparation",
  "prete",
  "expediee",
  "livree",
  "terminee",
  "annulee",
];

const LIBELLES_STATUT: Record<string, string> = {
  nouvelle: "Nouvelle",
  confirmee: "Confirmée",
  en_preparation: "En préparation",
  prete: "Prête",
  expediee: "Expédiée",
  livree: "Livrée",
  terminee: "Terminée",
  annulee: "Annulée",
};

const LIBELLES_PAIEMENT: Record<string, string> = {
  orange_money: "Orange Money",
  mtn_money: "MTN Mobile Money",
  especes: "Espèces",
};

export default function DetailCommande({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [commande, setCommande] = useState<CommandeDetail | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  function charger() {
    apiFetch(`/commandes/detail/${id}`)
      .then(setCommande)
      .catch((e) => setErreur(e.message));
  }

  useEffect(charger, [id]);

  async function changerStatut(statut: string) {
    setEnregistrement(true);
    try {
      await apiFetch(`/commandes/${id}/statut`, { method: "PATCH", body: JSON.stringify({ statut }) });
      toast.success("Statut mis à jour.");
      charger();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnregistrement(false);
    }
  }

  async function confirmerPaiement() {
    setEnregistrement(true);
    try {
      await apiFetch(`/commandes/${id}/paiement`, { method: "PATCH", body: JSON.stringify({ statut: "valide" }) });
      toast.success("Paiement marqué comme reçu.");
      charger();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnregistrement(false);
    }
  }

  if (erreur) return <p className="p-8 text-sm text-destructive">{erreur}</p>;
  if (!commande) return <p className="p-8 text-sm text-muted-foreground">Chargement…</p>;

  const paiement = commande.payments[0];

  return (
    <div className="p-6 sm:p-10">
      <Link href="/admin/commandes" className="label-xs flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Retour aux commandes
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">{commande.numero}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(commande.createdAt).toLocaleString("fr-FR")}
          </p>
        </div>
        <Select value={commande.statut} onValueChange={changerStatut} disabled={enregistrement}>
          <SelectTrigger className="w-56 rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUTS_COMMANDE.map((s) => (
              <SelectItem key={s} value={s}>
                {LIBELLES_STATUT[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h2 className="label-xs text-muted-foreground">Articles</h2>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {commande.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                <span>
                  {it.nomProduit}
                  {it.couleur ? ` · ${it.couleur}` : ""}
                  {it.taille ? ` · Taille ${it.taille}` : ""}
                  {" · "}
                  <span className="text-muted-foreground">
                    {it.mode === "sur-mesure" ? "Sur mesure" : "Prêt-à-porter"}
                  </span>
                  {" × "}
                  {it.quantite}
                </span>
                <span>{formatPrice(Number(it.prixUnitaire) * it.quantite)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span>
              <span>{formatPrice(Number(commande.sousTotal))}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison</span>
              <span>{formatPrice(Number(commande.fraisLivraison))}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-display text-lg">
              <span>Total</span>
              <span>{formatPrice(Number(commande.total))}</span>
            </div>
          </div>

          {commande.notes && (
            <div className="mt-8">
              <h2 className="label-xs text-muted-foreground">Notes de la cliente</h2>
              <p className="mt-2 border border-border bg-secondary/30 p-4 text-sm">{commande.notes}</p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="border border-border p-5">
            <h2 className="label-xs text-muted-foreground">Cliente</h2>
            <p className="mt-2 text-sm">{commande.profile?.fullName ?? "Invitée"}</p>
            <p className="text-sm text-muted-foreground">{commande.contactEmail}</p>
            <p className="text-sm text-muted-foreground">{commande.contactPhone}</p>
          </div>

          <div className="border border-border p-5">
            <h2 className="label-xs text-muted-foreground">Livraison</h2>
            <p className="mt-2 text-sm">{commande.adresseLivraison.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {commande.adresseLivraison.line1}
              {commande.adresseLivraison.line2 ? `, ${commande.adresseLivraison.line2}` : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {commande.adresseLivraison.city}, {commande.adresseLivraison.country}
            </p>
          </div>

          <div className="border border-border p-5">
            <h2 className="label-xs text-muted-foreground">Paiement</h2>
            {paiement ? (
              <>
                <p className="mt-2 text-sm">{LIBELLES_PAIEMENT[paiement.provider] ?? paiement.provider}</p>
                <p
                  className={cn(
                    "label-xs mt-1",
                    paiement.statut === "valide" ? "text-gold" : "text-muted-foreground",
                  )}
                >
                  {paiement.statut === "valide" ? "Reçu" : "En attente"}
                </p>
                {paiement.statut !== "valide" && (
                  <Button
                    size="sm"
                    disabled={enregistrement}
                    onClick={confirmerPaiement}
                    className="mt-4 w-full rounded-none"
                  >
                    Marquer comme reçu
                  </Button>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  À utiliser uniquement après vérification réelle (relevé mobile money ou espèces
                  comptées).
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Aucune information de paiement.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
