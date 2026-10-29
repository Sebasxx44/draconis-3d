import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { siteConfig } from "@/config/site";
import "@/app/globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "DRACONIS — Dragones que cobran vida | 3D Collectibles",
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "DRACONIS — Dragones que cobran vida",
    description: siteConfig.description,
    url: "/",
    siteName: "DRACONIS 3D Collectibles",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/images/caraxes.png",
        width: 1448,
        height: 1086,
        alt: "Render conceptual de un dragón rojo de colección DRACONIS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DRACONIS — 3D Collectibles",
    description: siteConfig.description,
    images: ["/images/caraxes.png"],
  },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = {
  themeColor: "#0c0d0e",
  colorScheme: "dark",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="es" className={`${serif.variable} ${sans.variable}`}>
    <body>{children}</body>
  </html>
);
export default RootLayout;
