"use client";

import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/data/mokha";

export function SiteFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="mt-24 bg-ink text-ivory">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo className="h-20" />
            <p className="label-xs mt-4 text-gold">{BRAND.baseline}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/70">
              Maison de création fondée par {BRAND.fondatrice}, styliste et modéliste diplômée.
              Créations féminines, collections et confection sur mesure.
            </p>
          </div>

          <nav>
            <p className="label-xs text-gold">Maison</p>
            <ul className="mt-4 space-y-2 text-sm text-ivory/75">
              <li><Link href="/a-propos" className="hover:text-gold">La Maison</Link></li>
              <li><Link href="/atelier" className="hover:text-gold">L'Atelier</Link></li>
              <li><Link href="/journal" className="hover:text-gold">Journal</Link></li>
              <li><Link href="/services" className="hover:text-gold">Services</Link></li>
              <li><Link href="/admin" className="hover:text-gold">Espace administration</Link></li>
            </ul>
          </nav>

          <nav>
            <p className="label-xs text-gold">Boutique</p>
            <ul className="mt-4 space-y-2 text-sm text-ivory/75">
              <li><Link href="/boutique" className="hover:text-gold">Toutes les créations</Link></li>
              <li><Link href="/collections" className="hover:text-gold">Collections</Link></li>
              <li><Link href="/sur-mesure" className="hover:text-gold">Sur mesure</Link></li>
              <li><Link href="/sur-mesure/suivi" className="hover:text-gold">Suivre ma demande</Link></li>
              <li><Link href="/favoris" className="hover:text-gold">Mes favoris</Link></li>
              <li><Link href="/commande/suivi" className="hover:text-gold">Suivre ma commande</Link></li>
              <li><Link href="/faq" className="hover:text-gold">FAQ</Link></li>
            </ul>
          </nav>

          <div>
            <p className="label-xs text-gold">Rejoindre l'univers MOKHA</p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.includes("@")) {
                  toast.error("Merci d'indiquer une adresse e-mail valide.");
                  return;
                }
                toast.success("Bienvenue. Vous recevrez nos prochaines nouveautés.");
                setEmail("");
              }}
            >
              <Input
                type="email"
                value={email}
                maxLength={120}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre e-mail"
                className="rounded-none border-ivory/30 bg-transparent text-ivory placeholder:text-ivory/40"
              />
              <Button type="submit" className="rounded-none bg-gold text-ink hover:bg-gold-soft">
                Rejoindre
              </Button>
            </form>
            <ul className="mt-6 space-y-2 text-sm text-ivory/75">
              {BRAND.adresse && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {BRAND.adresse}
                </li>
              )}
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                {BRAND.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                {BRAND.email}
              </li>
              {BRAND.instagram && (
                <li className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 shrink-0 text-gold" />
                  <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-ivory/15 pt-6 text-xs text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MOKHA — Maison de Création. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/mentions-legales" className="hover:text-gold">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-gold">Confidentialité</Link>
            <Link href="/conditions" className="hover:text-gold">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
