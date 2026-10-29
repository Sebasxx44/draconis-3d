import { ArrowUpRight, Flame } from "lucide-react";
import { WhatsAppButtonTA } from "@/components/ui/WhatsAppButtonTA";

export const ContactTA = () => (
  <section id="contacto" className="contact-section">
    <span className="contact-emblem">
      <Flame size={30} strokeWidth={1} />
    </span>
    <p className="eyebrow">
      LAS GRANDES COLECCIONES EMPIEZAN CON UNA CONVERSACIÓN
    </p>
    <h2>
      Tu próximo dragón
      <br />
      <em>te espera.</em>
    </h2>
    <p>
      ¿Tienes uno en mente? Escríbenos y descubre las opciones
      <br className="desktop-break" /> de impresión, tamaño y acabado.
    </p>
    <WhatsAppButtonTA>
      Hablar por WhatsApp
      <ArrowUpRight size={17} />
    </WhatsAppButtonTA>
    <span className="contact-note">
      Sin intermediarios. Hablemos de tu próxima pieza.
    </span>
  </section>
);
