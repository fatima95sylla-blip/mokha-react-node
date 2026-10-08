import { supabase } from "@/lib/supabase";

// Buckets à créer dans Supabase (Storage > New bucket), tous publics en lecture :
//  - "inspirations" : photos jointes aux demandes sur-mesure par les clientes
//  - "produits"      : photos du catalogue, ajoutées par l'admin
// Voir README pour les policies d'écriture à configurer sur chacun.
export type Bucket = "inspirations" | "produits";

export const TAILLE_MAX_OCTETS = 5 * 1024 * 1024; // 5 Mo
export const TYPES_AUTORISES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
export const NB_MAX_FICHIERS = 6;

export type ResultatUpload = { url: string; nom: string };

/**
 * Valide un fichier AVANT envoi. Cette vérification est un confort côté
 * interface : les limites réelles (type MIME, taille) doivent aussi être
 * configurées sur le bucket Supabase, car un contrôle fait dans le navigateur
 * est contournable.
 */
export function validerFichier(f: File): string | null {
  if (!TYPES_AUTORISES.includes(f.type)) {
    return `${f.name} : format non accepté (JPEG, PNG, WebP ou HEIC).`;
  }
  if (f.size > TAILLE_MAX_OCTETS) {
    return `${f.name} : fichier trop lourd (5 Mo maximum).`;
  }
  return null;
}

function nomSur(nomOriginal: string): string {
  const ext = nomOriginal.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "jpg";
  // On ne réutilise jamais le nom fourni par la personne dans le chemin de
  // stockage : on génère un identifiant neutre (évite collisions et caractères
  // problématiques).
  const id = crypto.randomUUID();
  return `${id}.${ext}`;
}

export async function envoyerImages(fichiers: File[], bucket: Bucket): Promise<ResultatUpload[]> {
  if (!supabase) throw new Error("Le stockage d’images n’est pas configuré sur cette installation.");

  const resultats: ResultatUpload[] = [];

  for (const f of fichiers) {
    const probleme = validerFichier(f);
    if (probleme) throw new Error(probleme);

    const chemin = `${new Date().getFullYear()}/${nomSur(f.name)}`;
    const { error } = await supabase.storage.from(bucket).upload(chemin, f, {
      cacheControl: "3600",
      upsert: false,
      contentType: f.type,
    });
    if (error) {
      throw new Error("L'envoi d'une image a échoué. Merci de réessayer.");
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(chemin);
    resultats.push({ url: data.publicUrl, nom: f.name });
  }

  return resultats;
}

/** Conservé pour compatibilité avec le formulaire sur-mesure existant. */
export function envoyerInspirations(fichiers: File[]) {
  return envoyerImages(fichiers, "inspirations");
}
