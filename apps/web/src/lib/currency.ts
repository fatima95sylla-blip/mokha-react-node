export type Currency = "GNF" | "XOF" | "EUR" | "USD";

// Devise de référence de la maison : les prix sont STOCKÉS en base dans cette
// devise, les autres ne sont que des conversions d'affichage.
export const BASE_CURRENCY: Currency = "GNF";

// ⚠️ Taux indicatifs, figés. Pour de la facturation réelle, brancher une source
// de change (API) et mettre ces valeurs en base (table `settings`).
export const CURRENCIES: { code: Currency; label: string; symbol: string; rate: number }[] = [
  { code: "GNF", label: "Franc guinéen", symbol: "GNF", rate: 1 },
  { code: "XOF", label: "Franc CFA", symbol: "FCFA", rate: 1 / 14.8 },
  { code: "EUR", label: "Euro", symbol: "€", rate: 1 / 9700 },
  { code: "USD", label: "Dollar US", symbol: "$", rate: 1 / 8600 },
];

/** Convertit un prix exprimé dans la devise de base et le formate. */
export function formatPrice(amountBase: number, currency: Currency = BASE_CURRENCY) {
  const meta = CURRENCIES.find((c) => c.code === currency) ?? { rate: 1 };
  const value = amountBase * meta.rate;

  if (currency === "GNF") {
    return `${Math.round(value).toLocaleString("fr-FR")} GNF`;
  }
  if (currency === "XOF") {
    return `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
