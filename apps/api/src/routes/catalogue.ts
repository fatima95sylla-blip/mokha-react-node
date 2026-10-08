import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const catalogueRouter = Router();

function slugifier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function slugUnique(base: string, ignorerId?: string): Promise<string> {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existant = await prisma.product.findUnique({ where: { slug } });
    if (!existant || existant.id === ignorerId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// ==================== LECTURE PUBLIQUE ====================

// GET /api/produits — public, avec filtres optionnels (catégorie, collection, dispo, recherche)
catalogueRouter.get("/produits", async (req, res) => {
  const { categorie, collection, disponibilite, q } = req.query;

  const produits = await prisma.product.findMany({
    where: {
      publie: true,
      ...(categorie ? { category: { slug: String(categorie) } } : {}),
      ...(collection ? { collection: { slug: String(collection) } } : {}),
      ...(disponibilite ? { disponibilite: String(disponibilite) } : {}),
      ...(q
        ? {
            OR: [
              { nom: { contains: String(q), mode: "insensitive" } },
              { description: { contains: String(q), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { images: { orderBy: { ordre: "asc" } }, category: true, collection: true, variants: true },
    orderBy: { populaire: "desc" },
  });

  res.json(produits);
});

// GET /api/produits/:slug — public
catalogueRouter.get("/produits/:slug", async (req, res) => {
  const produit = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      images: { orderBy: { ordre: "asc" } },
      category: true,
      collection: true,
      variants: { include: { size: true, color: true } },
    },
  });
  if (!produit || !produit.publie) {
    return res.status(404).json({ error: "Produit introuvable." });
  }
  res.json(produit);
});

// GET /api/collections — public
catalogueRouter.get("/collections", async (_req, res) => {
  const collections = await prisma.collection.findMany({ orderBy: { ordre: "asc" } });
  res.json(collections);
});

// GET /api/categories — public
catalogueRouter.get("/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { ordre: "asc" } });
  res.json(categories);
});

// ==================== ADMIN — PRODUITS ====================

const variantSchema = z.object({
  taille: z.string().max(30).optional(),
  couleur: z.string().max(60).optional(),
  stock: z.number().int().min(0).default(0),
  prixOverride: z.number().positive().optional(),
});

const produitSchema = z.object({
  nom: z.string().min(2).max(200),
  slug: z.string().max(220).optional(), // généré depuis le nom si absent
  reference: z.string().min(2).max(60),
  description: z.string().max(4000).optional(),
  matiere: z.string().max(300).optional(),
  entretien: z.string().max(500).optional(),
  delai: z.string().max(200).optional(),
  confection: z.string().max(500).optional(),
  prix: z.number().positive(),
  categoryId: z.string().uuid().optional(),
  collectionId: z.string().uuid().optional(),
  disponibilite: z.enum(["En stock", "Sur commande", "Édition limitée", "Épuisé"]).default("En stock"),
  surMesureDisponible: z.boolean().default(false),
  nouveaute: z.boolean().default(false),
  publie: z.boolean().default(true),
  images: z.array(z.string().url()).max(10).default([]),
  variantes: z.array(variantSchema).max(60).default([]),
});

// Schéma d'édition distinct : `images`/`variantes` sont ici de simples
// tableaux OPTIONNELS (pas de `.default([])`). Un PATCH qui ne les transmet
// pas ne doit JAMAIS effacer les images ou les variantes existantes — seul un
// tableau explicitement envoyé (même vide) déclenche une synchronisation.
const produitUpdateSchema = z.object({
  nom: z.string().min(2).max(200).optional(),
  slug: z.string().max(220).optional(),
  reference: z.string().min(2).max(60).optional(),
  description: z.string().max(4000).optional(),
  matiere: z.string().max(300).optional(),
  entretien: z.string().max(500).optional(),
  delai: z.string().max(200).optional(),
  confection: z.string().max(500).optional(),
  prix: z.number().positive().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  collectionId: z.string().uuid().nullable().optional(),
  disponibilite: z.enum(["En stock", "Sur commande", "Édition limitée", "Épuisé"]).optional(),
  surMesureDisponible: z.boolean().optional(),
  nouveaute: z.boolean().optional(),
  publie: z.boolean().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  variantes: z.array(variantSchema).max(60).optional(),
});

// GET /api/produits/admin/liste — TOUS les produits (y compris non publiés)
catalogueRouter.get("/produits/admin/liste", requireAuth, requireAdmin, async (_req, res) => {
  const produits = await prisma.product.findMany({
    include: { images: { orderBy: { ordre: "asc" } }, category: true, collection: true, variants: true },
    orderBy: { updatedAt: "desc" },
  });
  res.json(produits);
});

// GET /api/produits/admin/detail/:id — un produit par id, pour le formulaire d'édition
catalogueRouter.get("/produits/admin/detail/:id", requireAuth, requireAdmin, async (req, res) => {
  const produit = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      images: { orderBy: { ordre: "asc" } },
      category: true,
      collection: true,
      variants: { include: { size: true, color: true } },
    },
  });
  if (!produit) return res.status(404).json({ error: "Produit introuvable." });
  res.json(produit);
});

/**
 * Remplace intégralement les images et les variantes d'un produit à partir de
 * la liste fournie. On DÉLÈTE d'abord les paniers en cours qui référencent une
 * variante qui va disparaître : un panier client n'est pas une donnée qu'on a
 * l'obligation de préserver face à une modification du catalogue, contrairement
 * à une commande déjà passée (order_items conserve un instantané séparé).
 */
async function synchroniserImagesEtVariantes(
  tx: Prisma.TransactionClient,
  productId: string,
  images: string[],
  variantes: z.infer<typeof variantSchema>[],
) {
  await tx.productImage.deleteMany({ where: { productId } });
  if (images.length) {
    await tx.productImage.createMany({
      data: images.map((url, ordre) => ({ productId, url, ordre })),
    });
  }

  const anciennesVariantes = await tx.productVariant.findMany({ where: { productId } });
  if (anciennesVariantes.length) {
    await tx.cartItem.deleteMany({ where: { variantId: { in: anciennesVariantes.map((v) => v.id) } } });
    await tx.productVariant.deleteMany({ where: { productId } });
  }

  const produit = await tx.product.findUniqueOrThrow({ where: { id: productId } });

  for (const [i, v] of variantes.entries()) {
    let sizeId: string | undefined;
    let colorId: string | undefined;
    if (v.taille) {
      sizeId = (await tx.size.upsert({ where: { label: v.taille }, update: {}, create: { label: v.taille } })).id;
    }
    if (v.couleur) {
      colorId = (await tx.color.upsert({ where: { label: v.couleur }, update: {}, create: { label: v.couleur } })).id;
    }
    await tx.productVariant.create({
      data: {
        productId,
        sizeId,
        colorId,
        stock: v.stock,
        prixOverride: v.prixOverride,
        sku: `${produit.reference}-${i + 1}`,
      },
    });
  }
}

// POST /api/produits — admin uniquement
catalogueRouter.post("/produits", requireAuth, requireAdmin, async (req, res) => {
  const parsed = produitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Produit invalide.", details: parsed.error.flatten() });
  }
  const { images, variantes, slug: slugPropose, ...data } = parsed.data;

  const refExistante = await prisma.product.findUnique({ where: { reference: data.reference } });
  if (refExistante) {
    return res.status(409).json({ error: "Cette référence existe déjà." });
  }
  const slug = await slugUnique(slugifier(slugPropose || data.nom));

  const produit = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({ data: { ...data, slug } });
    await synchroniserImagesEtVariantes(tx, p.id, images, variantes);
    return tx.product.findUniqueOrThrow({
      where: { id: p.id },
      include: { images: true, variants: { include: { size: true, color: true } }, category: true, collection: true },
    });
  });

  res.status(201).json(produit);
});

