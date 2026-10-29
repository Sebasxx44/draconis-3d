// ─── Types ────────────────────────────────────────────────────────────────────
export type DragonOrigin = "screen" | "literary" | "historical";

export interface Dragon {
  id: string;
  name: string;
  epithet: string;
  description: string;
  story: string;
  origin: DragonOrigin;
  color: string;
  finish: string;
  image: string;
  whatsappMessage: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const dragonOriginLabels: Record<DragonOrigin, string> = {
  screen: "En pantalla",
  literary: "Universo literario",
  historical: "Historia de Poniente",
};

export const dragonSources = [
  {
    label: "Guía de dragones · Sky",
    url: "https://www.sky.com/watch/house-of-the-dragon/meet-the-dragons",
  },
  {
    label: "Dragones y jinetes · A Wiki of Ice and Fire",
    url: "https://awoiaf.westeros.org/index.php/Dragonrider",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inquiry = (name: string): string =>
  `Hola, estoy interesado en una figura 3D de ${name}. ¿Me puedes compartir tamaños, acabados y precios?`;

// ─── Catalog ──────────────────────────────────────────────────────────────────
export const dragons: readonly Dragon[] = [
  {
    id: "caraxes",
    name: "Caraxes",
    epithet: "El Gusano de Sangre",
    description: "Una silueta serpentina. Un carácter indomable.",
    story:
      "El dragón de Daemon Targaryen destaca por su cuello alargado y su silueta singular. Su rojo profundo inspira un estudio de formas sinuosas y alas desplegadas.",
    origin: "screen",
    color: "#a94237",
    finish: "Rojo profundo · textura orgánica",
    image: "/images/caraxes.png",
    whatsappMessage:
      "Hola, estoy interesado en una figura 3D de Caraxes. ¿Me puedes compartir tamaños, acabados y precios?",
  },
  {
    id: "vhagar",
    name: "Vhagar",
    epithet: "La reina de los cielos",
    description: "La presencia imponente de una leyenda ancestral.",
    story:
      "Una de las tres grandes criaturas de la Conquista y una superviviente de otra era. La interpretación visual de Vhagar se centra en su corpulencia, su piel envejecida y sus tonos terrosos.",
    origin: "screen",
    color: "#8f9b76",
    finish: "Verde envejecido · tonos de tierra",
    image: "/images/vhagar.png",
    whatsappMessage:
      "Hola, quiero información sobre la figura 3D de Vhagar. ¿Qué opciones tienen disponibles?",
  },
  {
    id: "vermithor",
    name: "Vermithor",
    epithet: "La Furia de Bronce",
    description: "Bronce, fuerza y el peso de una historia legendaria.",
    story:
      "El antiguo dragón del rey Jaehaerys I es conocido como la Furia de Bronce. Su porte poderoso y su coloración inspiran un acabado de matices cálidos y escamas marcadas.",
    origin: "screen",
    color: "#bd9862",
    finish: "Bronce cálido · escamas definidas",
    image: "/images/vermithor.png",
    whatsappMessage:
      "Hola, me interesa una impresión 3D de Vermithor. ¿Podemos hablar de tamaños y acabados?",
  },
  {
    id: "syrax",
    name: "Syrax",
    epithet: "El vínculo de la reina",
    description: "Elegancia dorada y una silueta inconfundible.",
    story:
      "Vinculada a Rhaenyra Targaryen, Syrax toma su nombre de una diosa valyria. Su apariencia dorada permite explorar acabados luminosos y detalles delicados.",
    origin: "screen",
    color: "#d3b169",
    finish: "Ocre dorado · reflejos suaves",
    image: "/images/syrax.png",
    whatsappMessage: inquiry("Syrax"),
  },
  {
    id: "meleys",
    name: "Meleys",
    epithet: "La Reina Roja",
    description: "Rojo carmesí. La elegancia de una guerrera.",
    story:
      "La montura de Rhaenys Targaryen es conocida como la Reina Roja. Sus escamas carmesíes y su corona de cuernos dan lugar a una interpretación de gran carácter.",
    origin: "screen",
    color: "#b85149",
    finish: "Carmesí · cuernos contrastados",
    image: "/images/meleys.png",
    whatsappMessage: inquiry("Meleys"),
  },
  {
    id: "sunfyre",
    name: "Sunfyre",
    epithet: "El Dorado",
    description: "Una criatura hecha de luz y destellos de oro.",
    story:
      "El dragón de Aegon II es célebre por su color dorado. El contraste entre escamas brillantes y membranas suaves inspira este estudio de acabado.",
    origin: "screen",
    color: "#e0c07d",
    finish: "Oro luminoso · matices rosados",
    image: "/images/sunfyre.png",
    whatsappMessage: inquiry("Sunfyre"),
  },
  {
    id: "seasmoke",
    name: "Seasmoke",
    epithet: "Bruma marina",
    description: "Tonos pálidos y la ligereza de una bruma costera.",
    story:
      "Seasmoke está ligado a la historia de la casa Velaryon. Su apariencia gris plateada sugiere una pieza de contrastes suaves y tonos marinos.",
    origin: "screen",
    color: "#afbac0",
    finish: "Gris perla · matices fríos",
    image: "/images/seasmoke.png",
    whatsappMessage: inquiry("Seasmoke"),
  },
  {
    id: "silverwing",
    name: "Silverwing",
    epithet: "Alas de plata",
    description: "La serenidad de una gran silueta plateada.",
    story:
      "La antigua montura de la reina Alysanne lleva la plata en su nombre. Su interpretación ofrece un lenguaje de escamas claras y amplias superficies alares.",
    origin: "screen",
    color: "#b9babe",
    finish: "Plata suave · detalles claros",
    image: "/images/silverwing.png",
    whatsappMessage: inquiry("Silverwing"),
  },
  {
    id: "dreamfyre",
    name: "Dreamfyre",
    epithet: "Fuego de ensueño",
    description: "Azules delicados con destellos de plata.",
    story:
      "La historia de Dreamfyre se extiende a lo largo de generaciones Targaryen. Su coloración azul pálida y plateada es la referencia literaria para este concepto.",
    origin: "screen",
    color: "#9badc9",
    finish: "Azul pálido · acentos de plata",
    image: "/images/dreamfyre.png",
    whatsappMessage: inquiry("Dreamfyre"),
  },
  {
    id: "tessarion",
    name: "Tessarion",
    epithet: "La Reina Azul",
    description: "Azul cobalto y el brillo cálido del cobre.",
    story:
      "Asociada a Daeron Targaryen, Tessarion es conocida como la Reina Azul. El contraste de azul y cobre procede de su descripción literaria.",
    origin: "screen",
    color: "#7396bc",
    finish: "Azul intenso · detalles cobrizos",
    image: "/images/tessarion.png",
    whatsappMessage: inquiry("Tessarion"),
  },
  {
    id: "moondancer",
    name: "Moondancer",
    epithet: "Danza bajo la luna",
    description: "Una silueta ágil en verdes suaves.",
    story:
      "La pequeña dragona de Baela Targaryen inspira una composición ligera y dinámica. Sus tonos verdes permiten una paleta más sutil dentro de la colección.",
    origin: "screen",
    color: "#a2b49a",
    finish: "Verde suave · acentos marfil",
    image: "/images/moondancer.png",
    whatsappMessage: inquiry("Moondancer"),
  },
  {
    id: "vermax",
    name: "Vermax",
    epithet: "Espíritu joven",
    description: "Verdes profundos y una energía que crece.",
    story:
      "Vinculado a Jacaerys Velaryon desde su juventud, Vermax representa una nueva generación de dragones. Su concepto explora tonos verdes y una postura alerta.",
    origin: "screen",
    color: "#7c9b73",
    finish: "Verde bosque · detalles cálidos",
    image: "/images/vermax.png",
    whatsappMessage: inquiry("Vermax"),
  },
  {
    id: "arrax",
    name: "Arrax",
    epithet: "Blanco entre tormentas",
    description: "Escamas claras y una delicada presencia.",
    story:
      "El joven dragón de Lucerys Velaryon tiene una silueta más ligera que los grandes veteranos. Su coloración clara inspira acabados de marfil y perla.",
    origin: "screen",
    color: "#d3c9b6",
    finish: "Marfil · matices nacarados",
    image: "/images/arrax.png",
    whatsappMessage: inquiry("Arrax"),
  },
  {
    id: "tyraxes",
    name: "Tyraxes",
    epithet: "La nueva generación",
    description: "Un nombre joven en la historia de la Danza.",
    story:
      "El dragón de Joffrey Velaryon pertenece a la generación más joven de la Danza de los Dragones. La referencia principal es el relato literario; la imagen propone una interpretación original en azules grises y verde petróleo, sin atribuirle una apariencia canónica.",
    origin: "literary",
    color: "#8e9a9d",
    finish: "Azul gris · interpretación original",
    image: "/images/tyraxes.png",
    whatsappMessage: inquiry("Tyraxes"),
  },
  {
    id: "stormcloud",
    name: "Stormcloud",
    epithet: "Nube de tormenta",
    description: "Una pequeña criatura con una gran historia.",
    story:
      "Stormcloud está unido a la infancia de Aegon el Joven en Fuego y Sangre. La imagen propone una interpretación original en grises tormenta y azules nocturnos; no representa una apariencia canónica confirmada.",
    origin: "literary",
    color: "#9198ad",
    finish: "Gris tormenta · interpretación original",
    image: "/images/stormcloud.png",
    whatsappMessage: inquiry("Stormcloud"),
  },
  {
    id: "sheepstealer",
    name: "Sheepstealer",
    epithet: "El Ladrón de Ovejas",
    description: "La belleza indómita de un dragón salvaje.",
    story:
      "Un dragón salvaje cuyo nombre recuerda sus hábitos de caza. Su coloración terrosa y su carácter esquivo inspiran una interpretación de textura áspera.",
    origin: "screen",
    color: "#a78b6c",
    finish: "Tonos terrosos · textura irregular",
    image: "/images/sheepstealer.png",
    whatsappMessage: inquiry("Sheepstealer"),
  },
  {
    id: "the-cannibal",
    name: "The Cannibal",
    epithet: "El Caníbal",
    description: "Oscuridad, misterio y una mirada verde.",
    story:
      "Uno de los dragones salvajes de Rocadragón en Fuego y Sangre. Su descripción literaria combina escamas negras y ojos verdes, una referencia de contrastes intensos.",
    origin: "literary",
    color: "#8a9a76",
    finish: "Negro profundo · acentos verdes",
    image: "/images/the-cannibal.png",
    whatsappMessage: inquiry("The Cannibal"),
  },
  {
    id: "grey-ghost",
    name: "Grey Ghost",
    epithet: "El Fantasma Gris",
    description: "Una presencia esquiva entre niebla y mar.",
    story:
      "Este dragón salvaje de Rocadragón evita la presencia humana. Sus tonos grisáceos y su naturaleza esquiva inspiran una composición ligera y silenciosa.",
    origin: "literary",
    color: "#a7b0b5",
    finish: "Gris humo · transiciones suaves",
    image: "/images/grey-ghost.png",
    whatsappMessage: inquiry("Grey Ghost"),
  },
  {
    id: "balerion",
    name: "Balerion",
    epithet: "El Terror Negro",
    description: "La sombra de una era de conquistas.",
    story:
      "El dragón de Aegon el Conquistador ocupa un lugar central en la historia de Poniente. Su enorme silueta negra inspira una pieza de presencia monumental.",
    origin: "historical",
    color: "#85818c",
    finish: "Negro carbón · escamas marcadas",
    image: "/images/balerion.png",
    whatsappMessage: inquiry("Balerion"),
  },
  {
    id: "meraxes",
    name: "Meraxes",
    epithet: "El legado de la Conquista",
    description: "Plata y oro en una leyenda del pasado.",
    story:
      "La dragona de Rhaenys Targaryen durante la Conquista se describe con escamas plateadas y ojos dorados. Una referencia histórica para un acabado de contraste refinado.",
    origin: "historical",
    color: "#bab6a7",
    finish: "Plata envejecida · acentos de oro",
    image: "/images/meraxes.png",
    whatsappMessage: inquiry("Meraxes"),
  },
  {
    id: "morghul",
    name: "Morghul",
    epithet: "Memorias de la Danza",
    description: "Una historia por descubrir en cada detalle.",
    story:
      "Morghul aparece en Fuego y Sangre vinculado a la princesa Jaehaera. El render explora una interpretación original en carbón y ciruela, sin presentarla como una apariencia canónica.",
    origin: "literary",
    color: "#9a8b94",
    finish: "Carbón y ciruela · interpretación original",
    image: "/images/morghul.png",
    whatsappMessage: inquiry("Morghul"),
  },
  {
    id: "shrykos",
    name: "Shrykos",
    epithet: "Ecos de Rocadragón",
    description: "Una criatura joven del universo literario.",
    story:
      "El joven Shrykos está asociado al príncipe Jaehaerys en Fuego y Sangre. El render propone una interpretación original en verde oliva y oro suave, sin presentarla como una apariencia canónica.",
    origin: "literary",
    color: "#a4a18a",
    finish: "Oliva y oro · interpretación original",
    image: "/images/shrykos.png",
    whatsappMessage: inquiry("Shrykos"),
  },
  {
    id: "morning",
    name: "Morning",
    epithet: "Un nuevo amanecer",
    description: "Rosados suaves para una nueva historia.",
    story:
      "Morning, la dragona de Rhaena Targaryen en Fuego y Sangre, se describe con escamas rosadas y cuernos negros. Su paleta ofrece un cierre delicado a la colección.",
    origin: "literary",
    color: "#c69caa",
    finish: "Rosa suave · detalles negros",
    image: "/images/morning.png",
    whatsappMessage: inquiry("Morning"),
  },
];
