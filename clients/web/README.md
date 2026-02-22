# CRIS Web (React + Vite)

Frontend do portfólio integrado ao Strapi (`clients/cms`) com:

- TanStack Query para data fetching e cache
- Adapters DTO → Domain com validação de fronteira
- Hooks por feature (`about`, `projects`, `global`, `badges`)

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário:

```bash
VITE_STRAPI_API_URL=http://localhost:1337
VITE_STRAPI_API_TOKEN=
VITE_DEV_MODE=true
```

## Comandos

```bash
yarn workspace client-web dev
yarn workspace client-web build
yarn workspace client-web lint
```

## Fluxo local completo

1. Suba o CMS (`clients/cms`) e rode o seed.
2. Garanta permissões públicas para `about`, `project`, `badge` e `global`.
3. Suba o web e acesse a aplicação.

## Arquitetura (resumo)

- `src/lib/api`: client HTTP e endpoints do Strapi
- `src/lib/adapters`: mapeamento e isolamento de contrato externo
- `src/features/*/hooks`: hooks de query por contexto
- `src/pages/*`: composição de UI sem acesso direto à API
