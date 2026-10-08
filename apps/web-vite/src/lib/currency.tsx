import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const countries = [
  { code: "GN", label: "Guinée", currency: "GNF" },
  { code: "CI", label: "Côte d'Ivoire", currency: "XOF" },
  { code: "SN", label: "Sénégal", currency: "XOF" },
  { code: "ML", label: "Mali", currency: "XOF" },
  { code: "BF", label: "Burkina Faso", currency: "XOF" },
  { code: "BJ", label: "Bénin", currency: "XOF" },
  { code: "TG", label: "Togo", currency: "XOF" },
  { code: "NE", label: "Niger", currency: "XOF" },
  { code: "GW", label: "Guinée-Bissau", currency: "XOF" },
  { code: "FR", label: "France", currency: "EUR" },
  { code: "US", label: "États-Unis", currency: "USD" },
  { code: "GB", label: "Royaume-Uni", currency: "GBP" },
] as const;

type CountryCode = (typeof countries)[number]["code"];
type CurrencyCode = (typeof countries)[number]["currency"];
type CurrencyContextValue = {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
  currency: CurrencyCode;
  formatPrice: (priceInXof: number) => string;
  ratesAvailable: boolean;
  ratesUpdatedAt: string | null;
};

const STORAGE_KEY = "mokha-country-v1";
const CACHE_KEY = "mokha-rates-xof-v1";
const CurrencyContext = createContext<CurrencyContextValue | null>(null);
type Rates = Partial<Record<CurrencyCode, number>>;
type CachedRates = { rates: Rates; updatedAt: string };

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>("GN");
  const [rates, setRates] = useState<Rates>({ XOF: 1 });
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<string | null>(null);
  const currency = countries.find((item) => item.code === country)?.currency ?? "GNF";

  useEffect(() => {
    const savedCountry = localStorage.getItem(STORAGE_KEY) as CountryCode | null;
    if (countries.some((item) => item.code === savedCountry)) setCountryState(savedCountry!);

    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null") as CachedRates | null;
      if (cached?.rates && cached.updatedAt && Date.now() - Date.parse(cached.updatedAt) < 24 * 60 * 60 * 1000) {
        setRates({ XOF: 1, ...cached.rates });
        setRatesUpdatedAt(cached.updatedAt);
      }
    } catch {
      localStorage.removeItem(CACHE_KEY);
    }

    const controller = new AbortController();
    fetch("https://open.er-api.com/v6/latest/XOF", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Taux indisponibles");
        return response.json() as Promise<{ result?: string; time_last_update_utc?: string; rates?: Record<string, number> }>;
      })
      .then((payload) => {
        if (payload.result !== "success" || !payload.rates) throw new Error("Taux indisponibles");
        const currencyCodes = [...new Set(countries.map(({ currency: code }) => code))];
        const nextRates = Object.fromEntries(currencyCodes.map((code) => [code, payload.rates?.[code]])) as Rates;
        nextRates.XOF = 1;
        if (Object.values(nextRates).some((rate) => typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0)) {
          throw new Error("Taux incomplets");
        }
        const updatedAt = payload.time_last_update_utc ? new Date(payload.time_last_update_utc).toISOString() : new Date().toISOString();
        setRates(nextRates);
        setRatesUpdatedAt(updatedAt);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: nextRates, updatedAt } satisfies CachedRates));
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  function setCountry(nextCountry: CountryCode) {
    setCountryState(nextCountry);
    localStorage.setItem(STORAGE_KEY, nextCountry);
  }

  function formatPrice(priceInXof: number) {
    const effectiveCurrency = rates[currency] ? currency : "XOF";
    const convertedPrice = priceInXof * (rates[effectiveCurrency] ?? 1);
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: effectiveCurrency, maximumFractionDigits: 0 }).format(convertedPrice);
  }

  return <CurrencyContext.Provider value={{ country, setCountry, currency, formatPrice, ratesAvailable: Boolean(rates[currency]), ratesUpdatedAt }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("useCurrency doit être utilisé dans CurrencyProvider");
  return value;
}