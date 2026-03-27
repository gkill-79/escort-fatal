# 🔥 Escorte Fatal

Plateforme d'annonces escortes — Next.js 14 · PostgreSQL 18 · Prisma · Socket.io · Stripe

## Stack

| Technologie | Rôle |
|---|---|
| Next.js 14 (App Router) | Framework React |
| TypeScript 5 | Typage statique |
| Tailwind CSS 3 | Styles utilitaires |
| PostgreSQL 18 | Base de données |
| Prisma ORM 5 | Accès données typé |
| NextAuth.js v5 | Authentification |
| Socket.io | Chat temps réel |
| Cloudflare R2 | Stockage médias |
| Stripe | Paiements |
| Redis (Upstash) | Cache + pub/sub |

## Démarrage rapide

### 1. Prérequis

- Node.js 20+
- Docker (pour PostgreSQL + Redis en local)

### 2. Installation

```bash
git clone https://github.com/votre-org/escorte-fatal
cd escorte-fatal
npm install
```

### 3. Variables d'environnement

```bash
cp .env.example .env
# Éditez .env avec vos valeurs
```

### 4. Base de données

```bash
# Démarrer PostgreSQL et Redis
docker-compose up -d

# Appliquer les migrations
npm run db:migrate

# Remplir les données initiales (villes, départements)
npm run db:seed
```

### 5. Lancer le serveur

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure du projet

```
escorte-fatal/
├── app/                    # Next.js App Router
│   ├── (public)/          # Pages publiques
│   ├── (auth)/            # Login / Register
│   ├── (dashboard)/       # Espace escorte
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Primitives (Button, Badge, Toast...)
│   ├── layouts/           # Header, Footer, Sidebar
│   └── features/          # Composants métier
├── lib/                   # Services, helpers, queries
├── prisma/                # Schema + migrations + seed
├── server/                # Serveur Socket.io custom
├── types/                 # TypeScript interfaces
└── store/                 # Zustand state
```

## Commandes

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run db:migrate   # Nouvelles migrations
npm run db:seed      # Seed initial
npm run db:studio    # Prisma Studio (GUI BDD)
npm run typecheck    # Vérification TypeScript
npm run lint         # ESLint
npm test             # Tests Jest
npm run test:e2e     # Tests Playwright
```

## Déploiement

### Vercel (recommandé)

```bash
vercel deploy
```

### Docker / VPS

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Licence

Propriétaire — Tous droits réservés.
