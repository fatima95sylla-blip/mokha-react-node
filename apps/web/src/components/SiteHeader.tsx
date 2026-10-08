"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { useBoutique } from "@/lib/boutique-store";
import { CURRENCIES, type Currency } from "@/lib/currency";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/boutique", label: "Boutique" },
  { to: "/collections", label: "Collections" },
  { to: "/sur-mesure", label: "Sur mesure" },
  { to: "/services", label: "Services" },
  { to: "/atelier", label: "L'Atelier" },
  { to: "/journal", label: "Journal" },
  { to: "/a-propos", label: "La Maison" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { nbArticles, favoris, setPanierOuvert, devise, setDevise } = useBoutique();
  const { user } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const [compact, setCompact] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOuvert(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (to: string) => pathname === to || pathname?.startsWith(`${to}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur transition-all",
        compact ? "py-1" : "py-3",
      )}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-8">
        <button className="lg:hidden" aria-label="Ouvrir le menu" onClick={() => setOuvert((v) => !v)}>
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 lg:block">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {NAV.slice(0, 4).map((n) => (
              <Link
                key={n.to}
                href={n.to}
                className={cn("label-xs text-foreground/70 transition-colors hover:text-gold", isActive(n.to) && "text-gold")}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex justify-center lg:justify-center">
          <Logo className={cn("transition-all", compact ? "h-10" : "h-14")} />
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <select
            aria-label="Devise"
            value={devise}
            onChange={(e) => setDevise(e.target.value as Currency)}
            className="label-xs hidden bg-transparent text-foreground/70 outline-none sm:block"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
          <Link href="/boutique" aria-label="Rechercher" className="hidden sm:block">
            <Search className="h-4 w-4" />
          </Link>
          <Link href="/favoris" aria-label="Favoris" className="relative">
            <Heart className="h-4 w-4" />
            {favoris.length > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center bg-gold text-[10px] text-ink">
                {favoris.length}
              </span>
            )}
          </Link>
          <Link
            href={user ? "/compte" : "/connexion"}
            aria-label={user ? "Mon compte" : "Se connecter"}
            className="relative hidden sm:block"
          >
            <User className="h-4 w-4" />
            {user && (
              <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-gold" />
            )}
          </Link>
          <button aria-label="Panier" className="relative" onClick={() => setPanierOuvert(true)}>
            <ShoppingBag className="h-4 w-4" />
            {nbArticles > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center bg-gold text-[10px] text-ink">
                {nbArticles}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="mx-auto hidden max-w-[1400px] justify-center gap-8 px-8 pt-2 lg:flex">
        {NAV.slice(4).map((n) => (
          <Link
            key={n.to}
            href={n.to}
            className={cn("label-xs text-foreground/70 transition-colors hover:text-gold", isActive(n.to) && "text-gold")}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      {ouvert && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="label-xs text-muted-foreground">Navigation</span>
            <button aria-label="Fermer" onClick={() => setOuvert(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="px-4 pb-6">
            {NAV.map((n) => (
              <li key={n.to} className="border-t border-border/60">
                <Link href={n.to} className="block py-3 font-display text-2xl">
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-border/60">
              <Link href={user ? "/compte" : "/connexion"} className="block py-3 font-display text-2xl">
                {user ? "Mon compte" : "Se connecter"}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
