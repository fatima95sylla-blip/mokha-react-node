// ⚠️ TRANSITION EN COURS
// Le CATALOGUE (produits, collections) n'est plus servi depuis ce fichier : il
// vient désormais de l'API (`src/lib/api.ts` → apps/api → Supabase). Les
// exports `products` / `collections` ci-dessous ne sont plus utilisés par les
// pages ; ils restent comme référence pour le seed (apps/api/prisma/seed.ts)
// et seront supprimés une fois le back-office en place.
//
// Le reste (BRAND, images, looks, journal, services, faq, processusSurMesure,
// etapesAtelier) est encore statique : ces contenus éditoriaux seront
// basculés en base lors de la phase « Blog + services + FAQ + contenu ».


export const images = {
  hero: "/images/hero.jpg",
  look1: "/images/look-1.jpg",
  look2: "/images/look-2.jpg",
  look3: "/images/look-3.jpg",
  p1: "/images/p1.jpg",
  p2: "/images/p2.jpg",
  p3: "/images/p3.jpg",
  p4: "/images/p4.jpg",
  p5: "/images/p5.jpg",
  p6: "/images/p6.jpg",
  atelier1: "/images/atelier-1.jpg",
  fondatrice: "/images/fondatrice.jpg",
};

export const BRAND = {
  name: "MOKHA",
  signature: "Maison de Création",
  baseline: "Mode · Élégance · Intemporel",
  fondatrice: "Fatoumata Sylla",
  email: "fatima95sylla@gmail.com",
  phone: "+224 626 600 095",
  whatsapp: "224626600095",
  pays: "Guinée",
  // Administrable depuis le back-office (table `settings`) une fois celui-ci en place.
  adresse: "Atelier MOKHA — Petit Simbaya, Washington, Carrefour Parisien, Conakry, Guinée",
  horaires: "Lundi — Samedi · 10h — 19h (sur rendez-vous)",
  // ⚠️ À RENSEIGNER : lien réel du compte Instagram de la maison.
  instagram: "",
};

export type Product = {
  id: string;
  slug: string;
  nom: string;
  reference: string;
  prix: number; // FCFA
  categorie: "Robes" | "Ensembles" | "Boubous" | "Tailleurs" | "Jupes";
  collection: string; // slug de collection
  couleurs: string[];
  tailles: string[];
  images: string[];
  description: string;
  matiere: string;
  entretien: string;
  delai: string;
  confection: string;
  disponibilite: "En stock" | "Sur commande" | "Édition limitée";
  populaire: number;
  nouveaute: boolean;
  surMesureDisponible: boolean;
};

export const collections = [
  {
    slug: "heritage",
    nom: "Héritage",
    saison: "Collection 2026",
    image: "/images/look-3.jpg",
    accroche: "Le geste des anciennes, la coupe d'aujourd'hui.",
    description:
      "Une collection née des tissus de famille : bazin riche, broderies à la main et volumes amples repensés pour la femme contemporaine.",
  },
  {
    slug: "lumiere-doree",
    nom: "Lumière Dorée",
    saison: "Cérémonie 2026",
    image: "/images/look-2.jpg",
    accroche: "Pour les soirs qui deviennent des souvenirs.",
    description:
      "Soies champagne, drapés sculptés et finitions dorées : une ligne de cérémonie pensée pour la lumière du soir.",
  },
  {
    slug: "silhouette-noire",
    nom: "Silhouette Noire",
    saison: "Essentiels",
    image: "/images/look-1.jpg",
    accroche: "L'élégance réduite à l'essentiel.",
    description:
      "Le noir profond comme signature : tailleurs structurés, robes fluides et pièces intemporelles que l'on garde une vie.",
  },
];

