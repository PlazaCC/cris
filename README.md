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

Local CMS and Web use their own env files.

```bash
# Linux/macOS
cp clients/cms/.env.example clients/cms/.env
cp clients/web/.env.example clients/web/.env

# Windows (PowerShell)
Copy-Item clients/cms/.env.example clients/cms/.env
Copy-Item clients/web/.env.example clients/web/.env
```

Start the development database:

```bash
yarn dev:docker
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

Or run both packages together:

```bash
yarn dev
```

## Docker

Production runs web and cms together:

```bash
docker compose -f docker-compose.yml up -d --build
```

Stop development database:

```bash
yarn dev:docker:down
```

See `clients/cms/README.md` for CMS details.

## Docs

Architecture and contribution rules live in `docs/engineering-rules.md`.
