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

`public/models/draconis-original.glb` es un modelo serpentino original, generado con `node scripts/generate-dragon.mjs`. Incluye rig y clip `Flight`. Para sustituirlo, conserva los nombres de huesos/anclajes definidos en el generador o adapta `DragonModelTA`. El fuego usa partículas con shader, cooldown y luz temporal. Audio sintetizado desactivado inicialmente; WebGL y movimiento reducido tienen alternativas accesibles.

Proyecto independiente y sin afiliación oficial. Los nombres del universo de ficción pertenecen a sus titulares; las interpretaciones visuales no acreditan una licencia comercial para sus marcas o personajes.
