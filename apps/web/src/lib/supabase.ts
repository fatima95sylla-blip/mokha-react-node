import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Utilisé UNIQUEMENT pour l'authentification (inscription, connexion, session,
// upload vers Supabase Storage). Toute la logique métier (produits, panier,
// commandes...) passe par l'API Express (`NEXT_PUBLIC_API_URL`), jamais
// directement par ce client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[MOKHA] Supabase n'est pas configuré : définissez NEXT_PUBLIC_SUPABASE_URL et " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY dans apps/web/.env",
  );
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
