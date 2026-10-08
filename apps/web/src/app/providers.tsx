"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { BoutiqueProvider } from "@/lib/boutique-store";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BoutiqueProvider>
          {children}
          <Toaster position="top-center" />
        </BoutiqueProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
