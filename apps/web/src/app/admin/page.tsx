"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, Scissors, Store, TrendingUp, Users } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import { formatPrice } from "@/lib/currency";

type Stats = {
  nbCommandesNouvelles: number;
  nbSurMesureEnAttente: number;
  nbProduits: number;
  nbClientes: number;
  chiffreAffaires: number;
  chiffreAffairesMois: number;
  commandesRecentes: { id: string; numero: string; statut: string; total: string; contactEmail: string }[];
  demandesRecentes: { id: string; numero: string; statut: string; typeVetement: string; nom: string }[];
};

const LIBELLES_STATUT: Record<string, string> = {
  nouvelle: "Nouvelle",
  confirmee: "Confirmée",
  en_preparation: "En préparation",
  prete: "Prête",
  expediee: "Expédiée",
  livree: "Livrée",
  terminee: "Terminée",
  annulee: "Annulée",
  en_etude: "À l'étude",
  devis_envoye: "Devis envoyé",
  acceptee: "Acceptée",
  en_confection: "En confection",
};

function Carte({ icone: Icon, label, valeur, lien }: { icone: typeof Package; label: string; valeur: string; lien?: string }) {
  const contenu = (
    <div className="border border-border bg-background p-6 transition-colors hover:border-gold">
      <Icon className="h-5 w-5 text-gold" />
      <p className="mt-4 font-display text-3xl">{valeur}</p>
      <p className="label-xs mt-1 text-muted-foreground">{label}</p>
    </div>
  );
  return lien ? <Link href={lien}>{contenu}</Link> : contenu;
}

export default function TableauDeBord() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/admin/stats")
      .then(setStats)
      .catch((e) => setErreur(e.message));
  }, []);

  if (erreur) {
    return <p className="p-8 text-sm text-destructive">{erreur}</p>;
  }
  if (!stats) {
    return <p className="p-8 text-sm text-muted-foreground">Chargement…</p>;
  }

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl">Tableau de bord</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Carte icone={TrendingUp} label="Chiffre d'affaires (ce mois)" valeur={formatPrice(stats.chiffreAffairesMois)} />
        <Carte icone={Package} label="Commandes à traiter" valeur={String(stats.nbCommandesNouvelles)} lien="/admin/commandes" />
        <Carte icone={Scissors} label="Demandes sur mesure en attente" valeur={String(stats.nbSurMesureEnAttente)} lien="/admin/sur-mesure" />
        <Carte icone={Users} label="Clientes" valeur={String(stats.nbClientes)} lien="/admin/clientes" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="label-xs text-muted-foreground">Commandes récentes</h2>
            <Link href="/admin/commandes" className="label-xs text-gold hover:underline">Tout voir</Link>
          </div>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {stats.commandesRecentes.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground">Aucune commande pour le moment.</li>
            )}
            {stats.commandesRecentes.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/commandes/${c.id}`} className="flex items-center justify-between gap-3 py-4 text-sm hover:text-gold">
                  <span>
                    <span className="block font-display text-lg">{c.numero}</span>
                    <span className="text-xs text-muted-foreground">{c.contactEmail}</span>
                  </span>
                  <span className="text-right">
                    <span className="label-xs block text-gold">{LIBELLES_STATUT[c.statut] ?? c.statut}</span>
                    <span className="text-xs">{formatPrice(Number(c.total))}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="label-xs text-muted-foreground">Demandes sur mesure récentes</h2>
            <Link href="/admin/sur-mesure" className="label-xs text-gold hover:underline">Tout voir</Link>
          </div>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {stats.demandesRecentes.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground">Aucune demande pour le moment.</li>
            )}
            {stats.demandesRecentes.map((d) => (
              <li key={d.id}>
                <Link href={`/admin/sur-mesure/${d.id}`} className="flex items-center justify-between gap-3 py-4 text-sm hover:text-gold">
                  <span>
                    <span className="block font-display text-lg">{d.numero}</span>
                    <span className="text-xs text-muted-foreground">{d.nom} · {d.typeVetement}</span>
                  </span>
                  <span className="label-xs text-gold">{LIBELLES_STATUT[d.statut] ?? d.statut}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