export const products: Product[] = [
  {
    id: "prd-01",
    slug: "robe-portefeuille-nuit",
    nom: "Robe Portefeuille Nuit",
    reference: "MK-RB-014",
    prix: 245000,
    categorie: "Robes",
    collection: "silhouette-noire",
    couleurs: ["Noir", "Ivoire"],
    tailles: ["36", "38", "40", "42", "44"],
    images: ["/images/p1.jpg", "/images/look-1.jpg"],
    description:
      "Une robe longue en soie sablée, croisée à la taille et nouée d'une ceinture souple. La coupe suit le corps sans jamais le contraindre.",
    matiere: "100 % soie sablée",
    entretien: "Nettoyage à sec uniquement. Repassage à basse température sur l'envers.",
    delai: "Expédition sous 3 jours ouvrés",
    confection: "Coupée et assemblée à l'atelier de Dakar, doublure ivoire, ourlet main.",
    disponibilite: "En stock",
    populaire: 96,
    nouveaute: true,
    surMesureDisponible: true,
  },
  {
    id: "prd-02",
    slug: "kaftan-lumiere-doree",
    nom: "Kaftan Lumière Dorée",
    reference: "MK-KF-007",
    prix: 420000,
    categorie: "Boubous",
    collection: "lumiere-doree",
    couleurs: ["Champagne", "Or"],
    tailles: ["Unique", "38", "40", "42"],
    images: ["/images/p2.jpg", "/images/look-2.jpg"],
    description:
      "Kaftan de cérémonie en satin champagne, entièrement rebrodé de fils dorés selon un motif floral dessiné par la maison.",
    matiere: "Satin de soie, broderie fil métallisé",
    entretien: "Nettoyage à sec spécialisé. Conserver sur cintre rembourré.",
    delai: "Confection en 3 semaines",
    confection: "Broderie main, 60 heures de travail par pièce.",
    disponibilite: "Sur commande",
    populaire: 88,
    nouveaute: true,
    surMesureDisponible: true,
  },
  {
    id: "prd-03",
    slug: "tailleur-ivoire-maison",
    nom: "Tailleur Ivoire Maison",
    reference: "MK-TL-021",
    prix: 315000,
    categorie: "Tailleurs",
    collection: "silhouette-noire",
    couleurs: ["Ivoire", "Noir", "Sable"],
    tailles: ["36", "38", "40", "42"],
    images: ["/images/p3.jpg"],
    description:
      "Veste cintrée à un bouton et pantalon large à pinces, en laine froide ivoire. Le tailleur signature de la maison.",
    matiere: "Laine froide, doublure cupro",
    entretien: "Nettoyage à sec. Brosser après chaque port.",
    delai: "Expédition sous 5 jours ouvrés",
    confection: "Épaules montées main, boutonnière passementée.",
    disponibilite: "En stock",
    populaire: 74,
    nouveaute: false,
    surMesureDisponible: true,
  },
  {
    id: "prd-04",
    slug: "ensemble-bustier-emeraude",
    nom: "Ensemble Bustier Émeraude",
    reference: "MK-EN-009",
    prix: 380000,
    categorie: "Ensembles",
    collection: "lumiere-doree",
    couleurs: ["Émeraude"],
    tailles: ["36", "38", "40"],
    images: ["/images/p4.jpg"],
    description:
      "Bustier baleiné et jupe drapée à traîne en satin duchesse émeraude. Une pièce de soirée sculpturale.",
    matiere: "Satin duchesse",
    entretien: "Nettoyage à sec uniquement.",
    delai: "Confection en 2 semaines",
    confection: "Bustier monté sur armature, 14 baleines, drapé épinglé à la main.",
    disponibilite: "Édition limitée",
    populaire: 81,
    nouveaute: true,
    surMesureDisponible: true,
  },
  {
    id: "prd-05",
    slug: "robe-wax-contemporaine",
    nom: "Robe Wax Contemporaine",
    reference: "MK-RB-032",
    prix: 165000,
    categorie: "Robes",
    collection: "heritage",
    couleurs: ["Ocre", "Indigo"],
    tailles: ["36", "38", "40", "42", "44"],
    images: ["/images/p5.jpg"],
    description:
      "Robe mi-longue en wax premium, drapée à la taille. Le motif est positionné à la main pour respecter la symétrie.",
    matiere: "Coton wax premium",
    entretien: "Lavage à la main à froid, séchage à l'ombre.",
    delai: "Expédition sous 3 jours ouvrés",
    confection: "Motif raccordé à la coupe, finitions surpiquées.",
    disponibilite: "En stock",
    populaire: 92,
    nouveaute: false,
    surMesureDisponible: true,
  },
  {
    id: "prd-06",
    slug: "grand-boubou-bazin-noir",
    nom: "Grand Boubou Bazin Noir",
    reference: "MK-BB-003",
    prix: 295000,
    categorie: "Boubous",
    collection: "heritage",
    couleurs: ["Noir", "Or"],
    tailles: ["Unique"],
    images: ["/images/p6.jpg", "/images/look-3.jpg"],
    description:
      "Grand boubou en bazin riche noir, plastron brodé de motifs dorés inspirés des tresses traditionnelles.",
    matiere: "Bazin riche getzner",
    entretien: "Nettoyage à sec. Amidonner légèrement avant le repassage.",
    delai: "Confection en 2 semaines",
    confection: "Broderie machine guidée main, 20 heures de travail.",
    disponibilite: "Sur commande",
    populaire: 70,
    nouveaute: false,
    surMesureDisponible: true,
  },
  {
    id: "prd-07",
    slug: "jupe-drapee-champagne",
    nom: "Jupe Drapée Champagne",
    reference: "MK-JP-011",
    prix: 145000,
    categorie: "Jupes",
    collection: "lumiere-doree",
    couleurs: ["Champagne"],
    tailles: ["36", "38", "40", "42"],
    images: ["/images/p2.jpg"],
    description:
      "Jupe longue drapée sur le côté, fente haute et taille haute ceinturée. À porter avec un simple haut noir.",
    matiere: "Crêpe de soie",
    entretien: "Nettoyage à sec.",
    delai: "Expédition sous 3 jours ouvrés",
    confection: "Drapé monté à la main, fermeture invisible.",
    disponibilite: "En stock",
    populaire: 64,
    nouveaute: true,
    surMesureDisponible: true,
  },
  {
    id: "prd-08",
    slug: "ensemble-heritage-ivoire",
    nom: "Ensemble Héritage Ivoire",
    reference: "MK-EN-018",
    prix: 268000,
    categorie: "Ensembles",
    collection: "heritage",
    couleurs: ["Ivoire", "Sable"],
    tailles: ["Unique", "38", "40", "42"],
    images: ["/images/look-3.jpg", "/images/p3.jpg"],
    description:
      "Tunique ample à manches papillon et pantalon fluide en jacquard ivoire. Un hommage aux silhouettes de fête.",
    matiere: "Jacquard de coton et soie",
    entretien: "Nettoyage à sec recommandé.",
    delai: "Confection en 10 jours",
    confection: "Manches papillon coupées dans le biais, boutons passementerie.",
    disponibilite: "Sur commande",
    populaire: 78,
    nouveaute: true,
    surMesureDisponible: true,
  },
];

