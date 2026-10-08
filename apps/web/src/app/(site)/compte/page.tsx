"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Package, Heart, Scissors, User as UserIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { RouteProtegee } from "@/components/RouteProtegee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/currency";
import { useBoutique } from "@/lib/boutique-store";

type Commande = {
  id: string;
  numero: string;
  statut: string;
  total: string;
  createdAt: string;
  items: { id: string; nomProduit: string; quantite: number }[];
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
};

function Contenu() {
  const { profil, session, deconnexion, rafraichirProfil, estAdmin } = useAuth();
  const { devise } = useBoutique();

  const [nomComplet, setNomComplet] = useState(profil?.fullName ?? "");
  const [telephone, setTelephone] = useState(profil?.phone ?? "");
  const [enregistrement, setEnregistrement] = useState(false);

  const [commandes, setCommandes] = useState<Commande[] | null>(null);
  const [erreurCommandes, setErreurCommandes] = useState(false);

  useEffect(() => {
    setNomComplet(profil?.fullName ?? "");
    setTelephone(profil?.phone ?? "");
  }, [profil]);

  useEffect(() => {
    if (!session) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/compte/commandes`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setCommandes)
      .catch(() => setErreurCommandes(true));
  }, [session]);

  async function enregistrerProfil(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setEnregistrement(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compte/profil`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ fullName: nomComplet, phone: telephone || undefined }),
      });
      if (!res.ok) throw new Error();
      await rafraichirProfil();
      toast.success("Informations mises à jour.");
    } catch {
      toast.error("Enregistrement impossible. Merci de réessayer.");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <section className="mx-auto max-w-[1000px] px-4 py-16 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-xs text-gold">Espace cliente</p>
          <h1 className="mt-3 text-4xl">Bonjour{profil?.fullName ? `, ${profil.fullName.split(" ")[0]}` : ""}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{profil?.email}</p>
        </div>
        <div className="flex gap-3">
          {estAdmin && (
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/admin">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Administration
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-none"
            onClick={async () => {
              await deconnexion();
              toast.success("À bientôt.");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profil" className="mt-12">
        <TabsList className="flex w-full flex-wrap justify-start gap-2 rounded-none bg-transparent p-0">
          <TabsTrigger value="profil" className="label-xs rounded-none border border-border px-4 py-2">
            <UserIcon className="mr-2 h-3 w-3" /> Profil
          </TabsTrigger>
          <TabsTrigger value="commandes" className="label-xs rounded-none border border-border px-4 py-2">
            <Package className="mr-2 h-3 w-3" /> Commandes
          </TabsTrigger>
          <TabsTrigger value="favoris" className="label-xs rounded-none border border-border px-4 py-2">
            <Heart className="mr-2 h-3 w-3" /> Favoris
          </TabsTrigger>
          <TabsTrigger value="surmesure" className="label-xs rounded-none border border-border px-4 py-2">
            <Scissors className="mr-2 h-3 w-3" /> Sur mesure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="mt-8">
          <form onSubmit={enregistrerProfil} className="max-w-md space-y-5">
            <div>
              <Label htmlFor="nom" className="label-xs">Nom complet</Label>
              <Input
                id="nom"
                value={nomComplet}
                maxLength={120}
                onChange={(e) => setNomComplet(e.target.value)}
                className="mt-2 rounded-none"
              />
            </div>
            <div>
              <Label htmlFor="tel" className="label-xs">Téléphone</Label>
              <Input
                id="tel"
                type="tel"
                placeholder="+224 6XX XX XX XX"
                value={telephone}
                maxLength={30}
                onChange={(e) => setTelephone(e.target.value)}
                className="mt-2 rounded-none"
              />
            </div>
            <div>
              <Label className="label-xs">Adresse e-mail</Label>
              <Input value={profil?.email ?? ""} disabled className="mt-2 rounded-none" />
              <p className="mt-2 text-xs text-muted-foreground">
                L'adresse e-mail ne peut pas être modifiée ici. Contactez la maison si nécessaire.
              </p>
            </div>
            <Button type="submit" disabled={enregistrement} className="rounded-none">
              {enregistrement ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="commandes" className="mt-8">
          {erreurCommandes ? (
            <p className="text-sm text-muted-foreground">
              Vos commandes sont momentanément indisponibles. Merci de réessayer plus tard.
            </p>
          ) : commandes === null ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : commandes.length === 0 ? (
            <div className="border border-border p-10 text-center">
              <p className="text-muted-foreground">Vous n'avez pas encore passé commande.</p>
              <Button asChild className="mt-6 rounded-none">
                <Link href="/boutique">Découvrir la boutique</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {commandes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                  <div>
                    <p className="font-display text-xl">{c.numero}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR")} ·{" "}
                      {c.items.reduce((s, i) => s + i.quantite, 0)} article(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="label-xs text-gold">{LIBELLES_STATUT[c.statut] ?? c.statut}</p>
                    <p className="mt-1 text-sm">{formatPrice(Number(c.total), devise)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="favoris" className="mt-8">
          <div className="border border-border p-10 text-center">
            <p className="text-muted-foreground">Retrouvez toutes vos pièces favorites.</p>
            <Button asChild className="mt-6 rounded-none">
              <Link href="/favoris">Voir mes favoris</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="surmesure" className="mt-8">
          <div className="border border-border p-10 text-center">
            <p className="text-muted-foreground">
              Vos demandes de confection sur mesure apparaîtront ici.
            </p>
            <Button asChild className="mt-6 rounded-none">
              <Link href="/sur-mesure">Faire une demande</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

export default function Compte() {
  return (
    <RouteProtegee>
      <Contenu />
    </RouteProtegee>
  );
}
