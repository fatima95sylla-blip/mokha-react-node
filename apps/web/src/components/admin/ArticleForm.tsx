"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api-fetch";
import { envoyerImages, validerFichier } from "@/lib/upload";

type Categorie = { id: string; nom: string };

export type ArticleFormValues = {
  id?: string;
  titre: string;
  extrait: string;
  contenu: string;
  imageUrl: string;
  categoryId: string;
  statut: "brouillon" | "publie";
};

const VIDE: ArticleFormValues = {
  titre: "",
  extrait: "",
  contenu: "",
  imageUrl: "",
  categoryId: "",
  statut: "brouillon",
};

export function ArticleForm({ initial }: { initial?: ArticleFormValues }) {
  const router = useRouter();
  const [valeurs, setValeurs] = useState<ArticleFormValues>(initial ?? VIDE);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [nouvelleCategorie, setNouvelleCategorie] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/categories`).then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  function set<K extends keyof ArticleFormValues>(cle: K, val: ArticleFormValues[K]) {
    setValeurs((v) => ({ ...v, [cle]: val }));
  }

  async function ajouterCategorie() {
    if (nouvelleCategorie.trim().length < 2) return;
    try {
      const cat = await apiFetch("/blog/categories", { method: "POST", body: JSON.stringify({ nom: nouvelleCategorie.trim() }) });
      setCategories((c) => [...c, cat]);
      set("categoryId", cat.id);
      setNouvelleCategorie("");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function changerImage(fichiers: FileList | null) {
    const f = fichiers?.[0];
    if (!f) return;
    const p = validerFichier(f);
    if (p) return toast.error(p);
    setUploadEnCours(true);
    try {
      const [res] = await envoyerImages([f], "produits");
      set("imageUrl", res.url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploadEnCours(false);
    }
  }

  async function soumettre(e: React.FormEvent, statutVoulu: "brouillon" | "publie") {
    e.preventDefault();
    if (valeurs.titre.trim().length < 3) return toast.error("Le titre est requis.");

    setEnregistrement(true);
    try {
      const payload = {
        titre: valeurs.titre.trim(),
        extrait: valeurs.extrait.trim() || undefined,
        contenu: valeurs.contenu.trim() || undefined,
        imageUrl: valeurs.imageUrl || undefined,
        categoryId: valeurs.categoryId || null,
        statut: statutVoulu,
      };
      if (valeurs.id) {
        await apiFetch(`/blog/${valeurs.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast.success("Article mis à jour.");
      } else {
        await apiFetch("/blog", { method: "POST", body: JSON.stringify(payload) });
        toast.success(statutVoulu === "publie" ? "Article publié." : "Brouillon enregistré.");
      }
      router.push("/admin/blog");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <form className="space-y-8">
      <div>
        <Label htmlFor="titre" className="label-xs">Titre</Label>
        <Input id="titre" value={valeurs.titre} onChange={(e) => set("titre", e.target.value)} className="mt-2 rounded-none" required />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label className="label-xs">Catégorie</Label>
          <Select value={valeurs.categoryId} onValueChange={(v) => set("categoryId", v)}>
            <SelectTrigger className="mt-2 rounded-none"><SelectValue placeholder="Aucune" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Nouvelle catégorie…"
              value={nouvelleCategorie}
              onChange={(e) => setNouvelleCategorie(e.target.value)}
              className="rounded-none"
            />
            <Button type="button" variant="outline" className="shrink-0 rounded-none" onClick={ajouterCategorie}>
              Ajouter
            </Button>
          </div>
        </div>

        <div>
          <Label className="label-xs">Image de couverture</Label>
          {valeurs.imageUrl ? (
            <div className="relative mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={valeurs.imageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
              <button type="button" onClick={() => set("imageUrl", "")} className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-background/90">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="mt-2 flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border hover:border-gold">
              {uploadEnCours ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : <Upload className="h-5 w-5 text-gold" />}
              <span className="label-xs">Ajouter une image</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="sr-only" onChange={(e) => changerImage(e.target.files)} />
            </label>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="extrait" className="label-xs">Extrait (affiché dans les listes)</Label>
        <Textarea id="extrait" rows={2} value={valeurs.extrait} maxLength={400} onChange={(e) => set("extrait", e.target.value)} className="mt-2 rounded-none" />
      </div>

      <div>
        <Label htmlFor="contenu" className="label-xs">
          Contenu <span className="text-muted-foreground">(séparez les paragraphes par une ligne vide)</span>
        </Label>
        <Textarea id="contenu" rows={14} value={valeurs.contenu} onChange={(e) => set("contenu", e.target.value)} className="mt-2 rounded-none" />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="button" disabled={enregistrement} variant="outline" className="rounded-none" onClick={(e) => soumettre(e, "brouillon")}>
          Enregistrer le brouillon
        </Button>
        <Button type="button" disabled={enregistrement} className="rounded-none px-8" onClick={(e) => soumettre(e, "publie")}>
          Publier
        </Button>
      </div>
    </form>
  );
}
