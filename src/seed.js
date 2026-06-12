import { db } from "./db.js";
import { mundiales } from "./data/mundiales.js";

// Limpiar tabla antes de insertar
db.prepare("DELETE FROM mundiales").run();

// Preparar sentencia de inserción
const insert = db.prepare(`
  INSERT INTO mundiales
    (nombre, anio, sede, campeon, subcampeon, goleador, equipos, imagen, slug, resumen, descripcion)
  VALUES
    (@nombre, @anio, @sede, @campeon, @subcampeon, @goleador, @equipos, @imagen, @slug, @resumen, @descripcion)
`);

// Insertar todos los mundiales
for (const mundial of mundiales) {
  insert.run(mundial);
}

console.log(`✅ ${mundiales.length} mundiales insertados correctamente.`);
db.close();
