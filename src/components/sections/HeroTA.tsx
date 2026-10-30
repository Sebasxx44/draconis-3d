import { ArrowDown, ArrowUpRight, Box, Gem, WandSparkles } from "lucide-react";
import { DragonSlotTA } from "@/components/experience/DragonSlotTA";
import { ButtonTA } from "@/components/ui/ButtonTA";
import { WhatsAppButtonTA } from "@/components/ui/WhatsAppButtonTA";

export const HeroTA = () => (
  <section id="inicio" className="hero-section" aria-labelledby="hero-title">
    <div className="hero-watermark" aria-hidden="true">
      DRACONIS
    </div>
    <div className="hero-main">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">
          <span />
          FIGURAS IMPRESAS EN 3D
        </p>
        <h1 id="hero-title">
          Dragones que
          <br />
          cobran <em>vida.</em>
        </h1>
        <p className="hero-description">
          Las criaturas más legendarias de Poniente,
          <br className="desktop-break" /> reinterpretadas en figuras 3D.
          <br className="desktop-break" /> Un universo extraordinario. Una
          colección muy tuya.
        </p>
        <div className="hero-actions">
          <ButtonTA asChild>
            <a href="#dragones">
              Explorar dragones
              <ArrowUpRight size={17} />
            </a>
          </ButtonTA>
          <WhatsAppButtonTA variant="outline">
            Cotizar por WhatsApp
          </WhatsAppButtonTA>
        </div>
        <div className="hero-note">
          <span className="fine-rule" />
          <span>FANTASÍA EN CADA DETALLE.</span>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-orbit" aria-hidden="true" />
        <span className="hero-scene-label">
          <i />
          EXPERIENCIA 3D EN TIEMPO REAL
        </span>
        <DragonSlotTA stage="hero" />
        <div className="hero-dragon-label">
          <span>01 / EL GUSANO DE SANGRE</span>
          <p>
            Caraxes<span>ESTUDIO DE VUELO</span>
          </p>
        </div>
      </div>
    </div>
    <div className="hero-bottom">
      <a href="#dragones" className="scroll-invitation">
        <ArrowDown size={15} /> DESCUBRE LA COLECCIÓN
      </a>
      <div className="hero-qualities">
        <span>
          <Box size={15} />
          Impresión 3D
        </span>
        <span>
          <Gem size={15} />
          Atención al detalle
        </span>
        <span>
          <WandSparkles size={15} />
          Hecho a tu estilo
        </span>
      </div>
    </div>
  </section>
);
