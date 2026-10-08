# MOKHA — Monorepo (React/Next.js + Node.js/Express + Supabase)

Ce projet remplace la stack Lovable (TanStack Start) par une stack standard et
indépendante :

- `apps/web` — Frontend **Next.js 15** (App Router, React 19, Tailwind v4)
- `apps/api` — Backend **Node.js/Express** (TypeScript, Prisma, JWT Supabase)
- **Supabase** — Postgres managé, Auth, Storage

## Pourquoi cette architecture

- Supabase Auth gère inscription/connexion/sessions ; le frontend obtient un
  JWT qu'il transmet à l'API dans l'en-tête `Authorization: Bearer <token>`.
- L'API Express **ne fait jamais confiance** au rôle envoyé par le client :
  elle vérifie le JWT puis relit le rôle réel dans la table `profiles`.
- Toute la logique métier (catalogue, panier, commandes, sur-mesure...) vit
  dans l'API Node via Prisma, connecté directement à la base Postgres de
  Supabase.
- Supabase Storage est prévu pour les images (produits, photos d'inspiration
  sur-mesure) — à brancher en Phase suivante.

## Démarrage rapide

Guide détaillé pas à pas (création du projet Supabase, buckets, variables
d'environnement, dépannage) : **[docs/LANCEMENT_LOCAL.md](docs/LANCEMENT_LOCAL.md)**.

Avant toute mise en production, passez en revue **[docs/SECURITE_PRODUCTION.md](docs/SECURITE_PRODUCTION.md)**.

## Démarrage

### 1. Base de données Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans le SQL Editor, exécutez `supabase/migrations/0001_init.sql`.
3. Récupérez les clés dans *Project Settings > API* et la chaîne de connexion
   dans *Project Settings > Database*.

### 2. API (`apps/api`)

```bash
cd apps/api
cp .env.example .env   # renseignez DATABASE_URL, SUPABASE_JWT_SECRET
npm install
npm run prisma:generate
npm run seed            # charge le catalogue initial dans Supabase

# Créer le compte administratrice (le mot de passe n'est JAMAIS écrit dans un fichier)
ADMIN_EMAIL="fatima95sylla@gmail.com" \
ADMIN_PASSWORD='votre-mot-de-passe-fort' \
ADMIN_NAME="Fatoumata Sylla" \
ADMIN_PHONE="+224 626 600 095" \
npm run create-admin
npm run dev             # http://localhost:4000
```

### 3. Frontend (`apps/web`)

```bash
cd apps/web
cp .env.example .env    # renseignez NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / API_URL
npm install
npm run dev              # http://localhost:3000
```

## État d'avancement

| Zone | Statut |
|---|---|
| Identité visuelle (couleurs, polices) | ✅ portée à l'identique |
| Page d'accueil | ✅ portée |
| Boutique (catalogue + filtres) | ✅ portée |
| Fiche produit | ✅ portée |
| Panier | ✅ instantané produit + `localStorage` (prix revalidé au checkout) |
| Catalogue connecté à Supabase (API réelle) | ✅ fait |
| Authentification (inscription, connexion, mot de passe oublié, compte) | ✅ fait |
| Sur mesure (formulaire multi-étapes, upload, SM-AAAA-XXXX, suivi) | ✅ fait |
| Favoris (local + synchronisés au compte) | ✅ fait |
| Pages éditoriales (à-propos, atelier, services, FAQ, contact) | ✅ fait |
| Collections (liste + détail) | ✅ fait |
| Blog/journal (public + back-office) | ✅ fait |
| Panier détaillé (`/panier`) | ✅ fait |
| Checkout (`/commande`) avec revalidation serveur des prix et du stock | ✅ fait |
| Suivi de commande invitée (numéro + e-mail) | ✅ fait |
| Back-office `/admin` — dashboard, commandes, sur-mesure, clientes | ✅ fait |
| Back-office — produits (CRUD complet : images, variantes, catégories, collections) | ✅ fait |

## ⚠️ Logo à remplacer

Le fichier `mokha-logo.png` du projet Lovable n'a pas pu être récupéré (seul
un pointeur vers leur CDN interne existait). Déposez le vrai fichier dans
`apps/web/public/mokha-logo.png` ; en attendant, un repli typographique
s'affiche automatiquement.

## Devise et coordonnées (Guinée)

- Devise de référence : **GNF** (franc guinéen), définie dans `apps/web/src/lib/currency.ts`.
- ⚠️ **Les prix du catalogue doivent être ressaisis** : ceux du seed proviennent
  du projet initial et étaient exprimés en FCFA. Ils ne sont pas convertibles
  tels quels.
- Contacts configurés : `fatima95sylla@gmail.com`, `+224 626 600 095`.
- Adresse de l'atelier : Petit Simbaya, Washington, Carrefour Parisien, Conakry.
- ⚠️ Reste à renseigner dans `apps/web/src/data/mokha.ts` (puis en base) :
  le **lien Instagram**. Volontairement vide plutôt qu'inventé ; le footer le
  masque tant qu'il l'est.

## Sécurité — à faire dès l'installation

