"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth";
import { useBoutique } from "@/lib/boutique-store";
import { formatPrice } from "@/lib/currency";
import { BRAND } from "@/data/mokha";
import { cn } from "@/lib/utils";

const ETAPES = ["Informations", "Livraison", "Paiement", "Confirmation"];

const OPTIONS_LIVRAISON = [
  { v: "retrait", label: "Retrait à l'atelier", texte: "Gratuit · Petit Simbaya, Conakry", prix: 0 },
  { v: "conakry", label: "Livraison à Conakry", texte: "Sous 2 à 4 jours ouvrés", prix: 30000 },
  {
    v: "hors-conakry",
    label: "Livraison hors Conakry",
    texte: "Frais confirmés par la maison après validation",
    prix: null,
  },
] as const;

const OPTIONS_PAIEMENT = [
  { v: "orange_money", label: "Orange Money" },
  { v: "mtn_money", label: "MTN Mobile Money" },
  { v: "especes", label: "Espèces à la livraison / au retrait" },
] as const;

type CommandeCreee = {
  numero: string;
  total: string;
};

export default function Commande() {
  const { lignes, sousTotal, devise, viderPanier } = useBoutique();
  const { session, profil } = useAuth();

  const [etape, setEtape] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [commande, setCommande] = useState<CommandeCreee | null>(null);

  // Étape 1 — informations
  const [email, setEmail] = useState(profil?.email ?? "");
  const [telephone, setTelephone] = useState(profil?.phone ?? "");
  const [notes, setNotes] = useState("");

  // Étape 2 — livraison
  const [livraison, setLivraison] = useState<(typeof OPTIONS_LIVRAISON)[number]["v"]>("conakry");
  const [nomComplet, setNomComplet] = useState(profil?.fullName ?? "");
  const [ligne1, setLigne1] = useState("");
  const [ligne2, setLigne2] = useState("");
  const [ville, setVille] = useState("Conakry");

  // Étape 3 — paiement
  const [paiement, setPaiement] = useState<(typeof OPTIONS_PAIEMENT)[number]["v"]>("orange_money");

  const optionLivraison = OPTIONS_LIVRAISON.find((o) => o.v === livraison)!;
  const fraisLivraison = optionLivraison.prix ?? 0;
  const total = sousTotal + fraisLivraison;

  if (lignes.length === 0 && !commande) {
    return (
      <section className="mx-auto max-w-lg px-4 py-24 text-center sm:px-8">
        <h1 className="text-3xl">Votre panier est vide</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ajoutez des pièces avant de passer commande.
        </p>
        <Button asChild className="mt-8 rounded-none">
          <Link href="/boutique">Découvrir la boutique</Link>
        </Button>
      </section>
    );
  }

  function validerEtape(): string | null {
    if (etape === 0) {
      if (!email.includes("@")) return "Merci d'indiquer une adresse e-mail valide.";
      if (telephone.trim().length < 6) return "Merci d'indiquer un numéro de téléphone.";
    }
    if (etape === 1) {
      if (nomComplet.trim().length < 2) return "Merci d'indiquer le nom du destinataire.";
      if (livraison !== "retrait" && ligne1.trim().length < 3)
        return "Merci d'indiquer votre adresse de livraison.";
      if (livraison !== "retrait" && ville.trim().length < 2) return "Merci d'indiquer votre ville.";
    }
    return null;
  }

  function suivant() {
    const p = validerEtape();
    if (p) return setErreur(p);
    setErreur(null);
    setEtape((e) => e + 1);
  }

  async function confirmer() {
    setErreur(null);
    setEnvoi(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/commandes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          lignes: lignes.map((l) => ({
            slug: l.slug,
            taille: l.taille,
            couleur: l.couleur,
            mode: l.mode,
            quantite: l.quantite,
          })),
          adresseLivraison: {
            fullName: nomComplet.trim(),
            phone: telephone.trim(),
            line1: livraison === "retrait" ? BRAND.adresse : ligne1.trim(),
            line2: ligne2.trim() || undefined,
            city: livraison === "retrait" ? "Conakry" : ville.trim(),
            country: "Guinée",
          },
          livraison,
          paiement,
          contactEmail: email.trim(),
          contactPhone: telephone.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setErreur(
          `Certaines pièces ne sont plus disponibles : ${data.indisponibles?.join(", ")}. Merci d'ajuster votre panier.`,
        );
        return;
      }
      if (!res.ok) throw new Error();

      const data = (await res.json()) as CommandeCreee;
      setCommande(data);
      viderPanier();
      setEtape(3);
    } catch {
      setErreur("La commande n'a pas pu être enregistrée. Merci de réessayer.");
    } finally {
      setEnvoi(false);
    }
  }

  // ---------- CONFIRMATION ----------
  if (commande) {
    const messageWhatsapp = encodeURIComponent(
      `Bonjour MOKHA, je viens de passer la commande ${commande.numero} (${formatPrice(Number(commande.total), devise)}), réglée par ${OPTIONS_PAIEMENT.find((o) => o.v === paiement)?.label}. Merci de me confirmer les coordonnées de paiement.`,
    );
    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center sm:px-8">
        <div className="mx-auto grid h-14 w-14 place-items-center border border-gold text-gold">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="mt-8 text-3xl">Commande enregistrée</h1>
        <div className="mt-8 border border-gold/40 bg-secondary/40 p-6">
          <p className="label-xs text-muted-foreground">Référence</p>
          <p className="mt-2 font-display text-3xl text-gold">{commande.numero}</p>
          <p className="mt-3 text-sm">{formatPrice(Number(commande.total), devise)}</p>
        </div>

        <div className="mt-8 border border-border p-6 text-left text-sm leading-relaxed text-muted-foreground">
          <p className="label-xs mb-2 text-foreground">Prochaine étape — paiement</p>
          Votre commande est enregistrée mais <strong className="text-foreground">pas encore payée</strong>.
          La maison vous contacte sur WhatsApp pour vous communiquer les coordonnées de paiement
          ({OPTIONS_PAIEMENT.find((o) => o.v === paiement)?.label}) et confirmer votre commande dès
          réception du règlement.
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-none">
            <a
              href={`https://wa.me/${BRAND.whatsapp}?text=${messageWhatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Écrire sur WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-none">
            <Link href={`/commande/suivi?numero=${commande.numero}&email=${encodeURIComponent(email)}`}>
              Suivre ma commande
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1000px] px-4 py-16 sm:px-8">
      <p className="label-xs text-gold">Commande</p>
      <h1 className="mt-4 text-4xl">Finaliser ma commande</h1>

      <ol className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-5">
        {ETAPES.map((e, i) => (
          <li
            key={e}
            className={cn(
              "label-xs flex items-center gap-2",
              i === etape ? "text-gold" : i < etape ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "grid h-6 w-6 place-items-center border text-[10px]",
                i === etape ? "border-gold" : i < etape ? "border-foreground" : "border-border",
              )}
            >
              {i < etape ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {e}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {etape === 0 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="email" className="label-xs">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 rounded-none"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tel" className="label-xs">Téléphone / WhatsApp</Label>
                <Input
                  id="tel"
                  type="tel"
                  placeholder="+224 6XX XX XX XX"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="mt-2 rounded-none"
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes" className="label-xs">
                  Notes <span className="text-muted-foreground">(facultatif)</span>
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  maxLength={1000}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Précisions utiles pour votre commande…"
                  className="mt-2 rounded-none"
                />
              </div>
              {!session && (
                <p className="border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                  Vous commandez en tant qu'invitée.{" "}
                  <Link href="/connexion?suite=/commande" className="text-gold hover:underline">
                    Connectez-vous
                  </Link>{" "}
                  pour retrouver cette commande dans votre espace.
                </p>
              )}
            </div>
          )}

          {etape === 1 && (
            <div className="space-y-6">
              <RadioGroup value={livraison} onValueChange={(v) => setLivraison(v as typeof livraison)}>
                {OPTIONS_LIVRAISON.map((o) => (
                  <label
                    key={o.v}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                      livraison === o.v ? "border-gold bg-secondary/60" : "border-border hover:border-gold",
                    )}
                  >
                    <RadioGroupItem value={o.v} className="mt-1" />
                    <span className="flex-1">
                      <span className="label-xs block">{o.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{o.texte}</span>
                    </span>
                    <span className="label-xs shrink-0">
                      {o.prix === null ? "À confirmer" : o.prix === 0 ? "Gratuit" : formatPrice(o.prix, devise)}
                    </span>
                  </label>
                ))}
              </RadioGroup>

              {livraison === "retrait" ? (
                <p className="border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                  Retrait à l'atelier : {BRAND.adresse}. {BRAND.horaires}.
                </p>
              ) : (
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="nom" className="label-xs">Nom du destinataire</Label>
                    <Input
                      id="nom"
                      value={nomComplet}
                      onChange={(e) => setNomComplet(e.target.value)}
                      className="mt-2 rounded-none"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="l1" className="label-xs">Adresse</Label>
                    <Input
                      id="l1"
                      value={ligne1}
                      onChange={(e) => setLigne1(e.target.value)}
                      placeholder="Quartier, secteur, points de repère"
                      className="mt-2 rounded-none"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="l2" className="label-xs">
                      Complément <span className="text-muted-foreground">(facultatif)</span>
                    </Label>
                    <Input
                      id="l2"
                      value={ligne2}
                      onChange={(e) => setLigne2(e.target.value)}
                      className="mt-2 rounded-none"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ville" className="label-xs">Ville</Label>
                    <Input
                      id="ville"
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      className="mt-2 max-w-xs rounded-none"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {etape === 2 && (
            <div className="space-y-6">
              <RadioGroup value={paiement} onValueChange={(v) => setPaiement(v as typeof paiement)}>
                {OPTIONS_PAIEMENT.map((o) => (
                  <label
                    key={o.v}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 border p-4 transition-colors",
                      paiement === o.v ? "border-gold bg-secondary/60" : "border-border hover:border-gold",
                    )}
                  >
                    <RadioGroupItem value={o.v} />
                    <span className="label-xs">{o.label}</span>
                  </label>
                ))}
              </RadioGroup>
              <p className="border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
                Aucun paiement n'est prélevé maintenant. Après validation, la maison vous contacte
                sur WhatsApp pour vous communiquer les coordonnées de paiement et confirmer votre
                commande dès réception du règlement.
              </p>
            </div>
          )}

          {erreur && (
            <p role="alert" className="mt-6 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {erreur}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {etape > 0 && (
              <Button type="button" variant="outline" className="rounded-none" onClick={() => setEtape((e) => e - 1)}>
                Retour
              </Button>
            )}
            {etape < 2 ? (
              <Button type="button" className="rounded-none px-8" onClick={suivant}>
                Continuer
              </Button>
            ) : (
              <Button type="button" disabled={envoi} className="rounded-none px-8" onClick={confirmer}>
                {envoi ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi…
                  </>
                ) : (
                  "Confirmer la commande"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* RÉCAPITULATIF */}
        <aside className="h-fit border border-border p-6">
          <p className="label-xs text-muted-foreground">Récapitulatif</p>
          <ul className="mt-4 space-y-3">
            {lignes.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  {l.nom} × {l.quantite}
                </span>
                <span className="shrink-0">{formatPrice(l.prixUnitaire * l.quantite, devise)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span>
              <span>{formatPrice(sousTotal, devise)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison</span>
              <span>
                {optionLivraison.prix === null
                  ? "À confirmer"
                  : optionLivraison.prix === 0
                    ? "Gratuit"
                    : formatPrice(optionLivraison.prix, devise)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-display text-lg text-foreground">
              <span>Total</span>
              <span>{formatPrice(total, devise)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
