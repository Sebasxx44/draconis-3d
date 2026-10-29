import { Box, Paintbrush, PackageCheck, ScanLine } from "lucide-react";
import { ActionHeaderTA } from "@/components/ui/ActionHeaderTA";

const stages = [
  {
    title: "Todo empieza con una forma.",
    label: "Preparación del modelo",
    text: "Definimos la pose, la escala y los detalles de la pieza que quieres crear.",
    icon: ScanLine,
  },
  {
    title: "Capa a capa, cobra vida.",
    label: "Impresión 3D",
    text: "El modelo digital se convierte en una figura física, cuidando cada volumen.",
    icon: Box,
  },
  {
    title: "El detalle hace la magia.",
    label: "Acabados y pintura",
    text: "Limpieza, preparación y el acabado acordado para darle su carácter final.",
    icon: Paintbrush,
  },
  {
    title: "Una leyenda en tus manos.",
    label: "Entrega",
    text: "Coordinamos contigo la entrega y las recomendaciones para cuidar tu figura.",
    icon: PackageCheck,
  },
] as const;

export const PrintingProcessTA = () => (
  <section id="proceso" className="process-section">
    <div className="section-shell">
      <ActionHeaderTA
        eyebrow="DEL ARCHIVO A LA COLECCIÓN"
        title={
          <>
            De la fantasía <em>a tus manos.</em>
          </>
        }
        description="Un proceso pensado para transformar una idea en algo que puedes sostener."
      />
      <div className="process-grid">
        {stages.map(({ title, label, text, icon: Icon }, index) => (
          <article key={label}>
            <div className="process-icon">
              <Icon size={36} strokeWidth={1} />
              <span>0{index + 1}</span>
            </div>
            <p className="eyebrow">{label}</p>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <p className="process-note">
        Así planteamos cada proyecto. Materiales, tiempos y alcance se acuerdan
        directamente por WhatsApp.
      </p>
    </div>
  </section>
);
