"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

function Formulaire() {
  const { connexion } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirection = params.get("suite") ?? "/compte";

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!email.includes("@") || motDePasse.length < 6) {
      setErreur("Merci de saisir un e-mail valide et votre mot de passe.");
      return;
    }

    setEnvoi(true);
    const { erreur: err } = await connexion(email.trim(), motDePasse);
    setEnvoi(false);

    if (err) {
      setErreur(err);
      return;
    }
    toast.success("Bienvenue chez MOKHA.");
    router.push(redirection);
  }

  return (
    <form onSubmit={soumettre} className="mt-10 space-y-5" noValidate>
      <div>
        <Label htmlFor="email" className="label-xs">
          Adresse e-mail
        </Label>
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
        <div className="flex items-baseline justify-between">
          <Label htmlFor="mdp" className="label-xs">
            Mot de passe
          </Label>
          <Link href="/connexion/mot-de-passe-oublie" className="label-xs text-gold">
            Oublié ?
          </Link>
        </div>
        <Input
          id="mdp"
          type="password"
          autoComplete="current-password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
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
        {envoi ? "Connexion…" : "Se connecter"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-gold hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

export default function Connexion() {
  return (
    <section className="mx-auto max-w-md px-4 py-20 sm:px-8">
      <p className="label-xs text-gold">Espace cliente</p>
      <h1 className="mt-4 text-4xl">Connexion</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Retrouvez vos commandes, vos favoris et vos demandes sur mesure.
      </p>
      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">Chargement…</p>}>
        <Formulaire />
      </Suspense>
    </section>
  );
}
