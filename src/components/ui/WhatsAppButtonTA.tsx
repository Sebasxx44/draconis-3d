import { ArrowUpRight, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { ButtonTA } from "@/components/ui/ButtonTA";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WhatsAppButtonProps {
  message?: string;
  children?: ReactNode;
  variant?: "primary" | "outline" | "text";
  className?: string;
  icon?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const WhatsAppButtonTA = ({
  message = "Hola, quiero conocer las figuras 3D de DRACONIS. ¿Me compartes las opciones de tamaños y acabados?",
  children = "Cotizar por WhatsApp",
  variant = "primary",
  className,
  icon = true,
}: WhatsAppButtonProps) => {
  const href = createWhatsAppLink(siteConfig.whatsappNumber, message);
  if (!href)
    return (
      <ButtonTA
        variant={variant}
        className={className}
        disabled
        title="El contacto por WhatsApp todavía no está configurado"
      >
        Contacto pendiente
      </ButtonTA>
    );
  return (
    <ButtonTA asChild variant={variant} className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {icon && <MessageCircle size={16} aria-hidden="true" />}
        {children}
        {variant === "text" && <ArrowUpRight size={14} aria-hidden="true" />}
      </a>
    </ButtonTA>
  );
};
