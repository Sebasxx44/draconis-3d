import { ArrowUpRight } from "lucide-react";
import { DragonSlotTA } from "@/components/experience/DragonSlotTA";
import { WhatsAppButtonTA } from "@/components/ui/WhatsAppButtonTA";

export const FeaturedDragonTA = () => (
  <section
    className="featured-section"
    id="caraxes"
    aria-labelledby="caraxes-title"
  >
    <div className="featured-visual">
      <span className="eyebrow">EL ESTUDIO 3D / 001</span>
      <DragonSlotTA stage="study" />
      <p className="concept-caption">
        Un mismo vuelo, desde todos los ángulos.
      </p>
    </div>
    <div className="featured-copy">
      <p className="eyebrow">UNA LEYENDA, DESDE TODOS LOS ÁNGULOS</p>
      <h2 id="caraxes-title">
        Conoce al
        <br />
        <em>Gusano de Sangre.</em>
      </h2>
      <p>
        Inconfundible. Indomable. Caraxes es el dragón de Daemon Targaryen: una
        silueta serpentina, un cuello extraordinario y el rojo que anuncia su
        llegada.
      </p>
      <p>
        Explora nuestra interpretación original en tres dimensiones. Acércate a
        los detalles y descubre el carácter detrás de la leyenda.
      </p>
      <div className="featured-traits">
        <div>
          <span>CARÁCTER</span>
          <p>Feroz y singular</p>
        </div>
        <div>
          <span>INSPIRACIÓN</span>
          <p>Fuego y sangre</p>
        </div>
      </div>
      <WhatsAppButtonTA message="Hola, estoy interesado en una figura 3D de Caraxes. ¿Me puedes compartir tamaños, acabados y precios?">
        Quiero mi Caraxes
        <ArrowUpRight size={16} />
      </WhatsAppButtonTA>
      <span className="featured-footnote">
        El modelo 3D es una interpretación original, reemplazable por una pieza
        autorizada.
      </span>
    </div>
  </section>
);
