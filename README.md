# TodoList App — Architecture Microservices

Application de gestion de projets et tâches en architecture microservices.

## Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [npm](https://www.npmjs.com/) >= 9
- [Docker](https://www.docker.com/) + Docker Compose (pour le déploiement complet)

---

## Lancer le projet avec Docker (recommandé)

La méthode la plus simple pour démarrer l'ensemble de la stack.

```bash
docker compose up --build
```

Cela démarre :
| Service | URL |
|---|---|
| Frontend (React) | http://localhost:5173 | 

| Nginx (reverse proxy) | http://localhost:8080 |

| Auth Service | http://localhost:3000 |

| Project Service | http://localhost:3001 |

| Task Service | http://localhost:3002 |

| Notification Service | http://localhost:3003 |

| RabbitMQ Management | http://localhost:15672 |


> Identifiants RabbitMQ par défaut : `guest` / `guest`

Pour arrêter et nettoyer les volumes :

```bash
docker compose down -v
```

---

## Installation manuelle (développement local)

### 1. Installer les dépendances racine

```bash
npm install
```

### 2. Installer les dépendances de chaque service

```bash
cd auth-service && npm install && cd ..
cd project-service && npm install && cd ..
cd task-service && npm install && cd ..
cd notification-service && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Variables d'environnement

Chaque service nécessite les variables suivantes (à créer dans un fichier `.env` dans chaque dossier de service) :

**auth-service/.env**
```env
PORT=3000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=auth_db
```

**project-service/.env**
```env
PORT=3001
AUTH_SERVICE_URL=http://localhost:3000
TASK_SERVICE_URL=http://localhost:3002
RABBITMQ_URL=amqp://localhost:5672
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=project_db
```

**task-service/.env**
```env
PORT=3002
PROJECT_SERVICE_URL=http://localhost:3001
RABBITMQ_URL=amqp://localhost:5672
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=task_db
```

**notification-service/.env**
```env
PORT=3003
RABBITMQ_URL=amqp://localhost:5672
```

### 4. Initialiser les bases de données

Créer les bases de données MySQL et exécuter les schémas SQL :

```bash
mysql -u root -p < auth-service/sql/schema.sql
mysql -u root -p < project-service/sql/migrations/schema.sql
mysql -u root -p < task-service/sql/schema.sql
```

### 5. Compiler et lancer chaque service

```bash
# Auth Service
cd auth-service
npm run build
npm start
cd ..

# Project Service
cd project-service
npm run build
npm start
cd ..

# Task Service
cd task-service
npm run build
npm start
cd ..

# Notification Service
cd notification-service
npm run build
npm start
cd ..
```

### 6. Lancer le frontend

```bash
npm run frontend:dev
```

Accessible sur http://localhost:5173

---

## Tests

### Tests unitaires (Vitest) — par service

Depuis le dossier de chaque service :

```bash
# Auth Service
cd auth-service && npm test

# Project Service
cd project-service && npm test

# Task Service
cd task-service && npm test

# Notification Service
cd notification-service && npm test
```

### Tests E2E (Playwright)

Les tests E2E nécessitent que la stack complète soit démarrée (via Docker ou manuellement).

Installer les navigateurs Playwright (première fois) :

```bash
npx playwright install
```

Lancer les tests :

```bash
npm run test:e2e
```

Les tests sont exécutés sur Chromium, Firefox et WebKit. Le rapport HTML est généré dans `playwright-report/`.

Pour afficher le rapport après les tests :

```bash
npx playwright show-report
```

---

## Qualité du code

### Lint (ESLint)

```bash
npm run lint
```

### Lint architecture (Dependency Cruiser)

Vérifie le respect des frontières entre microservices :

```bash
npm run lint:architecture
```

---

## Build TypeScript (racine)

```bash
npm run build
```

Compile le TypeScript vers `dist/`.

---

## Structure du projet

```
.
├── auth-service/          # Authentification JWT + gestion des utilisateurs
├── project-service/       # Gestion des projets (CRUD + RabbitMQ)
├── task-service/          # Gestion des tâches (CRUD + RabbitMQ)
├── notification-service/  # Notifications temps réel (WebSocket + RabbitMQ)
├── frontend/              # Application React (Vite)
├── nginx/                 # Configuration du reverse proxy
├── tests/                 # Tests E2E Playwright
└── docker-compose.yml     # Orchestration complète
```
