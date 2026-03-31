# Lancement rapide

```bash
git clone <URL_DU_REPO>
cd DEVChallenge48H
docker compose up -d --build
```

Site disponible sur :

[http://20.199.117.68/](http://20.199.117.68/)

# 🌍 DEVChallenge 48H - Atmospheric Indices Monitoring

Application web pour suivre et afficher les indices de qualité atmosphérique à travers différentes villes.

---

## 📋 Table des matières

- [Backend](#-backend)
- [Frontend](#-frontend)
- [Installation globale](#-installation-globale)
- [Structure du projet](#-structure-du-projet)

---

## 🔧 Backend

### Description
Le backend est une API Node.js/Express qui gère les données atmosphériques et les localisations.

**Technologies:**
- Node.js (ES modules)
- Express.js
- Base de données: MariaDB / SQL Server
- axios pour les requêtes HTTP

### Installation Backend

```bash
cd back
npm install
```

### Configuration Backend

Créez un fichier `.env` à la racine du projet:

```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=password
DB_DATABASE=projet48h
DB_ENCRYPT=true
DB_TRUST_CERT=false

# Pool de connexions
DB_POOL_MAX=10
```

### Scripts disponibles

```bash
# Démarrer le serveur
node back/endpoint.js

# Réinitialiser la base de données
node back/resetDatabase.js
```

### Points d'entrée API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/indices` | GET | Récupère les indices avec pagination et filtres |
| `/localisation` | POST | Ajoute une nouvelle localisation |
| `/indice` | POST | Ajoute un nouvel indice |

### Fichiers Backend

- **endpoint.js** - Serveur Express et routes API
- **constructSQL.js** - Construction dynamique des requêtes SQL
- **index.js** - Configuration et connexion à la base de données
- **field.js** - Schéma des champs et validation
- **resetDatabase.js** - Script pour réinitialiser et peupler la BD
- **worker.js** / **message_worker.js** - Traitement asynchrone toute les 500 secondes

### Modèle de données

```sql
-- Localisations
CREATE TABLE Localisation (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pays VARCHAR(100) NOT NULL,
  ville VARCHAR(100) NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(10,6)
);

-- Indices atmosphériques
CREATE TABLE Indice (
  id INT PRIMARY KEY AUTO_INCREMENT,
  indice FLOAT NOT NULL,
  localisation_id INT NOT NULL,
  date DATETIME NOT NULL,
  FOREIGN KEY (localisation_id) REFERENCES Localisation(id)
);
```

---

## 🎨 Frontend

### Description
Une application React moderne pour visualiser les données atmosphériques sur une carte interactive et consulter les détails.

**Technologies:**
- React 19 avec TypeScript
- Vite (bundler)
- Leaflet + React-Leaflet (cartes interactives)
- React Router
- CSS modulaire

### Installation Frontend

```bash
cd front
npm install
```

### Scripts Frontend

```bash
# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Vérifier le code (linting)
npm run lint

# Aperçu de la build
npm run preview
```

### Configuration Frontend

Le frontend se connecte au backend via les variables d'environnement définies dans `front/.env.local` (si nécessaire).

### Structure des composants

```
src/
├── components/
│   ├── atoms/              # Composants basiques (Icon, Chip, IconButton)
│   ├── molecules/          # Composants composés (SearchField, SideNavItem)
│   ├── organisms/          # Composants complexes (TopAppBar, SideNavBar, Modal)
│   └── templates/          # Layouts (AppLayout)
├── pages/                  # Pages principales (MapPage, AnalyticsPage)
├── api/                    # Clients API et types
├── lib/                    # Utilitaires (dateUtils, indexScoring)
└── styles/                 # Stylesheets CSS
```

### Pages disponibles

- **MapPage** - Visualisation interactive des indices sur carte
- **AnalyticsPage** - Anályse et statistiques

### Composants principaux

- **AtmosMap** - Carte Leaflet interactive
- **StationDetailsModal** - Détails d'une station
- **FilterDrawer** - Filtres de recherche
- **TopAppBar** - Barre supérieure
- **SideNavBar** - Navigation latérale

---

## 🚀 Installation globale

### Prérequis
- Node.js 18+
- npm ou yarn
- Base de données MariaDB/MySQL ou SQL Server

### Installation complète

```bash
# Clone/navigation au projet
cd DEVChallenge48H

# Installation du backend
cd back && npm install && cd ..

# Installation du frontend
cd front && npm install && cd ..

# Configurer le fichier .env à la racine
cp .env.example .env
# Éditer .env avec vos paramètres
```

### Démarrage du projet

**Terminal 1 - Backend:**
```bash
cd back && npm start
# ou
node endpoint.js
```

**Terminal 2 - Frontend:**
```bash
cd front && npm run dev
```

Le frontend sera généralement disponible à `http://localhost:5173`
Le backend à `http://localhost:3000`

---

## 📁 Structure du projet

```
DEVChallenge48H/
├── back/                      # Backend Node.js/Express
│   ├── endpoint.js
│   ├── constructSQL.js
│   ├── index.js
│   ├── field.js
│   ├── resetDatabase.js
│   ├── worker.js
│   └── message_worker.js
├── front/                     # Frontend React/TypeScript
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── init.sql                   # Script d'initialisation BD
├── .env                       # Variables d'environnement
├── package.json              # Dépendances root
└── readme.md                 # Cette documentation
```

---

## 📊 Données atmosphériques

L'indice varie généralement de 0 à 500:
- **0-50**: Excellent
- **51-100**: Bon
- **101-150**: Acceptable
- **151-200**: Mauvais
- **201+**: Très mauvais

---

## 🛠️ Développement

### Linting Frontend
```bash
cd front && npm run lint
```

### Build Production
```bash
cd front && npm run build
```

---

## 📝 Notes supplémentaires

- Le projet utilise ES modules (`"type": "module"` dans package.json)
- TypeScript est configuré strictement côté frontend
- Les variables d'environnement sensibles peuvent utiliser des fichiers secrets
- Le pool de connexions est limité à 10 par défaut (configurable)

---

