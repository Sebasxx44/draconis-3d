"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { BrandTA } from "@/components/ui/BrandTA";
import { WhatsAppButtonTA } from "@/components/ui/WhatsAppButtonTA";

// ─── Constants ────────────────────────────────────────────────────────────────
const navigation = [
  ["Inicio", "#inicio"],
  ["Dragones", "#dragones"],
  ["Personalización", "#personalizacion"],
  ["Nuestro proceso", "#proceso"],
  ["Galería", "#galeria"],
  ["Contacto", "#contacto"],
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export const HeaderTA = () => (
  <header className="site-header">
    <div className="header-inner">
      <BrandTA />
      <nav className="desktop-navigation" aria-label="Navegación principal">
        {navigation.map(([title, href]) => (
          <a key={href} href={href}>
            {title}
          </a>
        ))}
      </nav>
      <WhatsAppButtonTA className="header-contact" variant="outline">
        Cotizar por WhatsApp
      </WhatsAppButtonTA>
      <Dialog.Root>
        <Dialog.Trigger className="mobile-menu-trigger" aria-label="Abrir menú">
          <Menu size={23} />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="mobile-overlay" />
          <Dialog.Content
            className="mobile-navigation"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">
              Navegación principal
            </Dialog.Title>
            <div className="mobile-menu-heading">
              <BrandTA />
              <Dialog.Close aria-label="Cerrar menú" className="icon-button">
                <X size={22} />
              </Dialog.Close>
            </div>
            <nav aria-label="Navegación móvil">
              {navigation.map(([title, href]) => (
                <Dialog.Close asChild key={href}>
                  <a href={href}>
                    {title}
                    <ArrowUpRight size={19} />
                  </a>
                </Dialog.Close>
              ))}
            </nav>
            <WhatsAppButtonTA />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  </header>
);
