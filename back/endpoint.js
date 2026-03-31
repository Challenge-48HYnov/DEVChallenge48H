import express from 'express';
import qs from 'qs';
import construct from './constructSQL.js';
import { getPool, initializeDatabase, closeDatabase } from './index.js';


const app = express();
const PORT = 3000;

app.set('query parser', (str) => qs.parse(str));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/health', async (_req, res) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(503).json({ status: 'down', db: 'disconnected' });
    }
    await pool.query('SELECT 1');
    return res.json({ status: 'up' });
  } catch {
    return res.status(503).json({ status: 'down' });
  }
});

app.get('/indices', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sort = req.query.sort;
    let filters = [];
    try {
      filters = construct.parseFilters(req.query);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    
    let fields = [];
    if (req.query.fields) {
      fields = req.query.fields.split(',');
    }
    
    const includeLocation = req.query.include === 'location';
    
    const select = construct.buildSelect(fields, includeLocation);
    const { clause: where, params: whereParams } = construct.buildWhere(filters);
    let order = construct.buildOrder(sort);
    
    // Pagination fallback
    if (!order) {
      order = 'ORDER BY p.id ASC';
    }
    
    const join = includeLocation ? 'LEFT JOIN Localisation l ON l.id = p.localisation_id' : '';
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM indice p 
      ${join}
      ${where}
    `;
    
    const dataQuery = `
      SELECT ${select}
      FROM indice p
      ${join}
      ${where}
      ${order}
      LIMIT ${limit} OFFSET ${offset}
    `;
    

    console.log('Requête de données:', dataQuery);
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Base de données non connectée' });
    }

    // Compter les résultats
    const [countResult] = await pool.query(countQuery, whereParams);
    
    const total = Number(countResult[0].total);
    const totalPages = Math.ceil(total / limit);
    
    // Récupérer les données
    const [dataResult] = await pool.query(dataQuery, whereParams);
    console.log('Données récupérées:', dataResult);
    const products = construct.formatResults(dataResult, fields, includeLocation);
    
    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});





app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Initialiser et démarrer le serveur
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erreur au démarrage du serveur:', err);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  console.log('\nFermeture du serveur...');
  await closeDatabase();
  process.exit(0);
});
