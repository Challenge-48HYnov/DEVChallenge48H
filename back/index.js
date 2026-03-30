const sql = require("mssql");

const config = {
  user: "adm-dta",
  password: "le1cp3ny1@", // Note : Changez ce mot de passe dès que possible !
  server: "projet48h.database.windows.net",
  database: "projet48h",
  port: 1433,
  options: {
    encrypt: true, // Obligatoire pour Azure
    trustServerCertificate: false, // Mettre à true si vous avez des erreurs de certificat
  },
  authentication: {
    type: "default",
  },
};

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

    var country = "test3";
    var city = "test5";

    var indic = "test8";
    var localisation = "test10";
    var date = "test12";

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
