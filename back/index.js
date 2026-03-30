import sql from 'mssql';

const config = {
    user: 'adm-dta',
    password: 'le1cp3ny1@', // Note : Changez ce mot de passe dès que possible !
    server: 'projet48h.database.windows.net',
    database: 'projet48h',
    port: 1433,
    options: {
        encrypt: true, // Obligatoire pour Azure
        trustServerCertificate: false // Mettre à true si vous avez des erreurs de certificat
    },
    authentication: {
        type: 'default'
    }
};

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