"use client";

// ─── Imports ──────────────────────────────────────────────────────────────────
import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { dragons } from "@/data/dragons";
import "@/components/sections/catalog.css";

// ─── Constants ────────────────────────────────────────────────────────────────
const galleryDragons = dragons.slice(0, 6);

// ─── Component ────────────────────────────────────────────────────────────────
export const GalleryTA = () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDragon = galleryDragons[activeIndex];

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const changeImage = (direction: number) =>
    setActiveIndex(
      (current) =>
        (current + direction + galleryDragons.length) % galleryDragons.length,
    );
  const handleKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      changeImage(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      changeImage(-1);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      id="galeria"
      className="gallery-section"
      aria-labelledby="gallery-title"
    >
      <div className="gallery-heading">
        <div>
          <p className="catalog-eyebrow">UNA MIRADA MÁS CERCA</p>
          <h2 id="gallery-title">
            El arte está en <em>los detalles.</em>
          </h2>
        </div>
        <p>
          Estudios de colección.
          <br />
          <span>Renders conceptuales, no fotografías de producto.</span>
        </p>
      </div>
      <Dialog.Root>
        <div className="gallery-grid">
          {galleryDragons.map((dragon, index) => (
            <Dialog.Trigger key={dragon.id} asChild>
              <button
                type="button"
                className={`gallery-tile gallery-tile-${index + 1}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ampliar render conceptual de ${dragon.name}`}
              >
                <Image
                  src={dragon.image ?? ""}
                  alt={`Estudio conceptual de ${dragon.name}`}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 40vw"
                />
                <span className="gallery-tile-copy">
                  <span>{dragon.name}</span>
                  <ArrowUpRight size={20} />
                </span>
              </button>
            </Dialog.Trigger>
          ))}
        </div>
        <Dialog.Portal>
          <Dialog.Overlay className="catalog-dialog-overlay" />
          <Dialog.Content className="gallery-lightbox" onKeyDown={handleKeys}>
            <Dialog.Close
              className="catalog-dialog-close"
              aria-label="Cerrar galería"
            >
              <X size={23} />
            </Dialog.Close>
            {activeDragon && (
              <>
                <div className="gallery-lightbox-image">
                  <Image
                    src={activeDragon.image ?? ""}
                    alt={`Render conceptual ampliado de ${activeDragon.name}`}
                    fill
                    sizes="(max-width: 960px) 94vw, 1000px"
                    priority
                  />
                </div>
                <div className="gallery-lightbox-footer">
                  <button
                    type="button"
                    onClick={() => changeImage(-1)}
                    aria-label="Imagen anterior"
                  >
                    <ArrowLeft size={22} />
                  </button>
                  <div aria-live="polite">
                    <Dialog.Title>{activeDragon.name}</Dialog.Title>
                    <Dialog.Description>
                      Render conceptual generado con IA · {activeIndex + 1} de{" "}
                      {galleryDragons.length}
                    </Dialog.Description>
                  </div>
                  <button
                    type="button"
                    onClick={() => changeImage(1)}
                    aria-label="Imagen siguiente"
                  >
                    <ArrowRight size={22} />
                  </button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
};
