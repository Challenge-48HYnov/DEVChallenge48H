import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import mysql from "mysql2/promise";

dotenv.config({ path: "./.env" });

function readSecret(pathVar, fallbackVar = "") {
  const path = process.env[pathVar];
  if (path) return readFileSync(path, "utf8").trim();
  if (fallbackVar) return process.env[fallbackVar];
  return undefined;
}

const config = {
  host: process.env.DB_HOST || "db-proxy",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "app_user",
  database: process.env.DB_DATABASE || "projet48h",
  password: readSecret("DB_PASSWORD_FILE", "DB_PASSWORD"),
};

async function seedDatabase() {
    try {
        const pool = mysql.createPool(config);
        await pool.query('SELECT 1');
        console.log('Connecté à la base de données');

        try {
            await pool.query('DELETE FROM indice');
            console.log('Table indice vidée');
        } catch (err) {
            console.log('Table indice n\'existe pas encore ou erreur de suppression');
        }

        try {
            await pool.query('DELETE FROM Localisation');
            console.log('Table Localisation vidée');
        } catch (err) {
            console.log('Table Localisation n\'existe pas encore ou erreur de suppression');
        }

        // Insérer les localisations
        for (const loc of localisations) {
            await pool.query('INSERT INTO Localisation (pays, ville) VALUES (?, ?)', [loc.pays, loc.ville]);
        }
        console.log(`${localisations.length} localisations insérées`);

        // Insérer les indices
        for (const indice of indices) {
            await pool.query(
                'INSERT INTO indice (date, indice, localisation_id) VALUES (?, ?, ?)',
                [indice.date, indice.indice, indice.localisation_id]
            );
        }
        console.log(`${indices.length} indices insérés`);

        await pool.end();
        console.log('Données fictives ajoutées avec succès!');
    } catch (err) {
        console.error('Erreur:', err.message);
        process.exit(1);
    }
}

seedDatabase();
