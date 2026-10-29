// ─── Site configuration ───────────────────────────────────────────────────────
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
  brand: "DRACONIS",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  url:
    configuredUrl && /^https?:\/\//.test(configuredUrl)
      ? configuredUrl
      : "https://draconis-3d.vercel.app",
  description:
    "Dragones que cobran vida. Descubre una colección de figuras 3D, explora un dragón interactivo y encuentra tu próximo coleccionable.",
} as const;
