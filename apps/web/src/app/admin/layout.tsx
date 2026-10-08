"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Scissors, Store, Users, ExternalLink, LogOut, Newspaper, HelpCircle, Wrench } from "lucide-react";
import { RouteProtegee } from "@/components/RouteProtegee";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/commandes", label: "Commandes", icon: Package },
  { href: "/admin/sur-mesure", label: "Sur mesure", icon: Scissors },
  { href: "/admin/produits", label: "Produits", icon: Store },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/blog", label: "Journal", icon: Newspaper },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
] as const;

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profil, deconnexion } = useAuth();

  return (
    <div className="flex min-h-screen bg-secondary/20">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="border-b border-border px-6 py-6">
          <p className="font-display text-2xl">MOKHA</p>
          <p className="label-xs text-gold">Administration</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV.map((item) => {
            const actif = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  actif ? "bg-foreground text-background" : "text-foreground/70 hover:bg-secondary",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <p className="truncate text-xs text-muted-foreground">{profil?.email}</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/" className="label-xs flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-3 w-3" /> Voir le site
            </Link>
            <button
              onClick={() => deconnexion()}
              className="label-xs flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3 w-3" /> Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Navigation mobile simplifiée */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-background py-2 md:hidden">
        {NAV.map((item) => {
          const actif = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex flex-col items-center gap-1 px-2 text-[10px]", actif ? "text-gold" : "text-muted-foreground")}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtegee adminRequis>
      <AdminShell>{children}</AdminShell>
    </RouteProtegee>
  );
}
