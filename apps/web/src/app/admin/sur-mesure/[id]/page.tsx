"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api-fetch";

type DemandeDetail = {
  id: string;
  numero: string;
  nom: string;
  telephone: string;
  email: string;
  typeVetement: string;
  occasion: string | null;
  couleurs: string | null;
  tissu: string | null;
  description: string | null;
  budgetIndicatif: string | null;
  dateSouhaitee: string | null;
  inspirations: string | null;
  mesures: Record<string, string> | null;
  statut: string;
  notesInternes: string | null;
  createdAt: string;
  images: { id: string; url: string }[];
  profile: { email: string; fullName: string | null } | null;
};

const STATUTS = [
  "nouvelle",
  "en_etude",
  "devis_envoye",
  "acceptee",
  "en_confection",
  "prete",
  "livree",
  "annulee",
];

const LIBELLES: Record<string, string> = {
  nouvelle: "Nouvelle",
  en_etude: "À l'étude",
  devis_envoye: "Devis envoyé",
  acceptee: "Acceptée",
  en_confection: "En confection",
  prete: "Prête",
  livree: "Livrée",
  annulee: "Annulée",
};

const LIBELLES_MESURE: Record<string, string> = {
  poitrine: "Tour de poitrine",
  taille: "Tour de taille",
  hanches: "Tour de hanches",
  epaules: "Carrure épaules",
  longueurManche: "Longueur de manche",
  longueurRobe: "Longueur totale",
};

export default function DetailSurMesure({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [demande, setDemande] = useState<DemandeDetail | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  function charger() {
    apiFetch(`/sur-mesure/detail/${id}`)
      .then((d) => {
        setDemande(d);
        setNotes(d.notesInternes ?? "");
      })
      .catch((e) => setErreur(e.message));
  }

  useEffect(charger, [id]);

  async function changerStatut(statut: string) {
    setEnregistrement(true);
    try {
      await apiFetch(`/sur-mesure/${id}/statut`, { method: "PATCH", body: JSON.stringify({ statut, notesInternes: notes }) });
      toast.success("Statut mis à jour.");
      charger();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnregistrement(false);
    }
  }

  async function enregistrerNotes() {
    if (!demande) return;
    setEnregistrement(true);
    try {
      await apiFetch(`/sur-mesure/${id}/statut`, {
        method: "PATCH",
        body: JSON.stringify({ statut: demande.statut, notesInternes: notes }),
      });
      toast.success("Notes enregistrées.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnregistrement(false);
    }
  }

  if (erreur) return <p className="p-8 text-sm text-destructive">{erreur}</p>;
  if (!demande) return <p className="p-8 text-sm text-muted-foreground">Chargement…</p>;

  const messageWhatsapp = encodeURIComponent(
    `Bonjour ${demande.nom}, je vous contacte au sujet de votre demande ${demande.numero} chez MOKHA.`,
  );
  const telephoneWhatsapp = demande.telephone.replace(/[^0-9]/g, "");

  return (
    <div className="p-6 sm:p-10">
      <Link href="/admin/sur-mesure" className="label-xs flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Retour aux demandes
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">{demande.numero}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(demande.createdAt).toLocaleString("fr-FR")}
          </p>
        </div>
        <Select value={demande.statut} onValueChange={changerStatut} disabled={enregistrement}>
          <SelectTrigger className="w-56 rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUTS.map((s) => (
              <SelectItem key={s} value={s}>
                {LIBELLES[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <div>
            <h2 className="label-xs text-muted-foreground">Projet</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">Type de pièce</dt><dd>{demande.typeVetement}</dd></div>
              <div><dt className="text-muted-foreground">Occasion</dt><dd>{demande.occasion ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Couleurs</dt><dd>{demande.couleurs ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Tissu</dt><dd>{demande.tissu ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Budget indicatif</dt><dd>{demande.budgetIndicatif ?? "—"}</dd></div>
              <div>
                <dt className="text-muted-foreground">Date souhaitée</dt>
                <dd>{demande.dateSouhaitee ? new Date(demande.dateSouhaitee).toLocaleDateString("fr-FR") : "—"}</dd>
              </div>
            </dl>
            {demande.description && (
              <p className="mt-4 border border-border bg-secondary/30 p-4 text-sm leading-relaxed">
                {demande.description}
              </p>
            )}
          </div>

          {demande.mesures && Object.keys(demande.mesures).length > 0 && (
            <div>
              <h2 className="label-xs text-muted-foreground">Mesures transmises</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                {Object.entries(demande.mesures).map(([cle, val]) => (
                  <div key={cle} className="border border-border p-3">
                    <dt className="label-xs text-muted-foreground">{LIBELLES_MESURE[cle] ?? cle}</dt>
                    <dd className="mt-1 text-lg">{val} cm</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {demande.images.length > 0 && (
            <div>
              <h2 className="label-xs text-muted-foreground">Inspirations</h2>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {demande.images.map((img) => (
                  <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="Inspiration" className="aspect-square w-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="label-xs text-muted-foreground">Notes internes</h2>
            <p className="mt-1 text-xs text-muted-foreground">Visibles uniquement par l'équipe MOKHA.</p>
            <Textarea
              rows={5}
              value={notes}
              maxLength={2000}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 rounded-none"
            />
            <Button size="sm" disabled={enregistrement} onClick={enregistrerNotes} className="mt-3 rounded-none">
              Enregistrer les notes
            </Button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="border border-border p-5">
            <h2 className="label-xs text-muted-foreground">Cliente</h2>
            <p className="mt-2 text-sm">{demande.profile?.fullName ?? demande.nom}</p>
            <p className="text-sm text-muted-foreground">{demande.email}</p>
            <p className="text-sm text-muted-foreground">{demande.telephone}</p>
            <Button asChild size="sm" className="mt-4 w-full rounded-none">
              <a
                href={`https://wa.me/${telephoneWhatsapp}?text=${messageWhatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                Contacter sur WhatsApp
              </a>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
