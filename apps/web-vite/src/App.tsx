import { useEffect, useLayoutEffect, useState, type FormEvent } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowRight, Check, Facebook, Heart, Instagram, Mail, MapPin, Menu, MessageCircle, Pause, Phone, Play, Plus, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { collections, journal, looks, processusSurMesure, products, services, type Product } from "@/data";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { countries, useCurrency } from "@/lib/currency";
import { useShopState } from "@/lib/shop-state";

function Header() {
  const { user } = useAuth();
  const { country, setCountry, currency, ratesAvailable, ratesUpdatedAt } = useCurrency();
  const { favoriteIds, cart } = useShopState();
  const [menuOpen, setMenuOpen] = useState(false);
  const linksTop = [{ to: "/boutique", label: "Boutique" }, { to: "/collections", label: "Collections" }, { to: "/sur-mesure", label: "Sur mesure" }, { to: "/services", label: "Services" }];
  const linksBottom = [{ to: "/atelier", label: "L'Atelier" }, { to: "/journal", label: "Journal" }, { to: "/a-propos", label: "La Maison" }, { to: "/contact", label: "Contact" }];
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <header className="site-header"><div className="header-main"><button className="icon-button mobile-menu" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button><nav className={`primary-nav nav-top ${menuOpen ? "is-open" : ""}`}>{linksTop.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}</nav><Link className="wordmark" to="/" aria-label="MOKHA, accueil"><img src="/images/logo-mokha.png" alt="MOKHA — Maison de création" /></Link><div className="header-actions"><label className="currency-control"><span className="sr-only">Pays et devise</span><select aria-label="Pays et devise" value={country} onChange={(event) => setCountry(event.target.value as typeof country)}>{countries.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.currency}</option>)}</select><span className="currency-status" aria-live="polite">{currency !== "XOF" && !ratesAvailable ? "Taux indisponibles · prix en XOF" : ratesAvailable && ratesUpdatedAt ? `Taux du ${new Intl.DateTimeFormat("fr-FR").format(new Date(ratesUpdatedAt))}` : ""}</span></label><Link className="icon-button" to="/boutique" aria-label="Rechercher"><Search /></Link><Link className="icon-button counted-icon" to="/favoris" aria-label={`Mes favoris, ${favoriteIds.length} article${favoriteIds.length === 1 ? "" : "s"}`}><Heart /><span className="count-badge">{favoriteIds.length}</span></Link><Link className="icon-button" to="/connexion" aria-label={user ? "Mon compte" : "Se connecter"}>{user ? <Check /> : <UserRound />}</Link><Link className="icon-button counted-icon" to="/panier" aria-label={`Mon panier, ${cartCount} article${cartCount === 1 ? "" : "s"}`}><ShoppingBag />{cartCount > 0 && <span className="count-badge">{cartCount}</span>}</Link></div></div><nav className="secondary-nav">{linksBottom.map((item) => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}</nav></header>;
}

function Footer() {
  const [email, setEmail] = useState("");
  function joinNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = `mailto:fatima95sylla@gmail.com?subject=${encodeURIComponent("Rejoindre l'univers MOKHA")}&body=${encodeURIComponent(`Je souhaite rejoindre l'univers MOKHA. Mon e-mail : ${email}`)}`;
  }
  return <footer className="site-footer"><div className="footer-brand"><Link className="wordmark footer-mark" to="/" aria-label="MOKHA, accueil"><img src="/images/logo-mokha.png" alt="MOKHA — Maison de création" /></Link><p className="footer-motto">Mode · Élégance · Intemporel</p><p>Maison de création fondée par Fatoumata Sylla, styliste et modéliste diplômée. Créations féminines, collections et confection sur mesure.</p></div><nav className="footer-column" aria-label="La Maison"><span className="eyebrow">MAISON</span><Link to="/a-propos">La Maison</Link><Link to="/atelier">L'Atelier</Link><Link to="/journal">Journal</Link><Link to="/services">Services</Link><Link to="/admin">Espace administration</Link></nav><nav className="footer-column" aria-label="Boutique"><span className="eyebrow">BOUTIQUE</span><Link to="/boutique">Toutes les créations</Link><Link to="/collections">Collections</Link><Link to="/sur-mesure">Sur mesure</Link><Link to="/favoris">Mes favoris</Link><Link to="/faq">FAQ</Link></nav><div className="footer-contact"><span className="eyebrow">REJOINDRE L'UNIVERS MOKHA</span><form className="footer-subscribe" onSubmit={joinNewsletter}><label className="sr-only" htmlFor="footer-email">Votre e-mail</label><input id="footer-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Votre e-mail" required/><button type="submit">Rejoindre</button></form><a className="contact-line" href="https://maps.google.com/?q=Atelier+MOKHA+Petit+Simbaya+Conakry" target="_blank" rel="noreferrer"><MapPin/><span>Atelier MOKHA — Washington, Petit Simbaya, Conakry, Guinée</span></a><a className="contact-line" href="tel:+224626600095"><Phone/><span>+224 626 600 095</span></a><a className="contact-line" href="mailto:fatima95sylla@gmail.com"><Mail/><span>fatima95sylla@gmail.com</span></a><a className="contact-line" href="https://instagram.com/mokha.maison" target="_blank" rel="noreferrer"><Instagram/><span>@mokha.maison</span></a><a className="contact-line" href="https://facebook.com/mokha.maison" target="_blank" rel="noreferrer"><Facebook/><span>@mokha.maison</span></a></div><div className="footer-legal"><span>© 2026 MOKHA — Maison de Création. Tous droits réservés.</span><nav aria-label="Informations légales"><Link to="/mentions-legales">Mentions légales</Link><Link to="/confidentialite">Confidentialité</Link><Link to="/conditions">CGV</Link></nav></div></footer>;
}

function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { formatPrice } = useCurrency();
  const { favoriteIds, toggleFavorite } = useShopState();
  const isFavorite = favoriteIds.includes(product.id);
  return <article className="product-card" style={{ animationDelay: `${index * 70}ms` }}><div className="product-photo"><Link to={`/boutique/${product.slug}`} aria-label={`Voir ${product.nom}`}><img src={product.images[0]} alt={product.nom} loading="lazy" />{product.nouveaute && <span className="product-tag">Nouveauté</span>}<span className="product-open" aria-hidden="true"><ArrowRight size={17} /></span></Link><button className={`favorite-button ${isFavorite ? "is-favorite" : ""}`} type="button" aria-label={isFavorite ? `Retirer ${product.nom} des favoris` : `Ajouter ${product.nom} aux favoris`} aria-pressed={isFavorite} onClick={() => toggleFavorite(product.id)}><Heart fill={isFavorite ? "currentColor" : "none"} /></button></div><Link className="product-card-copy" to={`/boutique/${product.slug}`}><div className="product-meta"><span className="eyebrow">{product.categorie}</span><span className="product-price">{formatPrice(product.prix)}</span></div><h3>{product.nom}</h3></Link></article>;
}

function CollectionFavoriteButton({ collectionSlug }: { collectionSlug: string }) {
  const { favoriteIds, toggleFavorite } = useShopState();
  const product = products.find((item) => item.collection === collectionSlug);
  if (!product) return null;
  const isFavorite = favoriteIds.includes(product.id);
  return <button className={`collection-favorite ${isFavorite ? "is-favorite" : ""}`} type="button" aria-label={isFavorite ? `Retirer ${product.nom} des favoris` : `Ajouter ${collections.find((item) => item.slug === collectionSlug)?.nom} aux favoris`} aria-pressed={isFavorite} onClick={() => toggleFavorite(product.id)}><Heart fill={isFavorite ? "currentColor" : "none"}/></button>;
}

function FilterOptions({ title, options, selected, update }: { title: string; options: string[]; selected: string[]; update: (value: string) => void }) {
  return <fieldset className="filter-group"><legend>{title}</legend><div className="filter-options">{options.map((item) => <button key={item} type="button" className={`filter-chip ${selected.includes(item) ? "selected" : ""}`} aria-pressed={selected.includes(item)} onClick={() => update(item)}>{title === "COLLECTION" ? collections.find((entry) => entry.slug === item)?.nom ?? item : item}</button>)}</div></fieldset>;
}

const homeSlides = [
  { image: "/images/hero.jpg", alt: "Robe ivoire brodée portée lors d’une séance éditoriale MOKHA", eyebrow: "MODE · ÉLÉGANCE · INTEMPOREL", title: <>L’élégance<br/>se transmet.</>, description: "Des pièces dessinées par Fatoumata Sylla, façonnées à l’atelier et pensées pour traverser le temps.", action: "Découvrir les collections", href: "/collections", secondary: "Créer sur mesure", secondaryHref: "/sur-mesure" },
  { image: "/images/look-1.jpg", alt: "Robe noire structurée aux détails dorés", eyebrow: "SILHOUETTE NOIRE · ESSENTIELS", title: <>Le noir,<br/>notre signature.</>, description: "Des lignes affirmées et des détails précieux, pour une élégance qui ne cherche pas à en faire trop.", action: "Voir Silhouette Noire", href: "/collections?collection=silhouette-noire", secondary: "Explorer la boutique", secondaryHref: "/boutique?collection=silhouette-noire" },
  { image: "/images/look-2.jpg", alt: "Robe de cérémonie champagne drapée", eyebrow: "LUMIÈRE DORÉE · CÉRÉMONIE", title: <>La lumière<br/>prend forme.</>, description: "Soie champagne, drapé sculpté et finitions dorées : une silhouette faite pour les grands moments.", action: "Découvrir Lumière Dorée", href: "/collections?collection=lumiere-doree", secondary: "Imaginer ma tenue", secondaryHref: "/sur-mesure?occasion=evenement" },
  { image: "/images/look-3.jpg", alt: "Boubou ivoire ample inspiré du geste de la couture familiale", eyebrow: "HÉRITAGE · LE GESTE FAMILIAL", title: <>L’héritage<br/>se porte.</>, description: "Le volume du boubou rencontre la précision du modélisme dans une création ancrée et contemporaine.", action: "Découvrir Héritage", href: "/collections?collection=heritage", secondary: "Entrer dans l’atelier", secondaryHref: "/atelier" },
];

