import { parentPort } from "worker_threads";
import { createReadStream, readFileSync } from "node:fs";
import readline from "node:readline";
import mysql from "mysql2/promise";

function computeIndex(temperature, humidity, wind, rain) {
  const value = 70 + (temperature * 1.4) + (humidity * 0.35) - (wind * 1.8) - (rain * 4.0);
  return Math.max(0, Math.min(200, Number(value.toFixed(1))));
}

function parseCsvLine(line) {
  // File is simple comma-separated dataset without quoted commas.
  return line.split(",");
}

async function ingestCsvIntoDb() {
  const csvPath = process.env.DATA_CSV_PATH || "/data/cleaned/meteo_clean.csv";
  const passwordPath = process.env.DB_PASSWORD_FILE || "/run/secrets/db_password";
  const password = readFileSync(passwordPath, "utf8").trim();

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "db-proxy",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "app_user",
    password,
    database: process.env.DB_DATABASE || "projet48h",
    connectionLimit: 5,
  });

  let inserted = 0;
  const stationCache = new Map();

  try {
    const rl = readline.createInterface({
      input: createReadStream(csvPath, { encoding: "utf8" }),
      crlfDelay: Infinity,
    });

    let isFirstLine = true;
    for await (const line of rl) {
      if (!line.trim()) continue;
      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }

      const [dateRaw, stationRaw, latRaw, lonRaw, tempRaw, humidityRaw, windRaw, rainRaw] =
        parseCsvLine(line);
      if (!stationRaw || !latRaw || !lonRaw || !dateRaw) continue;

      const station = stationRaw.trim();
      const lat = Number(latRaw);
      const lon = Number(lonRaw);
      const date = dateRaw.replace("+00:00", "").trim();
      const temperature = Number(tempRaw || 0);
      const humidity = Number(humidityRaw || 0);
      const wind = Number(windRaw || 0);
      const rain = Number(rainRaw || 0);
      const idx = computeIndex(temperature, humidity, wind, rain);

      const stationKey = `${station}|${lat}|${lon}`;
      let locId = stationCache.get(stationKey);
      if (!locId) {
        const [existing] = await pool.query(
          "SELECT id FROM Localisation WHERE ville = ? AND latitude = ? AND longitude = ? LIMIT 1",
          [station, lat, lon],
        );
        if (existing.length > 0) {
          locId = existing[0].id;
        } else {
          const [insLoc] = await pool.query(
            "INSERT INTO Localisation (pays, ville, latitude, longitude) VALUES (?, ?, ?, ?)",
            ["France", station, lat, lon],
          );
          locId = insLoc.insertId;
        }
        stationCache.set(stationKey, locId);
      }

      const [insIndice] = await pool.query(
        `INSERT INTO indice (date, indice, localisation_id)
         SELECT ?, ?, ?
         FROM DUAL
         WHERE NOT EXISTS (
           SELECT 1 FROM indice WHERE date = ? AND localisation_id = ?
         )`,
        [date, idx, locId, date, locId],
      );
      inserted += Number(insIndice.affectedRows || 0);
    }
  } finally {
    await pool.end();
  }

  return inserted;
}

parentPort.on("message", async (message) => {
  if (message?.type !== "ingest_csv") return;
  try {
    const inserted = await ingestCsvIntoDb();
    parentPort.postMessage({ type: "ingest_done", tick: message.tick, inserted });
  } catch (error) {
    parentPort.postMessage({
      type: "ingest_error",
      tick: message.tick,
      error: error instanceof Error ? error.message : "unknown error",
    });
  }
});