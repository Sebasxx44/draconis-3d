import Image from "next/image";
import { Expand, Paintbrush, Gem, Layers3, ArrowUpRight } from "lucide-react";
import { ActionHeaderTA } from "@/components/ui/ActionHeaderTA";
import { WhatsAppButtonTA } from "@/components/ui/WhatsAppButtonTA";

const options = [
  {
    icon: Expand,
    title: "El tamaño ideal",
    description:
      "Una pieza discreta o el centro de tu colección. Hablemos del espacio que tienes en mente.",
  },
  {
    icon: Paintbrush,
    title: "Tu paleta, tu historia",
    description:
      "Sin pintar para darle tu toque, o con una propuesta de pintura detallada.",
  },
  {
    icon: Gem,
    title: "Acabados con carácter",
    description:
      "Explora texturas, tonos y efectos premium que realcen cada escama.",
  },
  {
    icon: Layers3,
    title: "Una base a su altura",
    description:
      "Consulta opciones de bases personalizadas para completar la escena.",
  },
] as const;

export const CustomizationTA = () => (
  <section id="personalizacion" className="customization-section section-shell">
    <ActionHeaderTA
      eyebrow="NO HAY DOS COLECCIONES IGUALES"
      title={
        <>
          Tu dragón. <em>Tu estilo.</em>
        </>
      }
      description="Imagina la pieza. Juntos encontramos la forma de hacerla tuya."
    />
    <div className="customization-content">
      <div className="customization-image">
        <Image
          src="/images/syrax-v2.png"
          alt="Estudio conceptual de acabado dorado para una figura de dragón; no es una pieza fabricada."
          fill
          sizes="(max-width: 800px) 90vw, 45vw"
        />
        <span>ESTUDIO DE ACABADO · ORO ANTIGUO</span>
      </div>
      <div className="customization-options">
        {options.map(({ icon: Icon, title, description }, index) => (
          <article key={title}>
            <span className="customization-option-icon">
              <Icon size={21} strokeWidth={1.3} />
            </span>
            <div>
              <span className="option-index">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </article>
        ))}
        <WhatsAppButtonTA
          variant="text"
          message="Hola, quiero cotizar una figura de dragón 3D personalizada."
        >
          Solicitar personalización
          <ArrowUpRight size={16} />
        </WhatsAppButtonTA>
        <p className="availability-note">
          Las opciones y la viabilidad se confirman al cotizar.
        </p>
      </div>
    </div>
  </section>
);
