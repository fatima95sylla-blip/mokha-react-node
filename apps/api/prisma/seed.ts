/**
 * Charge dans Supabase (via Prisma) le catalogue qui était jusqu'ici codé en
 * dur dans apps/web/src/data/mokha.ts, pour que l'API renvoie de vraies
 * données identiques à ce qui était affiché.
 *
 * Usage : npm run seed   (depuis apps/api, après avoir configuré .env)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const collectionsSeed = [
  {
    slug: "heritage",
    nom: "Héritage",
    saison: "Collection 2026",
    accroche: "Le geste des anciennes, la coupe d'aujourd'hui.",
    description:
      "Une collection née des tissus de famille : bazin riche, broderies à la main et volumes amples repensés pour la femme contemporaine.",
    imageUrl: "/images/look-3.jpg",
    ordre: 0,
  },
  {
    slug: "lumiere-doree",
    nom: "Lumière Dorée",
    saison: "Cérémonie 2026",
    accroche: "Pour les soirs qui deviennent des souvenirs.",
    description:
      "Soies champagne, drapés sculptés et finitions dorées : une ligne de cérémonie pensée pour la lumière du soir.",
    imageUrl: "/images/look-2.jpg",
    ordre: 1,
  },
  {
    slug: "silhouette-noire",
    nom: "Silhouette Noire",
    saison: "Essentiels",
    accroche: "L'élégance réduite à l'essentiel.",
    description:
      "Le noir profond comme signature : tailleurs structurés, robes fluides et pièces intemporelles que l'on garde une vie.",
    imageUrl: "/images/look-1.jpg",
    ordre: 2,
  },
];

const categoriesSeed = ["Robes", "Ensembles", "Boubous", "Tailleurs", "Jupes"];

const productsSeed = [
  {
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
    slug: "grand-boubou-bazin-noir",
    nom: "Grand Boubou Bazin Noir",
    reference: "MK-BB-003",
    prix: 295000,
    categorie: "Boubous",
    collection: "heritage",
    couleurs: ["Noir", "Or"],
    tailles: ["Unique", "38", "40", "42", "44"],
    images: ["/images/p6.jpg", "/images/look-3.jpg"],
    description:
      "Grand boubou en bazin riche noir, brodé main au col et aux poignets. Une pièce de patrimoine, réinterprétée.",
    matiere: "Bazin riche, broderie fil de soie",
    entretien: "Nettoyage à sec. Amidonnage possible sur demande.",
    delai: "Confection en 2 semaines",
    confection: "Broderie traditionnelle réalisée à l'atelier.",
    disponibilite: "En stock",
    populaire: 79,
    nouveaute: false,
    surMesureDisponible: true,
  },
];

const servicesSeed = [
  {
    nom: "Confection sur mesure",
    description: "Une pièce unique construite à vos mesures, du croquis à l'essayage final. Délai : 3 à 6 semaines.",
    ordre: 0,
  },
  {
    nom: "Conseil en stylisme",
    description: "Analyse de silhouette, palette de couleurs et construction d'un vestiaire cohérent. Séance de 2 heures.",
    ordre: 1,
  },
  {
    nom: "Création de cérémonie",
    description: "Mariages, baptêmes, remises de prix : tenues de la mariée et de son cortège. Délai : 6 à 10 semaines.",
    ordre: 2,
  },
  {
    nom: "Retouches & ajustements",
    description: "Reprise de vos pièces MOKHA ou d'une tenue que vous aimez déjà. Délai : 3 à 7 jours.",
    ordre: 3,
  },
];
// ⚠️ Les tarifs de chaque service ne sont volontairement pas seedés ici (pour
// ne pas répéter l'erreur des prix en FCFA du catalogue) : à renseigner par
// l'admin, en GNF, depuis /admin/services.

const faqSeed = [
  {
    question: "Comment se déroule une commande sur mesure ?",
    reponse:
      "Vous remplissez le formulaire « Votre Pièce, Votre Histoire ». Nous vous répondons sous 48 heures avec une proposition et une date d'essayage.",
    ordre: 0,
  },
  {
    question: "Livrez-vous en dehors de Conakry ?",
    reponse:
      "Oui. Le retrait à l'atelier et la livraison à Conakry sont proposés au checkout ; pour une livraison hors de Conakry, les frais sont confirmés par la maison après votre commande.",
    ordre: 1,
  },
  {
    question: "Puis-je faire ajuster une pièce du catalogue ?",
    reponse:
      "Chaque pièce du catalogue peut être confectionnée à vos mesures. Choisissez l'option « Sur mesure » sur la fiche produit.",
    ordre: 2,
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    reponse:
      "Orange Money, MTN Mobile Money et espèces (à la livraison ou au retrait). Après votre commande, la maison vous contacte sur WhatsApp pour confirmer le règlement.",
    ordre: 3,
  },
  {
    question: "Quelle est votre politique de retour ?",
    reponse:
      "Les pièces du catalogue sont échangeables sous 14 jours. Les pièces confectionnées sur mesure ne sont ni échangeables ni remboursables.",
    ordre: 4,
  },
];

const blogCategoriesSeed = ["Héritage", "Savoir-faire", "Style"];

const blogPostsSeed = [
  {
    slug: "le-bazin-raconte",
    titre: "Le bazin raconté par celles qui le portent",
    categorie: "Héritage",
    imageUrl: "/images/p6.jpg",
    extrait:
      "Du marché au salon de couture, le bazin riche traverse les générations sans perdre sa charge symbolique.",
    contenu: `Il y a des tissus que l'on choisit et d'autres que l'on hérite. Le bazin appartient à la seconde famille.

À l'atelier, nous travaillons le bazin comme une matière noble : amidonné juste ce qu'il faut, brodé au fil doré, coupé dans des volumes qui laissent respirer le corps.

Cette saison, la maison propose trois broderies dessinées d'après des motifs de tresses, transmis par la grand-mère de Fatoumata.`,
  },
  {
    slug: "anatomie-d-un-drape",
    titre: "Anatomie d'un drapé",
    categorie: "Savoir-faire",
    imageUrl: "/images/p4.jpg",
    extrait: "Un drapé réussi ne s'improvise pas : il se construit épingle après épingle, sur le corps.",
    contenu: `Le drapé est la signature des pièces de cérémonie MOKHA. Il demande une lecture précise du tombé du tissu.

Nous travaillons directement sur mannequin, dans la matière définitive, avant de reporter le résultat sur patron.

Compter en moyenne quatorze heures pour un drapé de jupe longue, doublure comprise.`,
  },
  {
    slug: "cinq-pieces-intemporelles",
    titre: "Cinq pièces intemporelles pour un vestiaire durable",
    categorie: "Style",
    imageUrl: "/images/p3.jpg",
    extrait: "Moins de pièces, mieux coupées : notre méthode pour construire un vestiaire qui dure dix ans.",
    contenu: `Le tailleur ivoire, la robe portefeuille noire, la jupe drapée, le boubou de cérémonie et la chemise de soie.

Ces cinq pièces se combinent en plus de vingt silhouettes différentes selon les accessoires.

Chacune peut être ajustée à vos mesures : le sur-mesure n'est pas un luxe, c'est une manière de garder ses vêtements plus longtemps.`,
  },
];

async function main() {
  console.log("Seed : collections…");
  for (const c of collectionsSeed) {
    await prisma.collection.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  console.log("Seed : catégories…");
  const categoryBySlug = new Map<string, string>();
  for (const [i, nom] of categoriesSeed.entries()) {
    const slug = nom.toLowerCase();
    const cat = await prisma.category.upsert({
      where: { slug },
      update: { nom, ordre: i },
      create: { slug, nom, ordre: i },
    });
    categoryBySlug.set(nom, cat.id);
  }

  console.log("Seed : produits, images, tailles, couleurs, variantes…");
  for (const p of productsSeed) {
    const collection = await prisma.collection.findUnique({ where: { slug: p.collection } });
    const categoryId = categoryBySlug.get(p.categorie);

    const produit = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        nom: p.nom,
        reference: p.reference,
        prix: p.prix,
        categoryId,
        collectionId: collection?.id,
        description: p.description,
        matiere: p.matiere,
        entretien: p.entretien,
        delai: p.delai,
        confection: p.confection,
        disponibilite: p.disponibilite,
        populaire: p.populaire,
        nouveaute: p.nouveaute,
        surMesureDisponible: p.surMesureDisponible,
      },
      create: {
        slug: p.slug,
        nom: p.nom,
        reference: p.reference,
        prix: p.prix,
        categoryId,
        collectionId: collection?.id,
        description: p.description,
        matiere: p.matiere,
        entretien: p.entretien,
        delai: p.delai,
        confection: p.confection,
        disponibilite: p.disponibilite,
        populaire: p.populaire,
        nouveaute: p.nouveaute,
        surMesureDisponible: p.surMesureDisponible,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: produit.id } });
    await prisma.productImage.createMany({
      data: p.images.map((url, ordre) => ({ productId: produit.id, url, ordre })),
    });

    const sizeIds: string[] = [];
    for (const label of p.tailles) {
      const size = await prisma.size.upsert({ where: { label }, update: {}, create: { label } });
      sizeIds.push(size.id);
    }
    const colorIds: string[] = [];
    for (const label of p.couleurs) {
      const color = await prisma.color.upsert({ where: { label }, update: {}, create: { label } });
      colorIds.push(color.id);
    }

    await prisma.productVariant.deleteMany({ where: { productId: produit.id } });
    let n = 1;
    for (const sizeId of sizeIds) {
      for (const colorId of colorIds) {
        await prisma.productVariant.create({
          data: {
            productId: produit.id,
            sizeId,
            colorId,
            sku: `${p.reference}-${n++}`,
            stock: 10,
          },
        });
      }
    }
  }

  console.log("Seed : services…");
  for (const s of servicesSeed) {
    const slug = s.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.service.upsert({ where: { slug }, update: s, create: { ...s, slug } });
  }

  console.log("Seed : FAQ…");
  for (const f of faqSeed) {
    const existant = await prisma.faq.findFirst({ where: { question: f.question } });
    if (existant) await prisma.faq.update({ where: { id: existant.id }, data: f });
    else await prisma.faq.create({ data: f });
  }

  console.log("Seed : blog…");
  const blogCategoryBySlug = new Map<string, string>();
  for (const nom of blogCategoriesSeed) {
    const slug = nom.toLowerCase();
    const cat = await prisma.blogCategory.upsert({ where: { slug }, update: { nom }, create: { slug, nom } });
    blogCategoryBySlug.set(nom, cat.id);
  }
  for (const post of blogPostsSeed) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        titre: post.titre,
        extrait: post.extrait,
        contenu: post.contenu,
        imageUrl: post.imageUrl,
        categoryId: blogCategoryBySlug.get(post.categorie),
        statut: "publie",
        publieLe: new Date(),
      },
      create: {
        slug: post.slug,
        titre: post.titre,
        extrait: post.extrait,
        contenu: post.contenu,
        imageUrl: post.imageUrl,
        categoryId: blogCategoryBySlug.get(post.categorie),
        statut: "publie",
        publieLe: new Date(),
      },
    });
  }

  console.log("Seed terminé ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
