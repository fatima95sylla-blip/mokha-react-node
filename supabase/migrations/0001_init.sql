-- MOKHA — Schéma initial Supabase
-- Convention : tables en snake_case, clés primaires en uuid, timestamps systématiques.
-- Sécurité : RLS activé partout. Un client ne peut jamais lire/écrire les données
-- d'un autre client. Seul un profil avec role = 'admin' peut agir sur le catalogue,
-- les commandes de tout le monde, le blog, les services, la FAQ et les médias.

create extension if not exists "pgcrypto";

-- ==========================================================
-- 1. PROFILS (étend auth.users de Supabase)
-- ==========================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Adresses d'une cliente (plusieurs par profil)
create table addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  label text not null default 'Domicile',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  country text not null default 'Sénégal',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ==========================================================
-- 2. CATALOGUE
-- ==========================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nom text not null,
  description text,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nom text not null,
  saison text,
  accroche text,
  description text,
  image_url text,
  publiee boolean not null default true,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nom text not null,
  reference text not null unique,
  description text,
  matiere text,
  entretien text,
  delai text,
  confection text,
  prix numeric(12,2) not null check (prix >= 0),
  category_id uuid references categories(id) on delete set null,
  collection_id uuid references collections(id) on delete set null,
  disponibilite text not null default 'En stock'
    check (disponibilite in ('En stock', 'Sur commande', 'Édition limitée', 'Épuisé')),
  sur_mesure_disponible boolean not null default false,
  nouveaute boolean not null default false,
  populaire int not null default 0,
  publie boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text,
  ordre int not null default 0
);

create table sizes (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  ordre int not null default 0
);

create table colors (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  hex text
);

-- Une variante = une combinaison achetable (taille + couleur) avec son propre stock
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size_id uuid references sizes(id) on delete set null,
  color_id uuid references colors(id) on delete set null,
  sku text not null unique,
  stock int not null default 0 check (stock >= 0),
  prix_override numeric(12,2),
  created_at timestamptz not null default now(),
  unique (product_id, size_id, color_id)
);

-- ==========================================================
-- 3. WISHLIST / PANIER
-- ==========================================================
create table wishlists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, product_id)
);

create table carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  session_id text, -- panier invité avant connexion
  devise text not null default 'XOF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete restrict,
  mode text not null default 'pret-a-porter' check (mode in ('pret-a-porter', 'sur-mesure')),
  quantite int not null check (quantite > 0),
  created_at timestamptz not null default now()
);

-- ==========================================================
-- 4. COMMANDES
-- ==========================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique, -- ex: MK-2026-0001
  profile_id uuid references profiles(id) on delete set null,
  statut text not null default 'nouvelle' check (statut in (
    'nouvelle', 'confirmee', 'en_preparation', 'prete',
    'expediee', 'livree', 'terminee', 'annulee'
  )),
  sous_total numeric(12,2) not null default 0,
  frais_livraison numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  devise text not null default 'XOF',
  adresse_livraison jsonb not null,
  contact_email text not null,
  contact_phone text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  nom_produit text not null, -- copie figée au moment de la commande
  taille text,
  couleur text,
  mode text not null default 'pret-a-porter',
  quantite int not null check (quantite > 0),
  prix_unitaire numeric(12,2) not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null, -- ex: 'wave', 'orange_money', 'stripe'
  provider_reference text,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'valide', 'echoue', 'rembourse')),
  montant numeric(12,2) not null,
  devise text not null default 'XOF',
  payload jsonb,
  created_at timestamptz not null default now()
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  transporteur text,
  numero_suivi text,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'expediee', 'livree', 'echouee')),
  date_expedition timestamptz,
  date_livraison timestamptz
);

-- ==========================================================
-- 5. SUR-MESURE
-- ==========================================================
create table custom_requests (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique, -- SM-2026-XXXX
  profile_id uuid references profiles(id) on delete set null,
  nom text not null,
  telephone text not null,
  email text not null,
  type_vetement text not null,
  occasion text,
  couleurs text,
  tissu text,
  description text,
  budget_indicatif text,
  date_souhaitee date,
  inspirations text,
  mesures jsonb,
  statut text not null default 'nouvelle' check (statut in (
    'nouvelle', 'en_etude', 'devis_envoye', 'acceptee', 'en_confection', 'prete', 'livree', 'annulee'
  )),
  notes_internes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table custom_request_images (
  id uuid primary key default gen_random_uuid(),
  custom_request_id uuid not null references custom_requests(id) on delete cascade,
  url text not null,
  ordre int not null default 0
);

create table measurements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  nom text not null default 'Mes mesures',
  poitrine numeric(6,2),
  taille numeric(6,2),
  hanches numeric(6,2),
  epaules numeric(6,2),
  longueur_manche numeric(6,2),
  longueur_robe numeric(6,2),
  autres jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================================
-- 6. CONTENU (blog, services, FAQ, médias, réglages)
-- ==========================================================
create table blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nom text not null
);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titre text not null,
  extrait text,
  contenu text,
  image_url text,
  category_id uuid references blog_categories(id) on delete set null,
  statut text not null default 'brouillon' check (statut in ('brouillon', 'publie')),
  publie_le timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nom text not null,
  description text,
  image_url text,
  ordre int not null default 0,
  actif boolean not null default true
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  reponse text not null,
  categorie text,
  ordre int not null default 0,
  publie boolean not null default true
);

create table media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  nom text,
  alt text,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  titre text not null,
  message text,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);

