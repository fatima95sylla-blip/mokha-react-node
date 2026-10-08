# Sécurité — checklist avant mise en production

Ce document liste ce qui est déjà fait dans le code, et ce qui reste à votre
charge (configuration, choix d'hébergement, process). Rien ici n'est
optionnel pour un site qui traite de vraies commandes et de vraies données
personnelles.

## ✅ Déjà en place dans le code

- **Autorisation côté serveur uniquement** : chaque route admin vérifie
  `requireAuth` + `requireAdmin` ; le rôle est relu en base à chaque requête,
  jamais fait confiance depuis le frontend.
- **JWT vérifié avec algorithme figé** (`HS256` uniquement) — empêche une
  attaque par confusion d'algorithme.
- **Row Level Security (RLS)** activée sur toutes les tables Supabase, avec
  policies séparant client/admin.
- **Revalidation serveur des prix et du stock** au moment de la commande —
  le panier envoyé par le navigateur n'est jamais une source de vérité.
- **Validation systématique des entrées** (zod) sur les routes d'écriture.
- **Aucun secret dans le code** : clé service_role, mot de passe admin, JWT
  secret — tous lus depuis l'environnement.
- **En-têtes de sécurité** (`helmet`) et **limitation de débit** sur les
  routes publiques sensibles (sur-mesure, commandes) contre le spam et
  l'épuisement de stock.
- **Erreurs internes non exposées** en production (message générique ; le
  détail part dans les logs serveur, pas dans la réponse HTTP).
- **Suivi invité protégé** : numéro de commande/demande + e-mail requis, pour
  qu'un identifiant séquentiel deviné ne révèle rien.

## ⚠️ À votre charge avant l'ouverture au public

### Comptes et secrets

- [ ] **Changez le mot de passe administratrice** partagé plus tôt dans cette
      conversation — il a circulé en clair, considérez-le compromis.
- [ ] Générez des secrets différents entre l'environnement de test et de
      production (ne réutilisez pas le même projet Supabase).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` : uniquement dans les variables
      d'environnement du serveur de production, jamais dans un commit, jamais
      dans un fichier `.env` versionné.
- [ ] Activez l'authentification à deux facteurs sur votre compte Supabase et
      sur votre compte d'hébergement (Vercel/Render/etc.).

### Supabase

- [ ] **Authentication → Providers → Email** : activez la confirmation
      d'e-mail (sinon n'importe qui peut créer un compte avec un e-mail qu'il
      ne possède pas).
- [ ] **Authentication → Rate Limits** : vérifiez les limites par défaut
      (inscription, connexion, réinitialisation de mot de passe) — Supabase
      en fournit, mais confirmez qu'elles sont actives sur votre plan.
- [ ] **Authentication → Password** : activez "Leaked password protection" si
      disponible sur votre plan.
- [ ] **Storage** : sur les buckets `inspirations` et `produits`, limitez la
      taille de fichier et les types MIME au niveau du bucket lui-même (pas
      seulement dans le code React, qui est contournable).
- [ ] **Database → Backups** : vérifiez la fréquence des sauvegardes
      automatiques de votre plan ; envisagez un plan payant si le gratuit ne
      couvre pas la restauration à un point dans le temps.

### Serveur API (`apps/api`)

- [ ] `NODE_ENV=production` en production (active le mode d'erreur non
      verbeux déjà codé).
- [ ] `WEB_ORIGIN` = le vrai domaine de production uniquement (pas de
      wildcard, pas de `localhost`).
- [ ] `TRUST_PROXY=1` si l'API tourne derrière un reverse proxy/load balancer
      (Render, Railway, Fly.io...).
- [ ] Servez l'API exclusivement en **HTTPS** (généralement automatique chez
      les hébergeurs modernes — vérifiez que le HTTP est bien redirigé).
- [ ] Mettez en place une surveillance des erreurs (Sentry ou équivalent) :
      actuellement les erreurs partent seulement dans les logs bruts.
- [ ] `npm audit` régulièrement sur `apps/api` et `apps/web`, et tenez les
      dépendances à jour.

### Paiement (rappel)

- [ ] Tant qu'aucune vraie passerelle de paiement n'est intégrée, chaque
      commande doit être confirmée manuellement (voir `/admin/commandes`,
      bouton "Marquer comme reçu") **après vérification réelle** du
      règlement. Ne prenez jamais cette habitude à la légère : c'est la seule
      protection contre les fausses commandes non payées.
- [ ] Si vous intégrez une vraie passerelle plus tard (Orange Money, MTN MoMo,
      CinetPay...), le statut de paiement doit être mis à jour **uniquement**
      par le callback/webhook signé de cette passerelle, jamais par une
      requête du navigateur.

### Tests avant ouverture

- [ ] Parcours complet : inscription → connexion → panier → commande →
      suivi, avec un compte de test.
- [ ] Parcours sur-mesure complet, avec upload d'image réel.
- [ ] Vérifiez qu'un compte **client** ne peut pas accéder à `/admin` (essayez
      manuellement).
- [ ] Vérifiez qu'un appel direct à une route admin de l'API (sans token, ou
      avec un token client) renvoie bien 401/403 — testez avec `curl` ou
      Postman, pas seulement via l'interface.
- [ ] Testez le site sur mobile réel (pas seulement le mode responsive du
      navigateur) : formulaires, upload photo, paiement.
- [ ] Videz le cache et testez en navigation privée pour repérer tout ce qui
      dépendrait d'un état local oublié.

### Après l'ouverture

- [ ] Surveillez les premières commandes de près la première semaine.
- [ ] Ayez un moyen simple de contacter une cliente en cas de problème de
      commande (déjà en place via WhatsApp dans `/admin/commandes`).
