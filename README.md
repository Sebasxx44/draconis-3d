# DRACONIS — 3D Collectibles

Landing de colección con Next.js, TypeScript, Tailwind, componentes TA basados en shadcn/Radix, Motion y React Three Fiber. Sin base de datos, cuentas ni checkout.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Configura `NEXT_PUBLIC_WHATSAPP_NUMBER` en formato internacional (solo dígitos). Sin número válido, los botones muestran contacto pendiente. `NEXT_PUBLIC_SITE_URL` define canonical y sitemap; Instagram solo aparece si se configura una URL válida.

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

El catálogo vive en `src/data/dragons.ts`. Los renders conceptuales de `public/images` fueron generados con ImageGen; no son fotografías de productos fabricados. Cada imagen representa una dirección visual distinta. El proceso se ilustra con iconos, sin presentar fotografías ficticias del taller.

`public/models/draconis-serpentine-reborn.glb` es el modelo original provisional activo: 73.528 triángulos, seis mallas, texturas PBR embebidas, 55 huesos y clips `Flight`/`Glide`. `node scripts/rebuild-dragon-rig.mjs` lo deriva del GLB v2 conservado. Añade ojos articulados, mezcla de vuelo/planeo y elimina 276 caras degeneradas; conserva la misma escultura y texturas. Consulta `public/models/README-reborn.md` y el contrato reemplazable `src/components/experience/dragon-asset.ts`. Esta mejora de rig no acredita calidad cinematográfica ni fidelidad exacta a Caraxes.

`src/components/experience` mantiene un único Canvas y mixer, con entrada en profundidad, cámara amortiguada y vuelo/planeo mezclados. El director usa anclas DOM y Catmull-Rom; una única escucha de scroll notifica a los controladores. No hay botones, paneles ni audio de Caraxes: responde al cursor, clic/toque y arrastre directo con ratón/lápiz en el estudio; vuelve al vuelo autónomo tras el gesto. El toque conserva el scroll nativo. El fuego GPU aparece automáticamente al estabilizarse en hero/contacto y luego cada 32–45 segundos; respeta cooldown, formularios, diálogos, pestaña oculta y reducción de movimiento. Al enfocar el espacio 3D, Espacio pausa/reanuda e Intro activa una reacción como alternativas de teclado.

Las 23 fichas de `src/data/dragon-visual-references.ts` separan referencias de producción, literatura e interpretación artística. No acreditan licencia para vender réplicas exactas. Las imágenes v1 se conservan como historial; el catálogo usa los renders revisados v2.

Proyecto independiente y sin afiliación oficial. Los nombres del universo de ficción pertenecen a sus titulares; las interpretaciones visuales no acreditan una licencia comercial para sus marcas o personajes.

## Validación de la refactorización

- Compilación de producción y TypeScript correctos; nueve pruebas automatizadas pasan. ESLint ejecutado únicamente sobre los archivos nuevos, según las reglas del proyecto.
- Chrome: un solo Canvas y el mismo identificador de modelo en las siete secciones, incluyendo el regreso al hero; clic sobre la malla, arrastre directo, retorno autónomo, fuego sin botones y pausa por teclado comprobados.
- Vista estrecha de 390 px: scroll nativo, composición, controles y ausencia de desbordamiento horizontal comprobados. Búsqueda, filtro histórico (nueve resultados), ficha y enlace individual a WhatsApp verificados.
- Referencias y prompts: `src/data/dragon-visual-references.ts` y `public/images/catalog-identity-prompts-v2.json`. Los renders son conceptos originales, no fotos de fabricación.
- Fallo de carga GLB simulado mediante HTTP 503: fallback visible, Canvas retirado y ficha/WhatsApp utilizables. No se validó en dispositivos físicos, Safari ni con una pérdida real de WebGL. No se atribuyen mediciones de FPS o Lighthouse que no se hayan realizado.
- Dependencia abierta: una escultura profesional con rig/PBR y permiso compatible con distribución WebGL; además de fotografías reales de piezas cuando existan. El catálogo conserva sus conceptos actuales: no se generaron nuevas imágenes ni se presentan como renders obtenidos de 23 modelos 3D.

## Recursos revisados para Dragon Reborn

[Caraxes de Igvite](https://www.cgtrader.com/3d-print-models/miniatures/figurines/caraxes-from-the-house-of-the-dragon) ofrece archivos para impresión con licencia editorial, sin rig/PBR acreditados. [Caraxes de Fabian Costa](https://sketchfab.com/3d-models/caraxes-the-blood-wyrm-6694de8be0d846418a53202a81851bb8) no habilita descarga. [Dreadthorn](https://www.cgtrader.com/3d-models/animal/dinosaur/dragon-dc79f600-a6ed-4cf2-88e0-040056842c2a) es un candidato original con rig y PBR según su ficha, no inspeccionado ni adquirido; requiere adaptación artística, optimización y confirmar distribución compatible con las [condiciones del proveedor](https://www.cgtrader.com/pages/terms-and-conditions). No se descargaron ni compraron esos assets.
