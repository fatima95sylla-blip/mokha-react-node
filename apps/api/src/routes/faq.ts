import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const faqRouter = Router();

// GET /api/faq — public
faqRouter.get("/", async (_req, res) => {
  const faqs = await prisma.faq.findMany({ where: { publie: true }, orderBy: { ordre: "asc" } });
  res.json(faqs);
});

// GET /api/faq/admin — toutes, y compris non publiées
faqRouter.get("/admin", requireAuth, requireAdmin, async (_req, res) => {
  const faqs = await prisma.faq.findMany({ orderBy: { ordre: "asc" } });
  res.json(faqs);
});

const faqSchema = z.object({
  question: z.string().min(3).max(300),
  reponse: z.string().min(3).max(3000),
  categorie: z.string().max(100).optional(),
  ordre: z.number().int().default(0),
  publie: z.boolean().default(true),
});

faqRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = faqSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Question invalide.", details: parsed.error.flatten() });
  const faq = await prisma.faq.create({ data: parsed.data });
  res.status(201).json(faq);
});

faqRouter.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = faqSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Question invalide.", details: parsed.error.flatten() });
  const faq = await prisma.faq.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(faq);
});

faqRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.faq.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