function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const slide = homeSlides[activeSlide];
  useEffect(() => {
    if (isPaused || isHovered || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveSlide((index) => (index + 1) % homeSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, [isPaused, isHovered]);
  function showSlide(index: number) {
    setActiveSlide((index + homeSlides.length) % homeSlides.length);
  }
  const homeCollections = collections.filter((item) => item.slug !== "toges-mokha");
  const signature = products.filter((product) => !["toge-signature-mokha", "robe-emeraude-brodee-yuyu", "boubou-fuchsia-brode-yuyu", "robe-bal-fuchsia-yuyu"].includes(product.slug)).sort((a, b) => b.populaire - a.populaire).slice(0, 4);
  return <>
    <section className="home-hero" aria-label="Diaporama des créations MOKHA" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {homeSlides.map((item, index) => <img key={item.image} className={`hero-slide-image ${index === activeSlide ? "is-active" : ""}`} src={item.image} alt={index === activeSlide ? item.alt : ""} aria-hidden={index !== activeSlide}/ >)}
      <div className="hero-shade"/>
      <div className="hero-copy" key={activeSlide}>
        <span className="eyebrow gold">{slide.eyebrow}</span><h1>{slide.title}</h1><p>{slide.description}</p>
        <div className="hero-actions"><Link className="button button-gold" to={slide.href}>{slide.action} <ArrowRight size={15}/></Link><Link className="button button-outline" to={slide.secondaryHref}>{slide.secondary}</Link></div>
      </div>
      <div className="hero-slide-controls" aria-label="Commandes du diaporama">
        <button className="hero-slide-arrow" type="button" aria-label="Diapositive précédente" onClick={() => showSlide(activeSlide - 1)}><ArrowLeft size={16}/></button>
        <div className="hero-slide-dots" role="group" aria-label="Choisir une diapositive">{homeSlides.map((item, index) => <button key={item.image} type="button" className={index === activeSlide ? "is-active" : ""} aria-label={`Afficher ${item.eyebrow}`} aria-current={index === activeSlide ? "true" : undefined} onClick={() => showSlide(index)}/>)}</div>
        <span className="hero-index">0{activeSlide + 1} / 0{homeSlides.length}</span>
        <button className="hero-slide-arrow" type="button" aria-label={isPaused ? "Reprendre le diaporama" : "Mettre le diaporama en pause"} onClick={() => setIsPaused((paused) => !paused)}>{isPaused ? <Play size={15}/> : <Pause size={15}/>}</button>
        <button className="hero-slide-arrow" type="button" aria-label="Diapositive suivante" onClick={() => showSlide(activeSlide + 1)}><ArrowRight size={16}/></button>
      </div>
      <a className="hero-scroll" href="#manifeste"><ArrowDown size={14}/> DÉFILER</a>
    </section>
    <section className="manifesto" id="manifeste"><span className="eyebrow">UNE MAISON, UN GESTE</span><p>« Je ne dessine pas des vêtements, je dessine des femmes qui entrent dans une pièce. »</p><span className="eyebrow">FATOUMATA SYLLA · FONDATRICE</span></section>
    <section className="section collection-section"><div className="section-heading"><div><span className="eyebrow gold">LES COLLECTIONS</span><h2>Trois univers,<br/>une même exigence.</h2></div><Link className="text-link" to="/collections">Toutes les collections <ArrowRight size={15}/></Link></div><div className="collection-grid">{homeCollections.map((item, index) => <article className={`collection-tile tile-${index + 1}`} key={item.slug}><Link className="collection-tile-link" to={`/collections?collection=${item.slug}`}><img src={item.image} alt={item.nom} loading="lazy"/><div className="tile-shade"/><div className="tile-copy"><span className="eyebrow gold">{item.saison}</span><h3>{item.nom}</h3><span>{item.accroche}</span></div><span className="tile-arrow"><ArrowRight size={17}/></span></Link><CollectionFavoriteButton collectionSlug={item.slug}/></article>)}</div></section>
    <LookbookSection/>
    <section className="section signature-section"><div className="section-heading"><div><span className="eyebrow gold">CRÉATIONS SIGNATURES</span><h2>Les pièces que l’on garde.</h2></div><Link className="text-link" to="/boutique">Voir la boutique <ArrowRight size={15}/></Link></div><div className="product-grid">{signature.map((product, index) => <ProductCard key={product.id} product={product} index={index}/>)}</div></section>
    <SurMesureSection/>
    <section className="atelier-band"><img src="/images/atelier-1.jpg" alt="Détail du travail de modélisme à l'atelier MOKHA"/><div><span className="eyebrow gold">LE SAVOIR-FAIRE</span><h2>Le modélisme comme point de départ.</h2><p>Fatoumata Sylla construit chaque patron à plat avant de le corriger sur mannequin. C'est ce travail invisible qui donne aux pièces MOKHA leur tombé si particulier.</p><ul className="atelier-points"><li>Patronage sur mesure et essayages intermédiaires</li><li>Ourlets, boutonnières et finitions réalisés à la main</li><li>Tissus sélectionnés pièce par pièce : soie, bazin riche, jacquard, wax premium</li></ul><Link className="text-link" to="/atelier">Entrer dans l'atelier <ArrowRight size={15}/></Link></div><span className="atelier-number">CONAKRY · 2026</span></section>
    <MaisonSection/>
    <JournalSection/>
  </>;
}

function LookbookSection() {
  const [activeLook, setActiveLook] = useState(0);
  const { formatPrice } = useCurrency();
  const look = looks[activeLook];
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  return <section className="lookbook-section"><div className="lookbook-inner"><div className="lookbook-heading"><div><span className="eyebrow gold">LOOKBOOK INTERACTIF</span><h2>Shop the Silhouette</h2></div><p>Survolez les repères dorés pour découvrir les pièces qui composent chaque silhouette.</p></div><div className="lookbook-layout"><div className="lookbook-image"><img src={look.image} alt={look.titre}/>{look.points.map((point) => { const product = productsBySlug.get(point.productSlug); return product ? <Link className="lookbook-marker" key={point.productSlug} to={`/boutique/${product.slug}`} style={{ top: point.top, left: point.left }} aria-label={`Découvrir ${product.nom}`}><Plus/><span><strong>{product.nom}</strong><small>{formatPrice(product.prix)}</small></span></Link> : null; })}</div><div className="lookbook-copy"><span className="eyebrow gold">LOOK {activeLook + 1} / {looks.length}</span><h3>{look.titre}</h3><p className="lookbook-description">{look.description}</p><div className="lookbook-products">{look.points.map((point) => { const product = productsBySlug.get(point.productSlug); return product ? <Link className="lookbook-product" key={point.productSlug} to={`/boutique/${product.slug}`}><img src={product.images[0]} alt=""/><span><strong>{product.nom}</strong><small>{formatPrice(product.prix)}</small></span><ArrowRight/></Link> : null; })}</div><div className="lookbook-controls"><button type="button" onClick={() => setActiveLook((activeLook - 1 + looks.length) % looks.length)}>Look précédent</button><button type="button" onClick={() => setActiveLook((activeLook + 1) % looks.length)}>Look suivant</button></div></div></div></div></section>;
}

function SurMesureSection() {
  return <section className="bespoke-section"><div className="bespoke-inner"><span className="eyebrow gold">VOTRE PIÈCE, VOTRE HISTOIRE</span><h2>La confection sur mesure, étape par étape</h2><p className="bespoke-intro">De la première inspiration à la remise de votre pièce sous housse, cinq temps qui vous appartiennent.</p><ol className="bespoke-steps">{processusSurMesure.map((step) => <li key={step.n}><span>{step.n}</span><i/><h3>{step.titre}</h3><p>{step.texte}</p></li>)}</ol><Link className="button button-outline-dark" to="/sur-mesure">Commencer mon projet</Link></div></section>;
}

function MaisonSection() {
  return <section className="maison-section"><div className="maison-inner"><img src="/images/fondatrice.jpg" alt="Fatoumata Sylla dans son atelier de création" loading="lazy"/><div><span className="eyebrow gold">NOTRE HISTOIRE</span><h2>Une maison de famille</h2><p>MOKHA naît de la rencontre entre un héritage familial de couture et une formation rigoureuse en stylisme et modélisme. Les premières pièces ont été cousues pour les femmes de la famille, à l'occasion des fêtes.</p><p>Aujourd'hui la maison habille des clientes à Dakar, Abidjan, Paris et Montréal, sans rien changer à sa méthode : peu de pièces, beaucoup de soin.</p><Link className="text-link" to="/a-propos">Découvrir la Maison <ArrowRight size={15}/></Link></div></div></section>;
}

function JournalSection() {
  return <section className="journal-section"><div className="journal-heading"><div><span className="eyebrow gold">LE JOURNAL</span><h2>Écrits de la maison</h2></div><Link className="text-link" to="/journal">Tous les articles <ArrowRight size={15}/></Link></div><div className="journal-grid">{journal.map((article) => <Link className="journal-card" to={`/journal/${article.slug}`} key={article.slug}><img src={article.image} alt={article.titre} loading="lazy"/><span className="eyebrow gold">{article.categorie} · {article.date}</span><h3>{article.titre}</h3><p>{article.chapeau}</p></Link>)}</div></section>;
}

function BoutiquePage() {
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const requestedCollection = searchParams.get("collection");
  const [categoriesSelected, setCategoriesSelected] = useState<string[]>([]);
  const [collectionsSelected, setCollectionsSelected] = useState<string[]>(() => requestedCollection && collections.some((item) => item.slug === requestedCollection) ? [requestedCollection] : []);
  const [sizesSelected, setSizesSelected] = useState<string[]>([]);
  const [colorsSelected, setColorsSelected] = useState<string[]>([]);
  const [availabilitySelected, setAvailabilitySelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [maximumPrice, setMaximumPrice] = useState(450000);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const categories = ["Robes", "Ensembles", "Boubous", "Toges", "Tailleurs", "Jupes", "Tissus"];
  const sizes = ["36", "38", "40", "42", "44", "Unique"];
  const colors = ["Blanc", "Bleu", "Champagne", "Corail", "Émeraude", "Fuchsia", "Grenat", "Ivoire", "Jaune", "Noir", "Ocre", "Orange", "Or", "Rose", "Rouge", "Sable"];
  const availability = ["En stock", "Sur commande", "Édition limitée"];
  function toggleValue(values: string[], setValues: (values: string[]) => void, value: string) {
    setValues(values.includes(value) ? [] : [value]);
    setPage(1);
  }
  const matchingProducts = products.filter((item) =>
    (!categoriesSelected.length || categoriesSelected.includes(item.categorie)) &&
    (!collectionsSelected.length || collectionsSelected.includes(item.collection)) &&
    (!sizesSelected.length || sizesSelected.some((size) => item.tailles.includes(size))) &&
    (!colorsSelected.length || colorsSelected.some((color) => item.couleurs.includes(color))) &&
    (!availabilitySelected.length || availabilitySelected.includes(item.disponibilite)) &&
    item.prix <= maximumPrice &&
    `${item.nom} ${item.reference}`.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr")));
  const sortedProducts = [...matchingProducts].sort((left, right) => sort === "popular" ? right.populaire - left.populaire : sort === "price-asc" ? left.prix - right.prix : sort === "price-desc" ? right.prix - left.prix : products.indexOf(left) - products.indexOf(right));
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const visibleProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize);
  function resetFilters() {
    setCategoriesSelected([]); setCollectionsSelected([]); setSizesSelected([]); setColorsSelected([]); setAvailabilitySelected([]); setSearch(""); setMaximumPrice(450000); setPage(1);
  }
  return <main>
    <section className="shop-page-heading"><span className="eyebrow gold">LA BOUTIQUE</span><h1>Créations disponibles</h1><p>Chaque pièce peut être commandée en prêt-à-porter ou confectionnée à vos mesures.</p></section>
    <section className="shop-layout">
      <aside className="shop-filters" aria-label="Filtres de recherche">
        <label className="filter-group search-filter"><span>RECHERCHE</span><span className="search-field"><Search size={15}/><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Robe, kaftan, référence…"/><span className="sr-only">Rechercher une création</span></span></label>
        <FilterOptions title="CATÉGORIE" options={categories} selected={categoriesSelected} update={(value) => toggleValue(categoriesSelected, setCategoriesSelected, value)}/>
        <FilterOptions title="COLLECTION" options={collections.map((item) => item.slug)} selected={collectionsSelected} update={(value) => toggleValue(collectionsSelected, setCollectionsSelected, value)}/>
        <fieldset className="filter-group"><legend>TAILLE</legend><div className="filter-options">{sizes.map((item) => <button key={item} type="button" className={`filter-chip ${sizesSelected.includes(item) ? "selected" : ""}`} aria-pressed={sizesSelected.includes(item)} onClick={() => toggleValue(sizesSelected, setSizesSelected, item)}>{item}</button>)}</div></fieldset>
        <FilterOptions title="COULEUR" options={colors} selected={colorsSelected} update={(value) => toggleValue(colorsSelected, setColorsSelected, value)}/>
        <FilterOptions title="DISPONIBILITÉ" options={availability} selected={availabilitySelected} update={(value) => toggleValue(availabilitySelected, setAvailabilitySelected, value)}/>
        <label className="filter-group price-filter"><span>PRIX MAXIMUM · {formatPrice(maximumPrice)}</span><input type="range" min="50000" max="450000" step="5000" value={maximumPrice} onChange={(event) => { setMaximumPrice(Number(event.target.value)); setPage(1); }} aria-label="Prix maximum"/><span className="price-range-labels"><span>{formatPrice(50000)}</span><span>{formatPrice(450000)}</span></span></label>
        <button className="clear-filters" type="button" onClick={resetFilters}>Effacer les filtres</button>
      </aside>
      <div className="shop-results">
        <div className="shop-results-heading"><span>{matchingProducts.length} CRÉATION{matchingProducts.length === 1 ? "" : "S"}</span><label className="sort-control">TRIER PAR <select aria-label="Trier les créations" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="newest">Nouveautés</option><option value="popular">Les plus demandés</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option></select></label></div>
        {visibleProducts.length ? <><div className="product-grid shop-grid">{visibleProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index}/>)}</div>{pageCount > 1 && <nav className="pagination" aria-label="Pages des créations">{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button type="button" key={number} className={page === number ? "selected" : ""} aria-current={page === number ? "page" : undefined} onClick={() => { setPage(number); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{number}</button>)}</nav>}</> : <div className="empty-state"><p>Aucune création ne correspond à ces critères.</p><button className="text-link" onClick={resetFilters}>Effacer les filtres <ArrowRight size={15}/></button></div>}
      </div>
    </section>
  </main>;
}

function ProductPage() {
  const { formatPrice } = useCurrency();
  const { favoriteIds, toggleFavorite, addToCart } = useShopState();
  const { slug } = useParams();
  const product = products.find((item) => item.slug === slug);
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState("36");
  const [color, setColor] = useState("Noir");
  const [confection, setConfection] = useState<"ready" | "custom">("ready");
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  useEffect(() => {
    if (!product) return;
    setImageIndex(0);
    setSize(product.tailles[0]);
    setColor(product.couleurs[0]);
    setAdded(false);
  }, [product?.id]);
  if (!product) return <NotFoundPage/>;
  const isFavorite = favoriteIds.includes(product.id);
  const related = product.id === "prd-01"
    ? [products.find((item) => item.id === "prd-03"), products.find((item) => item.id === "prd-05")].filter((item): item is Product => Boolean(item))
    : products.filter((item) => item.id !== product.id && (item.collection === product.collection || item.categorie === product.categorie)).slice(0, 4);
  const displayPrice = product.prix * (confection === "custom" ? 1.25 : 1);
  return <main className="product-detail-page">
    <nav className="breadcrumbs" aria-label="Fil d'Ariane"><Link to="/">Accueil</Link><span>·</span><Link to="/boutique">Boutique</Link><span>·</span><span>{product.nom}</span></nav>
    <div className="product-detail-layout">
      <section className="product-gallery" aria-label={`Photos de ${product.nom}`}><div className="detail-image"><img src={product.images[imageIndex] ?? product.images[0]} alt={product.nom}/><button className={`detail-favorite ${isFavorite ? "is-favorite" : ""}`} type="button" aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"} aria-pressed={isFavorite} onClick={() => toggleFavorite(product.id)}><Heart fill={isFavorite ? "currentColor" : "none"}/></button></div>{product.images.length > 1 && <div className="image-selector">{product.images.map((image, index) => <button className={imageIndex === index ? "active" : ""} key={image} aria-label={`Voir la photo ${index + 1}`} onClick={() => setImageIndex(index)}><img src={image} alt=""/></button>)}</div>}</section>
      <section className="detail-info">
        <Link className="eyebrow gold product-collection-link" to="/collections">COLLECTION {collections.find((item) => item.slug === product.collection)?.nom?.toLocaleUpperCase("fr")}</Link>
        <h1>{product.nom}</h1><p className="product-reference">RÉFÉRENCE {product.reference}</p><p className="detail-price">{formatPrice(displayPrice)}</p><p className="availability-label">{product.disponibilite.toLocaleUpperCase("fr")}</p><p className="detail-description">{product.description}</p>
        {!product.isFabric && <fieldset className="variant-group"><legend>RÉALISATION</legend><div className="variant-options realization-options"><button type="button" className={confection === "ready" ? "selected" : ""} aria-pressed={confection === "ready"} onClick={() => setConfection("ready")}><strong>PRÊT-À-PORTER</strong><span>Expédition sous 3 jours ouvrés</span></button><button type="button" className={confection === "custom" ? "selected" : ""} aria-pressed={confection === "custom"} onClick={() => setConfection("custom")}><strong>SUR MESURE</strong><span>À vos mesures · +25 %</span></button></div></fieldset>}
        <fieldset className="variant-group"><legend>COULEUR · {color.toLocaleUpperCase("fr")}</legend><div className="variant-options">{product.couleurs.map((item) => <button type="button" key={item} className={`variant-chip ${color === item ? "selected" : ""}`} aria-pressed={color === item} onClick={() => setColor(item)}>{item}</button>)}</div></fieldset>
        <fieldset className="variant-group"><div className="size-legend"><legend>{product.isFabric ? "FORMAT" : "TAILLE"}</legend>{!product.isFabric && <button type="button" className="size-guide-link" onClick={() => setSizeGuideOpen(true)}>Guide des tailles</button>}</div><div className="variant-options">{product.tailles.map((item) => <button type="button" key={item} className={`variant-chip size-chip ${size === item ? "selected" : ""}`} aria-pressed={size === item} onClick={() => setSize(item)}>{item}</button>)}</div></fieldset>
        <div className="purchase-actions"><button className={`button button-dark add-button ${added ? "added" : ""}`} type="button" onClick={() => { addToCart({ productId: product.id, quantity: 1, size, color, confection }); setAdded(true); }} disabled={added}>{added ? <><Check size={16}/> Ajouté au panier</> : <>Ajouter au panier · {formatPrice(displayPrice)}</>}</button><button className={`favorite-action ${isFavorite ? "is-favorite" : ""}`} type="button" aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"} aria-pressed={isFavorite} onClick={() => toggleFavorite(product.id)}><Heart fill={isFavorite ? "currentColor" : "none"}/><span>Favori</span></button></div>
        {!product.isFabric && <aside className="custom-callout"><h2>Vous aimez cette pièce mais souhaitez une adaptation ?</h2><p>Longueur, encolure, manches, tissu : nous adaptons cette création à votre morphologie et à votre occasion.</p><Link to={`/sur-mesure?piece=${encodeURIComponent(product.nom)}${product.categorie === "Toges" ? "&type=Toge" : ""}`} className="text-link">Demander sur mesure <ArrowRight size={15}/></Link></aside>}
        <p className="shipping-note">{product.disponibilite} · {product.livraison}</p>
        <div className="product-accordions"><details><summary>Matière</summary><p>{product.matiere}</p></details><details><summary>Confection</summary><p>{product.confection}</p></details><details><summary>Entretien</summary><p>{product.entretien}</p></details><details><summary>Livraison & retours</summary><p>{product.livraison}</p></details></div>
      </section>
    </div>
    {sizeGuideOpen && <div className="dialog-backdrop" role="presentation" onClick={() => setSizeGuideOpen(false)}><section className="size-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="size-guide-title" onClick={(event) => event.stopPropagation()}><button type="button" className="dialog-close" aria-label="Fermer le guide" onClick={() => setSizeGuideOpen(false)}><X/></button><span className="eyebrow gold">CONSEIL DE L'ATELIER</span><h2 id="size-guide-title">Guide des tailles</h2><p>Les mesures sont indiquées en centimètres. Entre deux tailles, choisissez la plus grande ou contactez l'atelier.</p><table><thead><tr><th>Taille</th><th>Poitrine</th><th>Taille</th><th>Hanches</th></tr></thead><tbody>{[["36", "82–85", "64–67", "90–93"], ["38", "86–89", "68–71", "94–97"], ["40", "90–93", "72–75", "98–101"], ["42", "94–97", "76–79", "102–105"], ["44", "98–102", "80–84", "106–110"]].map((row) => <tr key={row[0]}>{row.map((value) => <td key={value}>{value}</td>)}</tr>)}</tbody></table></section></div>}
    <section className="section related-section"><div className="section-heading"><div><span className="eyebrow gold">SÉLECTION MOKHA</span><h2>Pièces associées</h2></div></div><div className="product-grid">{related.map((item, index) => <ProductCard key={item.id} product={item} index={index}/>)}</div></section>
  </main>;
}

function CollectionsPage() {
  const visibleCollections = collections.filter((item) => item.slug !== "toges-mokha");
  return <main><section className="page-intro"><span className="eyebrow gold">LES COLLECTIONS</span><h1>Trois univers,<br/>une même exigence.</h1><p>Des histoires de matières, de gestes et de silhouettes.</p></section><section className="collections-list">{visibleCollections.map((item, index) => <article className={`collection-story story-${index + 1}`} key={item.slug}><div className="story-image"><Link to={`/boutique?collection=${item.slug}`} aria-label={`Voir la collection ${item.nom}`}><img src={item.image} alt={item.nom} loading="lazy"/></Link><CollectionFavoriteButton collectionSlug={item.slug}/><span className="story-count">0{index + 1}</span></div><div className="story-copy"><span className="eyebrow gold">{item.saison}</span><h2>{item.nom}</h2><p className="story-lead">{item.accroche}</p><p>{item.description}</p><Link className="text-link" to={`/boutique?collection=${item.slug}`}>Explorer les créations <ArrowRight size={15}/></Link></div></article>)}</section></main>;
}

const bespokeOccasions = {
  mariage: {
    label: "Mariage",
    title: "Une silhouette de cérémonie, créée pour votre jour.",
    intro: "Robe de mariée civile, tenue de cérémonie ou ensemble du cortège : dessinons une pièce élégante, confortable et pensée pour durer toute la célébration.",
    image: "/images/mokha-inspiration-2.jfif",
    imageAlt: "Tenue de cérémonie émeraude brodée et bijoux dorés",
    focusTitle: "Votre tenue de mariage",
    focusText: "Précisez le rôle de la tenue, le moment de la cérémonie, le niveau de broderie souhaité et les mouvements à privilégier. L’atelier vous accompagnera sur les essayages et le calendrier.",
    garment: "Robe",
    fabricHint: "Ex. dentelle brodée, satin, soie…",
    finishHint: "Ex. broderie, traîne, manches cérémonie…",
    finishes: ["Broderie main", "Dentelle brodée", "Manches cérémonie", "Traîne légère", "Finition perlée"],
  },
  evenement: {
    label: "Événement",
    title: "Une tenue remarquable pour votre grand moment.",
    intro: "Gala, remise de prix ou soirée : une création de cérémonie conçue autour de votre silhouette, du lieu et de l’allure que vous souhaitez porter.",
    image: "/images/mokha-inspiration.jfif",
    imageAlt: "Boubou grenat imprimé pour une tenue de cérémonie",
    focusTitle: "Une création pour l’événement",
    focusText: "Indiquez la date, le dress code et le type d’événement. Nous construirons ensemble une silhouette expressive, avec le bon équilibre entre ampleur, maintien et détails.",
    garment: "Boubou",
    fabricHint: "Ex. bazin, jacquard, satin…",
    finishHint: "Ex. empiècement, broderie, drapé…",
    finishes: ["Empiècement brodé", "Drapé de cérémonie", "Manches amples", "Finition contrastée", "Ceinture intégrée"],
  },
  voyage: {
    label: "Voyage",
    title: "Une pièce élégante qui vous accompagne.",
    intro: "Pour partir légère et rester vous-même : imaginons une tenue facile à porter, agréable en mouvement et adaptée à votre destination.",
    image: "/images/mokha-inspiration-1.jfif",
    imageAlt: "Robe longue à rayures azur, légère et structurée",
    focusTitle: "Le vestiaire du voyage",
    focusText: "Partagez votre destination, la saison et les usages prévus. L’atelier vous conseillera sur une coupe pratique, une matière respirante et des finitions faciles à vivre.",
    garment: "Robe",
    fabricHint: "Ex. coton léger, lin, viscose…",
    finishHint: "Ex. coupe fluide, poches, manches…",
    finishes: ["Coupe fluide", "Poches discrètes", "Manches retroussables", "Fermeture confortable", "Ourlet facile à porter"],
  },
  "tenue-signature": {
    label: "Tenue signature",
    title: "La pièce qui porte votre signature.",
    intro: "Une coupe reconnaissable, une matière qui vous ressemble, un détail juste : créons la tenue que vous aurez plaisir à reporter.",
    image: "/images/p1.jpg",
    imageAlt: "Robe portefeuille noire de la collection MOKHA",
    focusTitle: "Votre silhouette signature",
    focusText: "Parlez-nous des pièces que vous aimez déjà, des couleurs que vous portez et du détail qui rendrait cette création unique. La coupe sera développée autour de vos habitudes et de votre personnalité.",
    garment: "Robe",
    fabricHint: "Ex. soie sablée, laine froide, crêpe…",
    finishHint: "Ex. coupe portefeuille, taille marquée…",
    finishes: ["Coupe portefeuille", "Taille ceinturée", "Encolure signature", "Poche invisible", "Finition minimaliste"],
  },
  "fete-famille": {
    label: "Fête de famille",
    title: "Une tenue de fête à partager et à transmettre.",
    intro: "Retrouvailles, célébration ou grand repas : une création raffinée qui vous laisse profiter de chaque instant auprès des vôtres.",
    image: "/images/look-3.jpg",
    imageAlt: "Silhouette d’inspiration héritage pour une fête de famille",
    focusTitle: "Une fête en famille",
    focusText: "Précisez la date, les couleurs du rassemblement et si plusieurs tenues doivent dialoguer. Nous veillerons à l’aisance, à la tenue dans le temps et à l’harmonie de l’ensemble.",
    garment: "Boubou",
    fabricHint: "Ex. imprimé, bazin, coton…",
    finishHint: "Ex. empiècement, manches amples…",
    finishes: ["Empiècement décoratif", "Manches amples", "Finitions coordonnées", "Ceinture souple", "Broderie discrète"],
  },
  "collection-personnelle": {
    label: "Collection personnelle",
    title: "Construisons votre vestiaire, pièce après pièce.",
    intro: "Une garde-robe cohérente commence par vos vrais usages. L’atelier vous aide à imaginer des créations qui se combinent et vous ressemblent.",
    image: "/images/atelier-1.jpg",
    imageAlt: "Préparation d’une création dans l’atelier MOKHA",
    focusTitle: "Votre collection personnelle",
    focusText: "Décrivez les pièces que vous souhaitez réunir, vos couleurs, vos matières préférées et votre rythme de vie. Nous pouvons concevoir une pièce seule ou réfléchir à plusieurs silhouettes complémentaires.",
    garment: "Ensemble",
    fabricHint: "Ex. bazin, jacquard, soie…",
    finishHint: "Ex. détail récurrent, coupe coordonnée…",
    finishes: ["Silhouette coordonnée", "Détail signature récurrent", "Coupe intemporelle", "Finition sur mesure", "Pièces assorties"],
  },
} as const;

function BespokePage() {
  const [searchParams] = useSearchParams();
  const piece = searchParams.get("piece") ?? "";
  const occasion = searchParams.get("occasion") ?? "";
  const requestedGarmentType = searchParams.get("type") ?? "";
  const occasionInfo = bespokeOccasions[occasion as keyof typeof bespokeOccasions];
  const [garmentType, setGarmentType] = useState<string>(requestedGarmentType || occasionInfo?.garment || "Robe");
  const [currentStep, setCurrentStep] = useState(0);
  const [orderLink, setOrderLink] = useState("");
  const [requestError, setRequestError] = useState("");
  useEffect(() => {
    setGarmentType(requestedGarmentType || occasionInfo?.garment || "Robe");
  }, [occasionInfo, requestedGarmentType]);
  function validateBespokeStep(form: HTMLFormElement, step: number) {
    const panel = form.querySelector<HTMLElement>(`[data-bespoke-step="${step}"]`);
    const fields = panel?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea");
    const invalidField = Array.from(fields ?? []).find((field) => !field.checkValidity());
    if (invalidField) {
      invalidField.reportValidity();
      return false;
    }
    return true;
  }
  function prepareBespokeRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateBespokeStep(event.currentTarget, 2)) return;
    const form = new FormData(event.currentTarget);
    const referenceFile = form.get("referenceFile") as File | null;
    if (referenceFile?.size && referenceFile.size > 10 * 1024 * 1024) {
      setRequestError("Le fichier doit peser 10 Mo maximum.");
      setOrderLink("");
      return;
    }
    setRequestError("");
    const details = [
      `Pièce souhaitée : ${form.get("piece")}`,
      `Type de vêtement : ${form.get("garmentType")}`,
      `Tissu : ${form.get("fabric")}`,
      `Provenance du tissu : ${form.get("fabricSource")}`,
      `Finition / couture : ${form.get("finish")}`,
      `Longueur du vêtement : ${form.get("garmentLength") || "Non précisée"} cm`,
      `Longueur de manche : ${form.get("sleeveLength") || "Non précisée"} cm`,
      `Épaules : ${form.get("shoulders") || "Non précisées"} cm`,
      `Tour de poitrine : ${form.get("bust") || "Non précisé"} cm`,
      `Tour de taille : ${form.get("waist") || "Non précisé"} cm`,
      `Tour de hanches : ${form.get("hips") || "Non précisé"} cm`,
      `Nom : ${form.get("fullName")}`,
      `Téléphone : ${form.get("phone")}`,
      `E-mail : ${form.get("email")}`,
      `Occasion : ${occasionInfo?.label || occasion || "Non précisée"}`,
      `Précisions : ${form.get("notes") || "Aucune"}`,
      `Fichier de référence : ${referenceFile?.name || "Aucun"}`,
    ];
    const message = ["Bonjour MOKHA, je souhaite demander une création sur mesure.", "", ...details, "", "Merci de me contacter pour confirmer le tissu, les mesures et le devis.", referenceFile?.name ? "Je joindrai mon fichier de référence directement dans WhatsApp." : ""].filter(Boolean).join("\n");
    setOrderLink(`https://wa.me/224626600095?text=${encodeURIComponent(message)}`);
  }
  return <main className="page-shell content-page"><section className="page-hero page-hero-dark"><div className="page-hero-copy"><span className="eyebrow gold">{occasionInfo ? `SUR MESURE · ${occasionInfo.label.toLocaleUpperCase("fr")}` : "SUR MESURE"}</span><h1>{occasionInfo?.title ?? "Une pièce pensée pour vous."}</h1><p>{occasionInfo?.intro ?? "Chaque création MOKHA commence par une conversation : votre silhouette, votre occasion, votre rythme de vie."}</p><a className="button button-gold" href="#bespoke-request">{occasionInfo ? `Créer ma tenue ${occasionInfo.label.toLocaleLowerCase("fr")}` : "Décrire mon projet"} <ArrowRight size={15}/></a></div><div className="page-hero-visual"><img src={occasionInfo?.image ?? "/images/look-2.jpg"} alt={occasionInfo?.imageAlt ?? "Atelier de création MOKHA"} /></div></section>
    <section className="content-layout content-layout-reverse">
      <div className="content-card compact-card"><span className="eyebrow gold">PROCESSUS</span><h2>De l’inspiration au vêtement fini.</h2><ol className="steps-list">{processusSurMesure.map((step) => <li key={step.n}><span>{step.n}</span><div><h3>{step.titre}</h3><p>{step.texte}</p></div></li>)}</ol></div>
      <aside className="content-card quote-card"><span className="eyebrow gold">L'ATELIER</span><p>« Nous commençons par les volumes, puis nous ajustons. L’élégance naît du rapport entre le corps, la matière et le mouvement. »</p><strong>Fatoumata Sylla</strong></aside>
    </section>
    {occasionInfo ? <section className="occasion-focus"><span className="eyebrow gold">PROJET · {occasionInfo.label.toLocaleUpperCase("fr")}</span><h2>{occasionInfo.focusTitle}</h2><p>{occasionInfo.focusText}</p><div className="occasion-suggestions"><p><strong>Matières à envisager</strong><span>{occasionInfo.fabricHint}</span></p><p><strong>Finitions possibles</strong><span>{occasionInfo.finishes.join(" · ")}</span></p></div></section> : <section className="info-band"><div><span className="eyebrow gold">POUR QUI ?</span><h2>Pour les occasions qui comptent.</h2></div><div className="tag-grid">{[{ slug: "mariage", label: "Mariage" }, { slug: "evenement", label: "Événement" }, { slug: "voyage", label: "Voyage" }, { slug: "tenue-signature", label: "Tenue signature" }, { slug: "fete-famille", label: "Fête de famille" }, { slug: "collection-personnelle", label: "Collection personnelle" }].map((item) => <Link className="tag-button" key={item.slug} to={`/sur-mesure?occasion=${item.slug}`}>{item.label}</Link>)}</div></section>}
    <section className="bespoke-form-section" id="bespoke-request"><div className="bespoke-form-heading"><span className="eyebrow gold">VOTRE DEMANDE</span><h2>Parlons de votre création.</h2><p>Indiquez les mesures dont vous disposez. L’atelier les vérifiera avec vous avant toute confection.</p></div><form className="bespoke-form" noValidate onSubmit={prepareBespokeRequest}>
      <p className="bespoke-step-indicator" aria-live="polite">ÉTAPE {currentStep + 1} / 3</p>
      <section className="bespoke-step" data-bespoke-step="0" hidden={currentStep !== 0} aria-labelledby="bespoke-step-piece"><h3 id="bespoke-step-piece">La pièce</h3><div className="checkout-fields"><label>Modèle ou nom de la pièce<input name="piece" defaultValue={piece} placeholder="Ex. Toge Signature MOKHA" required/></label><label>Type de vêtement<select name="garmentType" value={garmentType} onChange={(event) => setGarmentType(event.target.value)}><option>Robe</option><option>Jupe</option><option>Ensemble</option><option>Boubou</option><option>Toge</option><option>Autre</option></select></label></div><div className="checkout-fields"><label>Tissu souhaité<input name="fabric" list="mokha-fabrics" placeholder="Choisir une matière du site ou préciser" required/><datalist id="mokha-fabrics">{[...new Set(products.map((product) => product.matiere))].map((fabric) => <option key={fabric} value={fabric}/>)}</datalist></label><label>Finition / couture<input name="finish" list="mokha-finishes" placeholder="Choisir une finition ou préciser" required/><datalist id="mokha-finishes"><option value="Coupe portefeuille"/><option value="Finition brodée main"/><option value="Drapé latéral"/><option value="Manches papillon"/><option value="Ourlet invisible"/></datalist></label></div><label>Choix du tissu<select name="fabricSource"><option value="Tissu proposé par MOKHA">Tissu proposé par MOKHA</option><option value="Tissu de la boutique en ligne">Tissu de la boutique en ligne</option><option value="Tissu fourni par la cliente">J’apporte mon propre tissu</option><option value="À définir avec l’atelier">À définir avec l’atelier</option></select></label><label>Photo ou document de référence <span className="optional">(facultatif, 10 Mo maximum)</span><input className="file-input" name="referenceFile" type="file" accept="image/*,.pdf"/></label>{requestError && <p className="form-error" role="alert">{requestError}</p>}</section>
      <section className="bespoke-step" data-bespoke-step="1" hidden={currentStep !== 1} aria-labelledby="bespoke-step-measures"><h3 id="bespoke-step-measures">Vos mesures <span className="optional">en centimètres</span></h3><div className="measure-grid"><label>Longueur {garmentType === "Jupe" ? "de jupe" : garmentType === "Robe" ? "de robe" : "du vêtement"}<input name="garmentLength" type="number" min="1" max="250" step="0.5" placeholder="Ex. 120"/></label><label>Longueur de manche<input name="sleeveLength" type="number" min="1" max="100" step="0.5" placeholder="Ex. 58"/></label><label>Largeur d’épaules<input name="shoulders" type="number" min="1" max="100" step="0.5" placeholder="Ex. 38"/></label><label>Tour de poitrine<input name="bust" type="number" min="1" max="200" step="0.5" placeholder="Ex. 92"/></label><label>Tour de taille<input name="waist" type="number" min="1" max="200" step="0.5" placeholder="Ex. 74"/></label><label>Tour de hanches<input name="hips" type="number" min="1" max="250" step="0.5" placeholder="Ex. 100"/></label></div></section>
      <section className="bespoke-step" data-bespoke-step="2" hidden={currentStep !== 2} aria-labelledby="bespoke-step-contact"><h3 id="bespoke-step-contact">Pour vous recontacter</h3><div className="checkout-fields"><label>Nom complet<input name="fullName" autoComplete="name" minLength={2} required/></label><label>Téléphone<input name="phone" type="tel" autoComplete="tel" required/></label></div><label>E-mail<input name="email" type="email" autoComplete="email" required/></label><label>Occasion et précisions<textarea name="notes" rows={4} maxLength={800} placeholder="Date souhaitée, préférence de coupe, autres mesures ou détails…"/></label><p className="form-note">Les mesures saisies sont indicatives. La confection et le prix seront confirmés après échange avec l’atelier.</p></section>
      <div className="bespoke-step-actions">{currentStep > 0 && <button className="button button-outline-dark" type="button" onClick={() => { setCurrentStep((step) => step - 1); setOrderLink(""); }}>Précédent</button>}{currentStep < 2 ? <button className="button button-dark" type="button" onClick={(event) => { const form = event.currentTarget.closest("form"); if (form && validateBespokeStep(form, currentStep)) { setCurrentStep((step) => step + 1); setOrderLink(""); } }}>Continuer <ArrowRight size={15}/></button> : <button className="button button-dark" type="submit">Préparer ma demande <ArrowRight size={15}/></button>}</div>{orderLink && <div className="order-ready" role="status"><p>Votre demande est structurée. Envoyez-la à l’atelier pour convenir des prochaines étapes.</p><a className="button button-gold" href={orderLink} target="_blank" rel="noreferrer">Envoyer via WhatsApp <MessageCircle size={16}/></a></div>}
    </form></section>
  </main>;
}

function ServicesPage() {
  const { formatPrice } = useCurrency();
  return <main className="page-shell content-page"><section className="page-hero page-hero-light"><div className="page-hero-copy"><span className="eyebrow gold">SERVICES</span><h1>Un accompagnement couture et stylistique.</h1><p>Des services pensés pour faire tenir votre tenue, votre image et votre confort dans le même mouvement.</p></div><div className="page-hero-visual"><img src="/images/p4.jpg" alt="Services MOKHA" /></div></section>
    <ValuesSection/>
    <section className="services-grid">{services.map((service) => <article className="service-card" key={service.slug}><span className="eyebrow gold">{service.duree}</span><h2>{service.titre}</h2><p>{service.texte}</p><div className="service-meta"><strong>{service.prixXof === null ? "Sur devis" : `${service.tarif === "starting" ? "À partir de " : ""}${formatPrice(service.prixXof)}${service.tarif === "session" ? " la séance" : ""}`}</strong><Link to="/contact">Demander le service <ArrowRight size={15}/></Link></div></article>)}</section>
  </main>;
}

function ValuesSection() {
  return <section className="values-section"><div><span className="eyebrow gold">NOTRE MISSION</span><h2>Faire vivre une élégance qui nous ressemble.</h2><p>Depuis Conakry, MOKHA crée des vêtements qui relient l’héritage de la couture à la liberté de chaque femme. Nous accompagnons chaque cliente de l’idée au dernier essayage, avec écoute et exigence.</p></div><div className="values-list"><article><span>01</span><div><h3>Écoute</h3><p>Comprendre votre occasion, vos envies et votre façon de bouger avant de dessiner.</p></div></article><article><span>02</span><div><h3>Savoir-faire</h3><p>Privilégier un patronage précis, des essayages attentifs et des finitions soignées.</p></div></article><article><span>03</span><div><h3>Respect</h3><p>Valoriser les matières, les gestes de l’atelier et les silhouettes sans compromis sur le confort.</p></div></article></div></section>;
}

const faqItems = [
  ["Comment commander une création ?", "Ajoutez la pièce et ses variantes à votre panier, puis renseignez vos coordonnées. Le récapitulatif WhatsApp permet à la conciergerie de confirmer disponibilité, livraison et paiement."],
  ["Puis-je demander une création sur mesure ?", "Oui. Décrivez la pièce, le tissu, les finitions et les mesures dont vous disposez sur la page Sur mesure. L’atelier vous recontactera pour valider le projet et le devis."],
  ["Comment prendre mes mesures ?", "Utilisez un ruban souple, sans serrer, et saisissez les valeurs en centimètres. Les mesures envoyées sont indicatives : elles seront revues avec l’atelier avant la coupe."],
  ["Quels sont les délais de confection ?", "Les délais varient selon la création et figurent sur les fiches de services ou de produits. Le délai précis est confirmé après validation du modèle, des matières et des mesures."],
  ["Puis-je utiliser mon propre tissu ?", "Oui, indiquez-le dans votre demande sur mesure et décrivez la matière ou joignez une référence. L’atelier confirmera si le tissu convient au modèle choisi."],
  ["Comment les prix sont-ils affichés ?", "Les montants sont indiqués dans la devise liée au pays sélectionné dans l’en-tête. Les conversions restent indicatives et peuvent varier ; le montant final est confirmé par MOKHA avant paiement. Les frais éventuels de livraison sont précisés séparément."],
  ["Comment se passent la livraison et les retours ?", "Les modalités sont confirmées au moment de la commande. Les pièces non portées peuvent être retournées sous 14 jours selon les conditions communiquées par la maison ; les créations personnalisées nécessitent une confirmation préalable."],
];

function FAQPage() {
  return <main className="page-shell content-page"><section className="page-hero page-hero-light"><div className="page-hero-copy"><span className="eyebrow gold">À VOTRE ÉCOUTE</span><h1>Questions fréquentes.</h1><p>Commande, création sur mesure, entretien et livraison : les réponses de la maison MOKHA.</p></div><div className="page-hero-visual"><img src="/images/atelier-1.jpg" alt="Travail de confection à l’atelier MOKHA"/></div></section><section className="faq-list">{faqItems.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section><p className="document-contact">Une question particulière ? <Link to="/contact">Écrivez à notre atelier <ArrowRight size={15}/></Link></p></main>;
}

function LegalPage({ kind }: { kind: "mentions" | "privacy" | "terms" }) {
  const page = {
    mentions: { label: "INFORMATIONS LÉGALES", title: "Mentions légales", updated: "Informations éditoriales", sections: [["Éditeur du site", "Le site MOKHA est édité par la maison de création MOKHA, fondée par Fatoumata Sylla, styliste et modéliste, à Conakry, République de Guinée."], ["Contact", "Atelier MOKHA — Washington, Petit Simbaya, Conakry, Guinée. Téléphone : +224 626 600 095. E-mail : fatima95sylla@gmail.com."], ["Hébergement", "Les coordonnées de l’hébergeur doivent être complétées par l’éditeur avant la mise en production."], ["Propriété intellectuelle", "Les textes, photographies, créations, marques et éléments graphiques publiés sur ce site sont réservés à MOKHA ou à leurs ayants droit. Toute reproduction ou réutilisation nécessite une autorisation préalable."], ["Responsabilité", "Les informations du site sont fournies à titre indicatif et peuvent évoluer. Les prix convertis dépendent des taux de change disponibles ; le montant confirmé par la maison lors de la commande fait foi."]] },
    privacy: { label: "VOS DONNÉES", title: "Confidentialité", updated: "Politique de confidentialité", sections: [["Données communiquées", "Les formulaires de commande et de demande sur mesure recueillent les coordonnées et informations nécessaires au traitement de votre demande. Le site prépare un message WhatsApp adressé à la conciergerie ; l’envoi n’a lieu qu’après votre action."], ["Données conservées dans le navigateur", "Le panier, les favoris et le pays/devise sélectionnés peuvent être conservés localement sur votre appareil afin de retrouver vos choix lors de votre prochaine visite."], ["Finalités", "Les informations transmises servent à répondre à vos demandes, préparer un devis, organiser une commande et assurer le suivi avec vous. Elles ne sont pas utilisées pour créer un compte marketing sans votre démarche."], ["Partage et conservation", "Une fois envoyées, les informations échangées par WhatsApp sont également soumises aux conditions de ce service. MOKHA ne vend pas vos données. Les demandes sont conservées le temps nécessaire au suivi de la relation et aux obligations applicables."], ["Vos droits et contact", "Pour demander l’accès, la correction ou la suppression de vos informations, contactez fatima95sylla@gmail.com ou le +224 626 600 095. Évitez d’ajouter des informations sensibles qui ne sont pas nécessaires à votre commande."]] },
    terms: { label: "ACHETER CHEZ MOKHA", title: "Conditions générales de vente", updated: "Conditions de commande", sections: [["Objet et disponibilité", "Les fiches présentent les créations, variantes et prix indicatifs. Une commande devient ferme après confirmation de la disponibilité, du prix final, des modalités de paiement et de livraison par la maison."], ["Prix et devise", "Les prix sont affichés dans la devise liée au pays sélectionné. Les conversions restent indicatives et peuvent varier ; le montant final est confirmé par MOKHA avant paiement. Les frais éventuels de livraison sont précisés séparément."], ["Créations sur mesure", "Toute demande personnalisée fait l’objet d’un échange préalable sur le modèle, le tissu, les mesures, le délai et le devis. La production ne commence qu’après validation expresse de ces éléments. Les mesures fournies en ligne sont indicatives et doivent être confirmées avec l’atelier."], ["Paiement et livraison", "Les moyens de paiement, l’adresse, les frais et les délais sont convenus avec la conciergerie lors de la confirmation. Les délais affichés sont estimatifs jusqu’à validation de la commande."], ["Retours et réclamations", "Pour une pièce non portée, toute demande de retour doit être signalée à MOKHA dans les 14 jours suivant la réception afin que l’atelier confirme la procédure. Les pièces réalisées selon des indications ou mesures personnalisées nécessitent un examen au cas par cas. Contact : fatima95sylla@gmail.com."], ["Droit applicable", "Les commandes sont traitées par la maison depuis Conakry. Les règles applicables et les modalités de résolution d’un différend seront précisées par MOKHA selon le lieu de vente et la réglementation applicable."]] },
  }[kind];
  return <main className="page-shell content-page"><section className="legal-heading"><span className="eyebrow gold">{page.label}</span><h1>{page.title}</h1><p>{page.updated} · Maison MOKHA, Conakry</p></section><article className="legal-content">{page.sections.map(([title, content]) => <section key={title}><h2>{title}</h2><p>{content}</p></section>)}</article></main>;
}

const atelierTopics = [
  { label: "Patronage", to: "/atelier/savoir-faire/patronage" },
  { label: "Essayage", to: "/atelier/savoir-faire/essayage" },
  { label: "Broderie", to: "/atelier/savoir-faire/broderie" },
  { label: "Finitions", to: "/atelier/savoir-faire/finitions" },
  { label: "Toges MOKHA", to: "/boutique?collection=toges-mokha" },
  { label: "Vêtements de cérémonie", to: "/boutique?collection=lumiere-doree" },
  { label: "Prêt-à-porter", to: "/boutique" },
];

const atelierTopicDetails: Record<string, { title: string; intro: string; detail: string }> = {
  patronage: { title: "Le patronage, base de chaque silhouette.", intro: "Un vêtement juste commence par un patron construit pour le corps et le mouvement.", detail: "À l’atelier MOKHA, la coupe est dessinée à plat, puis vérifiée sur mannequin. Pour une création personnalisée, les proportions et l’aisance sont ajustées à partir de vos mesures et de vos préférences." },
  essayage: { title: "L’essayage, le temps de l’ajustement.", intro: "Chaque essayage permet de vérifier le tombé, le confort et la liberté de mouvement.", detail: "L’atelier accompagne les étapes de confection par des essayages intermédiaires lorsque le projet le nécessite. Les corrections sont discutées avec vous avant les finitions." },
  broderie: { title: "La broderie, un geste de signature.", intro: "Des détails brodés à la main donnent relief et caractère à certaines pièces MOKHA.", detail: "Motif, emplacement et fils sont choisis en harmonie avec la matière et la silhouette. Découvrez les créations de cérémonie et les pièces brodées dans nos collections." },
  finitions: { title: "Les finitions, le soin du détail.", intro: "Ourlets, coutures et fermetures sont travaillés pour accompagner durablement le vêtement.", detail: "L’atelier contrôle chaque détail avant la remise de la pièce : propreté des coutures, tenue des ourlets et équilibre général du vêtement." },
};

function AtelierTopicPage() {
  const { slug } = useParams();
  const topic = slug ? atelierTopicDetails[slug] : undefined;
  if (!topic) return <NotFoundPage/>;
  return <main className="page-shell content-page"><section className="page-hero page-hero-dark"><div className="page-hero-copy"><span className="eyebrow gold">LE SAVOIR-FAIRE MOKHA</span><h1>{topic.title}</h1><p>{topic.intro}</p><Link className="button button-gold" to="/sur-mesure">Parler de mon projet <ArrowRight size={15}/></Link></div><div className="page-hero-visual"><img src="/images/atelier-1.jpg" alt="Savoir-faire de l’atelier MOKHA"/></div></section><article className="article-body atelier-topic-copy"><p>{topic.detail}</p><p>Chaque projet est différent. L’équipe vous conseille sur les matières, les délais et les options adaptées à la création souhaitée.</p><Link className="text-link" to="/contact">Contacter l’atelier <ArrowRight size={15}/></Link></article></main>;
}

function AtelierPage() {
  return <main className="page-shell content-page"><section className="page-hero page-hero-dark"><div className="page-hero-copy"><span className="eyebrow gold">L'ATELIER</span><h1>Le geste qui donne la forme.</h1><p>À Conakry, l’atelier MOKHA travaille en petits lots, avec soin, en alliant patronage, essayage et finition à la main.</p></div><div className="page-hero-visual"><img src="/images/atelier-1.jpg" alt="Atelier MOKHA" /></div></section>
    <section className="content-layout">
      <div className="content-card"><span className="eyebrow gold">NOTRE MÉTHODE</span><h2>Une maison de couture, un savoir-faire précis.</h2><p>Chaque pièce part d’un patron à plat puis est corrigée sur mannequin. La coupe est pensée pour épouser les mouvements du corps sans jamais les figer.</p><ul className="check-list"><li>Patronage sur mesure et essayages intermédiaires</li><li>Finitions à la main, boutons et ourlets sculptés</li><li>Sélection de tissus premium selon les collections</li></ul></div>
      <div className="content-card image-card"><img src="/images/fondatrice.jpg" alt="Fatoumata Sylla à l'atelier" /></div>
    </section>
    <section className="info-band"><div><span className="eyebrow gold">TRAVAIL DE L'ATELIER</span><h2>Des créations à la fois intemporelles et portables.</h2></div><div className="tag-grid">{atelierTopics.map((topic) => <Link className="tag-button" key={topic.label} to={topic.to}>{topic.label}</Link>)}</div></section>
  </main>;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useLayoutEffect(() => {
    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    resetScroll();
    const frame = requestAnimationFrame(resetScroll);
    return () => cancelAnimationFrame(frame);
  }, [pathname, search]);
  return null;
}

function JournalPage() {
  return <main className="page-shell content-page"><section className="page-hero page-hero-light"><div className="page-hero-copy"><span className="eyebrow gold">LE JOURNAL</span><h1>Écrits de la maison.</h1><p>Des réflexions sur les matières, les gestes et la manière de porter une pièce avec élégance.</p></div><div className="page-hero-visual"><img src="/images/p6.jpg" alt="Journal MOKHA" /></div></section>
    <section className="journal-grid page-journal-grid">{journal.map((article) => <Link className="journal-card" to={`/journal/${article.slug}`} key={article.slug}><img src={article.image} alt={article.titre} loading="lazy"/><span className="eyebrow gold">{article.categorie} · {article.date}</span><h3>{article.titre}</h3><p>{article.chapeau}</p></Link>)}</section>
  </main>;
}

function JournalArticlePage() {
  const { slug } = useParams();
  const article = journal.find((item) => item.slug === slug);
  if (!article) return <NotFoundPage/>;
  const related = journal.filter((item) => item.slug !== article.slug).slice(0, 2);
  return <main className="page-shell content-page"><section className="article-header"><div className="article-header-copy"><span className="eyebrow gold">{article.categorie} · {article.date}</span><h1>{article.titre}</h1><p>{article.chapeau}</p></div><img src={article.image} alt={article.titre}/></section>
    <article className="article-body"><p>La maison MOKHA construit chaque pièce autour d’une idée simple : une élégance durable repose sur un savoir-faire précis, des matières choisies avec soin et une silhouette pensée pour le corps qui la porte.</p><p>Dans notre atelier, les gestes sont lents. Nous posons le tissu, nous évaluons l’ampleur, nous ajustons les plis, nous corrigeons la couture. C’est cette patience qui transforme un vêtement en une signature.</p><p>Porter MOKHA, c’est choisir un rythme plus doux, un vestiaire plus fidèle à soi, un style qui traverse les années sans perdre son intensité.</p></article>
    <section className="related-posts"><h2>À lire aussi</h2><div className="journal-grid page-journal-grid">{related.map((item) => <Link className="journal-card" to={`/journal/${item.slug}`} key={item.slug}><img src={item.image} alt={item.titre} loading="lazy"/><span className="eyebrow gold">{item.categorie} · {item.date}</span><h3>{item.titre}</h3><p>{item.chapeau}</p></Link>)}</div></section>
  </main>;
}

function MaisonPage() {
  return <main className="page-shell content-page"><section className="page-hero page-hero-light"><div className="page-hero-copy"><span className="eyebrow gold">LA MAISON</span><h1>Une maison de création héritée du geste familial.</h1><p>Depuis la Guinée, MOKHA unit l’héritage de la couture, la précision du stylisme et l’élégance contemporaine.</p></div><div className="page-hero-visual"><img src="/images/fondatrice.jpg" alt="Fondatrice MOKHA" /></div></section>
    <section className="content-layout content-layout-reverse"><div className="content-card"><span className="eyebrow gold">NOTRE HISTOIRE</span><h2>Une élégance qui se transmet.</h2><p>MOKHA est née de la rencontre entre le savoir-faire de famille et l’intelligence du patronage. Fatoumata Sylla a fait de la couture un art de la silhouette, en tissant des matières nobles et des formes modernes.</p><p>Chaque collection est pensée comme une carte : une histoire de lieux, de pièces de famille, de célébrations et de femmes qui veulent porter leur autorité sans effort.</p></div><div className="content-card"><span className="eyebrow gold">AUJOURD’HUI</span><h2>Une présence internationale.</h2><p>Nos pièces sont portées par des femmes à Dakar, Abidjan, Paris et Montréal. L’élégance MOKHA reste fidèle à son principe : moins de pièces, plus de présence, plus de soin.</p><Link className="text-link" to="/collections">Voir les collections <ArrowRight size={15}/></Link></div></section>
  </main>;
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }
  return <main className="page-shell content-page"><section className="page-hero page-hero-dark"><div className="page-hero-copy"><span className="eyebrow gold">CONTACT</span><h1>Parlons de votre projet.</h1><p>Que vous souhaitiez une pièce sur mesure, un conseil stylistique ou simplement découvrir nos collections, nous sommes à votre écoute.</p></div><div className="page-hero-visual"><img src="/images/look-1.jpg" alt="Contact MOKHA" /></div></section>
    <section className="contact-layout"><form className="contact-form" onSubmit={handleSubmit}><label>Nom complet<input name="fullName" placeholder="Votre nom" required /></label><label>E-mail<input name="email" type="email" placeholder="vous@exemple.com" required /></label><label>Objet<input name="subject" placeholder="Sujet" required /></label><label>Message<textarea name="message" rows={6} placeholder="Décrivez votre projet…" required /></label>{submitted ? <p className="form-success">Votre demande a bien été enregistrée. L'atelier vous répondra rapidement.</p> : null}<button className="button button-dark" type="submit">Envoyer ma demande <ArrowRight size={15}/></button></form><aside className="contact-panel"><span className="eyebrow gold">CONTACTER</span><h2>MOKHA</h2><a className="contact-line" href="tel:+224626600095"><Phone/><span>+224 626 600 095</span></a><a className="contact-line" href="mailto:fatima95sylla@gmail.com"><Mail/><span>fatima95sylla@gmail.com</span></a><a className="contact-line" href="https://maps.google.com/?q=Atelier+MOKHA+Petit+Simbaya+Conakry" target="_blank" rel="noreferrer"><MapPin/><span>Atelier MOKHA · Petit Simbaya, Conakry</span></a><a className="contact-line" href="https://instagram.com/mokha.maison" target="_blank" rel="noreferrer"><Instagram/><span>@mokha.maison</span></a></aside></section>
  </main>;
}

function FavoritesPage() {
  const { favoriteIds } = useShopState();
  const favorites = products.filter((item) => favoriteIds.includes(item.id));
  return <main><section className="shop-page-heading"><span className="eyebrow gold">VOTRE SÉLECTION</span><h1>Mes favoris</h1><p>Les créations que vous souhaitez garder à portée de main.</p></section><section className="favorite-results">{favorites.length ? <div className="product-grid">{favorites.map((product, index) => <ProductCard key={product.id} product={product} index={index}/>)}</div> : <div className="empty-state"><Heart size={24}/><p>Votre sélection est encore vide.</p><Link className="button button-dark" to="/boutique">Découvrir les créations <ArrowRight size={15}/></Link></div>}</section></main>;
}

function CartPage() {
  const { formatPrice } = useCurrency();
  const { cart, setCartQuantity, removeFromCart } = useShopState();
  const lines = cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    return product ? [{ ...line, product, lineTotal: product.prix * (line.confection === "custom" ? 1.25 : 1) * line.quantity }] : [];
  });
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const groupedLines = Array.from(lines.reduce((groups, line) => {
    const group = groups.get(line.productId) ?? [];
    group.push(line);
    groups.set(line.productId, group);
    return groups;
  }, new Map<string, typeof lines>()).values());
  return <main><section className="shop-page-heading"><span className="eyebrow gold">VOTRE SÉLECTION</span><h1>Mon panier</h1><p>{lines.reduce((sum, line) => sum + line.quantity, 0)} article(s) · Les variantes différentes sont affichées séparément.</p></section><section className="cart-content">{lines.length ? <><div className="cart-lines">{groupedLines.map((group) => { const product = group[0].product; return <article className="cart-product-group" key={product.id}><Link className="cart-product-image" to={`/boutique/${product.slug}`}><img src={product.images[0]} alt={product.nom}/></Link><div className="cart-product-details"><div className="cart-product-heading"><span className="eyebrow">{product.categorie} · {product.reference}</span><h2><Link to={`/boutique/${product.slug}`}>{product.nom}</Link></h2></div>{group.map((line) => <div className="cart-variant-line" key={`${line.size}-${line.color}-${line.confection}`}><div className="cart-line-info"><p>Taille {line.size} · Tissu / couleur : {line.color} · {line.confection === "custom" ? "Sur mesure (+25 %)" : "Prêt-à-porter"}</p><div className="cart-quantity"><span className="cart-quantity-label">Quantité</span><div className="cart-quantity-control"><button type="button" aria-label={`Diminuer ${product.nom}`} disabled={line.quantity <= 1} onClick={() => setCartQuantity(line.productId, line.size, line.color, line.confection, line.quantity - 1)}>−</button><output aria-label="Quantité">{line.quantity}</output><button type="button" aria-label={`Augmenter ${product.nom}`} disabled={line.quantity >= 20} onClick={() => setCartQuantity(line.productId, line.size, line.color, line.confection, line.quantity + 1)}>+</button></div><span className="cart-unit-price">{formatPrice(line.lineTotal / line.quantity)} <span>/ pièce</span></span></div></div><div className="cart-variant-actions"><strong>{formatPrice(line.lineTotal)}</strong><button type="button" className="remove-cart-line" onClick={() => removeFromCart(line.productId, line.size, line.color, line.confection)}>Retirer</button></div></div>)}</div></article>; })}</div><div className="cart-total"><span>Sous-total indicatif</span><strong>{formatPrice(total)}</strong></div><p className="cart-notice">Les frais de livraison, la disponibilité et le paiement seront confirmés par l'atelier.</p><Link className="button button-dark checkout-button" to="/commande">Passer la commande <ArrowRight size={15}/></Link></> : <div className="empty-state"><ShoppingBag size={24}/><p>Votre panier est vide.</p><Link className="button button-dark" to="/boutique">Découvrir les créations <ArrowRight size={15}/></Link></div>}</section></main>;
}

function CheckoutPage() {
  const { formatPrice } = useCurrency();
  const { cart } = useShopState();
  const [orderLink, setOrderLink] = useState("");
  const lines = cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    return product ? [{ ...line, product, lineTotal: product.prix * (line.confection === "custom" ? 1.25 : 1) * line.quantity }] : [];
  });
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  function prepareOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const summary = lines.map((line, index) => line.product.isFabric
      ? `${index + 1}. ${line.product.nom} (${line.product.reference})\n   Format : ${line.size} | Couleur : ${line.color}\n   Quantité : ${line.quantity} coupon(s)\n   Montant indicatif : ${formatPrice(line.lineTotal)}`
      : `${index + 1}. ${line.product.nom} (${line.product.reference})\n   Taille : ${line.size} | Couleur : ${line.color}\n   Réalisation : ${line.confection === "custom" ? "sur mesure" : "prêt-à-porter"} | Quantité : ${line.quantity}\n   Montant indicatif : ${formatPrice(line.lineTotal)}`).join("\n\n");
    const message = [
      "Bonjour MOKHA, je souhaite confirmer ma commande.",
      "",
      "ARTICLES",
      summary,
      "",
      `SOUS-TOTAL INDICATIF : ${formatPrice(total)}`,
      "",
      "MES COORDONNÉES",
      `Nom : ${form.get("fullName")}`,
      `Téléphone : ${form.get("phone")}`,
      `E-mail : ${form.get("email")}`,
      "",
      "LIVRAISON",
      `Mode : ${form.get("delivery")}`,
      `Adresse : ${form.get("address")}`,
      `Ville : ${form.get("city")}`,
      `Pays : ${form.get("country")}`,
      "",
      "NOTE POUR L’ATELIER",
      String(form.get("notes") || "Aucune"),
      "",
      "Merci de me confirmer la disponibilité, les frais de livraison et les modalités de paiement.",
    ].join("\n");
    setOrderLink(`https://wa.me/224626600095?text=${encodeURIComponent(message)}`);
  }

  if (!lines.length) return <main><section className="shop-page-heading"><span className="eyebrow gold">COMMANDE</span><h1>Votre panier est vide</h1><Link className="button button-dark" to="/boutique">Retour à la boutique</Link></section></main>;

  return <main><section className="shop-page-heading"><span className="eyebrow gold">DERNIÈRE ÉTAPE</span><h1>Passer la commande</h1><p>Confirmez vos coordonnées. La conciergerie finalisera avec vous la livraison, la disponibilité et le paiement.</p></section><section className="checkout-layout"><form className="checkout-form" onSubmit={prepareOrder}><h2>Vos coordonnées</h2><label>Nom complet<input name="fullName" autoComplete="name" minLength={2} required/></label><div className="checkout-fields"><label>Téléphone<input name="phone" type="tel" autoComplete="tel" required/></label><label>E-mail<input name="email" type="email" autoComplete="email" required/></label></div><label>Mode de livraison<select name="delivery"><option value="Livraison à Conakry">Livraison à Conakry</option><option value="Retrait à l'atelier">Retrait à l'atelier</option><option value="Hors Conakry">Hors Conakry</option></select></label><label>Adresse de livraison<input name="address" autoComplete="street-address" minLength={4} required/></label><div className="checkout-fields"><label>Ville<input name="city" autoComplete="address-level2" required/></label><label>Pays<input name="country" autoComplete="country-name" defaultValue="Guinée" required/></label></div><label>Note pour l'atelier <span className="optional">(facultatif)</span><textarea name="notes" rows={3} maxLength={500}/></label><button className="button button-dark" type="submit">Préparer ma commande <ArrowRight size={15}/></button>{orderLink && <div className="order-ready" role="status"><p>Récapitulatif prêt. Envoyez-le à la conciergerie pour confirmer la commande.</p><a className="button button-gold" href={orderLink} target="_blank" rel="noreferrer">Confirmer via WhatsApp <MessageCircle size={16}/></a></div>}</form><aside className="checkout-summary"><span className="eyebrow gold">RÉCAPITULATIF</span><h2>{lines.reduce((sum, line) => sum + line.quantity, 0)} article(s)</h2>{lines.map((line) => <div className="checkout-line" key={`${line.productId}-${line.size}-${line.color}-${line.confection}`}><img src={line.product.images[0]} alt=""/><div><strong>{line.product.nom}</strong><span>{line.size} · {line.color} · {line.quantity} × {line.confection === "custom" ? "sur mesure" : "prêt-à-porter"}</span></div><b>{formatPrice(line.lineTotal)}</b></div>)}<div className="cart-total"><span>Sous-total indicatif</span><strong>{formatPrice(total)}</strong></div><p>Les frais de livraison et le montant définitif seront confirmés par l'atelier avant validation.</p></aside></section></main>;
}

