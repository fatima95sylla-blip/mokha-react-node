"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export default function MotDePasseOublie() {
  const { motDePasseOublie } = useAuth();
  const [email, setEmail] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setEnvoi(true);
    await motDePasseOublie(email.trim());
    setEnvoi(false);
    // On affiche toujours le même message, que le compte existe ou non :
    // cela évite de révéler quelles adresses sont enregistrées.
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <section className="mx-auto max-w-md px-4 py-20 sm:px-8">
        <h1 className="text-4xl">Vérifiez votre boîte mail</h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Si un compte est associé à cette adresse, vous recevrez un lien permettant de choisir un
          nouveau mot de passe. Pensez à regarder vos courriers indésirables.
        </p>
        <Link href="/connexion" className="label-xs mt-8 inline-block text-gold">
          ← Retour à la connexion
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-4 py-20 sm:px-8">
      <p className="label-xs text-gold">Espace cliente</p>
      <h1 className="mt-4 text-4xl">Mot de passe oublié</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Indiquez votre adresse e-mail : nous vous enverrons un lien de réinitialisation.
      </p>

      <form onSubmit={soumettre} className="mt-10 space-y-5" noValidate>
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
        <Button type="submit" disabled={envoi} className="w-full rounded-none py-6">
          {envoi ? "Envoi…" : "Recevoir le lien"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/connexion" className="text-gold hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </section>
  );
}
