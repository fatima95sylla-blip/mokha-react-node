"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Commande = {
  id: string;
  numero: string;
  statut: string;
  total: string;
  contactEmail: string;
  createdAt: string;
  items: { id: string }[];
};

const STATUTS = [
  { v: "", label: "Toutes" },
  { v: "nouvelle", label: "Nouvelle" },
  { v: "confirmee", label: "Confirmée" },
  { v: "en_preparation", label: "En préparation" },
  { v: "prete", label: "Prête" },
  { v: "expediee", label: "Expédiée" },
  { v: "livree", label: "Livrée" },
  { v: "terminee", label: "Terminée" },
  { v: "annulee", label: "Annulée" },
] as const;

export default function ListeCommandes() {
  const [commandes, setCommandes] = useState<Commande[] | null>(null);
  const [filtre, setFiltre] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    setCommandes(null);
    apiFetch(`/commandes${filtre ? `?statut=${filtre}` : ""}`)
      .then(setCommandes)
      .catch((e) => setErreur(e.message));
  }, [filtre]);

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl">Commandes</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUTS.map((s) => (
          <button
            key={s.v}
            onClick={() => setFiltre(s.v)}
            className={cn(
              "label-xs border px-3 py-2 transition-colors",
              filtre === s.v ? "border-foreground bg-foreground text-background" : "border-border hover:border-gold",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {erreur ? (
        <p className="mt-8 text-sm text-destructive">{erreur}</p>
      ) : commandes === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Chargement…</p>
      ) : commandes.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Aucune commande dans cette catégorie.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="label-xs border-b border-border text-left text-muted-foreground">
                <th className="py-3">Numéro</th>
                <th className="py-3">Cliente</th>
                <th className="py-3">Articles</th>
                <th className="py-3">Statut</th>
                <th className="py-3">Total</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr key={c.id} className="border-b border-border/60 hover:bg-secondary/40">
                  <td className="py-3">
                    <Link href={`/admin/commandes/${c.id}`} className="font-display text-lg text-gold hover:underline">
                      {c.numero}
                    </Link>
                  </td>
                  <td className="py-3">{c.contactEmail}</td>
                  <td className="py-3">{c.items.length}</td>
                  <td className="py-3">
                    <span className="label-xs">{c.statut}</span>
                  </td>
                  <td className="py-3">{formatPrice(Number(c.total))}</td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
