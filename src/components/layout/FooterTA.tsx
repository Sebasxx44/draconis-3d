import { Instagram, ArrowUpRight } from "lucide-react";
import { BrandTA } from "@/components/ui/BrandTA";
import { WhatsAppButtonTA } from "@/components/ui/WhatsAppButtonTA";
import { siteConfig } from "@/config/site";

export const FooterTA = () => (
  <footer className="site-footer">
    <div className="footer-top">
      <div>
        <BrandTA footer />
        <p>
          La fantasía merece un lugar
          <br />
          en tu colección.
        </p>
      </div>
      <nav aria-label="Enlaces del pie">
        <span>EXPLORA</span>
        <a href="#dragones">
          La colección
          <ArrowUpRight size={13} />
        </a>
        <a href="#personalizacion">
          Personalización
          <ArrowUpRight size={13} />
        </a>
        <a href="#proceso">
          Nuestro proceso
          <ArrowUpRight size={13} />
        </a>
      </nav>
      <div className="footer-contact">
        <span>HABLEMOS DE DRAGONES</span>
        <WhatsAppButtonTA variant="text">
          Escríbenos por WhatsApp
        </WhatsAppButtonTA>
        {/^https:\/\/(www\.)?instagram\.com\//.test(
          siteConfig.instagramUrl,
        ) && (
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={15} />
            Instagram
          </a>
        )}
      </div>
    </div>
    <div className="footer-bottom">
      <span>
        © {new Date().getFullYear()} DRACONIS. Hecho para coleccionar.
      </span>
      <p>
        Proyecto independiente, sin afiliación con HBO ni George R. R. Martin.
        Los nombres y universos pertenecen a sus titulares. Renders
        conceptuales; no representan productos oficiales ni fotografías de
        piezas fabricadas.
      </p>
    </div>
  </footer>
);
