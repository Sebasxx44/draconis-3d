import { dragonVisualReferences } from "@/data/dragon-visual-references";

// ─── Reference sheet, separate from product availability ────────────────────────
export const DragonReferenceTA = ({ id }: { id: string }) => {
  const reference = dragonVisualReferences[id];
  if (!reference) return null;
  const fields = [
    ["Cráneo", reference.skull],
    ["Cuernos", reference.horns],
    ["Cuello", reference.neck],
    ["Alas", reference.wings],
    ["Volumen", reference.body],
    ["Superficie", reference.texture],
  ];
  return (
    <details className="catalog-reference-summary">
      <summary>Ficha visual y procedencia · {reference.label}</summary>
      <div
        className="reference-palette"
        aria-label="Paleta de la interpretación"
      >
        {reference.palette.map((color) => (
          <span key={color} style={{ backgroundColor: color }} title={color} />
        ))}
      </div>
      <p className="reference-provenance">{reference.distinctive}</p>
      <dl>
        {fields.map(([title, text]) => (
          <div key={title}>
            <dt>{title}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
      <p className="reference-provenance">
        {reference.provenance} {reference.limitations}
      </p>
      <ul className="reference-sources">
        {reference.sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.title} ↗
            </a>
          </li>
        ))}
      </ul>
      <p className="reference-provenance">{reference.rights}</p>
    </details>
  );
};
