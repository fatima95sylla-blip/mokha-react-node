"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { ArrowLeft } from "lucide-react";
import { ArticleForm, type ArticleFormValues } from "@/components/admin/ArticleForm";
import { apiFetch } from "@/lib/api-fetch";

type ArticleApi = {
  id: string;
  titre: string;
  extrait: string | null;
  contenu: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  statut: "brouillon" | "publie";
};

export default function EditerArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [valeurs, setValeurs] = useState<ArticleFormValues | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/blog/admin/detail/${id}`)
      .then((a: ArticleApi) =>
        setValeurs({
          id: a.id,
          titre: a.titre,
          extrait: a.extrait ?? "",
          contenu: a.contenu ?? "",
          imageUrl: a.imageUrl ?? "",
          categoryId: a.categoryId ?? "",
          statut: a.statut,
        }),
      )
      .catch((e) => setErreur(e.message));
  }, [id]);

  return (
    <div className="p-6 sm:p-10">
      <Link href="/admin/blog" className="label-xs flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Retour au journal
      </Link>
      <h1 className="mt-4 text-3xl">Modifier l'article</h1>
      <div className="mt-8 max-w-3xl">
        {erreur ? (
          <p className="text-sm text-destructive">{erreur}</p>
        ) : !valeurs ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <ArticleForm initial={valeurs} />
        )}
      </div>
    </div>
  );
}
