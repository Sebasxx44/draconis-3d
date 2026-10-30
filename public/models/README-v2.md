# DRACONIS · serpentino original v2

Modelo provisional original; no es el asset de producción de HBO ni una réplica autorizada de Caraxes. Mejora el cuello y la cola alargados, el cráneo estrecho, las membranas de las patas traseras y la articulación de las alas. Su acabado sigue siendo una interpretación procedural, no una escultura cinematográfica fotorrealista.

- Archivo: `draconis-serpentine-v2.glb`, 3,29 MB; 73.804 triángulos y seis mallas/materiales.
- Rig: 46 canales de animación `Flight`, cuello/cola con skinning, hombros/codos/muñecas/dedos de ala, mandíbula y dos patas traseras. `Mouth` emite en su eje local −X.
- Texturas originales embebidas: color 1024², normal y ORM 512² para piel y membrana. La oclusión es una aproximación procedural, no un bake de escultura de alta resolución.
- Optimización: lotes skinned por material, colores/pesos/juntas compactados, normales cuantizadas con `KHR_mesh_quantization`; no requiere decodificadores remotos.
- Generador reproducible: `node scripts/generate-dragon-v2.mjs`. Conserva el archivo y generador v1.
- Validación: carga y vuelo comprobados en Chrome; 25 poses del ciclo y 1.040.750 vértices deformados sin valores no finitos. Métricas y amplitud animada en `serpentine-v2-provenance.json`.

Se consultaron el [desglose de MPC](https://www.mpcvfx.com/en/filmography/house-of-the-dragon/) y la [entrevista al equipo VFX](https://www.syfy.com/syfy-wire/house-of-the-dragon-vfx-interview-game-of-thrones-prequel) como referencias, sin incorporar sus imágenes o geometrías. No se encontró un asset de suficiente calidad cuya descarga y autorización comercial pudieran verificarse: las fichas Sketchfab consultadas devolvieron 403 y el modelo Snapmaker consultado restringe redistribución/hosting.

Pendiente para alcanzar fidelidad cinematográfica: un GLB esculpido y texturizado por un artista, con rig y permiso comercial verificables. El permiso sobre referencias visuales no autoriza por sí mismo la venta de réplicas exactas.
