import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const compteRouter = Router();

// Toutes les routes de ce module exigent une session valide.
compteRouter.use(requireAuth);

// GET /api/compte/profil — le rôle renvoyé ici fait autorité côté client
compteRouter.get("/profil", async (req, res) => {
  const profil = await prisma.profile.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, fullName: true, phone: true, role: true },
  });
  if (!profil) return res.status(404).json({ error: "Profil introuvable." });
  res.json(profil);
});

const profilSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().min(6).max(30).optional(),
});

// PATCH /api/compte/profil
// Le rôle n'est volontairement PAS modifiable ici : une cliente ne peut jamais
// se promouvoir administratrice, même en forgeant la requête.
compteRouter.patch("/profil", async (req, res) => {
  const parsed = profilSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Données invalides.", details: parsed.error.flatten() });
  }
  const profil = await prisma.profile.update({
    where: { id: req.user!.id },
    data: { ...parsed.data, updatedAt: new Date() },
    select: { id: true, email: true, fullName: true, phone: true, role: true },
  });
  res.json(profil);
});

// ---------- ADRESSES ----------
const adresseSchema = z.object({
  label: z.string().max(60).default("Domicile"),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(80).default("Guinée"),
  isDefault: z.boolean().default(false),
});

compteRouter.get("/adresses", async (req, res) => {
  const adresses = await prisma.address.findMany({
    where: { profileId: req.user!.id },
    orderBy: [{ isDefault: "desc" }],
  });
  res.json(adresses);
});

compteRouter.post("/adresses", async (req, res) => {
  const parsed = adresseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Adresse invalide.", details: parsed.error.flatten() });
  }
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { profileId: req.user!.id },
      data: { isDefault: false },
    });
  }
  const adresse = await prisma.address.create({
    data: { ...parsed.data, profileId: req.user!.id },
  });
  res.status(201).json(adresse);
});

compteRouter.delete("/adresses/:id", async (req, res) => {
  // deleteMany filtré sur le profil : impossible de supprimer l'adresse d'une
  // autre cliente en devinant un identifiant.
  const { count } = await prisma.address.deleteMany({
    where: { id: req.params.id, profileId: req.user!.id },
  });
  if (!count) return res.status(404).json({ error: "Adresse introuvable." });
  res.status(204).send();
});

// ---------- WISHLIST ----------
// On travaille par SLUG (et non par id) : c'est l'identifiant que le front
// manipule déjà, y compris pour les favoris enregistrés localement avant
// connexion.
compteRouter.get("/wishlist", async (req, res) => {
  const favoris = await prisma.wishlist.findMany({ where: { profileId: req.user!.id } });
  const produits = await prisma.product.findMany({
    where: { id: { in: favoris.map((f) => f.productId) }, publie: true },
    include: {
      images: { orderBy: { ordre: "asc" } },
      category: true,
      collection: true,
      variants: { include: { size: true, color: true } },
    },
  });
  res.json(produits);
});

// Fusion des favoris enregistrés hors connexion avec ceux du compte, appelée
// juste après la connexion. Rien n'est jamais supprimé : on ajoute seulement.
compteRouter.post("/wishlist/fusion", async (req, res) => {
  const slugs = z.array(z.string().max(120)).max(200).safeParse(req.body?.slugs);
  if (!slugs.success) return res.status(400).json({ error: "Liste de favoris invalide." });

  const produits = await prisma.product.findMany({
    where: { slug: { in: slugs.data } },
    select: { id: true },
  });
  if (produits.length) {
    await prisma.wishlist.createMany({
      data: produits.map((p) => ({ profileId: req.user!.id, productId: p.id })),
      skipDuplicates: true,
    });
  }
  res.status(200).json({ fusionnes: produits.length });
});

compteRouter.post("/wishlist/:slug", async (req, res) => {
  const produit = await prisma.product.findUnique({ where: { slug: req.params.slug } });
  if (!produit) return res.status(404).json({ error: "Produit introuvable." });
  await prisma.wishlist.upsert({
    where: { profileId_productId: { profileId: req.user!.id, productId: produit.id } },
    update: {},
    create: { profileId: req.user!.id, productId: produit.id },
  });
  res.status(201).json({ slug: produit.slug });
});

compteRouter.delete("/wishlist/:slug", async (req, res) => {
  const produit = await prisma.product.findUnique({ where: { slug: req.params.slug } });
  if (!produit) return res.status(404).json({ error: "Produit introuvable." });
  await prisma.wishlist.deleteMany({
    where: { profileId: req.user!.id, productId: produit.id },
  });
  res.status(204).send();
});

// ---------- COMMANDES DE LA CLIENTE ----------
compteRouter.get("/commandes", async (req, res) => {
  const commandes = await prisma.order.findMany({
    where: { profileId: req.user!.id },
    include: { items: true, delivery: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(commandes);
});
