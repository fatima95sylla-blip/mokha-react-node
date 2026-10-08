import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

// GET /api/admin/stats — vue d'ensemble du tableau de bord
adminRouter.get("/stats", async (_req, res) => {
  const [nbCommandesNouvelles, nbSurMesureEnAttente, nbProduits, nbClientes, commandes] =
    await Promise.all([
      prisma.order.count({ where: { statut: { in: ["nouvelle", "confirmee"] } } }),
      prisma.customRequest.count({ where: { statut: { in: ["nouvelle", "en_etude"] } } }),
      prisma.product.count({ where: { publie: true } }),
      prisma.profile.count({ where: { role: "client" } }),
      prisma.order.findMany({
        where: { statut: { not: "annulee" } },
        select: { total: true, createdAt: true },
      }),
    ]);

  const chiffreAffaires = commandes.reduce((s, c) => s + Number(c.total), 0);
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);
  const chiffreAffairesMois = commandes
    .filter((c) => c.createdAt >= debutMois)
    .reduce((s, c) => s + Number(c.total), 0);

  const [commandesRecentes, demandesRecentes] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, numero: true, statut: true, total: true, createdAt: true, contactEmail: true },
    }),
    prisma.customRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, numero: true, statut: true, typeVetement: true, createdAt: true, nom: true },
    }),
  ]);

  res.json({
    nbCommandesNouvelles,
    nbSurMesureEnAttente,
    nbProduits,
    nbClientes,
    chiffreAffaires,
    chiffreAffairesMois,
    commandesRecentes,
    demandesRecentes,
  });
});

// GET /api/admin/clientes — liste des comptes clientes avec leur activité
adminRouter.get("/clientes", async (_req, res) => {
  const clientes = await prisma.profile.findMany({
    where: { role: "client" },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      createdAt: true,
      _count: { select: { orders: true, customRequests: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(clientes);
});
