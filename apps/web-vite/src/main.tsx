import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { AuthProvider } from "@/lib/auth";
import { CurrencyProvider } from "@/lib/currency";
import { ShopStateProvider } from "@/lib/shop-state";
import "@/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CurrencyProvider><ShopStateProvider><AuthProvider><App /></AuthProvider></ShopStateProvider></CurrencyProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
