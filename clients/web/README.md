# CRIS Web (TanStack Start)

Site do portfólio e painel de conteúdo (`/admin`) no mesmo app:

- Conteúdo no Postgres (Neon) via Drizzle, lido e gravado por server functions
- Imagens no Vercel Blob
- Login do painel com Better Auth
- Formulário "get in touch" salvo no banco, com aviso por e-mail (SMTP configurado no painel)

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`. Todas são só do servidor (sem prefixo `VITE_`).

## Comandos

```bash
yarn workspace client-web dev                  # http://localhost:4000
yarn workspace client-web build
yarn workspace client-web lint

yarn workspace client-web db:generate          # gera a migração depois de mudar o schema
yarn workspace client-web db:migrate           # aplica as migrações
yarn workspace client-web db:seed              # carrega seed/data.json + seed/uploads
yarn workspace client-web db:studio
yarn workspace client-web auth:create-admin <email> <senha> [nome]
```

## Arquitetura (resumo)

- `src/server`: código só do servidor (banco, auth, e-mail, sanitização)
- `src/features/*/api.ts`: server functions de leitura e escrita
- `src/features/*/hooks`: hooks de query e mutation por contexto
- `src/lib/adapters`: linha do banco → tipo de domínio
- `src/pages/*`: composição de UI (o painel fica em `pages/admin`)

Regras completas em `docs/engineering-rules.md`.