// PATCH /api/produits/:id — admin uniquement
catalogueRouter.patch("/produits/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = produitUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Produit invalide.", details: parsed.error.flatten() });
  }
  const { images, variantes, slug: slugPropose, ...data } = parsed.data;

  const existant = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existant) return res.status(404).json({ error: "Produit introuvable." });

  if (data.reference && data.reference !== existant.reference) {
    const refExistante = await prisma.product.findUnique({ where: { reference: data.reference } });
    if (refExistante) return res.status(409).json({ error: "Cette référence existe déjà." });
  }

  const slug = slugPropose || data.nom
    ? await slugUnique(slugifier(slugPropose || data.nom || existant.nom), existant.id)
    : undefined;

  const produit = await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: existant.id },
      data: { ...data, ...(slug ? { slug } : {}), updatedAt: new Date() },
    });
    if (images !== undefined && variantes !== undefined) {
      await synchroniserImagesEtVariantes(tx, existant.id, images, variantes);
    }
    return tx.product.findUniqueOrThrow({
      where: { id: existant.id },
      include: { images: true, variants: { include: { size: true, color: true } }, category: true, collection: true },
    });
  });

  res.json(produit);
});

// DELETE /api/produits/:id — admin uniquement
catalogueRouter.delete("/produits/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      const variantes = await tx.productVariant.findMany({ where: { productId: req.params.id } });
      if (variantes.length) {
        await tx.cartItem.deleteMany({ where: { variantId: { in: variantes.map((v) => v.id) } } });
      }
      await tx.product.delete({ where: { id: req.params.id } });
    });
    res.status(204).send();
  } catch {
    res.status(409).json({
      error:
        "Ce produit ne peut pas être supprimé car il apparaît dans des commandes existantes. Dépubliez-le plutôt.",
    });
  }
});

// ==================== ADMIN — CATÉGORIES & COLLECTIONS ====================

const categorieSchema = z.object({ nom: z.string().min(2).max(100) });
const collectionSchema = z.object({
  nom: z.string().min(2).max(100),
  saison: z.string().max(100).optional(),
  accroche: z.string().max(300).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  publiee: z.boolean().default(true),
});

catalogueRouter.post("/categories", requireAuth, requireAdmin, async (req, res) => {
  const parsed = categorieSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Catégorie invalide." });
  const slug = await (async () => {
    let s = slugifier(parsed.data.nom);
    let n = 1;
    while (await prisma.category.findUnique({ where: { slug: s } })) {
      n += 1;
      s = `${slugifier(parsed.data.nom)}-${n}`;
    }
    return s;
  })();
  const categorie = await prisma.category.create({ data: { nom: parsed.data.nom, slug } });
  res.status(201).json(categorie);
});

catalogueRouter.delete("/categories/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } }).catch(() => {});
  res.status(204).send();
});

catalogueRouter.post("/collections", requireAuth, requireAdmin, async (req, res) => {
  const parsed = collectionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Collection invalide." });
  let slug = slugifier(parsed.data.nom);
  let n = 1;
  while (await prisma.collection.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugifier(parsed.data.nom)}-${n}`;
  }
  const collection = await prisma.collection.create({ data: { ...parsed.data, slug } });
  res.status(201).json(collection);
});

catalogueRouter.patch("/collections/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = collectionSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Collection invalide." });
  const collection = await prisma.collection.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(collection);
});

catalogueRouter.delete("/collections/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.collection.delete({ where: { id: req.params.id } }).catch(() => {});
  res.status(204).send();
});