export const looks = [
  {
    id: "look-1",
    titre: "Silhouette I — Le Noir",
    image: "/images/look-1.jpg",
    description:
      "Épaules dessinées, taille marquée d'un bouton doré. La pièce se porte du bureau au dîner sans changer de peau.",
    points: [
      { top: "38%", left: "52%", productSlug: "robe-portefeuille-nuit" },
      { top: "72%", left: "46%", productSlug: "tailleur-ivoire-maison" },
    ],
  },
  {
    id: "look-2",
    titre: "Silhouette II — La Lumière",
    image: "/images/look-2.jpg",
    description:
      "Un drapé unique, une épaule libre. La soie champagne capte la lumière des lampes et sculpte la marche.",
    points: [
      { top: "40%", left: "48%", productSlug: "kaftan-lumiere-doree" },
      { top: "70%", left: "55%", productSlug: "jupe-drapee-champagne" },
    ],
  },
  {
    id: "look-3",
    titre: "Silhouette III — L'Héritage",
    image: "/images/look-3.jpg",
    description:
      "Le volume du boubou, la précision du modélisme. Une pièce de cérémonie qui se porte aussi en plein jour.",
    points: [
      { top: "45%", left: "50%", productSlug: "ensemble-heritage-ivoire" },
      { top: "76%", left: "42%", productSlug: "grand-boubou-bazin-noir" },
    ],
  },
];

