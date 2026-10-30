# Serpentino original · rig Reborn

`draconis-serpentine-reborn.glb` conserva la escultura y las seis texturas originales de v2. Es una mejora de rig y animación; no es un modelo cinematográfico ni una réplica autorizada de Caraxes. La procedencia y limitaciones de la geometría permanecen en `README-v2.md`.

- Reconstrucción: `node scripts/rebuild-dragon-rig.mjs`, a partir del GLB v2 conservado.
- 3,36 MB; 41.630 vértices; 73.528 triángulos, tras retirar 276 caras degeneradas; seis mallas/materiales y 55 huesos.
- `Flight`: 6,4 s, batido con recuperación asimétrica y retraso entre hombro, codo, muñeca y dedos. `Glide`: 9,6 s, alas estables y movimiento secundario de cuello y cola. Ambos clips contienen 46 canales y admiten mezcla ponderada en un solo mixer.
- `EyeFar` y `EyeNear`: hijos de `Head`, con iris y pupilas tridimensionales existentes reasignados al rig. No tienen canales propios en los clips: el controlador puede orientar cada ojo dentro de ±0,20 rad y restaurar su quaternion de reposo.
- `Mouth` mantiene el emisor en su eje local −X. Se conservan todos los nombres de huesos de v2.
- Validación reproducible: carga con GLTFLoader, 100 poses con mezcla y movimiento ocular, 4.163.000 vértices deformados finitos; discontinuidad angular de bucles inferior a 6 × 10⁻⁸ rad. Métricas y límites espaciales en `serpentine-reborn-provenance.json`.

La revisión geométrica por CPU no acredita calidad cinematográfica ni sustituye las pruebas WebGL de integración. Para ese nivel artístico sigue pendiente una escultura y texturizado de producción con derechos verificables.
