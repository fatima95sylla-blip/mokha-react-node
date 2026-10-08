import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

// Le frontend Next.js s'authentifie auprès de Supabase Auth (email/mdp, etc.) et
// obtient un access_token JWT. Il l'envoie à l'API dans l'en-tête Authorization.
// L'API ne fait JAMAIS confiance à un rôle envoyé par le client : elle vérifie
// le JWT avec le secret du projet Supabase, puis relit le rôle réel en base
// (table profiles), qui seul un admin peut avoir modifié.

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: "client" | "admin" };
    }
  }
}

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentification requise." });
  }
  if (!SUPABASE_JWT_SECRET) {
    console.error("SUPABASE_JWT_SECRET manquant côté serveur.");
    return res.status(500).json({ error: "Configuration serveur incomplète." });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET, { algorithms: ["HS256"] }) as { sub: string; email?: string };
    const profile = await prisma.profile.findUnique({ where: { id: payload.sub } });
    if (!profile) {
      return res.status(401).json({ error: "Profil introuvable." });
    }
    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role === "admin" ? "admin" : "client",
    };
    next();
  } catch {
    return res.status(401).json({ error: "Session invalide ou expirée." });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Accès réservé à l'administration." });
  }
  next();
}

// Auth optionnelle : utile pour le panier invité qui devient un panier client
// une fois connecté, sans bloquer les visiteurs non connectés.
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ") || !SUPABASE_JWT_SECRET) return next();
  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET, { algorithms: ["HS256"] }) as { sub: string };
    const profile = await prisma.profile.findUnique({ where: { id: payload.sub } });
    if (profile) {
      req.user = { id: profile.id, email: profile.email, role: profile.role === "admin" ? "admin" : "client" };
    }
  } catch {
    /* token absent/invalide -> visiteur anonyme, on continue sans bloquer */
  }
  next();
}
