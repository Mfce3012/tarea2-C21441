import express from "express";
import { cwd } from "node:process";
import { z } from "zod";
import { db } from "./db.js";

const app = express();
app.enable("strict routing");

const HOST = "localhost";
const PORT = 4321;

// ─── Ruta raíz: información del API ───────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    nombre: "API Copa Mundial FIFA",
    version: "1.0.0",
    descripcion:
      "API REST con información de las ediciones de la Copa Mundial de la FIFA",
    rutas: {
      "GET /mundiales":
        "Lista todos los slugs (agrega ?include=full para datos completos)",
      "GET /mundial/:slug": "Obtiene un mundial por su slug",
      "GET /campeon/:pais": "Slugs de ediciones ganadas por ese país",
      "GET /random": "Obtiene un mundial al azar",
      "GET /search/:text": "Busca mundiales por texto (mínimo 3 caracteres)",
      "GET /imagenes/*": "Sirve imágenes de los mundiales",
    },
  });
});

// ─── Listar mundiales ──────────────────────────────────────────────────────────
app.get("/mundiales", (req, res) => {
  const { include } = req.query;

  if (include === "full") {
    const mundiales = db.prepare("SELECT * FROM mundiales ORDER BY anio").all();
    return res.json(mundiales);
  }

  const slugs = db
    .prepare("SELECT slug FROM mundiales ORDER BY anio")
    .all()
    .map((m) => m.slug);

  res.json(slugs);
});

// ─── Mundial por slug ──────────────────────────────────────────────────────────
app.get("/mundial/:slug", (req, res) => {
  const { slug } = req.params;
  const mundial = db
    .prepare("SELECT * FROM mundiales WHERE slug = ?")
    .get(slug);

  if (!mundial) {
    return res.status(404).json({ error: "Mundial no encontrado", slug });
  }

  res.json(mundial);
});

// ─── Mundiales por país campeón ────────────────────────────────────────────────
app.get("/campeon/:pais", (req, res) => {
  const { pais } = req.params;
  const mundiales = db
    .prepare("SELECT slug FROM mundiales WHERE campeon = ? ORDER BY anio")
    .all(pais);

  if (mundiales.length === 0) {
    return res
      .status(404)
      .json({ error: "No se encontraron mundiales para ese campeón", pais });
  }

  res.json(mundiales.map((m) => m.slug));
});

// ─── Mundial aleatorio ─────────────────────────────────────────────────────────
app.get("/random", (req, res) => {
  const mundial = db
    .prepare("SELECT * FROM mundiales ORDER BY RANDOM() LIMIT 1")
    .get();

  res.json(mundial);
});

// ─── Búsqueda por texto (mínimo 3 caracteres) ─────────────────────────────────
const SearchSchema = z.object({
  text: z
    .string()
    .min(3, "El texto de búsqueda debe tener al menos 3 caracteres"),
});

app.get("/search/:text", (req, res) => {
  const result = SearchSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      error: "Bad Request",
      detalle: result.error.issues[0].message,
    });
  }

  const { text } = result.data;
  const query = `%${text}%`;

  const mundiales = db
    .prepare(
      `
      SELECT * FROM mundiales
      WHERE nombre      LIKE ?
         OR sede        LIKE ?
         OR campeon     LIKE ?
         OR resumen     LIKE ?
         OR descripcion LIKE ?
      ORDER BY anio
    `,
    )
    .all(query, query, query, query, query);

  res.json(mundiales);
});

// ─── Servir imágenes estáticas ─────────────────────────────────────────────────
app.use("/imagenes", express.static(`${cwd()}/imagenes`));

// ─── 404 para rutas no definidas ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada", path: req.path });
});

// ─── Servidor ─────────────────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  console.log(`Server at http://${HOST}:${PORT}/`);
});
