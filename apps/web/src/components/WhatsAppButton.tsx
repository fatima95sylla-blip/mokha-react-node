import { MessageCircle } from "lucide-react";
import { BRAND } from "@/data/mokha";

export function WhatsAppButton() {
  const message = encodeURIComponent(
    "Bonjour MOKHA, je souhaite des informations sur vos créations.",
  );
  return (
    <a
      href={`https://wa.me/${BRAND.whatsapp}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Écrire à la conciergerie MOKHA sur WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 border border-gold/50 bg-ink px-4 py-3 text-ivory shadow-none transition-colors hover:bg-gold hover:text-ink"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="label-xs hidden sm:inline">Conciergerie</span>
    </a>
  );
}
