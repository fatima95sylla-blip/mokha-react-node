"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api-fetch";
import { envoyerImages, validerFichier } from "@/lib/upload";

type Categorie = { id: string; nom: string };
type Collection = { id: string; nom: string };

type Variante = { taille: string; couleur: string; stock: number; prixOverride?: number };

export type ProduitFormValues = {
  id?: string;
  nom: string;
  reference: string;
  prix: string;
  categoryId: string;
  collectionId: string;
  description: string;
  matiere: string;
  entretien: string;
  delai: string;
  confection: string;
  disponibilite: string;
  surMesureDisponible: boolean;
  nouveaute: boolean;
  publie: boolean;
  images: string[];
  variantes: Variante[];
};

const DISPONIBILITES = ["En stock", "Sur commande", "Édition limitée", "Épuisé"];

const VIDE: ProduitFormValues = {
  nom: "",
  reference: "",
  prix: "",
  categoryId: "",
  collectionId: "",
  description: "",
  matiere: "",
  entretien: "",
  delai: "",
  confection: "",
  disponibilite: "En stock",
  surMesureDisponible: false,
  nouveaute: false,
  publie: true,
  images: [],
  variantes: [],
};

export function ProduitForm({ initial }: { initial?: ProduitFormValues }) {
  const router = useRouter();
  const [valeurs, setValeurs] = useState<ProduitFormValues>(initial ?? VIDE);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [enregistrement, setEnregistrement] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${base}/categories`).then((r) => r.json()).then(setCategories).catch(() => {});
    fetch(`${base}/collections`).then((r) => r.json()).then(setCollections).catch(() => {});
  }, []);

  function set<K extends keyof ProduitFormValues>(cle: K, val: ProduitFormValues[K]) {
    setValeurs((v) => ({ ...v, [cle]: val }));
  }

  async function ajouterImages(liste: FileList | null) {
    if (!liste) return;
    const fichiers = Array.from(liste);
    for (const f of fichiers) {
      const p = validerFichier(f);
      if (p) return toast.error(p);
    }
    setUploadEnCours(true);
    try {
      const resultats = await envoyerImages(fichiers, "produits");
      set("images", [...valeurs.images, ...resultats.map((r) => r.url)]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploadEnCours(false);
    }
  }

  function ajouterVariante() {
    set("variantes", [...valeurs.variantes, { taille: "", couleur: "", stock: 0 }]);
  }

  function modifierVariante(i: number, patch: Partial<Variante>) {
    set("variantes", valeurs.variantes.map((v, j) => (i === j ? { ...v, ...patch } : v)));
  }

  function retirerVariante(i: number) {
    set("variantes", valeurs.variantes.filter((_, j) => j !== i));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();

    if (valeurs.nom.trim().length < 2) return toast.error("Le nom est requis.");
    if (valeurs.reference.trim().length < 2) return toast.error("La référence est requise.");
    const prix = Number(valeurs.prix);
    if (!prix || prix <= 0) return toast.error("Le prix doit être un nombre positif.");

    setEnregistrement(true);
    try {
      const payload = {
        nom: valeurs.nom.trim(),
        reference: valeurs.reference.trim(),
        prix,
        categoryId: valeurs.categoryId || undefined,
        collectionId: valeurs.collectionId || undefined,
        description: valeurs.description.trim() || undefined,
        matiere: valeurs.matiere.trim() || undefined,
        entretien: valeurs.entretien.trim() || undefined,
        delai: valeurs.delai.trim() || undefined,
        confection: valeurs.confection.trim() || undefined,
        disponibilite: valeurs.disponibilite,
        surMesureDisponible: valeurs.surMesureDisponible,
        nouveaute: valeurs.nouveaute,
        publie: valeurs.publie,
        images: valeurs.images,
        variantes: valeurs.variantes
          .filter((v) => v.taille || v.couleur)
          .map((v) => ({
            taille: v.taille || undefined,
            couleur: v.couleur || undefined,
            stock: Number(v.stock) || 0,
            prixOverride: v.prixOverride ? Number(v.prixOverride) : undefined,
          })),
      };

      if (valeurs.id) {
        await apiFetch(`/produits/${valeurs.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast.success("Produit mis à jour.");
      } else {
        await apiFetch("/produits", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Produit créé.");
      }
      router.push("/admin/produits");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <form onSubmit={soumettre} className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="nom" className="label-xs">Nom</Label>
          <Input id="nom" value={valeurs.nom} onChange={(e) => set("nom", e.target.value)} className="mt-2 rounded-none" required />
        </div>
        <div>
          <Label htmlFor="ref" className="label-xs">Référence</Label>
          <Input id="ref" value={valeurs.reference} onChange={(e) => set("reference", e.target.value)} className="mt-2 rounded-none" required />
        </div>
        <div>
          <Label htmlFor="prix" className="label-xs">Prix (GNF)</Label>
          <Input id="prix" type="number" min={0} value={valeurs.prix} onChange={(e) => set("prix", e.target.value)} className="mt-2 rounded-none" required />
        </div>
        <div>
          <Label className="label-xs">Disponibilité</Label>
          <Select value={valeurs.disponibilite} onValueChange={(v) => set("disponibilite", v)}>
            <SelectTrigger className="mt-2 rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DISPONIBILITES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="label-xs">Catégorie</Label>
          <Select value={valeurs.categoryId} onValueChange={(v) => set("categoryId", v)}>
            <SelectTrigger className="mt-2 rounded-none"><SelectValue placeholder="Aucune" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="label-xs">Collection</Label>
          <Select value={valeurs.collectionId} onValueChange={(v) => set("collectionId", v)}>
            <SelectTrigger className="mt-2 rounded-none"><SelectValue placeholder="Aucune" /></SelectTrigger>
            <SelectContent>
              {collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="desc" className="label-xs">Description</Label>
        <Textarea id="desc" rows={4} value={valeurs.description} onChange={(e) => set("description", e.target.value)} className="mt-2 rounded-none" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="matiere" className="label-xs">Matière</Label>
          <Input id="matiere" value={valeurs.matiere} onChange={(e) => set("matiere", e.target.value)} className="mt-2 rounded-none" />
        </div>
        <div>
          <Label htmlFor="entretien" className="label-xs">Entretien</Label>
          <Input id="entretien" value={valeurs.entretien} onChange={(e) => set("entretien", e.target.value)} className="mt-2 rounded-none" />
        </div>
        <div>
          <Label htmlFor="delai" className="label-xs">Délai</Label>
          <Input id="delai" value={valeurs.delai} onChange={(e) => set("delai", e.target.value)} className="mt-2 rounded-none" />
        </div>
        <div>
          <Label htmlFor="confection" className="label-xs">Confection</Label>
          <Input id="confection" value={valeurs.confection} onChange={(e) => set("confection", e.target.value)} className="mt-2 rounded-none" />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={valeurs.surMesureDisponible} onCheckedChange={(v) => set("surMesureDisponible", !!v)} />
          Sur mesure disponible
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={valeurs.nouveaute} onCheckedChange={(v) => set("nouveaute", !!v)} />
          Nouveauté
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={valeurs.publie} onCheckedChange={(v) => set("publie", !!v)} />
          Publié (visible sur le site)
        </label>
      </div>

      {/* IMAGES */}
      <div>
        <Label className="label-xs">Images</Label>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {valeurs.images.map((url) => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-[3/4] w-full object-cover" />
              <button
                type="button"
                onClick={() => set("images", valeurs.images.filter((u) => u !== url))}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-background/90"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border transition-colors hover:border-gold">
            {uploadEnCours ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : <Upload className="h-5 w-5 text-gold" />}
            <span className="label-xs text-center">Ajouter</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              className="sr-only"
              onChange={(e) => {
                ajouterImages(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {/* VARIANTES */}
      <div>
        <div className="flex items-center justify-between">
          <Label className="label-xs">Variantes (taille / couleur / stock)</Label>
          <Button type="button" size="sm" variant="outline" className="rounded-none" onClick={ajouterVariante}>
            <Plus className="mr-2 h-3 w-3" /> Ajouter une ligne
          </Button>
        </div>
        {valeurs.variantes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Aucune variante : le produit sera vendable sans déclinaison de taille/couleur.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {valeurs.variantes.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_100px_auto] items-end gap-3">
                <div>
                  <Label className="label-xs">Taille</Label>
                  <Input value={v.taille} onChange={(e) => modifierVariante(i, { taille: e.target.value })} className="mt-1 rounded-none" placeholder="40" />
                </div>
                <div>
                  <Label className="label-xs">Couleur</Label>
                  <Input value={v.couleur} onChange={(e) => modifierVariante(i, { couleur: e.target.value })} className="mt-1 rounded-none" placeholder="Noir" />
                </div>
                <div>
                  <Label className="label-xs">Stock</Label>
                  <Input type="number" min={0} value={v.stock} onChange={(e) => modifierVariante(i, { stock: Number(e.target.value) })} className="mt-1 rounded-none" />
                </div>
                <button type="button" onClick={() => retirerVariante(i)} className="mb-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={enregistrement || uploadEnCours} className="rounded-none px-8">
          {enregistrement ? "Enregistrement…" : valeurs.id ? "Enregistrer les modifications" : "Créer le produit"}
        </Button>
      </div>
    </form>
  );
}
