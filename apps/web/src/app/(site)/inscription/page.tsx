"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

// Mêmes exigences que côté serveur pour le compte administratrice.
const REGLES = [
  { test: (m: string) => m.length >= 12, texte: "12 caractères minimum" },
  { test: (m: string) => /[a-z]/.test(m) && /[A-Z]/.test(m), texte: "Majuscule et minuscule" },
  { test: (m: string) => /[0-9]/.test(m), texte: "Au moins un chiffre" },
  { test: (m: string) => /[^A-Za-z0-9]/.test(m), texte: "Au moins un caractère spécial" },
];

export default function Inscription() {
  const { inscription } = useAuth();
  const router = useRouter();

  const [nomComplet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const reglesOk = REGLES.every((r) => r.test(motDePasse));

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (nomComplet.trim().length < 2) return setErreur("Merci d'indiquer votre nom complet.");
    if (!email.includes("@")) return setErreur("Merci d'indiquer une adresse e-mail valide.");
    if (!reglesOk) return setErreur("Votre mot de passe ne respecte pas toutes les exigences.");
    if (motDePasse !== confirmation) return setErreur("Les deux mots de passe ne correspondent pas.");

    setEnvoi(true);
    const { erreur: err, confirmationRequise } = await inscription({
      email: email.trim(),
      motDePasse,
      nomComplet: nomComplet.trim(),
      telephone: telephone.trim() || undefined,
    });
    setEnvoi(false);

    if (err) return setErreur(err);

    if (confirmationRequise) {
      toast.success("Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse.");
      router.push("/connexion");
    } else {
      toast.success("Bienvenue chez MOKHA.");
      router.push("/compte");
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-20 sm:px-8">
      <p className="label-xs text-gold">Espace cliente</p>
      <h1 className="mt-4 text-4xl">Créer un compte</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Suivez vos commandes, conservez vos mesures et retrouvez vos pièces favorites.
      </p>

      <form onSubmit={soumettre} className="mt-10 space-y-5" noValidate>
        <div>
          <Label htmlFor="nom" className="label-xs">Nom complet</Label>
          <Input
            id="nom"
            autoComplete="name"
            value={nomComplet}
            maxLength={120}
            onChange={(e) => setNomComplet(e.target.value)}
            className="mt-2 rounded-none"
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="label-xs">Adresse e-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 rounded-none"
            required
          />
        </div>

        <div>
          <Label htmlFor="tel" className="label-xs">
            Téléphone <span className="text-muted-foreground">(facultatif)</span>
          </Label>
          <Input
            id="tel"
            type="tel"
            autoComplete="tel"
            placeholder="+224 6XX XX XX XX"
            value={telephone}
            maxLength={30}
            onChange={(e) => setTelephone(e.target.value)}
            className="mt-2 rounded-none"
          />
        </div>

        <div>
          <Label htmlFor="mdp" className="label-xs">Mot de passe</Label>
          <Input
            id="mdp"
            type="password"
            autoComplete="new-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="mt-2 rounded-none"
            required
          />
          <ul className="mt-3 space-y-1">
            {REGLES.map((r) => {
              const ok = r.test(motDePasse);
              return (
                <li
                  key={r.texte}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    ok ? "text-gold" : "text-muted-foreground",
                  )}
                >
                  {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {r.texte}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <Label htmlFor="confirm" className="label-xs">Confirmer le mot de passe</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="mt-2 rounded-none"
            required
          />
        </div>

        {erreur && (
          <p role="alert" className="border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {erreur}
          </p>
        )}

        <Button type="submit" disabled={envoi} className="w-full rounded-none py-6">
          {envoi ? "Création…" : "Créer mon compte"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Déjà cliente ?{" "}
          <Link href="/connexion" className="text-gold hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </section>
  );
}
