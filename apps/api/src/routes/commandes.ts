import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";

export const commandesRouter = Router();

const ligneSchema = z.object({
  slug: z.string().min(1),
  taille: z.string().optional(),
  couleur: z.string().optional(),
  mode: z.enum(["pret-a-porter", "sur-mesure"]).default("pret-a-porter"),
  quantite: z.number().int().min(1).max(20),
});

const commandeSchema = z.object({
  lignes: z.array(ligneSchema).min(1).max(30),
  adresseLivraison: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(6),
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    country: z.string().default("Guinée"),
  }),
  livraison: z.enum(["retrait", "conakry", "hors-conakry"]).default("conakry"),
  paiement: z.enum(["orange_money", "mtn_money", "especes"]),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(6),
  notes: z.string().max(1000).optional(),
});

// ⚠️ Frais de livraison placeholder, à administrer plus tard (table `settings`
// ou back-office). Ils ne sont volontairement pas définis pour "hors-conakry" :
// la cliente est informée qu'ils seront confirmés par la maison.
const FRAIS_LIVRAISON: Record<string, number> = {
  retrait: 0,
  conakry: 30000,
  "hors-conakry": 0,
};

async function genererNumero(): Promise<string> {
  const annee = new Date().getFullYear();
  const dernier = await prisma.order.count({ where: { numero: { startsWith: `MK-${annee}-` } } });
  return `MK-${annee}-${String(dernier + 1).padStart(4, "0")}`;
}

// POST /api/commandes
// Revalide CHAQUE prix et CHAQUE disponibilité depuis la base avant de créer
// quoi que ce soit : le panier envoyé par le navigateur n'est qu'une
// proposition, jamais une source de vérité.
commandesRouter.post("/", optionalAuth, async (req, res) => {
  const parsed = commandeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Commande invalide.", details: parsed.error.flatten() });
  }
  const { lignes, adresseLivraison, livraison, paiement, contactEmail, contactPhone, notes } = parsed.data;

  const itemsAValider: {
    nomProduit: string;
    taille?: string;
    couleur?: string;
    mode: string;
    quantite: number;
    prixUnitaire: number;
    variantId?: string;
  }[] = [];
  const indisponibles: string[] = [];

  for (const ligne of lignes) {
    const produit = await prisma.product.findUnique({
      where: { slug: ligne.slug },
      include: { variants: { include: { size: true, color: true } } },
    });

    if (!produit || !produit.publie) {
      indisponibles.push(ligne.slug);
      continue;
    }

    const variant = produit.variants.find(
      (v) =>
        (!ligne.taille || v.size?.label === ligne.taille) &&
        (!ligne.couleur || v.color?.label === ligne.couleur),
    );

    // Le prêt-à-porter exige un stock suffisant ; le sur-mesure n'est jamais
    // bloqué par un stock (la pièce est confectionnée à la demande).
    if (ligne.mode === "pret-a-porter" && variant && variant.stock < ligne.quantite) {
      indisponibles.push(`${produit.nom} (${ligne.taille ?? ""} ${ligne.couleur ?? ""})`.trim());
      continue;
    }

    const prixBase = variant?.prixOverride ? Number(variant.prixOverride) : Number(produit.prix);
    const prixUnitaire = ligne.mode === "sur-mesure" ? Math.round(prixBase * 1.25) : prixBase;

    itemsAValider.push({
      nomProduit: produit.nom,
      taille: ligne.taille,
      couleur: ligne.couleur,
      mode: ligne.mode,
      quantite: ligne.quantite,
      prixUnitaire,
      variantId: variant?.id,
    });
  }

  if (indisponibles.length) {
    return res.status(409).json({
      error: "Certaines pièces ne sont plus disponibles dans les quantités demandées.",
      indisponibles,
    });
  }

  const sousTotal = itemsAValider.reduce((s, i) => s + i.prixUnitaire * i.quantite, 0);
  const fraisLivraison = FRAIS_LIVRAISON[livraison] ?? 0;
  const total = sousTotal + fraisLivraison;
  const numero = await genererNumero();

  const commande = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        numero,
        profileId: req.user?.id,
        statut: "nouvelle",
        sousTotal,
        fraisLivraison,
        total,
        devise: "GNF",
        adresseLivraison,
        contactEmail,
        contactPhone,
        notes,
        items: {
          create: itemsAValider.map((i) => ({
            variantId: i.variantId,
            nomProduit: i.nomProduit,
            taille: i.taille,
            couleur: i.couleur,
            mode: i.mode,
            quantite: i.quantite,
            prixUnitaire: i.prixUnitaire,
          })),
        },
        payments: {
          create: {
            provider: paiement,
            statut: "en_attente",
            montant: total,
            devise: "GNF",
          },
        },
      },
      include: { items: true, payments: true },
    });

    // Décrément de stock UNIQUEMENT pour le prêt-à-porter avec variante
    // identifiée. Le sur-mesure ne consomme pas de stock.
    for (const i of itemsAValider) {
      if (i.mode === "pret-a-porter" && i.variantId) {
        await tx.productVariant.update({
          where: { id: i.variantId },
          data: { stock: { decrement: i.quantite } },
        });
      }
    }

    return o;
  });

  res.status(201).json(commande);
});

