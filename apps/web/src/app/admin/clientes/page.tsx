"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";

type Cliente = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
  _count: { orders: number; customRequests: number };
};

export default function ListeClientes() {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/admin/clientes").then(setClientes).catch((e) => setErreur(e.message));
  }, []);

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-3xl">Clientes</h1>

      {erreur ? (
        <p className="mt-8 text-sm text-destructive">{erreur}</p>
      ) : clientes === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Chargement…</p>
      ) : clientes.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Aucune cliente inscrite pour le moment.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="label-xs border-b border-border text-left text-muted-foreground">
                <th className="py-3">Nom</th>
                <th className="py-3">Contact</th>
                <th className="py-3">Commandes</th>
                <th className="py-3">Sur mesure</th>
                <th className="py-3">Inscrite le</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="py-3">{c.fullName ?? "—"}</td>
                  <td className="py-3">
                    <span className="block">{c.email}</span>
                    {c.phone && <span className="text-xs text-muted-foreground">{c.phone}</span>}
                  </td>
                  <td className="py-3">{c._count.orders}</td>
                  <td className="py-3">{c._count.customRequests}</td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
