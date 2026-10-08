"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const REGLES = [
  { test: (m: string) => m.length >= 12, texte: "12 caractères minimum" },
  { test: (m: string) => /[a-z]/.test(m) && /[A-Z]/.test(m), texte: "Majuscule et minuscule" },
  { test: (m: string) => /[0-9]/.test(m), texte: "Au moins un chiffre" },
  { test: (m: string) => /[^A-Za-z0-9]/.test(m), texte: "Au moins un caractère spécial" },
];

export default function NouveauMotDePasse() {
  const router = useRouter();
  const [pret, setPret] = useState(false);
  const [lienValide, setLienValide] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Supabase ouvre une session temporaire lorsque la cliente arrive via le lien
  // reçu par e-mail. Sans cette session, le formulaire ne sert à rien.
  useEffect(() => {
    if (!supabase) {
      setPret(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setLienValide(!!data.session);
      setPret(true);
    });
  }, []);

  const reglesOk = REGLES.every((r) => r.test(motDePasse));

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (!reglesOk) return setErreur("Votre mot de passe ne respecte pas toutes les exigences.");
    if (motDePasse !== confirmation) return setErreur("Les deux mots de passe ne correspondent pas.");
    if (!supabase) return setErreur("L’authentification n’est pas configurée sur cette installation.");

    setEnvoi(true);
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setEnvoi(false);

    if (error) return setErreur("Le lien a peut-être expiré. Merci de refaire une demande.");
    toast.success("Mot de passe mis à jour.");
    router.push("/compte");
  }

  if (!pret) {
    return <p className="mx-auto max-w-md px-4 py-20 text-sm text-muted-foreground sm:px-8">Chargement…</p>;
  }

  if (!lienValide) {
    return (
      <section className="mx-auto max-w-md px-4 py-20 sm:px-8">
        <h1 className="text-4xl">Lien invalide ou expiré</h1>
        <p className="mt-5 text-sm text-muted-foreground">
          Merci de refaire une demande de réinitialisation depuis la page de connexion.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-4 py-20 sm:px-8">
      <h1 className="text-4xl">Nouveau mot de passe</h1>

      <form onSubmit={soumettre} className="mt-10 space-y-5" noValidate>
        <div>
          <Label htmlFor="mdp" className="label-xs">Nouveau mot de passe</Label>
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
                <li key={r.texte} className={cn("flex items-center gap-2 text-xs", ok ? "text-gold" : "text-muted-foreground")}>
                  {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {r.texte}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <Label htmlFor="confirm" className="label-xs">Confirmer</Label>
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
          {envoi ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </section>
  );
}