-- Réglages globaux administrables (coordonnées, réseaux sociaux, newsletter provider, etc.)
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ==========================================================
-- 7. FONCTIONS UTILITAIRES
-- ==========================================================
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ==========================================================
-- 8. ROW LEVEL SECURITY
-- ==========================================================
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table collections enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table sizes enable row level security;
alter table colors enable row level security;
alter table product_variants enable row level security;
alter table wishlists enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table deliveries enable row level security;
alter table custom_requests enable row level security;
alter table custom_request_images enable row level security;
alter table measurements enable row level security;
alter table blog_categories enable row level security;
alter table blog_posts enable row level security;
alter table services enable row level security;
alter table faqs enable row level security;
alter table media enable row level security;
alter table notifications enable row level security;
alter table settings enable row level security;

-- Lecture publique du catalogue et du contenu éditorial publié
create policy "public read categories" on categories for select using (true);
create policy "public read collections" on collections for select using (publiee or is_admin());
create policy "public read products" on products for select using (publie or is_admin());
create policy "public read product_images" on product_images for select using (true);
create policy "public read sizes" on sizes for select using (true);
create policy "public read colors" on colors for select using (true);
create policy "public read product_variants" on product_variants for select using (true);
create policy "public read blog_posts" on blog_posts for select using (statut = 'publie' or is_admin());
create policy "public read blog_categories" on blog_categories for select using (true);
create policy "public read services" on services for select using (actif or is_admin());
create policy "public read faqs" on faqs for select using (publie or is_admin());
create policy "public read settings" on settings for select using (true);

-- Écriture catalogue/contenu réservée à l'admin
create policy "admin write categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin write collections" on collections for all using (is_admin()) with check (is_admin());
create policy "admin write products" on products for all using (is_admin()) with check (is_admin());
create policy "admin write product_images" on product_images for all using (is_admin()) with check (is_admin());
create policy "admin write sizes" on sizes for all using (is_admin()) with check (is_admin());
create policy "admin write colors" on colors for all using (is_admin()) with check (is_admin());
create policy "admin write product_variants" on product_variants for all using (is_admin()) with check (is_admin());
create policy "admin write blog_posts" on blog_posts for all using (is_admin()) with check (is_admin());
create policy "admin write blog_categories" on blog_categories for all using (is_admin()) with check (is_admin());
create policy "admin write services" on services for all using (is_admin()) with check (is_admin());
create policy "admin write faqs" on faqs for all using (is_admin()) with check (is_admin());
create policy "admin write settings" on settings for all using (is_admin()) with check (is_admin());
create policy "admin write media" on media for all using (is_admin()) with check (is_admin());
create policy "public read media" on media for select using (true);

-- Profils : chacun voit/modifie le sien, l'admin voit tout
create policy "own profile select" on profiles for select using (id = auth.uid() or is_admin());
create policy "own profile update" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on profiles for insert with check (id = auth.uid());

-- Adresses : propriétaire uniquement, admin en lecture
create policy "own addresses" on addresses for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid());

-- Wishlist : propriétaire uniquement
create policy "own wishlist" on wishlists for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid());

-- Panier : propriétaire (par profil ou session invité gérée côté server function)
create policy "own cart" on carts for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or profile_id is null);
create policy "own cart items" on cart_items for all using (
  exists (select 1 from carts c where c.id = cart_id and (c.profile_id = auth.uid() or is_admin()))
);

-- Commandes : la cliente voit les siennes, l'admin voit/modifie tout ;
-- la création est faite via server function (service role), jamais directement par le client.
create policy "own orders select" on orders for select using (profile_id = auth.uid() or is_admin());
create policy "admin orders write" on orders for update using (is_admin()) with check (is_admin());
create policy "own order_items select" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.profile_id = auth.uid() or is_admin()))
);
create policy "admin payments" on payments for all using (is_admin()) with check (is_admin());
create policy "own payments select" on payments for select using (
  exists (select 1 from orders o where o.id = order_id and o.profile_id = auth.uid())
);
create policy "own deliveries select" on deliveries for select using (
  exists (select 1 from orders o where o.id = order_id and (o.profile_id = auth.uid() or is_admin()))
);
create policy "admin deliveries write" on deliveries for all using (is_admin()) with check (is_admin());

-- Sur-mesure : la cliente voit ses demandes, l'admin voit/gère tout
create policy "own custom_requests select" on custom_requests for select using (profile_id = auth.uid() or is_admin());
create policy "own custom_requests insert" on custom_requests for insert with check (profile_id = auth.uid() or profile_id is null);
create policy "admin custom_requests write" on custom_requests for update using (is_admin()) with check (is_admin());
create policy "own custom_request_images" on custom_request_images for all using (
  exists (select 1 from custom_requests r where r.id = custom_request_id and (r.profile_id = auth.uid() or is_admin()))
);

-- Mesures : propriétaire uniquement
create policy "own measurements" on measurements for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid());

-- Notifications : propriétaire uniquement
create policy "own notifications" on notifications for select using (profile_id = auth.uid() or is_admin());
create policy "admin notifications write" on notifications for all using (is_admin()) with check (is_admin());

-- ==========================================================
-- 9. INDEX DE PERFORMANCE
-- ==========================================================
create index idx_products_category on products(category_id);
create index idx_products_collection on products(collection_id);
create index idx_products_disponibilite on products(disponibilite);
create index idx_variants_product on product_variants(product_id);
create index idx_orders_profile on orders(profile_id);
create index idx_orders_statut on orders(statut);
create index idx_custom_requests_statut on custom_requests(statut);
create index idx_blog_posts_statut on blog_posts(statut);
create index idx_cart_items_cart on cart_items(cart_id);
