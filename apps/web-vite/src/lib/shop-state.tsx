import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type CartLine = { productId: string; quantity: number; size: string; color: string; confection: "ready" | "custom" };
type ShopStateValue = {
  favoriteIds: string[];
  toggleFavorite: (productId: string) => void;
  cart: CartLine[];
  addToCart: (line: CartLine) => void;
  setCartQuantity: (productId: string, size: string, color: string, confection: "ready" | "custom", quantity: number) => void;
  removeFromCart: (productId: string, size: string, color: string, confection: "ready" | "custom") => void;
};

const FAVORITES_KEY = "mokha-favorites-v1";
const CART_KEY = "mokha-cart-v1";
const PRODUCT_ID_MIGRATIONS: Record<string, string> = { "prd-21": "prd-13", "prd-24": "prd-25" };
const ShopStateContext = createContext<ShopStateValue | null>(null);

export function ShopStateProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]") as unknown;
      const storedCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as unknown;
      if (Array.isArray(storedFavorites)) {
        const migratedFavorites = [...new Set(storedFavorites.filter((id): id is string => typeof id === "string").map((id) => PRODUCT_ID_MIGRATIONS[id] ?? id))];
        setFavoriteIds(migratedFavorites);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(migratedFavorites));
      }
      if (Array.isArray(storedCart)) {
        const migratedCart = (storedCart as CartLine[]).map((line) => ({ ...line, productId: PRODUCT_ID_MIGRATIONS[line.productId] ?? line.productId }));
        const mergedCart = migratedCart.reduce<CartLine[]>((items, line) => {
          const existing = items.find((item) => item.productId === line.productId && item.size === line.size && item.color === line.color && item.confection === line.confection);
          if (existing) existing.quantity += line.quantity;
          else items.push(line);
          return items;
        }, []);
        setCart(mergedCart);
        localStorage.setItem(CART_KEY, JSON.stringify(mergedCart));
      }
    } catch {
      localStorage.removeItem(FAVORITES_KEY);
      localStorage.removeItem(CART_KEY);
    }
  }, []);

  function toggleFavorite(productId: string) {
    setFavoriteIds((current) => {
      const updated = current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function addToCart(line: CartLine) {
    setCart((current) => {
      const found = current.find((item) => item.productId === line.productId && item.size === line.size && item.color === line.color && item.confection === line.confection);
      const updated = found
        ? current.map((item) => item === found ? { ...item, quantity: item.quantity + line.quantity } : item)
        : [...current, line];
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function setCartQuantity(productId: string, size: string, color: string, confection: "ready" | "custom", quantity: number) {
    const boundedQuantity = Math.max(1, Math.min(20, Math.floor(quantity)));
    setCart((current) => {
      const updated = current.map((item) => item.productId === productId && item.size === size && item.color === color && item.confection === confection
        ? { ...item, quantity: boundedQuantity }
        : item);
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function removeFromCart(productId: string, size: string, color: string, confection: "ready" | "custom") {
    setCart((current) => {
      const updated = current.filter((item) => !(item.productId === productId && item.size === size && item.color === color && item.confection === confection));
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  return <ShopStateContext.Provider value={{ favoriteIds, toggleFavorite, cart, addToCart, setCartQuantity, removeFromCart }}>{children}</ShopStateContext.Provider>;
}

export function useShopState() {
  const value = useContext(ShopStateContext);
  if (!value) throw new Error("useShopState doit être utilisé dans ShopStateProvider");
  return value;
}