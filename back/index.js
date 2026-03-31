import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import mysql from "mysql2/promise";

dotenv.config({ path: "./.env" });

function getSecretValue(envVar, fallbackEnvVar = "") {
  const secretPath = process.env[envVar];
  if (secretPath) {
    return readFileSync(secretPath, "utf8").trim();
  }
  if (fallbackEnvVar) {
    return process.env[fallbackEnvVar];
  }
  return undefined;
}

const config = {
  host: process.env.DB_HOST || "db-proxy",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "app_user",
  database: process.env.DB_DATABASE || "projet48h",
  password: getSecretValue("DB_PASSWORD_FILE", "DB_PASSWORD"),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_MAX) || 10,
  queueLimit: 0,
};

let pool = null;

export async function initializeDatabase() {
  try {
    pool = mysql.createPool(config);
    await pool.query("SELECT 1");
    console.log(`Connexion MariaDB OK sur ${config.host}:${config.port}`);
  } catch (err) {
    console.error("Erreur lors de la connexion à la base de données:", err.message);
    throw err;
  }
}

export function getPool() {
  return pool;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log("Pool MariaDB fermé");
  }
}
