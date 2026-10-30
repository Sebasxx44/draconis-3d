// ─── Types ────────────────────────────────────────────────────────────────────
export type VisualReferenceBasis =
  "production-study" | "literary-study" | "original-interpretation";
export interface VisualReferenceSource {
  title: string;
  url: string;
  kind: "production" | "author" | "literary-index";
}
export interface DragonVisualReference {
  id: string;
  basis: VisualReferenceBasis;
  label: string;
  palette: readonly string[];
  skull: string;
  horns: string;
  neck: string;
  wings: string;
  body: string;
  texture: string;
  distinctive: string;
  assetPath: string;
  provenance: string;
  rights: string;
  limitations: string;
  sources: readonly VisualReferenceSource[];
}

// ─── Editorial scope ──────────────────────────────────────────────────────────
// Sources identify the study basis. Fine anatomy, resin paint and poses remain
// artistic interpretations; an image-generation result is not evidence of canon.
// Reference images are not bundled or licensed for merchandising by this record.
export const VISUAL_REFERENCE_REVIEWED_AT = "2026-10-29";

// ─── Reference sheets ─────────────────────────────────────────────────────────
export const dragonVisualReferences: Readonly<
  Record<string, DragonVisualReference>
> = {
  caraxes: {
    id: "caraxes",
    basis: "production-study",
    label: "Estudio de anatomía de la serie",
    palette: ["#582323", "#8e443a", "#b09b78"],
    skull: "Pequeño, aplanado y alargado; mandíbula estrecha.",
    horns: "Cuernos cortos retraídos y crestas finas; sin corona monumental.",
    neck: "Extraordinariamente largo, fino y sinuoso; define la silueta.",
    wings: "Dedos alares largos, membrana tensa rojiza y bordes irregulares.",
    body: "Torso estrecho y alargado; dos patas traseras con membranas accesorias.",
    texture:
      "Escamas pequeñas irregulares, piel rojiza moteada y pliegues cervicales.",
    distinctive:
      "Cuello serpentiforme y cola de látigo; proporciones distintas a un dragón robusto.",
    assetPath: "/images/caraxes-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "La escultura interpreta la silueta y la anatomía; no reproduce el asset VFX ni certifica exactitud de cada escama.",
    sources: [
      {
        title: "MPC · Creación de criaturas",
        url: "https://www.mpcvfx.com/en/filmography/house-of-the-dragon/",
        kind: "production",
      },
      {
        title: "Mike Bell · Dirección de las criaturas",
        url: "https://www.syfy.com/syfy-wire/house-of-the-dragon-vfx-interview-game-of-thrones-prequel",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  vhagar: {
    id: "vhagar",
    basis: "production-study",
    label: "Estudio de anatomía de la serie",
    palette: ["#65684c", "#77634b", "#a59c7d"],
    skull: "Ancho, romo y de apariencia prehistórica; mirada hundida.",
    horns: "Cráneo prácticamente sin corona; relieve reducido y envejecido.",
    neck: "Muy grueso, bajo y con pliegues de piel colgante.",
    wings: "Enormes, pesadas y desgastadas; membranas terrosas.",
    body: "Masa adulta voluminosa y postura pesada; dos patas traseras y alas.",
    texture:
      "Piel rugosa, cicatrices, arrugas y moteado oliva y bronce apagado.",
    distinctive:
      "Edad y peso visibles en mandíbula, garganta y silueta, sin añadir cuernos ornamentales.",
    assetPath: "/images/vhagar-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "Estudio interpretativo del aspecto general. La distribución de arrugas, cicatrices y perforaciones es una propuesta artística.",
    sources: [
      {
        title: "Pixomondo · Behind the Flames",
        url: "https://www.pixomondo.com/",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  vermithor: {
    id: "vermithor",
    basis: "production-study",
    label: "Estudio de anatomía de la serie",
    palette: ["#76513a", "#ad8351", "#c5ae81"],
    skull: "Grande, rectangular y rugoso, con arco supraorbital pronunciado.",
    horns: "Corona irregular y espinas que enmarcan mandíbula y nuca.",
    neck: "Largo y muy potente; transición amplia hacia el pecho.",
    wings: "Anchas, de membrana ocre y estructura ósea robusta.",
    body: "Adulto masivo y musculoso, sin perder anatomía de dos patas y alas.",
    texture: "Escamas gruesas e irregulares y bronce envejecido.",
    distinctive:
      "Fuerza de una criatura madura; combinación de bronce oscuro, cuernos y textura áspera.",
    assetPath: "/images/vermithor-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "El acabado de bronce y el patrón de placas pertenecen a esta dirección de escultura, no a un archivo oficial.",
    sources: [
      {
        title: "Pixomondo · Behind the Flames",
        url: "https://www.pixomondo.com/",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  syrax: {
    id: "syrax",
    basis: "production-study",
    label: "Estudio de anatomía de la serie",
    palette: ["#a98234", "#d4ae5b", "#bda77e"],
    skull: "Corto y redondeado, con frente alta y hocico romo.",
    horns: "Par curvado hacia atrás a los lados de la cabeza.",
    neck: "Compacto y flexible, más corto que el de Caraxes.",
    wings:
      "Membranas color miel y nervaduras discretas; proporción equilibrada.",
    body: "Torso compacto y curvas más suaves, postura alerta y elegante.",
    texture:
      "Escamas pequeñas ocre, garganta más clara y superficies satinadas.",
    distinctive:
      "Ocre cálido y perfil facial redondeado; no confundir con el oro metálico de Sunfyre.",
    assetPath: "/images/syrax-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "Interpretación de los grandes rasgos; los matices de pintura y la pose de la figura son originales.",
    sources: [
      {
        title: "MPC · Creación de criaturas",
        url: "https://www.mpcvfx.com/en/filmography/house-of-the-dragon/",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  meleys: {
    id: "meleys",
    basis: "production-study",
    label: "Estudio de anatomía de la serie",
    palette: ["#7f302c", "#aa5147", "#d9c9ab"],
    skull: "Triangular y ancho, de mandíbula fuerte y ojos bajo crestas.",
    horns: "Corona abundante de cuernos claros orientados hacia atrás.",
    neck: "Musculoso y proporcionado; menos serpentino que Caraxes.",
    wings: "Anchas, carmesíes y con nervios alares bien definidos.",
    body: "Madura, atlética y poderosa; dos patas y alas como miembros anteriores.",
    texture: "Escamas rojas densas, crestas oscuras y membrana coral apagada.",
    distinctive:
      "Corona de cuernos y porte regio: rasgos señalados por la dirección VFX.",
    assetPath: "/images/meleys-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "Los cuernos se interpretan desde la identidad de la serie; el color de los detalles difiere de algunas descripciones literarias.",
    sources: [
      {
        title: "MPC · Creación de criaturas",
        url: "https://www.mpcvfx.com/en/filmography/house-of-the-dragon/",
        kind: "production",
      },
      {
        title: "Mike Bell · Dirección de las criaturas",
        url: "https://www.syfy.com/syfy-wire/house-of-the-dragon-vfx-interview-game-of-thrones-prequel",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  sunfyre: {
    id: "sunfyre",
    basis: "production-study",
    label: "Estudio de anatomía de la serie",
    palette: ["#d3ab51", "#edcf8d", "#c99191"],
    skull: "Triangular y esbelto, con frente suave y hocico afinado.",
    horns: "Par simétrico y contenido de cuernos claros barridos hacia atrás.",
    neck: "De longitud media y arco elegante.",
    wings: "Rosadas y melocotón, contrastadas con dedos de tono dorado.",
    body: "Esbelto y atlético; pose erguida y equilibrada.",
    texture: "Escamas pequeñas doradas con reflejos champán y brillo moderado.",
    distinctive:
      "Contraste oro y rosa, más luminoso y refinado que Syrax o Vermithor.",
    assetPath: "/images/sunfyre-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "Color y elegancia guían el concepto; no es una reproducción exacta ni una fotografía comercial.",
    sources: [
      {
        title: "MPC · Creación de criaturas",
        url: "https://www.mpcvfx.com/en/filmography/house-of-the-dragon/",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  seasmoke: {
    id: "seasmoke",
    basis: "production-study",
    label: "Estudio de anatomía de la serie",
    palette: ["#7c8589", "#b2bdc2", "#ac9699"],
    skull: "Estrecho y alargado, con perfil de depredador reptiliano.",
    horns: "Cuernos bajos curvados hacia atrás y crestas cortas.",
    neck: "Medio-largo y ágil, sin la elongación extrema de Caraxes.",
    wings: "Gris humo con matices rosados discretos en la membrana.",
    body: "Bajo, ligero y atlético; postura dinámica.",
    texture: "Escamas grises irregulares, lomo más oscuro y garganta pálida.",
    distinctive:
      "Gris marino y silueta ágil; evitar convertirlo en un dragón de hielo blanco.",
    assetPath: "/images/seasmoke-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "La paleta y la forma se interpretan; los matices rosados y el acabado de resina no garantizan coincidencia exacta con cada plano.",
    sources: [
      {
        title: "MPC · Creación de criaturas",
        url: "https://www.mpcvfx.com/en/filmography/house-of-the-dragon/",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  silverwing: {
    id: "silverwing",
    basis: "production-study",
    label: "Estudio de anatomía de la serie",
    palette: ["#7e858b", "#adb1b5", "#c8c1b5"],
    skull: "Adulto alargado y angular, expresión calmada.",
    horns:
      "Cuernos laterales curvados hacia fuera y atrás, de silueta distintiva.",
    neck: "Largo y elegante, sin extremos serpentinos.",
    wings: "Amplias y majestuosas, de gris plateado y membranas finas.",
    body: "Grande y madura; pecho definido y figura estilizada.",
    texture:
      "Piel plateada envejecida, pliegues y escamas pequeñas de relieve sutil.",
    distinctive:
      "Cuernos laterales, presencia serena y escala adulta; detalles de piel estudiados por Rodeo FX.",
    assetPath: "/images/silverwing-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "La ficha se basa en el estudio de producción de la segunda temporada. Brillos y pose pertenecen al render conceptual.",
    sources: [
      {
        title: "Rodeo FX · House of the Dragon S2",
        url: "https://www.rodeofx.com/project/house-of-the-dragon-season-02",
        kind: "production",
      },
      {
        title: "Martin Pelletier · Silverwing",
        url: "https://beforesandafters.com/2024/09/13/house-of-the-dragon-s2-befores-and-afters-with-rodeo-fx/",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  dreamfyre: {
    id: "dreamfyre",
    basis: "literary-study",
    label: "Paleta literaria · anatomía interpretada",
    palette: ["#819cbd", "#b7c8d7", "#c2bdce"],
    skull:
      "Propuesta alargada y refinada; no se afirma un cráneo canónico completo.",
    horns: "Propuesta de cuernos plateados discretos orientados hacia atrás.",
    neck: "Propuesta larga y suave para diferenciar su madurez.",
    wings: "Azul pálido y plata; membrana lavanda tenue propuesta.",
    body: "Madura y esbelta; proporciones interpretadas para esta escultura.",
    texture:
      "Escamas azul pálido y reflejos plateados basados en descripción literaria.",
    distinctive:
      "Identidad azul pálida y plateada, separada del cobalto y cobre de Tessarion.",
    assetPath: "/images/dreamfyre-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "La referencia literaria define el color; esta revisión no verificó una ficha VFX completa de Dreamfyre y no atribuye la anatomía propuesta al canon.",
    sources: [
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · dreamfyre",
        url: "https://awoiaf.westeros.org/index.php/Dreamfyre",
        kind: "literary-index",
      },
    ],
  },
  tessarion: {
    id: "tessarion",
    basis: "literary-study",
    label: "Paleta literaria · anatomía interpretada",
    palette: ["#264c90", "#456db4", "#b87746"],
    skull: "Propuesta juvenil, angular y de hocico afinado.",
    horns: "Cuernos cortos y cresta cobriza como dirección de diseño.",
    neck: "Medio y flexible; proporción juvenil propuesta.",
    wings: "Cobalto oscuro, con estructura cobriza interpretada.",
    body: "Joven, ágil y ligera frente a los grandes dragones adultos.",
    texture: "Azules intensos; vientre, cresta y garras de cobre.",
    distinctive:
      "Contraste cobalto-cobre procedente de la descripción literaria.",
    assetPath: "/images/tessarion-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "Tessarion tiene presencia en pantalla, pero este concepto no pretende reproducir un asset VFX verificado. La anatomía fina sigue siendo interpretativa.",
    sources: [
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · tessarion",
        url: "https://awoiaf.westeros.org/index.php/Tessarion",
        kind: "literary-index",
      },
    ],
  },
  moondancer: {
    id: "moondancer",
    basis: "production-study",
    label: "Estudio de serie · interpretación de figura",
    palette: ["#8c9c77", "#b8bd9d", "#d4ccb1"],
    skull: "Pequeño y ligero, hocico agudo.",
    horns: "Cresta alta y cuernos cortos como dirección de escultura.",
    neck: "Delgado, de longitud moderada.",
    wings: "Grandes para su cuerpo pequeño; membranas verdes pálidas.",
    body: "Juvenil, esbelta y ágil.",
    texture: "Escamas verde claro, marcas oscuras y acentos marfil.",
    distinctive:
      "Pequeña escala corporal y aspecto ligero; diferenciada de los adultos.",
    assetPath: "/images/moondancer-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "Rodeo FX documenta el trabajo de la criatura; el patrón de marcas, pose y acabados de esta figura son originales.",
    sources: [
      {
        title: "Rodeo FX · House of the Dragon S2",
        url: "https://www.rodeofx.com/project/house-of-the-dragon-season-02",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  vermax: {
    id: "vermax",
    basis: "production-study",
    label: "Estudio de serie · interpretación de figura",
    palette: ["#496d4f", "#879a65", "#ab7d53"],
    skull: "Juvenil y alerta, hocico reptiliano compacto.",
    horns: "Cuernos cortos orientados hacia atrás.",
    neck: "Compacto y activo; proporción joven.",
    wings: "Verdes con matices cálidos; dedos finos y largos.",
    body: "Ágil y en crecimiento; dos patas traseras y alas abiertas.",
    texture: "Escamas verdes y textura reptiliana de relieve medio.",
    distinctive:
      "Expresión exploradora; la dirección de animación consultó lagartos y aves.",
    assetPath: "/images/vermax-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "La ficha toma el carácter juvenil como referencia; colores exactos, tamaño y postura no son especificaciones oficiales.",
    sources: [
      {
        title: "MPC · Creación de criaturas",
        url: "https://www.mpcvfx.com/en/filmography/house-of-the-dragon/",
        kind: "production",
      },
      {
        title: "Mike Bell · Dirección de las criaturas",
        url: "https://www.syfy.com/syfy-wire/house-of-the-dragon-vfx-interview-game-of-thrones-prequel",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  arrax: {
    id: "arrax",
    basis: "production-study",
    label: "Estudio de serie · interpretación de figura",
    palette: ["#c7c5b8", "#e0dbca", "#ac9470"],
    skull: "Pequeño y afinado, de aspecto juvenil.",
    horns: "Cuernos delicados y cresta corta.",
    neck: "Esbelto y moderadamente largo.",
    wings: "Claras, de matices beige, con dedos finos.",
    body: "Pequeño y ligero, con cola delgada.",
    texture: "Marfil, perla y suaves acentos dorados.",
    distinctive: "Paleta clara y cuerpo joven frente a Vhagar y los adultos.",
    assetPath: "/images/arrax-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "Acabados de marfil y la postura son una interpretación visual; no se reproducen medidas ni un asset oficial.",
    sources: [
      {
        title: "Pixomondo · Behind the Flames",
        url: "https://www.pixomondo.com/",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  tyraxes: {
    id: "tyraxes",
    basis: "original-interpretation",
    label: "Interpretación literaria original",
    palette: ["#526d72", "#899da1", "#b8b0a0"],
    skull: "Propuesta compacta, con hocico estrecho.",
    horns: "Propuesta de cuernos cortos discretos.",
    neck: "Propuesta media y flexible.",
    wings: "Propuesta de membranas verde petróleo.",
    body: "Juvenil; volumen moderado según dirección artística.",
    texture: "Propuesta azul gris y verde petróleo.",
    distinctive:
      "La paleta propuesta distingue la figura sin atribuir colores no verificados a la obra.",
    assetPath: "/images/tyraxes-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "Nombre literario; cráneo, color, cuernos, proporciones y textura de esta ficha son propuestas originales, no una apariencia canónica confirmada.",
    sources: [
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · tyraxes",
        url: "https://awoiaf.westeros.org/index.php/Tyraxes",
        kind: "literary-index",
      },
    ],
  },
  stormcloud: {
    id: "stormcloud",
    basis: "original-interpretation",
    label: "Interpretación original · referencia limitada",
    palette: ["#766d67", "#9d8061", "#b0a28a"],
    skull: "Propuesta pequeña y redondeada, propia de una cría.",
    horns: "Cuernos incipientes propuestos.",
    neck: "Corto y flexible en esta interpretación juvenil.",
    wings: "Membranas finas y grandes respecto al pequeño cuerpo.",
    body: "Cría de dragón; anatomía deliberadamente juvenil.",
    texture: "Propuesta de ocres desaturados y grises cálidos.",
    distinctive:
      "Lectura de dragón pequeño, distinta de los adultos del catálogo.",
    assetPath: "/images/stormcloud-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "La serie muestra una criatura joven asociada a Aegon. No se ha verificado aquí un dossier VFX completo; el acabado propuesto no debe anunciarse como canónico.",
    sources: [
      {
        title: "Pixomondo · Behind the Flames",
        url: "https://www.pixomondo.com/",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · stormcloud",
        url: "https://awoiaf.westeros.org/index.php/Stormcloud",
        kind: "literary-index",
      },
    ],
  },
  sheepstealer: {
    id: "sheepstealer",
    basis: "production-study",
    label: "Estudio de serie · interpretación de figura",
    palette: ["#756044", "#9a7b54", "#b2a17c"],
    skull: "Angular, áspero y de rasgos irregulares.",
    horns: "Cuernos de aspecto irregular, con asimetría propuesta.",
    neck: "Largo y delgado, con postura desconfiada.",
    wings: "Terrosas, de bordes desiguales y textura desgastada.",
    body: "Largo y huesudo; carácter salvaje en vez de postura regia.",
    texture: "Tierra, marrón y rugosidad marcada.",
    distinctive: "Aspecto agreste y poco ornamental; silueta irregular.",
    assetPath: "/images/sheepstealer-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "La estética salvaje guía la interpretación; cicatrices, asimetrías y patrón de piel no son una copia de producción.",
    sources: [
      {
        title: "Pixomondo · Behind the Flames",
        url: "https://www.pixomondo.com/",
        kind: "production",
      },
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
    ],
  },
  "the-cannibal": {
    id: "the-cannibal",
    basis: "literary-study",
    label: "Descripción literaria · forma interpretada",
    palette: ["#171b1b", "#323a34", "#75a35c"],
    skull: "Propuesta grande y afilada, de mandíbula fuerte.",
    horns: "Propuesta de cuernos negros irregulares.",
    neck: "Propuesta gruesa, de cazador adulto.",
    wings: "Propuesta de membranas negras amplias.",
    body: "Grande y poderoso según interpretación artística.",
    texture: "Negro profundo y ojos verdes según descripción literaria.",
    distinctive: "La oscuridad y los ojos verdes distinguen el concepto.",
    assetPath: "/images/the-cannibal-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "La descripción literaria orienta color y carácter; no hay un diseño de pantalla verificado empleado en esta ficha.",
    sources: [
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · the-cannibal",
        url: "https://awoiaf.westeros.org/index.php/Cannibal_(dragon)",
        kind: "literary-index",
      },
    ],
  },
  "grey-ghost": {
    id: "grey-ghost",
    basis: "literary-study",
    label: "Descripción literaria · forma interpretada",
    palette: ["#9aabab", "#c1cccc", "#d8dcda"],
    skull: "Propuesta fina y aerodinámica.",
    horns: "Propuesta discreta, de cuernos claros.",
    neck: "Propuesta larga y esbelta.",
    wings: "Propuesta de membranas pálidas y ligeras.",
    body: "Delgado y ligero según interpretación.",
    texture: "Gris claro y blanco de humo.",
    distinctive: "Paleta desvanecida y silueta evasiva; contraste suave.",
    assetPath: "/images/grey-ghost-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "Color general vinculado a la descripción literaria; anatomía y materiales son una interpretación propia.",
    sources: [
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · grey-ghost",
        url: "https://awoiaf.westeros.org/index.php/Grey_Ghost",
        kind: "literary-index",
      },
    ],
  },
  balerion: {
    id: "balerion",
    basis: "literary-study",
    label: "Historia de Poniente · forma interpretada",
    palette: ["#17191b", "#33353a", "#615749"],
    skull:
      "Monumental y pesado como propuesta basada en el legado del Terror Negro.",
    horns: "Cuernos grandes oscuros; distribución interpretada.",
    neck: "Grueso, masivo y de gran alcance.",
    wings: "Enormes y negras en esta interpretación.",
    body: "Volumen colosal y postura antigua.",
    texture: "Negro carbón con brillos contenidos.",
    distinctive:
      "Escala monumental y predominio negro, sin convertir el render en una referencia oficial.",
    assetPath: "/images/balerion-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "El cráneo tiene presencia en pantalla, pero no se ha verificado aquí una anatomía completa viva. Esta figura interpreta relatos históricos.",
    sources: [
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · balerion",
        url: "https://awoiaf.westeros.org/index.php/Balerion",
        kind: "literary-index",
      },
    ],
  },
  meraxes: {
    id: "meraxes",
    basis: "literary-study",
    label: "Historia de Poniente · forma interpretada",
    palette: ["#9fa5a6", "#d4d6d0", "#c49b51"],
    skull: "Propuesta elegante, de hocico largo.",
    horns: "Propuesta de cuernos claros barridos hacia atrás.",
    neck: "Propuesta larga y firme.",
    wings: "Propuesta de plata envejecida en membranas anchas.",
    body: "Gran dragona adulta de porte ligero.",
    texture: "Escamas plateadas y ojos dorados según descripción literaria.",
    distinctive:
      "Contraste plata y ojos dorados, distinto del aspecto plateado de Silverwing.",
    assetPath: "/images/meraxes-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "No se presenta un modelo de pantalla confirmado; cabeza, cuernos y proporciones completan artísticamente la descripción literaria.",
    sources: [
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · meraxes",
        url: "https://awoiaf.westeros.org/index.php/Meraxes",
        kind: "literary-index",
      },
    ],
  },
  morghul: {
    id: "morghul",
    basis: "original-interpretation",
    label: "Interpretación literaria original",
    palette: ["#39343b", "#66515f", "#a18b9b"],
    skull: "Propuesta juvenil, ancha y de hocico corto.",
    horns: "Propuesta de cuernos pequeños y nacientes.",
    neck: "Propuesta compacta.",
    wings: "Propuesta de membranas ciruela desaturadas.",
    body: "Pequeño y juvenil según dirección artística.",
    texture: "Carbón y ciruela: paleta propia.",
    distinctive:
      "Acabado oscuro suave, sin atribuir colores a un canon no verificado.",
    assetPath: "/images/morghul-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "No se verificó una descripción anatómica o cromática completa. Todas las decisiones visuales de esta figura son interpretativas.",
    sources: [
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · morghul",
        url: "https://awoiaf.westeros.org/index.php/Morghul",
        kind: "literary-index",
      },
    ],
  },
  shrykos: {
    id: "shrykos",
    basis: "original-interpretation",
    label: "Interpretación literaria original",
    palette: ["#73836d", "#9ca88c", "#c3b896"],
    skull: "Propuesta juvenil y fina.",
    horns: "Propuesta de cuernos cortos claros.",
    neck: "Propuesta corta y delicada.",
    wings: "Propuesta de verde salvia con membranas beige.",
    body: "Pequeño y ligero según dirección artística.",
    texture: "Salvia y marfil: paleta propia.",
    distinctive: "Propuesta de criatura joven clara, distinta de Morghul.",
    assetPath: "/images/shrykos-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "La obra aporta su identidad, no una especificación visual verificada aquí. Paleta, anatomía y textura son creación interpretativa.",
    sources: [
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · shrykos",
        url: "https://awoiaf.westeros.org/index.php/Shrykos",
        kind: "literary-index",
      },
    ],
  },
  morning: {
    id: "morning",
    basis: "literary-study",
    label: "Descripción literaria · forma interpretada",
    palette: ["#c98f9e", "#e4b4bf", "#343035"],
    skull: "Propuesta pequeña y refinada, con hocico fino.",
    horns: "Cuernos negros; distribución propuesta.",
    neck: "Propuesta de cuello joven y flexible.",
    wings: "Propuesta rosa pálido, con dedos oscuros.",
    body: "Juvenil y ligera en esta interpretación.",
    texture: "Rosa y cuernos negros según descripción literaria.",
    distinctive:
      "Contraste rosa-negro; evitar confundir con las alas rosas y cuerpo dorado de Sunfyre.",
    assetPath: "/images/morning-v2.png",
    provenance:
      "Render conceptual original generado con ImageGen. No es una fotografía de una figura fabricada ni un recurso oficial; las fuentes se consultaron como referencia y no se redistribuyen.",
    rights:
      "No se ha verificado una licencia para comercializar réplicas exactas ni usar marcas oficiales. La referencia visual no concede esos derechos.",
    limitations:
      "La paleta parte de la descripción literaria; pose, cráneo, volumen y membranas son una propuesta original.",
    sources: [
      {
        title: "George R. R. Martin · Anatomía de los dragones",
        url: "https://speculativeliterature.org/portolan-project/deep-dives/george-r-r-martin/",
        kind: "author",
      },
      {
        title: "Índice literario · morning",
        url: "https://awoiaf.westeros.org/index.php/Morning",
        kind: "literary-index",
      },
    ],
  },
};
