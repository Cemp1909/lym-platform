import { MessageCircle } from "lucide-react";
import { whatsappMessages, whatsappUrl } from "./whatsapp";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappUrl(whatsappMessages.general)}
      target="_blank"
      rel="noreferrer"
      className="no-print fixed bottom-4 right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-[#0A3D5C] px-4 text-sm font-bold text-white shadow-xl shadow-[#031B2A]/25"
      aria-label="Atención por WhatsApp"
    >
      <MessageCircle className="size-5" />
      WhatsApp
    </a>
  );
}
