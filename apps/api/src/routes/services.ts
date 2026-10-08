import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const servicesRouter = Router();

function slugifier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/services — public
servicesRouter.get("/", async (_req, res) => {
  const services = await prisma.service.findMany({ where: { actif: true }, orderBy: { ordre: "asc" } });
  res.json(services);
});

// GET /api/services/admin — toutes, y compris inactives
servicesRouter.get("/admin", requireAuth, requireAdmin, async (_req, res) => {
  const services = await prisma.service.findMany({ orderBy: { ordre: "asc" } });
  res.json(services);
});

const serviceSchema = z.object({
  nom: z.string().min(2).max(150),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  ordre: z.number().int().default(0),
  actif: z.boolean().default(true),
});

servicesRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Service invalide.", details: parsed.error.flatten() });

  let slug = slugifier(parsed.data.nom);
  let n = 1;
  while (await prisma.service.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugifier(parsed.data.nom)}-${n}`;
  }
  const service = await prisma.service.create({ data: { ...parsed.data, slug } });
  res.status(201).json(service);
});

servicesRouter.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = serviceSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Service invalide.", details: parsed.error.flatten() });
  const service = await prisma.service.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(service);
});

servicesRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.service.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
