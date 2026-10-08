"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-fetch";
import { cn } from "@/lib/utils";

type ServiceItem = { id: string; nom: string; description: string | null; actif: boolean };

export default function AdminServices() {
  const [items, setItems] = useState<ServiceItem[] | null>(null);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  function charger() {
    apiFetch("/services/admin").then(setItems).catch(() => setItems([]));
  }
  useEffect(charger, []);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    if (nom.trim().length < 2) return toast.error("Merci d'indiquer un nom.");
    setEnregistrement(true);
    try {
      await apiFetch("/services", {
        method: "POST",
        body: JSON.stringify({ nom: nom.trim(), description: description.trim() || undefined, ordre: items?.length ?? 0 }),
      });
      setNom("");
      setDescription("");
      toast.success("Service ajouté.");
      charger();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnregistrement(false);
    }
  }

  async function basculer(item: ServiceItem) {
    await apiFetch(`/services/${item.id}`, { method: "PATCH", body: JSON.stringify({ actif: !item.actif }) }).catch((e) =>
      toast.error(e.message),
    );
    charger();
  }

  async function supprimer(item: ServiceItem) {
    if (!confirm(`Supprimer « ${item.nom} » ?`)) return;
    await apiFetch(`/services/${item.id}`, { method: "DELETE" }).catch((e) => toast.error(e.message));
    charger();
  }

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl">Services</h1>

      <form onSubmit={ajouter} className="mt-8 max-w-2xl space-y-4 border border-border p-6">
        <p className="label-xs text-muted-foreground">Ajouter un service</p>
        <div>
          <Label htmlFor="nom" className="label-xs">Nom</Label>
          <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} className="mt-2 rounded-none" />
        </div>
        <div>
          <Label htmlFor="desc" className="label-xs">Description (peut inclure le tarif et le délai)</Label>
          <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 rounded-none" />
        </div>
        <Button type="submit" disabled={enregistrement} className="rounded-none">
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </form>

      {items === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <ul className="mt-8 max-w-2xl divide-y divide-border border-y border-border">
          {items.map((item) => (
            <li key={item.id} className="py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={cn("font-display text-lg", !item.actif && "text-muted-foreground")}>{item.nom}</p>
                  {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                </div>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => basculer(item)} className="text-muted-foreground hover:text-foreground">
                    {item.actif ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => supprimer(item)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
