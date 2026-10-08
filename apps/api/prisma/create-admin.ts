/**
 * Crée (ou promeut) le compte administratrice de la maison MOKHA.
 *
 * ⚠️ AUCUN mot de passe n'est écrit dans ce fichier. Il est lu depuis
 * l'environnement, le temps de l'exécution uniquement :
 *
 *   ADMIN_EMAIL="fatima95sylla@gmail.com" \
 *   ADMIN_PASSWORD='votre-mot-de-passe' \
 *   ADMIN_NAME="Fatoumata Sylla" \
 *   ADMIN_PHONE="+224 626 600 095" \
 *   npm run create-admin
 *
 * Conseils :
 *  - préfixez la commande d'un ESPACE pour qu'elle n'entre pas dans l'historique
 *    du shell (fonctionne avec bash/zsh si HISTCONTROL=ignorespace) ;
 *  - ne stockez PAS ADMIN_PASSWORD dans un fichier .env versionné ;
 *  - changez le mot de passe depuis l'application après la première connexion.
 *
 * Ce script utilise la SERVICE_ROLE_KEY : elle contourne les policies RLS, elle
 * ne doit donc jamais être exposée côté navigateur ni committée.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_NAME ?? "Administratrice MOKHA";
const phone = process.env.ADMIN_PHONE ?? null;

function exigerMotDePasseSolide(mdp: string) {
  const problemes: string[] = [];
  if (mdp.length < 12) problemes.push("au moins 12 caractères");
  if (!/[a-z]/.test(mdp)) problemes.push("une minuscule");
  if (!/[A-Z]/.test(mdp)) problemes.push("une majuscule");
  if (!/[0-9]/.test(mdp)) problemes.push("un chiffre");
  if (!/[^A-Za-z0-9]/.test(mdp)) problemes.push("un caractère spécial");
  if (problemes.length) {
    console.error(`❌ Mot de passe trop faible. Il manque : ${problemes.join(", ")}.`);
    process.exit(1);
  }
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env");
    process.exit(1);
  }
  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL et ADMIN_PASSWORD doivent être fournis en variables d'environnement.");
    console.error("   Voir l'en-tête de ce fichier pour la commande exacte.");
    process.exit(1);
  }
  exigerMotDePasseSolide(password);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Le compte existe-t-il déjà dans Supabase Auth ?
  const { data: liste, error: erreurListe } = await admin.auth.admin.listUsers();
  if (erreurListe) {
    console.error("❌ Impossible de lister les comptes :", erreurListe.message);
    process.exit(1);
  }
  const existant = liste.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;

  if (existant) {
    console.log("ℹ️  Le compte existe déjà — mise à jour du mot de passe.");
    const { error } = await admin.auth.admin.updateUserById(existant.id, { password });
    if (error) {
      console.error("❌ Mise à jour impossible :", error.message);
      process.exit(1);
    }
    userId = existant.id;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // compte interne : pas d'e-mail de confirmation à attendre
      user_metadata: { full_name: fullName, phone },
    });
    if (error || !data.user) {
      console.error("❌ Création impossible :", error?.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log("✅ Compte créé dans Supabase Auth.");
  }

  // 2. Élever le profil au rôle admin (le trigger handle_new_user a créé la
  //    ligne `profiles` avec role = 'client' par défaut).
  await prisma.profile.upsert({
    where: { id: userId },
    update: { role: "admin", fullName, phone, updatedAt: new Date() },
    create: { id: userId, email, fullName, phone, role: "admin" },
  });

  console.log(`✅ ${email} dispose désormais du rôle administratrice.`);
  console.log("→ Connectez-vous puis changez ce mot de passe depuis votre espace compte.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
