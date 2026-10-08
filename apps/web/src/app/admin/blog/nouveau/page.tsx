"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default function NouvelArticle() {
  return (
    <div className="p-6 sm:p-10">
      <Link href="/admin/blog" className="label-xs flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Retour au journal
      </Link>
      <h1 className="mt-4 text-3xl">Nouvel article</h1>
      <div className="mt-8 max-w-3xl">
        <ArticleForm />
      </div>
    </div>
  );
}
