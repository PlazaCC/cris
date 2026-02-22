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

Run a single package:

```bash
yarn workspace cris-cms dev
yarn workspace client-web dev
```

## Docs

Architecture and contribution rules live in `docs/engineering-rules.md`.
