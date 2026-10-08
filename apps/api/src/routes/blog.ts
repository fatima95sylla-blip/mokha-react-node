import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const blogRouter = Router();

function slugifier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ==================== PUBLIC ====================

// GET /api/blog?categorie=&q= — articles publiés uniquement
blogRouter.get("/", async (req, res) => {
  const { categorie, q } = req.query;
  const articles = await prisma.blogPost.findMany({
    where: {
      statut: "publie",
      ...(categorie ? { category: { slug: String(categorie) } } : {}),
      ...(q
        ? { OR: [{ titre: { contains: String(q), mode: "insensitive" } }, { extrait: { contains: String(q), mode: "insensitive" } }] }
        : {}),
    },
    include: { category: true },
    orderBy: { publieLe: "desc" },
  });
  res.json(articles);
});

// GET /api/blog/categories — public
blogRouter.get("/categories", async (_req, res) => {
  res.json(await prisma.blogCategory.findMany({ orderBy: { nom: "asc" } }));
});

// GET /api/blog/admin/liste — TOUS les articles (y compris brouillons)
blogRouter.get("/admin/liste", requireAuth, requireAdmin, async (_req, res) => {
  const articles = await prisma.blogPost.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });
  res.json(articles);
});

// GET /api/blog/admin/detail/:id
blogRouter.get("/admin/detail/:id", requireAuth, requireAdmin, async (req, res) => {
  const article = await prisma.blogPost.findUnique({ where: { id: req.params.id }, include: { category: true } });
  if (!article) return res.status(404).json({ error: "Article introuvable." });
  res.json(article);
});

// GET /api/blog/:slug — public, article publié uniquement
blogRouter.get("/:slug", async (req, res) => {
  const article = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug },
    include: { category: true },
  });
  if (!article || article.statut !== "publie") {
    return res.status(404).json({ error: "Article introuvable." });
  }
  const similaires = await prisma.blogPost.findMany({
    where: { statut: "publie", categoryId: article.categoryId, id: { not: article.id } },
    take: 3,
    orderBy: { publieLe: "desc" },
  });
  res.json({ ...article, similaires });
});

// ==================== ADMIN ====================

const articleSchema = z.object({
  titre: z.string().min(3).max(200),
  slug: z.string().max(220).optional(),
  extrait: z.string().max(400).optional(),
  contenu: z.string().max(20000).optional(),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  statut: z.enum(["brouillon", "publie"]).default("brouillon"),
});

async function slugUniqueArticle(base: string, ignorerId?: string): Promise<string> {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existant = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existant || existant.id === ignorerId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

blogRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Article invalide.", details: parsed.error.flatten() });

  const { slug: slugPropose, statut, ...data } = parsed.data;
  const slug = await slugUniqueArticle(slugifier(slugPropose || data.titre));

  const article = await prisma.blogPost.create({
    data: { ...data, slug, statut, publieLe: statut === "publie" ? new Date() : null },
  });
  res.status(201).json(article);
});

blogRouter.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = articleSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Article invalide.", details: parsed.error.flatten() });

  const existant = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
  if (!existant) return res.status(404).json({ error: "Article introuvable." });

  const { slug: slugPropose, statut, ...data } = parsed.data;
  const slug = slugPropose || data.titre ? await slugUniqueArticle(slugifier(slugPropose || data.titre || existant.titre), existant.id) : undefined;

  // On publie une seule fois une date de publication : elle ne doit pas
  // reculer si l'admin republie un article après l'avoir remis en brouillon.
  const publieLe =
    statut === "publie" && !existant.publieLe
      ? new Date()
      : statut === "brouillon"
        ? existant.publieLe
        : undefined;

  const article = await prisma.blogPost.update({
    where: { id: existant.id },
    data: {
      ...data,
      ...(slug ? { slug } : {}),
      ...(statut ? { statut } : {}),
      ...(publieLe !== undefined ? { publieLe } : {}),
      updatedAt: new Date(),
    },
  });
  res.json(article);
});

blogRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ---------- Catégories de blog ----------
blogRouter.post("/categories", requireAuth, requireAdmin, async (req, res) => {
  const parsed = z.object({ nom: z.string().min(2).max(100) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Catégorie invalide." });

  let slug = slugifier(parsed.data.nom);
  let n = 1;
  while (await prisma.blogCategory.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugifier(parsed.data.nom)}-${n}`;
  }
  const categorie = await prisma.blogCategory.create({ data: { nom: parsed.data.nom, slug } });
  res.status(201).json(categorie);
});

blogRouter.delete("/categories/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.blogCategory.delete({ where: { id: req.params.id } }).catch(() => {});
  res.status(204).send();
});