function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const authenticatedUser = isRegister
        ? await register({ name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")), phone: String(form.get("phone") || "") || undefined })
        : await login(String(form.get("email")), String(form.get("password")));
      navigate(authenticatedUser?.role === "ADMIN" || authenticatedUser?.role === "admin" ? "/admin" : "/boutique");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Une erreur est survenue. Réessayez.");
    } finally { setBusy(false); }
  }
  return <main className="auth-page"><div className="auth-image"><img src={isRegister ? "/images/fondatrice.jpg" : "/images/look-2.jpg"} alt="Créations de la maison MOKHA"/><div className="auth-image-copy"><span className="eyebrow gold">MOKHA · CONAKRY</span><p>Une élégance<br/>qui se transmet.</p></div></div><section className="auth-panel"><span className="eyebrow gold">VOTRE ESPACE</span><h1>{isRegister ? "Créer un compte." : "Ravie de vous retrouver."}</h1><p className="auth-caption">{isRegister ? "Rejoignez la maison MOKHA et retrouvez vos échanges avec l’atelier." : "Connectez-vous pour retrouver votre espace MOKHA."}</p><form className="auth-form" onSubmit={submit}>{isRegister && <label>Nom complet<input name="name" autoComplete="name" minLength={2} required placeholder="Votre nom"/></label>}<label>Adresse e-mail<input name="email" type="email" autoComplete="email" required placeholder="vous@exemple.com"/></label>{isRegister && <label>Téléphone <span className="optional">(facultatif)</span><input name="phone" type="tel" autoComplete="tel" placeholder="+224"/></label>}<label>Mot de passe<input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 12 : 1} required placeholder={isRegister ? "12 caractères minimum" : "Votre mot de passe"}/></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={busy}>{busy ? "Un instant…" : isRegister ? "Créer mon compte" : "Me connecter"}<ArrowRight size={15}/></button></form><p className="auth-switch">{isRegister ? "Vous avez déjà un compte ?" : "Première visite ?"} <Link to={isRegister ? "/connexion" : "/inscription"}>{isRegister ? "Connexion" : "Créer un compte"}</Link></p><p className="auth-privacy">Vos informations restent confidentielles et sont utilisées uniquement pour votre relation avec la maison.</p></section></main>;
}

