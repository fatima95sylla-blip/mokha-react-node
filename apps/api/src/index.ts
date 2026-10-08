import "dotenv/config";
import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { catalogueRouter } from "./routes/catalogue.js";
import { adminRouter } from "./routes/admin.js";
import { blogRouter } from "./routes/blog.js";
import { faqRouter } from "./routes/faq.js";
import { servicesRouter } from "./routes/services.js";
import { commandesRouter } from "./routes/commandes.js";
import { compteRouter } from "./routes/compte.js";
import { surMesureRouter } from "./routes/sur-mesure.js";

// ---------- Validation des variables d'environnement au démarrage ----------
// Mieux vaut un crash immédiat et explicite au déploiement qu'une API qui
// démarre "à moitié" et échoue de façon confuse sur la première requête.
const requises = ["DATABASE_URL", "SUPABASE_JWT_SECRET"];
const manquantes = requises.filter((v) => !process.env[v]);
if (manquantes.length) {
  console.error(`❌ Variables d'environnement manquantes : ${manquantes.join(", ")}`);
  process.exit(1);
}

const app = express();

// Si l'API tourne derrière un reverse proxy / load balancer (Render, Railway,
// Fly.io, nginx...), ceci est nécessaire pour que express-rate-limit et
// req.ip lisent la vraie IP du client plutôt que celle du proxy.
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin: process.env.WEB_ORIGIN?.split(",") ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

// Limite globale, généreuse : un filet de sécurité contre les abus grossiers,
// pas une protection fine (celle-ci est faite route par route ci-dessous).
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Limite stricte pour les écritures publiques sensibles : une cliente non
// connectée peut soumettre une demande sur-mesure ou une commande, ce qui en
// fait une cible naturelle pour le spam ou l'épuisement de stock.
const limiteEcpituresPubliques = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives. Merci de réessayer dans quelques minutes." },
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/sur-mesure", limiteEcpituresPubliques);
app.use("/api/commandes", limiteEcpituresPubliques);

app.use("/api", catalogueRouter);
app.use("/api/sur-mesure", surMesureRouter);
app.use("/api/compte", compteRouter);
app.use("/api/commandes", commandesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/blog", blogRouter);
app.use("/api/services", servicesRouter);
app.use("/api/faq", faqRouter);

// 404 explicite plutôt qu'un HTML par défaut d'Express.
app.use((req, res) => {
  res.status(404).json({ error: `Route inconnue : ${req.method} ${req.path}` });
});

// Handler d'erreur global. Les erreurs métier (validation, 404, 409...) sont
// déjà renvoyées directement par les routes avec un message pensé pour la
// cliente. Ici on n'attrape que les erreurs NON prévues (bug, Prisma, réseau) :
// leur message brut ne doit JAMAIS partir en production, il peut contenir des
// détails d'implémentation (requête SQL, chemin de fichier...).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const production = process.env.NODE_ENV === "production";
  res.status(err.status ?? 500).json({
    error: production ? "Une erreur est survenue. Merci de réessayer." : (err.message ?? "Erreur serveur."),
  });
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`[MOKHA API] démarrée sur http://localhost:${port}`);
});