export const processusSurMesure = [
  { n: "01", titre: "Inspiration", texte: "Vous partagez votre occasion, vos images, vos envies de matière." },
  { n: "02", titre: "Échange", texte: "Un rendez-vous en salon ou en visio avec Fatoumata pour affiner le projet." },
  { n: "03", titre: "Conception", texte: "Croquis, choix des tissus et patronage réalisé à vos mesures." },
  { n: "04", titre: "Confection", texte: "Coupe, assemblage et essayage intermédiaire à l'atelier." },
  { n: "05", titre: "Livraison", texte: "Finitions main, mise sous housse et remise en main propre ou expédition." },
];

export const etapesAtelier = [
  { titre: "Croquis", texte: "Chaque pièce commence au crayon : proportions, tombé, détails de finition." },
  { titre: "Patronage", texte: "Le patron est construit à plat puis corrigé sur mannequin à vos mesures." },
  { titre: "Tissus", texte: "Soies, bazins, jacquards et wax premium sélectionnés pièce par pièce." },
  { titre: "Coupe", texte: "Coupe dans le droit fil, motifs raccordés à la main avant assemblage." },
  { titre: "Assemblage", texte: "Montage, baleinage et doublures posées selon les règles de la couture." },
  { titre: "Finition", texte: "Ourlets main, boutonnières passementées, contrôle final sous lumière du jour." },
];

export const services = [
  {
    slug: "confection-sur-mesure",
    titre: "Confection sur mesure",
    prix: "À partir de 250 000 FCFA",
    texte: "Une pièce unique construite à vos mesures, du croquis à l'essayage final.",
    duree: "3 à 6 semaines",
  },
  {
    slug: "stylisme",
    titre: "Conseil en stylisme",
    prix: "75 000 FCFA la séance",
    texte: "Analyse de silhouette, palette de couleurs et construction d'un vestiaire cohérent.",
    duree: "2 heures",
  },
  {
    slug: "creation-ceremonie",
    titre: "Création de cérémonie",
    prix: "Sur devis",
    texte: "Mariages, baptêmes, remises de prix : tenues de la mariée et de son cortège.",
    duree: "6 à 10 semaines",
  },
  {
    slug: "retouches",
    titre: "Retouches & ajustements",
    prix: "À partir de 15 000 FCFA",
    texte: "Reprise de vos pièces MOKHA ou d'une tenue que vous aimez déjà.",
    duree: "3 à 7 jours",
  },
];

export const journal = [
  {
    slug: "le-bazin-raconte",
    titre: "Le bazin raconté par celles qui le portent",
    date: "12 septembre 2026",
    categorie: "Héritage",
    image: "/images/p6.jpg",
    chapeau:
      "Du marché HLM aux salons de couture, le bazin riche traverse les générations sans perdre sa charge symbolique.",
    corps: [
      "Il y a des tissus que l'on choisit et d'autres que l'on hérite. Le bazin appartient à la seconde famille.",
      "À l'atelier, nous travaillons le bazin comme une matière noble : amidonné juste ce qu'il faut, brodé au fil doré, coupé dans des volumes qui laissent respirer le corps.",
      "Cette saison, la maison propose trois broderies dessinées d'après des motifs de tresses, transmis par la grand-mère de Fatoumata.",
    ],
  },
  {
    slug: "anatomie-d-un-drape",
    titre: "Anatomie d'un drapé",
    date: "28 août 2026",
    categorie: "Savoir-faire",
    image: "/images/p4.jpg",
    chapeau: "Un drapé réussi ne s'improvise pas : il se construit épingle après épingle, sur le corps.",
    corps: [
      "Le drapé est la signature des pièces de cérémonie MOKHA. Il demande une lecture précise du tombé du tissu.",
      "Nous travaillons directement sur mannequin, dans la matière définitive, avant de reporter le résultat sur patron.",
      "Compter en moyenne quatorze heures pour un drapé de jupe longue, doublure comprise.",
    ],
  },
  {
    slug: "cinq-pieces-intemporelles",
    titre: "Cinq pièces intemporelles pour un vestiaire durable",
    date: "3 août 2026",
    categorie: "Style",
    image: "/images/p3.jpg",
    chapeau: "Moins de pièces, mieux coupées : notre méthode pour construire un vestiaire qui dure dix ans.",
    corps: [
      "Le tailleur ivoire, la robe portefeuille noire, la jupe drapée, le boubou de cérémonie et la chemise de soie.",
      "Ces cinq pièces se combinent en plus de vingt silhouettes différentes selon les accessoires.",
      "Chacune peut être ajustée à vos mesures : le sur-mesure n'est pas un luxe, c'est une manière de garder ses vêtements plus longtemps.",
    ],
  },
];

