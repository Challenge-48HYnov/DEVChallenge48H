const { loadEnvFile } = require('node:process');
import sql from 'mssql';

try {
  loadEnvFile('../.env'); 
} catch (err) {
  console.error("Fichier .env introuvable, assurez-vous qu'il existe à la racine.");
}

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433, 
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', 
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
  authentication: {
    type: "default",
  },
};

console.log(`Tentative de connexion à : ${config.server}`);

// ... la suite de votre fonction connectAndQuery() ...

/*
    //Use Azure VM Managed Identity to connect to the SQL database
    const config = {
        server: process.env["db_server"],
        port: process.env["db_port"],
        database: process.env["db_database"],
        authentication: {
            type: 'azure-active-directory-msi-vm'
        },
        options: {
            encrypt: true
        }
    }

    //Use Azure App Service Managed Identity to connect to the SQL database
    const config = {
        server: process.env["db_server"],
        port: process.env["db_port"],
        database: process.env["db_database"],
        authentication: {
            type: 'azure-active-directory-msi-app-service'
        },
        options: {
            encrypt: true
        }
    }
*/

console.log("Starting...");
connectAndQuery("localisation");

async function connectAndQuery(table, country = "default", city = "default", indic = "default", localisation = "default", date = "default") {
  try {
    var poolConnection = await sql.connect(config);
    let request = await poolConnection.request();

    console.log("Reading rows from the Table...");
    var resultSet = await poolConnection.request().query(`SELECT * FROM Localisation`);
    console.log("Reading rows from the Table...");
    if (table == "localisation") {
      request.input("country", sql.VarChar, country);
      request.input("city", sql.VarChar, city);
      var resultSet = await request.query(
        "INSERT INTO Localisation (pays, ville) OUTPUT INSERTED.id, INSERTED.pays, INSERTED.ville VALUES (@country, @city)",
      );
    } else if (table == "indice") {
      request.input("indice", sql.Float, parseFloat(indic));
      request.input("localisation_id", sql.Int, parseInt(localisation));
      request.input("date", sql.DateTime, new Date(date));
      var resultSet = await request.query(
        "INSERT INTO Indice (indice, localisation_id, date) OUTPUT INSERTED.id, INSERTED.indice, INSERTED.localisation_id, INSERTED.date VALUES (@indice, @localisation_id, @date)",
      );
    }

    console.log(`${resultSet.recordset.length} rows returned.`);

    // output column headers
    var columns = "";
    for (var column in resultSet.recordset.columns) {
      columns += column + ", ";
    }
    console.log("%s\t", columns.substring(0, columns.length - 2));

    // output row contents from default record set
    resultSet.recordset.forEach((row) => {
      console.log("%s\t%s", row.CategoryName, row.ProductName);
    });

    // close connection only when we're certain application is finished
    poolConnection.close();
  } catch (err) {
    console.error(err.message);
  }
}
let pool = null;

// Initialiser le pool de connexions
export async function initializeDatabase() {
    try {
        pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('Pool de connexions établi avec succès');
    } catch (err) {
        console.error('Erreur lors de la connexion à la base de données:', err.message);
        throw err;
    }
}

// Exporter le pool pour utilisation dans les autres fichiers
export function getPool() {
    return pool;
}

// Fermer la connexion gracieusement
export async function closeDatabase() {
    if (pool) {
        await pool.close();
        console.log('Pool de connexions fermé');
    }
}
