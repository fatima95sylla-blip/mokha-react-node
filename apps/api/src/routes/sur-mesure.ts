import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";

export const surMesureRouter = Router();

const demandeSchema = z.object({
  nom: z.string().min(2),
  telephone: z.string().min(6),
  email: z.string().email(),
  typeVetement: z.string().min(2),
  occasion: z.string().optional(),
  couleurs: z.string().optional(),
  tissu: z.string().optional(),
  description: z.string().optional(),
  budgetIndicatif: z.string().optional(),
  dateSouhaitee: z.string().datetime().optional(),
  inspirations: z.string().optional(),
  mesures: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
});

async function genererNumero(): Promise<string> {
  const annee = new Date().getFullYear();
  const dernier = await prisma.customRequest.count({
    where: { numero: { startsWith: `SM-${annee}-` } },
  });
  const suivant = String(dernier + 1).padStart(4, "0");
  return `SM-${annee}-${suivant}`;
}

// POST /api/sur-mesure — création d'une demande (client connecté ou invité)
surMesureRouter.post("/", optionalAuth, async (req, res) => {
  const parsed = demandeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Formulaire invalide.", details: parsed.error.flatten() });
  }
  const { imageUrls, dateSouhaitee, ...data } = parsed.data;
  const numero = await genererNumero();

  const demande = await prisma.customRequest.create({
    data: {
      ...data,
      numero,
      profileId: req.user?.id,
      dateSouhaitee: dateSouhaitee ? new Date(dateSouhaitee) : undefined,
      images: imageUrls?.length
        ? { create: imageUrls.map((url, ordre) => ({ url, ordre })) }
        : undefined,
    },
    include: { images: true },
  });

  res.status(201).json(demande);
});

// GET /api/sur-mesure/:numero — suivi public par numéro (pas besoin de compte)
surMesureRouter.get("/:numero", async (req, res) => {
  const demande = await prisma.customRequest.findUnique({
    where: { numero: req.params.numero },
    select: { numero: true, statut: true, typeVetement: true, dateSouhaitee: true },
  });
  if (!demande) return res.status(404).json({ error: "Demande introuvable." });
  res.json(demande);
});

// GET /api/sur-mesure — liste des demandes de la cliente connectée, ou tout pour l'admin
surMesureRouter.get("/", requireAuth, async (req, res) => {
  const demandes = await prisma.customRequest.findMany({
    where: req.user!.role === "admin" ? {} : { profileId: req.user!.id },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(demandes);
});

// Détail complet (mesures, notes internes) — réservé à l'admin.
surMesureRouter.get("/detail/:id", requireAuth, requireAdmin, async (req, res) => {
  const demande = await prisma.customRequest.findUnique({
    where: { id: req.params.id },
    include: {
      images: { orderBy: { ordre: "asc" } },
      profile: { select: { id: true, email: true, fullName: true, phone: true } },
    },
  });
  if (!demande) return res.status(404).json({ error: "Demande introuvable." });
  res.json(demande);
});

// PATCH /api/sur-mesure/:id/statut — admin uniquement
surMesureRouter.patch("/:id/statut", requireAuth, requireAdmin, async (req, res) => {
  const { statut, notesInternes } = req.body as { statut: string; notesInternes?: string };
  const demande = await prisma.customRequest.update({
    where: { id: req.params.id },
    data: { statut, notesInternes },
  });
  res.json(demande);
});
