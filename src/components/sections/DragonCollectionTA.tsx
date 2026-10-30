"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDown, ArrowUpRight, Check, Search, X } from "lucide-react";
import { dragons, dragonOriginLabels, type Dragon } from "@/data/dragons";
import { DragonReferenceTA } from "@/components/ui/DragonReferenceTA";
import { WhatsAppButtonTA } from "@/components/ui/WhatsAppButtonTA";
import "@/components/sections/catalog.css";

// ─── Types ────────────────────────────────────────────────────────────────────
type CollectionFilter = "all" | "screen" | "stories";
interface DragonCardProps {
  dragon: Dragon;
  index: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const filters: readonly { value: CollectionFilter; label: string }[] = [
  { value: "all", label: "Todos los dragones" },
  { value: "screen", label: "En pantalla" },
  { value: "stories", label: "Historia y libros" },
];

// ─── Components ───────────────────────────────────────────────────────────────
const DragonArtworkTA = ({
  dragon,
  large = false,
}: {
  dragon: Dragon;
  large?: boolean;
}) =>
  dragon.image ? (
    <Image
      src={dragon.image}
      alt={`Render conceptual de una figura de ${dragon.name}; no es una fotografía del producto final.`}
      fill
      sizes={
        large
          ? "(max-width: 760px) 94vw, 500px"
          : "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
      }
      className="catalog-artwork-image"
    />
  ) : (
    <div
      className="catalog-artwork-pending"
      style={{ "--dragon-accent": dragon.color } as CSSProperties}
    >
      <div className="catalog-pending-orbit" aria-hidden="true" />
      <span className="catalog-pending-monogram" aria-hidden="true">
        {dragon.name.slice(0, 1)}
      </span>
      <span className="catalog-pending-label">Referencia visual pendiente</span>
    </div>
  );

const DragonCardTA = ({ dragon, index }: DragonCardProps) => (
  <Dialog.Root>
    <article className="catalog-card">
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="catalog-artwork"
          aria-label={`Ver detalles de ${dragon.name}`}
        >
          <DragonArtworkTA dragon={dragon} />
          <span className="catalog-card-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="catalog-image-label">
            {dragon.image ? "Render conceptual" : "Concepto de colección"}
          </span>
          <span className="catalog-artwork-open" aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
        </button>
      </Dialog.Trigger>
      <div className="catalog-card-copy">
        <div className="catalog-card-heading">
          <h3>{dragon.name}</h3>
          <span
            className="catalog-color"
            style={{ backgroundColor: dragon.color }}
            aria-hidden="true"
          />
        </div>
        <p className="catalog-epithet">{dragon.epithet}</p>
        <p className="catalog-description">{dragon.description}</p>
        <div className="catalog-card-bottom">
          <WhatsAppButtonTA
            variant="text"
            message={dragon.whatsappMessage}
            className="catalog-inquiry"
          >
            Consultar por WhatsApp
          </WhatsAppButtonTA>
          <Dialog.Trigger asChild>
            <button
              className="catalog-details-link"
              type="button"
              aria-label={`Detalles de ${dragon.name}`}
            >
              <ArrowUpRight size={18} />
            </button>
          </Dialog.Trigger>
        </div>
      </div>
    </article>
    <Dialog.Portal>
      <Dialog.Overlay className="catalog-dialog-overlay" />
      <Dialog.Content
        className="catalog-dialog-content"
        aria-describedby={`dragon-description-${dragon.id}`}
      >
        <Dialog.Close
          className="catalog-dialog-close"
          aria-label="Cerrar detalles"
        >
          <X size={21} />
        </Dialog.Close>
        <div className="catalog-dialog-image">
          <DragonArtworkTA dragon={dragon} large />
        </div>
        <div className="catalog-dialog-copy">
          <span className="catalog-eyebrow">
            {dragonOriginLabels[dragon.origin]}
          </span>
          <Dialog.Title className="catalog-dialog-title">
            {dragon.name}
          </Dialog.Title>
          <p className="catalog-dialog-epithet">{dragon.epithet}</p>
          <Dialog.Description
            id={`dragon-description-${dragon.id}`}
            className="catalog-dialog-description"
          >
            {dragon.story}
          </Dialog.Description>
          <div className="catalog-dialog-finish">
            <span>Dirección de acabado</span>
            <p>{dragon.finish}</p>
          </div>
          <ul className="catalog-dialog-features">
            <li>
              <Check size={15} />
              Tamaño y acabado por acordar
            </li>
            <li>
              <Check size={15} />
              Consulta opciones de base y pintura
            </li>
          </ul>
          <WhatsAppButtonTA message={dragon.whatsappMessage}>
            Consultar este dragón
          </WhatsAppButtonTA>
          <DragonReferenceTA id={dragon.id} />
          <p className="catalog-dialog-note">
            {dragon.image
              ? "Imagen conceptual generada con IA. La figura final y sus características se acuerdan al cotizar."
              : "Referencia visual pendiente. Consulta las posibilidades de interpretación y fabricación."}
          </p>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export const DragonCollectionTA = () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  // ─── Computed ───────────────────────────────────────────────────────────────
  const filteredDragons = useMemo(() => {
    const search = query
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return dragons.filter((dragon) => {
      const categoryMatches =
        filter === "all" ||
        (filter === "screen"
          ? dragon.origin === "screen"
          : dragon.origin !== "screen");
      const searchable = `${dragon.name} ${dragon.epithet}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return categoryMatches && searchable.includes(search);
    });
  }, [filter, query]);
  const visibleDragons =
    expanded || query || filter !== "all"
      ? filteredDragons
      : filteredDragons.slice(0, 6);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      id="dragones"
      className="catalog-section"
      aria-labelledby="catalog-title"
    >
      <div className="catalog-section-intro">
        <div>
          <p className="catalog-eyebrow">ELIGE TU LEYENDA</p>
          <h2 id="catalog-title">
            Los dragones <em>legendarios.</em>
          </h2>
          <p className="catalog-intro-description">
            Descubre nuestra colección de figuras impresas en 3D.
          </p>
        </div>
        <span className="catalog-collection-mark">
          LA COLECCIÓN <span>01—23</span>
        </span>
      </div>
      <div className="catalog-toolbar">
        <div
          className="catalog-filter-list"
          role="group"
          aria-label="Filtrar colección"
        >
          {filters.map((item) => (
            <button
              type="button"
              className={
                filter === item.value
                  ? "catalog-filter is-active"
                  : "catalog-filter"
              }
              key={item.value}
              onClick={() => {
                setFilter(item.value);
                setExpanded(false);
              }}
              aria-pressed={filter === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="catalog-search">
          <Search size={17} aria-hidden="true" />
          <span className="catalog-sr-only">Buscar un dragón</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Encuentra tu dragón"
          />
        </label>
      </div>
      <p className="catalog-result-count" role="status" aria-live="polite">
        {filteredDragons.length}{" "}
        {filteredDragons.length === 1 ? "dragón" : "dragones"}
        {visibleDragons.length < filteredDragons.length
          ? ` · Mostrando ${visibleDragons.length}`
          : ""}
      </p>
      {visibleDragons.length > 0 ? (
        <div className="catalog-grid">
          {visibleDragons.map((dragon) => (
            <DragonCardTA
              key={dragon.id}
              dragon={dragon}
              index={dragons.indexOf(dragon)}
            />
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <p>No encontramos ese dragón.</p>
          <span>Prueba otro nombre o explora toda la colección.</span>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Ver todos los dragones
          </button>
        </div>
      )}
      {filter === "all" && !query && !expanded && (
        <button
          type="button"
          className="catalog-expand"
          onClick={() => setExpanded(true)}
        >
          Explorar la colección completa <span>23 dragones</span>
          <ArrowDown size={17} />
        </button>
      )}
      {expanded && filter === "all" && !query && (
        <button
          type="button"
          className="catalog-expand"
          onClick={() => {
            setExpanded(false);
            document
              .getElementById("dragones")
              ?.scrollIntoView({ behavior: "instant" });
          }}
        >
          Mostrar selección principal
        </button>
      )}
      <p className="catalog-disclaimer">
        Las imágenes son renders conceptuales. Acabados, tamaños y posibilidades
        de fabricación se confirman por WhatsApp.
      </p>
    </section>
  );
};
