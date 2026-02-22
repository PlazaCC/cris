# CRIS

Monorepo with the Strapi CMS and the React web client.

## Packages

- `clients/cms`: Strapi v5 CMS
- `clients/web`: React 19 + Vite 6 front end

## Requirements

- Node 22.x
- Yarn 4.9.2

## Setup

```bash
yarn install
```

## Development

```bash
yarn dev
```

Local CMS runs from the terminal. Docker is only for the database.

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d
```

Local CMS uses its own env file.

```bash
cp clients/cms/.env.example clients/cms/.env
```

First run requires seed:

```bash
yarn seed:cms
```

Run a single package:

```bash
yarn workspace client-cms dev
yarn workspace client-web dev
```

## Docker

Production runs web and cms together:

```bash
cp .env.example .env
docker compose -f docker-compose.yml up -d --build
```

See `clients/cms/README.md` for CMS details.

## Docs

Architecture and contribution rules live in `docs/engineering-rules.md`.