export const faq = [
  {
    q: "Comment se déroule une commande sur mesure ?",
    r: "Vous remplissez le parcours « Votre Pièce, Votre Histoire ». Nous vous répondons sous 48 heures avec une proposition, un devis et une date d'essayage.",
  },
  {
    q: "Livrez-vous à l'international ?",
    r: "Oui. Nous expédions dans toute l'Afrique de l'Ouest, en Europe et en Amérique du Nord, sous 3 à 7 jours ouvrés après confection.",
  },
  {
    q: "Puis-je faire ajuster une pièce du catalogue ?",
    r: "Chaque pièce du catalogue peut être confectionnée à vos mesures. Choisissez l'option « Sur mesure » sur la fiche produit.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    r: "Carte bancaire, Wave, Orange Money et virement. Les commandes sur mesure se règlent en deux fois : 50 % à la commande, le solde à la livraison.",
  },
  {
    q: "Quelle est votre politique de retour ?",
    r: "Les pièces du catalogue sont échangeables sous 14 jours. Les pièces confectionnées sur mesure ne sont ni échangeables ni remboursables.",
  },
];

/* ————— Données de démonstration back-office ————— */

export type Commande = {
  id: string;
  cliente: string;
  email: string;
  date: string;
  total: number;
  articles: number;
  statut: "En attente" | "Confirmée" | "En confection" | "Expédiée" | "Livrée";
  paiement: "Payée" | "Acompte" | "En attente";
  ville: string;
};

export const commandes: Commande[] = [
  { id: "CMD-2026-0148", cliente: "Aïssatou Diop", email: "aissatou.d@mail.com", date: "14/09/2026", total: 420000, articles: 1, statut: "En confection", paiement: "Acompte", ville: "Dakar" },
  { id: "CMD-2026-0147", cliente: "Mariama Bâ", email: "m.ba@mail.com", date: "13/09/2026", total: 245000, articles: 1, statut: "Expédiée", paiement: "Payée", ville: "Abidjan" },
  { id: "CMD-2026-0146", cliente: "Clarisse Kouadio", email: "clarisse.k@mail.com", date: "12/09/2026", total: 583000, articles: 2, statut: "Confirmée", paiement: "Payée", ville: "Paris" },
  { id: "CMD-2026-0145", cliente: "Fatou Ndiaye", email: "fatou.n@mail.com", date: "11/09/2026", total: 165000, articles: 1, statut: "Livrée", paiement: "Payée", ville: "Dakar" },
  { id: "CMD-2026-0144", cliente: "Awa Traoré", email: "awa.t@mail.com", date: "09/09/2026", total: 315000, articles: 1, statut: "Livrée", paiement: "Payée", ville: "Bamako" },
  { id: "CMD-2026-0143", cliente: "Nadège Mensah", email: "n.mensah@mail.com", date: "08/09/2026", total: 728000, articles: 3, statut: "En attente", paiement: "En attente", ville: "Lomé" },
  { id: "CMD-2026-0142", cliente: "Sokhna Fall", email: "sokhna.f@mail.com", date: "06/09/2026", total: 380000, articles: 1, statut: "Livrée", paiement: "Payée", ville: "Dakar" },
  { id: "CMD-2026-0141", cliente: "Hélène Sarr", email: "h.sarr@mail.com", date: "04/09/2026", total: 145000, articles: 1, statut: "Livrée", paiement: "Payée", ville: "Montréal" },
];

