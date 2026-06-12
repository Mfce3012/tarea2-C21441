import { DatabaseSync } from "node:sqlite";
import { cwd } from "node:process";

export const db = new DatabaseSync(`${cwd()}/mundiales.db`);

db.exec(`
  CREATE TABLE IF NOT EXISTS mundiales (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT    NOT NULL,
    anio        INTEGER NOT NULL,
    sede        TEXT    NOT NULL,
    campeon     TEXT    NOT NULL,
    subcampeon  TEXT    NOT NULL,
    goleador    TEXT    NOT NULL,
    equipos     INTEGER NOT NULL,
    imagen      TEXT    NOT NULL,
    slug        TEXT    NOT NULL UNIQUE,
    resumen     TEXT    NOT NULL,
    descripcion TEXT    NOT NULL
  )
`);