1. **Changez le mot de passe administratrice** après la première connexion.
2. Ne mettez jamais `ADMIN_PASSWORD` ni `SUPABASE_SERVICE_ROLE_KEY` dans un
   fichier versionné.
3. Dans Supabase, activez la confirmation d'e-mail (Authentication > Providers)
   pour les comptes clientes.

## Bucket Storage à créer

Le formulaire sur mesure envoie les images d'inspiration dans un bucket
Supabase nommé **`inspirations`** (Storage > New bucket, lecture publique).

Ajoutez une policy d'écriture, par exemple pour n'autoriser que des images
de 5 Mo maximum, et configurez les limites du bucket (taille et types MIME) :
le contrôle fait côté navigateur est un confort, il est contournable.

## Paiement — état actuel, honnête

Aucune passerelle de paiement en ligne (Orange Money API, MTN MoMo API, Stripe…)
n'est intégrée. Le checkout :

1. **Revalide tout côté serveur** (`apps/api/src/routes/commandes.ts`) : prix,
   variante, stock. Le panier envoyé par le navigateur n'est qu'une
   proposition.
2. Crée la commande avec un paiement au statut `en_attente`.
3. Redirige la cliente vers WhatsApp pour que la maison lui communique les
   coordonnées de paiement et confirme manuellement la commande.

C'est volontaire : afficher un faux formulaire de carte bancaire ou un statut
« payé » sans règlement réel serait mensonger. Pour automatiser, il faudra
intégrer une vraie API de paiement (Orange Money Guinée, MTN MoMo, ou un
agrégateur comme PayTech/CinetPay qui couvre l'Afrique de l'Ouest) et faire
passer `payments.statut` à `valide` uniquement sur callback confirmé de cette
API — jamais depuis le navigateur.

## Frais de livraison — placeholder

`FRAIS_LIVRAISON` dans `apps/api/src/routes/commandes.ts` est un tarif fixe
(30 000 GNF pour Conakry, gratuit en retrait atelier, à confirmer hors
Conakry). À terme, administrable depuis le back-office.

## Back-office (`/admin`)

Protégé par `RouteProtegee adminRequis` côté affichage, et par
`requireAuth + requireAdmin` sur **chaque route API** côté serveur — c'est ce
second niveau qui fait réellement autorité.

- **Tableau de bord** : chiffre d'affaires du mois, commandes à traiter,
  demandes sur mesure en attente, nombre de clientes, activité récente.
- **Commandes** : liste filtrable par statut, détail complet (articles,
  adresse, contact), changement de statut, et **confirmation manuelle du
  paiement** — un bouton "Marquer comme reçu" à n'utiliser qu'après
  vérification réelle (relevé mobile money ou espèces comptées). Ce n'est pas
  un webhook de passerelle : voir la section Paiement plus haut.
- **Sur mesure** : liste filtrable, détail avec mesures, inspirations
  (images), notes internes (jamais visibles côté cliente), changement de
  statut, et lien direct vers WhatsApp pour recontacter la cliente.
- **Clientes** : liste en lecture seule avec nombre de commandes et de
  demandes sur mesure par cliente.
- **Produits** : liste en lecture seule pour l'instant. La création/édition
  de produits, variantes et stock depuis l'interface est la prochaine étape ;
  en attendant, le catalogue se met à jour via `apps/api/prisma/seed.ts`.

Pour créer votre première administratrice, voir la section *Créer le compte
administratrice* plus haut.

## CRUD produits — détails

- **Images** : upload vers le bucket Supabase `produits` (voir plus bas), remplacées intégralement à chaque enregistrement.
- **Variantes** : lignes libres taille/couleur/stock ; les tailles et couleurs sont créées à la volée (upsert) si elles n'existent pas encore.
- **Suppression** : si un produit apparaît dans des commandes existantes, la suppression est refusée avec un message clair — dépubliez-le plutôt (case "Publié" décochée) pour le retirer du site sans casser l'historique des commandes.
- **Catégories/collections** : créées à la volée depuis le formulaire d'article de blog (catégories) ; les collections se gèrent pour l'instant via l'API (pas d'écran dédié — prochaine amélioration si besoin).

## Bucket Storage supplémentaire

En plus du bucket `inspirations` (sur-mesure), créez un bucket **`produits`**
(Storage > New bucket, lecture publique) : il reçoit les photos du catalogue
et les images de couverture des articles de journal.

## Pages éditoriales

- **À propos / Atelier** : contenu narratif encore statique (`data/mokha.ts`), assumé — ce sont des textes de marque, pas des données transactionnelles.
- **Services / FAQ** : dynamiques, administrables depuis `/admin/services` et `/admin/faq`.
- **Contact** : pas de faux formulaire d'envoi d'e-mail côté serveur (aucune messagerie n'est configurée) — le bouton ouvre WhatsApp ou l'application e-mail avec le message pré-rempli.
- **Journal/Blog** : articles publiés dynamiquement, back-office avec brouillon/publication, catégories créées à la volée.
- **Collections** : liste et détail connectés à l'API, ferment les liens morts identifiés dès l'audit initial.