export type DemandeSurMesure = {
  id: string;
  cliente: string;
  piece: string;
  occasion: string;
  budget: string;
  echeance: string;
  etape: "Nouvelle" | "Qualifiée" | "Mesures" | "En atelier" | "Livrée";
  note: string;
};

export const demandesSurMesure: DemandeSurMesure[] = [
  { id: "SM-2026-0031", cliente: "Bineta Sow", piece: "Robe de cérémonie", occasion: "Mariage", budget: "500 000 – 800 000 FCFA", echeance: "20/11/2026", etape: "Nouvelle", note: "Souhaite du bazin brodé, inspiration envoyée par WhatsApp." },
  { id: "SM-2026-0030", cliente: "Rokhaya Camara", piece: "Tailleur", occasion: "Professionnel", budget: "250 000 – 400 000 FCFA", echeance: "02/11/2026", etape: "Nouvelle", note: "Deux pantalons souhaités avec la même veste." },
  { id: "SM-2026-0029", cliente: "Adjoa Yeboah", piece: "Grand boubou", occasion: "Baptême", budget: "300 000 – 500 000 FCFA", echeance: "18/10/2026", etape: "Qualifiée", note: "Devis validé, en attente du choix de tissu." },
  { id: "SM-2026-0028", cliente: "Léa Kamara", piece: "Ensemble bustier", occasion: "Gala", budget: "400 000 – 600 000 FCFA", echeance: "10/10/2026", etape: "Mesures", note: "Prise de mesures faite en visio le 08/09." },
  { id: "SM-2026-0027", cliente: "Aminata Sylla", piece: "Robe longue", occasion: "Remise de prix", budget: "250 000 – 400 000 FCFA", echeance: "30/09/2026", etape: "En atelier", note: "Essayage intermédiaire prévu le 22/09." },
  { id: "SM-2026-0026", cliente: "Josiane Ouédraogo", piece: "Kaftan brodé", occasion: "Mariage", budget: "600 000 – 900 000 FCFA", echeance: "24/09/2026", etape: "En atelier", note: "Broderie en cours, 40 heures réalisées." },
  { id: "SM-2026-0025", cliente: "Khady Diallo", piece: "Ensemble héritage", occasion: "Fête familiale", budget: "200 000 – 350 000 FCFA", echeance: "12/09/2026", etape: "Livrée", note: "Livrée en main propre, cliente très satisfaite." },
];

export const clientes = [
  { nom: "Aïssatou Diop", email: "aissatou.d@mail.com", ville: "Dakar", commandes: 6, total: 1840000, depuis: "2024" },
  { nom: "Clarisse Kouadio", email: "clarisse.k@mail.com", ville: "Paris", commandes: 4, total: 1425000, depuis: "2025" },
  { nom: "Mariama Bâ", email: "m.ba@mail.com", ville: "Abidjan", commandes: 3, total: 890000, depuis: "2025" },
  { nom: "Sokhna Fall", email: "sokhna.f@mail.com", ville: "Dakar", commandes: 3, total: 760000, depuis: "2024" },
  { nom: "Nadège Mensah", email: "n.mensah@mail.com", ville: "Lomé", commandes: 2, total: 728000, depuis: "2026" },
  { nom: "Hélène Sarr", email: "h.sarr@mail.com", ville: "Montréal", commandes: 2, total: 410000, depuis: "2026" },
];

export const ventesMensuelles = [
  { mois: "Avr", ca: 1850000, commandes: 9 },
  { mois: "Mai", ca: 2240000, commandes: 11 },
  { mois: "Juin", ca: 1980000, commandes: 10 },
  { mois: "Juil", ca: 2760000, commandes: 14 },
  { mois: "Août", ca: 3120000, commandes: 16 },
  { mois: "Sept", ca: 3480000, commandes: 18 },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function getArticle(slug: string) {
  return journal.find((a) => a.slug === slug);
}
