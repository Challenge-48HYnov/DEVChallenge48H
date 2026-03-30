import sql from 'mssql';

const config = {
    user: 'adm-dta',
    password: 'le1cp3ny1@',
    server: 'projet48h.database.windows.net',
    database: 'projet48h',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    authentication: {
        type: 'default'
    }
};

async function seedDatabase() {
    try {
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('Connecté à la base de données');

        // Données fictives pour Localisation
        const localisations = [
            { pays: 'France', ville: 'Paris' },
            { pays: 'France', ville: 'Lyon' },
            { pays: 'Belgique', ville: 'Bruxelles' },
            { pays: 'Suisse', ville: 'Zurich' },
            { pays: 'Allemagne', ville: 'Berlin' }
        ];

        // Données fictives pour indice
        const indices = [
            { date: new Date('2024-01-15'), indice: 95.5, localisation_id: 1 },
            { date: new Date('2024-01-16'), indice: 98.2, localisation_id: 1 },
            { date: new Date('2024-01-15'), indice: 92.1, localisation_id: 2 },
            { date: new Date('2024-01-16'), indice: 94.3, localisation_id: 2 },
            { date: new Date('2024-01-15'), indice: 97.8, localisation_id: 3 },
            { date: new Date('2024-01-16'), indice: 96.5, localisation_id: 3 },
            { date: new Date('2024-01-15'), indice: 93.2, localisation_id: 4 },
            { date: new Date('2024-01-16'), indice: 91.7, localisation_id: 4 },
            { date: new Date('2024-01-15'), indice: 99.1, localisation_id: 5 },
            { date: new Date('2024-01-16'), indice: 98.9, localisation_id: 5 }
        ];

        // Vider les tables (si elles existent)
        try {
            await pool.request().query('DELETE FROM indice');
            console.log('Table indice vidée');
        } catch (err) {
            console.log('Table indice n\'existe pas encore ou erreur de suppression');
        }

        try {
            await pool.request().query('DELETE FROM Localisation');
            console.log('Table Localisation vidée');
        } catch (err) {
            console.log('Table Localisation n\'existe pas encore ou erreur de suppression');
        }

        // Insérer les localisations
        for (const loc of localisations) {
            await pool.request()
                .input('pays', sql.VarChar, loc.pays)
                .input('ville', sql.VarChar, loc.ville)
                .query('INSERT INTO Localisation (pays, ville) VALUES (@pays, @ville)');
        }
        console.log(`${localisations.length} localisations insérées`);

        // Insérer les indices
        for (const indice of indices) {
            await pool.request()
                .input('date', sql.DateTime, indice.date)
                .input('indice', sql.Float, indice.indice)
                .input('localisation_id', sql.Int, indice.localisation_id)
                .query('INSERT INTO indice (date, indice, localisation_id) VALUES (@date, @indice, @localisation_id)');
        }
        console.log(`${indices.length} indices insérés`);

        await pool.close();
        console.log('Données fictives ajoutées avec succès!');
    } catch (err) {
        console.error('Erreur:', err.message);
        process.exit(1);
    }
}

seedDatabase();
