"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import {
  envoyerInspirations,
  validerFichier,
  NB_MAX_FICHIERS,
  type ResultatUpload,
} from "@/lib/upload";
import { cn } from "@/lib/utils";

const TYPES_VETEMENT = [
  "Robe de cérémonie",
  "Robe de soirée",
  "Ensemble",
  "Grand boubou",
  "Kaftan",
  "Tailleur",
  "Jupe",
  "Autre",
];

const OCCASIONS = ["Mariage", "Baptême", "Fête religieuse", "Soirée", "Cérémonie", "Quotidien", "Autre"];

const ETAPES = ["Votre projet", "Style & matières", "Mesures", "Vos coordonnées"];

type Mesures = Record<string, string>;

const CHAMPS_MESURES = [
  { cle: "poitrine", label: "Tour de poitrine" },
  { cle: "taille", label: "Tour de taille" },
  { cle: "hanches", label: "Tour de hanches" },
  { cle: "epaules", label: "Carrure épaules" },
  { cle: "longueurManche", label: "Longueur de manche" },
  { cle: "longueurRobe", label: "Longueur totale souhaitée" },
];

function Formulaire() {
  const { session } = useAuth();
  const params = useSearchParams();

  const [etape, setEtape] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [numero, setNumero] = useState<string | null>(null);

  // Étape 1
  const [typeVetement, setTypeVetement] = useState(TYPES_VETEMENT[0]!);
  const [occasion, setOccasion] = useState(OCCASIONS[0]!);
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [description, setDescription] = useState(
    params.get("piece") ? `Je souhaite une pièce inspirée de « ${params.get("piece")} ».` : "",
  );

  // Étape 2
  const [couleurs, setCouleurs] = useState("");
  const [tissu, setTissu] = useState("");
  const [budget, setBudget] = useState("");
  const [fichiers, setFichiers] = useState<File[]>([]);

  // Étape 3
  const [mesures, setMesures] = useState<Mesures>({});

  // Étape 4
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  function ajouterFichiers(liste: FileList | null) {
    if (!liste) return;
    const nouveaux = Array.from(liste);
    for (const f of nouveaux) {
      const probleme = validerFichier(f);
      if (probleme) {
        toast.error(probleme);
        return;
      }
    }
    const total = [...fichiers, ...nouveaux].slice(0, NB_MAX_FICHIERS);
    if (fichiers.length + nouveaux.length > NB_MAX_FICHIERS) {
      toast.error(`${NB_MAX_FICHIERS} images maximum.`);
    }
    setFichiers(total);
  }

  function validerEtape(): string | null {
    if (etape === 0) {
      if (description.trim().length < 15)
        return "Merci de décrire votre projet en quelques phrases (15 caractères minimum).";
    }
    if (etape === 3) {
      if (nom.trim().length < 2) return "Merci d'indiquer votre nom.";
      if (telephone.trim().length < 6) return "Merci d'indiquer un numéro de téléphone.";
      if (!email.includes("@")) return "Merci d'indiquer une adresse e-mail valide.";
    }
    return null;
  }

  function suivant() {
    const probleme = validerEtape();
    if (probleme) return setErreur(probleme);
    setErreur(null);
    setEtape((e) => Math.min(e + 1, ETAPES.length - 1));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    const probleme = validerEtape();
    if (probleme) return setErreur(probleme);

    setErreur(null);
    setEnvoi(true);

    try {
      // 1. Envoi des images d'inspiration (si la cliente en a joint)
      let images: ResultatUpload[] = [];
      if (fichiers.length) {
        images = await envoyerInspirations(fichiers);
      }

      // 2. Création de la demande. Le numéro SM-AAAA-XXXX est généré
      //    côté serveur : jamais par le navigateur.
      const mesuresRemplies = Object.fromEntries(
        Object.entries(mesures).filter(([, v]) => v.trim() !== ""),
      );

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sur-mesure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Si la cliente est connectée, la demande est rattachée à son compte
          // et apparaîtra dans son espace.
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          nom: nom.trim(),
          telephone: telephone.trim(),
          email: email.trim(),
          typeVetement,
          occasion,
          couleurs: couleurs.trim() || undefined,
          tissu: tissu.trim() || undefined,
          description: description.trim(),
          budgetIndicatif: budget.trim() || undefined,
          dateSouhaitee: dateSouhaitee ? new Date(dateSouhaitee).toISOString() : undefined,
          mesures: Object.keys(mesuresRemplies).length ? mesuresRemplies : undefined,
          imageUrls: images.map((i) => i.url),
        }),
      });

      if (!res.ok) throw new Error();
      const demande = (await res.json()) as { numero: string };
      setNumero(demande.numero);
    } catch {
      setErreur("L'envoi a échoué. Merci de réessayer ou de nous contacter directement.");
    } finally {
      setEnvoi(false);
    }
  }

  // ---------- CONFIRMATION ----------
  if (numero) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center border border-gold text-gold">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="mt-8 text-3xl">Votre demande est enregistrée</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Fatoumata étudie personnellement chaque projet. Vous serez recontactée sous 48 heures
          ouvrées pour affiner votre pièce et recevoir une proposition.
        </p>
        <div className="mt-8 border border-gold/40 bg-secondary/40 p-6">
          <p className="label-xs text-muted-foreground">Référence de votre demande</p>
          <p className="mt-2 font-display text-3xl text-gold">{numero}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Conservez cette référence : elle permet de suivre l'avancement de votre projet.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-none">
            <Link href={`/sur-mesure/suivi?numero=${numero}`}>Suivre ma demande</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/boutique">Découvrir la boutique</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={soumettre} noValidate>
      {/* Fil d'étapes */}
      <ol className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-5">
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

      <div className="mt-10 space-y-6">
        {/* ÉTAPE 1 */}
        {etape === 0 && (
          <>
            <div>
              <Label className="label-xs">Type de pièce</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {TYPES_VETEMENT.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeVetement(t)}
                    className={cn(
                      "label-xs border px-4 py-2 transition-colors",
                      t === typeVetement
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-gold",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="label-xs">Occasion</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOccasion(o)}
                    className={cn(
                      "label-xs border px-4 py-2 transition-colors",
                      o === occasion
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-gold",
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="date" className="label-xs">
                Date souhaitée <span className="text-muted-foreground">(facultatif)</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={dateSouhaitee}
                min={new Date().toISOString().split("T")[0]}
                onChange={(ev) => setDateSouhaitee(ev.target.value)}
                className="mt-2 max-w-xs rounded-none"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Comptez 3 à 5 semaines pour une pièce de cérémonie.
              </p>
            </div>

            <div>
              <Label htmlFor="desc" className="label-xs">Décrivez votre projet</Label>
              <Textarea
                id="desc"
                rows={5}
                value={description}
                maxLength={2000}
                onChange={(ev) => setDescription(ev.target.value)}
                placeholder="La coupe imaginée, l'ambiance, ce que vous aimez porter, ce que vous évitez…"
                className="mt-2 rounded-none"
              />
            </div>
          </>
        )}

        {/* ÉTAPE 2 */}
        {etape === 1 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="couleurs" className="label-xs">Couleurs souhaitées</Label>
                <Input
                  id="couleurs"
                  value={couleurs}
                  maxLength={200}
                  onChange={(ev) => setCouleurs(ev.target.value)}
                  placeholder="Ivoire, or, bleu nuit…"
                  className="mt-2 rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="tissu" className="label-xs">Tissu envisagé</Label>
                <Input
                  id="tissu"
                  value={tissu}
                  maxLength={200}
                  onChange={(ev) => setTissu(ev.target.value)}
                  placeholder="Bazin riche, soie, dentelle…"
                  className="mt-2 rounded-none"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget" className="label-xs">
                Budget indicatif <span className="text-muted-foreground">(facultatif)</span>
              </Label>
              <Input
                id="budget"
                value={budget}
                maxLength={100}
                onChange={(ev) => setBudget(ev.target.value)}
                placeholder="Ex. 3 000 000 – 5 000 000 GNF"
                className="mt-2 max-w-sm rounded-none"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Cela nous aide à vous proposer les matières les plus justes. Aucun engagement.
              </p>
            </div>

            <div>
              <Label className="label-xs">
                Inspirations <span className="text-muted-foreground">({NB_MAX_FICHIERS} images max, 5 Mo chacune)</span>
              </Label>
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-3 border border-dashed border-border p-8 transition-colors hover:border-gold">
                <Upload className="h-4 w-4 text-gold" />
                <span className="label-xs">Ajouter des images</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  multiple
                  className="sr-only"
                  onChange={(ev) => {
                    ajouterFichiers(ev.target.files);
                    ev.target.value = "";
                  }}
                />
              </label>

              {fichiers.length > 0 && (
                <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {fichiers.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        aria-label={`Retirer ${f.name}`}
                        onClick={() => setFichiers((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-background/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* ÉTAPE 3 */}
        {etape === 2 && (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ces mesures sont facultatives : nous pouvons les prendre ensemble à l'atelier ou lors
              d'un rendez-vous. Si vous les renseignez, indiquez-les en centimètres, mesurées en
              sous-vêtements, le mètre à plat sans serrer.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {CHAMPS_MESURES.map((m) => (
                <div key={m.cle}>
                  <Label htmlFor={m.cle} className="label-xs">{m.label}</Label>
                  <div className="relative mt-2">
                    <Input
                      id={m.cle}
                      inputMode="decimal"
                      value={mesures[m.cle] ?? ""}
                      maxLength={6}
                      onChange={(ev) =>
                        setMesures((prev) => ({ ...prev, [m.cle]: ev.target.value }))
                      }
                      className="rounded-none pr-10"
                    />
                    <span className="label-xs absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      cm
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ÉTAPE 4 */}
        {etape === 3 && (
          <>
            <div>
              <Label htmlFor="nom" className="label-xs">Nom complet</Label>
              <Input
                id="nom"
                value={nom}
                maxLength={120}
                autoComplete="name"
                onChange={(ev) => setNom(ev.target.value)}
                className="mt-2 rounded-none"
                required
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="tel" className="label-xs">Téléphone / WhatsApp</Label>
                <Input
                  id="tel"
                  type="tel"
                  value={telephone}
                  maxLength={30}
                  autoComplete="tel"
                  placeholder="+224 6XX XX XX XX"
                  onChange={(ev) => setTelephone(ev.target.value)}
                  className="mt-2 rounded-none"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mail" className="label-xs">Adresse e-mail</Label>
                <Input
                  id="mail"
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="mt-2 rounded-none"
                  required
                />
              </div>
            </div>
            {!session && (
              <p className="border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                Vous n'êtes pas connectée.{" "}
                <Link href="/connexion?suite=/sur-mesure" className="text-gold hover:underline">
                  Connectez-vous
                </Link>{" "}
                pour retrouver cette demande dans votre espace cliente. Sinon, conservez bien la
                référence qui vous sera communiquée.
              </p>
            )}
          </>
        )}

        {erreur && (
          <p role="alert" className="border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {erreur}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-4">
          {etape > 0 && (
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={() => {
                setErreur(null);
                setEtape((e) => e - 1);
              }}
            >
              Retour
            </Button>
          )}
          {etape < ETAPES.length - 1 ? (
            <Button type="button" className="rounded-none px-8" onClick={suivant}>
              Continuer
            </Button>
          ) : (
            <Button type="submit" disabled={envoi} className="rounded-none px-8">
              {envoi ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi…
                </>
              ) : (
                "Envoyer ma demande"
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

export default function SurMesure() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40 px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-[1000px]">
          <p className="label-xs text-gold">Confection sur mesure</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Votre pièce, votre histoire</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Racontez-nous votre projet. Fatoumata Sylla étudie chaque demande personnellement et
            vous recontacte sous 48 heures ouvrées.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-4 py-14 sm:px-8">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
          <Formulaire />
        </Suspense>
      </section>
    </>
  );
}
