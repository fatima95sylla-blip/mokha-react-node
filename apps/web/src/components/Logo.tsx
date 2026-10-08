"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// IMPORTANT : le fichier binaire du logo n'a pas pu être récupéré depuis le
// projet Lovable (seul un pointeur vers leur CDN interne existait,
// `mokha-logo.png.asset.json`). Déposez le vrai PNG dans
// `apps/web/public/mokha-logo.png` pour qu'il s'affiche ; en attendant, un
// repli typographique fidèle à l'identité (Cormorant Garamond + or) s'affiche.
const LOGO_PATH = "/mokha-logo.png";

export function Logo({ className, invert = false }: { className?: string; invert?: boolean }) {
  return (
    <Link href="/" aria-label="MOKHA — Maison de Création" className="inline-flex items-center">
      <span className={cn("relative inline-flex h-14 w-auto items-center", className)}>
        <Image
          src={LOGO_PATH}
          alt="MOKHA — Maison de Création"
          width={220}
          height={150}
          className={cn("h-full w-auto object-contain", invert && "brightness-0 invert-0")}
          onError={(e) => {
            // Repli si /public/mokha-logo.png n'a pas encore été fourni.
            (e.currentTarget as HTMLImageElement).style.display = "none";
            e.currentTarget.parentElement
              ?.querySelector("[data-fallback]")
              ?.classList.remove("hidden");
          }}
        />
        <span
          data-fallback
          className="hidden font-display text-2xl tracking-wide text-foreground"
        >
          MOKHA
        </span>
      </span>
    </Link>
  );
}