// GET /api/commandes/:numero?email=... — suivi invité, protégé par la
// correspondance de l'e-mail de contact (évite qu'un numéro séquentiel devinable
// expose l'adresse et le contenu d'une commande à n'importe qui).
commandesRouter.get("/:numero", async (req, res) => {
  const email = String(req.query.email ?? "").toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "Paramètre email requis." });

  const commande = await prisma.order.findUnique({
    where: { numero: req.params.numero },
    include: {
      items: true,
      delivery: true,
      payments: { select: { provider: true, statut: true, montant: true } },
    },
  });

  if (!commande || commande.contactEmail.toLowerCase() !== email) {
    return res.status(404).json({ error: "Commande introuvable." });
  }
  res.json(commande);
});

// ---------- ADMIN ----------
commandesRouter.get("/", requireAuth, requireAdmin, async (req, res) => {
  const { statut } = req.query;
  const commandes = await prisma.order.findMany({
    where: statut ? { statut: String(statut) } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(commandes);
});

// Détail complet d'une commande par identifiant technique (réservé à l'admin :
// contient l'adresse, les contacts et l'historique de paiement).
commandesRouter.get("/detail/:id", requireAuth, requireAdmin, async (req, res) => {
  const commande = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: { include: { variant: { include: { size: true, color: true } } } },
      payments: true,
      delivery: true,
      profile: { select: { id: true, email: true, fullName: true, phone: true } },
    },
  });
  if (!commande) return res.status(404).json({ error: "Commande introuvable." });
  res.json(commande);
});

commandesRouter.patch("/:id/statut", requireAuth, requireAdmin, async (req, res) => {
  const { statut } = req.body as { statut: string };
  const commande = await prisma.order.update({ where: { id: req.params.id }, data: { statut } });
  res.json(commande);
});

// Confirmation MANUELLE de la réception d'un paiement (Orange Money, MTN Money,
// espèces...). Rappel : ceci enregistre la déclaration de l'administratrice
// après vérification réelle (relevé mobile money, espèces comptées) — ce
// n'est pas un webhook de passerelle de paiement, qui n'existe pas encore.
commandesRouter.patch("/:id/paiement", requireAuth, requireAdmin, async (req, res) => {
  const { statut } = req.body as { statut: "en_attente" | "valide" | "echoue" | "rembourse" };
  const commande = await prisma.order.findUnique({ where: { id: req.params.id }, include: { payments: true } });
  if (!commande || !commande.payments[0]) return res.status(404).json({ error: "Commande ou paiement introuvable." });

  await prisma.payment.update({ where: { id: commande.payments[0].id }, data: { statut } });
  // Confirmer un paiement fait naturellement avancer la commande si elle
  // n'a pas déjà été traitée plus loin dans le parcours.
  if (statut === "valide" && commande.statut === "nouvelle") {
    await prisma.order.update({ where: { id: commande.id }, data: { statut: "confirmee" } });
  }
  res.status(200).json({ ok: true });
});
