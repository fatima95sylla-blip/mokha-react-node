# Lancer MOKHA en local

Ce guide part de zéro : projet Supabase non créé, rien d'installé.

## 0. Prérequis

- Node.js 20 ou plus (`node -v`)
- Un compte sur [supabase.com](https://supabase.com) (gratuit)
- npm (fourni avec Node)

## 1. Créer le projet Supabase

1. [supabase.com](https://supabase.com) → *New project*. Choisissez une
   région proche (Europe de l'Ouest est la plus proche de la Guinée).
2. Notez le mot de passe de base de données que vous choisissez à la création
   — vous en aurez besoin à l'étape 3.
3. Une fois le projet prêt (1-2 minutes), allez dans **SQL Editor** → *New
   query*, collez tout le contenu de `supabase/migrations/0001_init.sql`,
   exécutez (*Run*). Vous devez voir "Success. No rows returned".
4. Allez dans **Storage** → *New bucket* → créez-en deux, tous deux **publics
   en lecture** :
   - `inspirations` (photos jointes aux demandes sur-mesure)
   - `produits` (photos du catalogue et du journal)
5. Récupérez les clés dans **Project Settings → API** :
   - `Project URL`
   - `anon public` key
   - `service_role` key (⚠️ secrète, jamais côté navigateur)
6. Récupérez la chaîne de connexion dans **Project Settings → Database →
   Connection string → URI**, mode *Transaction pooler* recommandé. Remplacez
   `[YOUR-PASSWORD]` par le mot de passe noté à l'étape 2.
7. Récupérez le JWT Secret dans **Project Settings → API → JWT Settings**.

## 2. Configurer et lancer l'API (`apps/api`)

```bash
cd apps/api
cp .env.example .env
```

Ouvrez `.env` et renseignez :
- `DATABASE_URL` → la chaîne de connexion de l'étape 1.6
- `SUPABASE_JWT_SECRET` → l'étape 1.7
- `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` → l'étape 1.5 (nécessaires
  uniquement pour créer le compte admin)
- Laissez `WEB_ORIGIN=http://localhost:3000`, `PORT=4000`

Puis :

```bash
npm install
npm run prisma:generate
npm run seed              # charge le catalogue de démonstration
npm run dev               # démarre sur http://localhost:4000
```

Vérifiez que ça répond : `curl http://localhost:4000/api/health` doit
renvoyer `{"ok":true}`.

### Créer votre compte administratrice

Dans un **autre terminal**, toujours dans `apps/api` :

```bash
ADMIN_EMAIL="fatima95sylla@gmail.com" \
ADMIN_PASSWORD='un-mot-de-passe-fort-different-de-celui-partage-avant' \
ADMIN_NAME="Fatoumata Sylla" \
ADMIN_PHONE="+224 626 600 095" \
npm run create-admin
```

## 3. Configurer et lancer le frontend (`apps/web`)

Dans un troisième terminal :

```bash
cd apps/web
cp .env.example .env
```

Renseignez dans `.env` :
- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` → étape 1.5
- `NEXT_PUBLIC_API_URL=http://localhost:4000/api`

Puis :

```bash
npm install
npm run dev                # démarre sur http://localhost:3000
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## 4. Vérifications rapides

- La page d'accueil affiche des produits → l'API et Supabase sont bien
  connectés.
- `/connexion` → connectez-vous avec le compte admin créé plus haut.
- `/admin` → le tableau de bord doit s'afficher (sinon, vérifiez que le rôle
  `admin` est bien enregistré : dans Supabase, *Table Editor → profiles*,
  colonne `role`).
- `/sur-mesure` → soumettez une demande de test, vérifiez qu'elle apparaît
  dans `/admin/sur-mesure`.
- `/boutique` → ajoutez un article au panier, passez une commande de test,
  vérifiez qu'elle apparaît dans `/admin/commandes`.

## Problèmes fréquents

| Symptôme | Cause probable |
|---|---|
| Page d'accueil sans produits, pas d'erreur visible | L'API n'est pas lancée, ou `NEXT_PUBLIC_API_URL` est mal renseigné dans `apps/web/.env` |
| `401 Unauthorized` partout après connexion | `SUPABASE_JWT_SECRET` ne correspond pas à celui du projet Supabase utilisé côté frontend |
| Upload d'image échoue | Bucket `inspirations` ou `produits` non créé, ou non public en lecture |
| `/admin` redirige en boucle vers `/connexion` | Le compte connecté n'a pas le rôle `admin` en base — relancez `npm run create-admin`, ou modifiez la colonne `role` dans Supabase |
| Erreur Prisma au démarrage de l'API | `DATABASE_URL` incorrecte, ou la migration SQL n'a pas été exécutée |
