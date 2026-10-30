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

`public/models/draconis-serpentine-v2.glb` es el modelo original provisional activo: 73.804 triángulos, seis mallas, texturas PBR embebidas y clip `Flight`. Se genera con `node scripts/generate-dragon-v2.mjs`. Consulta `public/models/README-v2.md` para el contrato del rig y su procedencia. La fidelidad cinematográfica depende de una escultura de mayor calidad con derechos verificados.

`src/components/experience` mantiene un único Canvas y mixer. El director de scroll usa anclas DOM, Catmull-Rom y amortiguación independiente de los FPS; conserva el scroll nativo. Las tarjetas y los controles tienen prioridad sobre la escena. La inspección táctil se activa explícitamente. El fuego se calcula en GPU, conserva el cooldown al pausar e incluye garganta, chispas y humo. Audio sintetizado desactivado inicialmente.

Las 23 fichas de `src/data/dragon-visual-references.ts` separan referencias de producción, literatura e interpretación artística. No acreditan licencia para vender réplicas exactas. Las imágenes v1 se conservan como historial; el catálogo usa los renders revisados v2.

Proyecto independiente y sin afiliación oficial. Los nombres del universo de ficción pertenecen a sus titulares; las interpretaciones visuales no acreditan una licencia comercial para sus marcas o personajes.

## Validación de la refactorización

- Compilación de producción y TypeScript correctos; nueve pruebas automatizadas pasan. ESLint ejecutado únicamente sobre los archivos nuevos, según las reglas del proyecto.
- Chrome: un solo Canvas y el mismo identificador de modelo en las siete secciones, incluyendo el regreso al hero; clic sobre la malla, fuego/cooldown, pausa, rotación y zoom comprobados.
- Vista estrecha de 390 y 433 px: scroll nativo, composición, controles y ausencia de desbordamiento horizontal comprobados. Búsqueda, filtro histórico (nueve resultados), ficha y enlace individual a WhatsApp verificados.
- Referencias y prompts: `src/data/dragon-visual-references.ts` y `public/images/catalog-identity-prompts-v2.json`. Los renders son conceptos originales, no fotos de fabricación.
- No se validó en dispositivos físicos, Safari ni con una pérdida real de WebGL. No se atribuyen mediciones de FPS o Lighthouse que no se hayan realizado.
- Dependencia abierta: escultura cinematográfica autorizada y fotografías reales de las piezas cuando existan. La versión activa mantiene expresamente su carácter provisional.
