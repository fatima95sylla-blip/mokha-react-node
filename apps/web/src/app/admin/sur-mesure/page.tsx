"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { cn } from "@/lib/utils";

type Demande = {
  id: string;
  numero: string;
  nom: string;
  typeVetement: string;
  statut: string;
  createdAt: string;
};

const STATUTS = [
  { v: "", label: "Toutes" },
  { v: "nouvelle", label: "Nouvelle" },
  { v: "en_etude", label: "À l'étude" },
  { v: "devis_envoye", label: "Devis envoyé" },
  { v: "acceptee", label: "Acceptée" },
  { v: "en_confection", label: "En confection" },
  { v: "prete", label: "Prête" },
  { v: "livree", label: "Livrée" },
  { v: "annulee", label: "Annulée" },
] as const;

const LIBELLES: Record<string, string> = Object.fromEntries(STATUTS.filter((s) => s.v).map((s) => [s.v, s.label]));

export default function ListeSurMesure() {
  const [demandes, setDemandes] = useState<Demande[] | null>(null);
  const [filtre, setFiltre] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    setDemandes(null);
    apiFetch("/sur-mesure")
      .then((data: Demande[]) => setDemandes(filtre ? data.filter((d) => d.statut === filtre) : data))
      .catch((e) => setErreur(e.message));
  }, [filtre]);

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl">Demandes sur mesure</h1>

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
      ) : demandes === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Chargement…</p>
      ) : demandes.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Aucune demande dans cette catégorie.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {demandes.map((d) => (
            <li key={d.id}>
              <Link
                href={`/admin/sur-mesure/${d.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm hover:bg-secondary/40"
              >
                <span>
                  <span className="block font-display text-lg text-gold">{d.numero}</span>
                  <span className="text-xs text-muted-foreground">{d.nom} · {d.typeVetement}</span>
                </span>
                <span className="text-right">
                  <span className="label-xs block">{LIBELLES[d.statut] ?? d.statut}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
