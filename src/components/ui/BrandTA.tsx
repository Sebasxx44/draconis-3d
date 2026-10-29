import { Flame } from "lucide-react";

export const BrandTA = ({ footer = false }: { footer?: boolean }) => (
  <a
    className={`brand ${footer ? "brand-footer" : ""}`}
    href="#inicio"
    aria-label="DRACONIS · Ir al inicio"
  >
    <span className="brand-symbol" aria-hidden="true">
      <Flame size={27} strokeWidth={1.2} />
    </span>
    <span className="brand-type">
      DRACONIS<span>3D COLLECTIBLES</span>
    </span>
  </a>
);
