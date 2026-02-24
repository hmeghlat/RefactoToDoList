# TodoList App

## Prérequis

- Node.js >= 18
- npm
- Docker (optionnel)

## Installation

```bash
npm install
```

---

## Lancer le projet

### En développement

```bash
npm run dev
```

Lance le backend avec rechargement automatique à chaque modification.

### En production

```bash
npm start
```

Compile le TypeScript puis démarre le serveur.

### Avec Docker

```bash
docker compose up
```

L'application est accessible sur `http://localhost:3000`.

---

## Frontend

### En développement

```bash
npm run frontend:dev
```

### Build

```bash
npm run frontend:build
```

---

## Tests

### Tous les tests unitaires (Jest)

```bash
npm test
```

### Tests de persistence uniquement

```bash
npm run test:persistence
```

### Tests de routes uniquement

```bash
npm run test:routes
```

### Tests end-to-end (Playwright)

```bash
npm run test:e2e
```

---

## Qualité du code

### Lint (ESLint)

```bash
npm run lint
```

### Lint architecture (dependency-cruiser)

```bash
npm run lint:architecture
```

---

## Build

```bash
npm run build
```

Compile le TypeScript vers `dist/`.
