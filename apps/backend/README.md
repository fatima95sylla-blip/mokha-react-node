# Backend Spring Boot MOKHA

Backend autonome destiné à remplacer progressivement `apps/api` (Express). Le dossier `apps/api` reste inchangé et peut servir de retour arrière. Ce socle ne porte que la santé et l'authentification; aucun endpoint métier n'est simulé.

## Prérequis et démarrage local

- Java 21 ou supérieur (Java 25 convient).
- Maven 3.9 ou supérieur.
- PostgreSQL local avec une base vide nommée `mokha` et un utilisateur applicatif autorisé à créer les tables.

Depuis PowerShell, dans `apps/backend` :

```powershell
$env:DATABASE_URL = 'jdbc:postgresql://localhost:5432/mokha'
$env:DB_USERNAME = 'votre-utilisateur-postgres'
$env:DB_PASSWORD = 'votre-mot-de-passe-postgres'
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$env:CORS_ALLOWED_ORIGINS = 'http://localhost:5173'
mvn spring-boot:run
```

`JWT_SECRET` accepte une chaîne d'au moins 32 octets UTF-8 ou la forme `base64:<clé>`. Il n'existe aucune valeur secrète par défaut. `application.yml` ne contient que des références aux variables d'environnement; ne placez jamais de mot de passe réel dans un fichier suivi par Git. Flyway applique automatiquement la migration de la seule table `profiles`; Hibernate vérifie ensuite le schéma sans le modifier.

Le serveur écoute par défaut sur `http://localhost:8080`. Le port est remplaçable via `PORT`.

## API disponible

- `GET /api/health` retourne `{"status":"UP"}`.
- `POST /api/auth/register` accepte `email`, `password` (12 à 72 caractères, maximum 72 octets UTF-8), et facultativement `fullName`, `phone`. Les inscriptions reçoivent toujours le rôle `CLIENT`.
- `POST /api/auth/login` accepte `email` et `password`.
- `GET /api/auth/me` exige `Authorization: Bearer <accessToken>`.

Inscription et connexion renvoient `accessToken`, `tokenType`, `expiresIn` en secondes et `profile`. Les mots de passe sont hachés en BCrypt (facteur 12). Les JWT HS256 expirent après 15 minutes par défaut (`JWT_EXPIRATION`, durée ISO-8601 telle que `PT30M`). Le rôle est signé côté serveur et n'est jamais accepté depuis le formulaire.

## Premier compte administrateur

Le bootstrap est inactif tant que les deux variables suivantes sont absentes. Pour l'activer une fois au démarrage, fournissez `ADMIN_BOOTSTRAP_EMAIL` et `ADMIN_BOOTSTRAP_PASSWORD` dans l'environnement du processus. Le mot de passe doit faire au moins 12 caractères et au plus 72 octets UTF-8. Il est haché en BCrypt et n'est jamais écrit en configuration ou journal. Une adresse déjà cliente fait échouer le démarrage sans promotion; un administrateur existant est laissé inchangé. Retirez les variables après création.

## Origines CORS

`CORS_ALLOWED_ORIGINS` contient une ou plusieurs origines séparées par des virgules. La valeur locale par défaut est `http://localhost:3000`; aucune origine générique `*` n'est activée.

## Vérification

```powershell
mvn test
mvn package
```

Le test unitaire couvre la signature/lecture des JWT et le rejet des clés trop courtes. La vérification complète nécessite aussi PostgreSQL pour démarrer l'application et appliquer Flyway.

## Portage restant

Le catalogue, panier, commandes, paiement, comptes/adresses, favoris, demandes sur mesure, blog, FAQ, services, back-office, stockage d'images et leur autorisation restent à porter depuis Express avant toute bascule de `apps/web`. Ce projet ne modifie ni le frontend ni le backend historique.