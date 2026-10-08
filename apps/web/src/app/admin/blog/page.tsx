"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-fetch";
import { cn } from "@/lib/utils";

type ArticleAdmin = {
  id: string;
  titre: string;
  statut: string;
  publieLe: string | null;
  category: { nom: string } | null;
};

export default function ListeBlog() {
  const [articles, setArticles] = useState<ArticleAdmin[] | null>(null);

  function charger() {
    apiFetch("/blog/admin/liste").then(setArticles).catch(() => setArticles([]));
  }
  useEffect(charger, []);

  async function supprimer(a: ArticleAdmin) {
    if (!confirm(`Supprimer « ${a.titre} » ?`)) return;
    try {
      await apiFetch(`/blog/${a.id}`, { method: "DELETE" });
      toast.success("Article supprimé.");
      charger();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl">Journal</h1>
        <Button asChild className="rounded-none">
          <Link href="/admin/blog/nouveau">
            <Plus className="mr-2 h-4 w-4" /> Nouvel article
          </Link>
        </Button>
      </div>

      {articles === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Chargement…</p>
      ) : articles.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Aucun article pour le moment.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {articles.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 py-4">
              <Link href={`/admin/blog/${a.id}`} className="min-w-0 flex-1">
                <p className="font-display text-lg hover:text-gold">{a.titre}</p>
                <p className="text-xs text-muted-foreground">{a.category?.nom ?? "Sans catégorie"}</p>
              </Link>
              <span className={cn("label-xs", a.statut === "publie" ? "text-gold" : "text-muted-foreground")}>
                {a.statut === "publie" ? "Publié" : "Brouillon"}
              </span>
              <button onClick={() => supprimer(a)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