function NotFoundPage() {
  return <main className="not-found"><span className="eyebrow gold">404 · PAGE INTROUVABLE</span><h1>Cette page s’est<br/>éclipsée.</h1><p>Le lien a peut-être changé. Retrouvez les créations de la maison dans la boutique.</p><Link className="button button-dark" to="/boutique"><ArrowLeft size={15}/> Retour à la boutique</Link></main>;
}

function WhatsAppConciergerie() {
  const message = encodeURIComponent("Bonjour MOKHA, je souhaite des informations sur vos créations.");
  return <a className="whatsapp-concierge" href={`https://wa.me/224626600095?text=${message}`} target="_blank" rel="noreferrer" aria-label="Écrire à la conciergerie MOKHA sur WhatsApp" title="Écrire à la conciergerie MOKHA sur WhatsApp"><MessageCircle size={17}/><span>Conciergerie</span></a>;
}

function AdminPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const [overview, setOverview] = useState<{ role: string; modulesDisponibles: string[]; modulesEnAttente: string[]; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";

  useEffect(() => {
    if (!token || !isAdmin) return;
    let active = true;
    setLoading(true);
    setError("");
    apiFetch<typeof overview>("/admin/overview", {}, token)
      .then((data) => { if (active) setOverview(data); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Le tableau de bord est indisponible."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, isAdmin]);

  if (authLoading) return <main className="admin-page"><p>Vérification de la session…</p></main>;
  if (!user || !token) return <main className="admin-page"><span className="eyebrow gold">ESPACE SÉCURISÉ</span><h1>Administration MOKHA</h1><p>Connectez-vous avec le compte administrateur pour accéder à cet espace.</p><Link className="button button-dark" to="/connexion">Connexion administrateur <ArrowRight size={15}/></Link></main>;
  if (!isAdmin) return <main className="admin-page"><span className="eyebrow gold">ACCÈS RESTREINT</span><h1>Réservé à l’administration</h1><p>Le compte {user.email} ne possède pas le rôle administrateur.</p><button className="button button-dark" onClick={logout}>Se déconnecter</button></main>;

  return <main className="admin-page"><div className="admin-heading"><div><span className="eyebrow gold">ESPACE SÉCURISÉ · {user.email}</span><h1>Administration MOKHA</h1><p>État de la migration vers Spring Boot.</p></div><button className="button button-outline-dark" onClick={logout}>Se déconnecter</button></div>{loading && <p role="status">Chargement des modules…</p>}{error && <p className="admin-error" role="alert">{error}</p>}{overview && <><div className="admin-status"><span className="admin-status-dot"/><div><strong>Backend Spring Boot connecté</strong><span>Session validée · rôle {overview.role}</span></div></div><section className="admin-module-section"><h2>Modules disponibles</h2><div className="admin-module-grid">{overview.modulesDisponibles.map((module) => <article className="admin-module available" key={module}><Check/><span>{module}</span><small>Actif</small></article>)}</div></section><section className="admin-module-section"><h2>En attente de migration</h2><div className="admin-module-grid">{overview.modulesEnAttente.map((module) => <article className="admin-module pending" key={module}><span className="module-indicator"/><span>{module}</span><small>Non migré</small></article>)}</div></section><p className="admin-notice">{overview.message}</p></>}</main>;
}

export default function App() {
return <><ScrollToTop/><Header/><Routes><Route path="/" element={<HomePage/>}/><Route path="/boutique" element={<BoutiquePage/>}/><Route path="/boutique/robe-orange-coiffe-yuyu" element={<Navigate to="/boutique/toge-signature-mokha" replace/>}/><Route path="/boutique/robe-blanche-details-rouges-yuyu" element={<Navigate to="/boutique/ensemble-bleu-ciel-yuyu" replace/>}/><Route path="/boutique/ensemble-blanc-evenement-yuyu" element={<Navigate to="/boutique/toge-remise-diplome-yuyu" replace/>}/><Route path="/boutique/:slug" element={<ProductPage/>}/><Route path="/collections" element={<CollectionsPage/>}/><Route path="/sur-mesure" element={<BespokePage/>}/><Route path="/services" element={<ServicesPage/>}/><Route path="/atelier" element={<AtelierPage/>}/><Route path="/atelier/savoir-faire/:slug" element={<AtelierTopicPage/>}/><Route path="/journal" element={<JournalPage/>}/><Route path="/journal/:slug" element={<JournalArticlePage/>}/><Route path="/a-propos" element={<MaisonPage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/faq" element={<FAQPage/>}/><Route path="/mentions-legales" element={<LegalPage kind="mentions"/>}/><Route path="/confidentialite" element={<LegalPage kind="privacy"/>}/><Route path="/conditions" element={<LegalPage kind="terms"/>}/><Route path="/favoris" element={<FavoritesPage/>}/><Route path="/panier" element={<CartPage/>}/><Route path="/commande" element={<CheckoutPage/>}/><Route path="/connexion" element={<AuthPage mode="login"/>}/><Route path="/inscription" element={<AuthPage mode="register"/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="*" element={<NotFoundPage/>}/></Routes><Footer/><WhatsAppConciergerie/></>;
}
