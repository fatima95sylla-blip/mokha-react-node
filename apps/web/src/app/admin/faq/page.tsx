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

type FaqItem = { id: string; question: string; reponse: string; publie: boolean; ordre: number };

export default function AdminFaq() {
  const [items, setItems] = useState<FaqItem[] | null>(null);
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  function charger() {
    apiFetch("/faq/admin").then(setItems).catch(() => setItems([]));
  }
  useEffect(charger, []);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim().length < 3 || reponse.trim().length < 3) {
      return toast.error("Merci de renseigner une question et une réponse.");
    }
    setEnregistrement(true);
    try {
      await apiFetch("/faq", {
        method: "POST",
        body: JSON.stringify({ question: question.trim(), reponse: reponse.trim(), ordre: items?.length ?? 0 }),
      });
      setQuestion("");
      setReponse("");
      toast.success("Question ajoutée.");
      charger();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnregistrement(false);
    }
  }

  async function basculer(item: FaqItem) {
    await apiFetch(`/faq/${item.id}`, { method: "PATCH", body: JSON.stringify({ publie: !item.publie }) }).catch((e) =>
      toast.error(e.message),
    );
    charger();
  }

  async function supprimer(item: FaqItem) {
    if (!confirm("Supprimer cette question ?")) return;
    await apiFetch(`/faq/${item.id}`, { method: "DELETE" }).catch((e) => toast.error(e.message));
    charger();
  }

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl">FAQ</h1>

      <form onSubmit={ajouter} className="mt-8 max-w-2xl space-y-4 border border-border p-6">
        <p className="label-xs text-muted-foreground">Ajouter une question</p>
        <div>
          <Label htmlFor="q" className="label-xs">Question</Label>
          <Input id="q" value={question} onChange={(e) => setQuestion(e.target.value)} className="mt-2 rounded-none" />
        </div>
        <div>
          <Label htmlFor="r" className="label-xs">Réponse</Label>
          <Textarea id="r" rows={3} value={reponse} onChange={(e) => setReponse(e.target.value)} className="mt-2 rounded-none" />
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
                  <p className={cn("font-display text-lg", !item.publie && "text-muted-foreground")}>{item.question}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.reponse}</p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => basculer(item)} className="text-muted-foreground hover:text-foreground">
                    {item.publie ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
