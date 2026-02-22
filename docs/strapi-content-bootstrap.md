# Strapi Content Bootstrap — Inventário de mocks e prática recomendada

## 1) Conteúdo mockado identificado no `clients/web`

### About

- `src/pages/about/components/hero.tsx`
  - Marca (`unk`), título, descrição completa hardcoded.
- `src/pages/about/components/clients.tsx`
  - Lista de clientes hardcoded em array.
- `src/pages/about/components/skills.tsx`
  - Lista de skills hardcoded em array.

### Home

- `src/pages/home/index.tsx`
  - Hero com título/subtítulo hardcoded.
  - Imagem de header hardcoded (`./images/header-1.png`).
  - Lista `projects` hardcoded com imagens locais.
  - Card com título/tags hardcoded (`Lovesicky`, `art direction`, `3D`, `branding`).

### Work

- `src/pages/work/index.tsx`
  - Conteúdo textual e blocos com `Lorem ipsum` hardcoded.

### Globais (layout)

- `src/components/footer.tsx`
  - Links, e-mail, branding, copyright hardcoded.
- `src/components/menu.tsx`
  - Itens de navegação e CTA hardcoded.
- `src/pages/work/components/marquee.tsx`
  - E-mail e microcopy hardcoded.

## 2) Strapi 5 — prática recomendada para abastecer conteúdo

Com base na documentação oficial atual do Strapi 5:

1. Use **database migrations** para mudanças de estrutura e transformações one-off de dados no banco.
2. Use **seed scripts** para conteúdo inicial/editorial de ambiente (dev, staging, demos).
3. Use **import/export/transfer** para mover conteúdo entre instâncias.

Referências oficiais:

- Database migrations: https://docs.strapi.io/cms/database-migrations
- Data management (import/export/transfer): https://docs.strapi.io/cms/features/data-management
- CLI: https://docs.strapi.io/cms/cli

### Observações importantes da doc (Strapi 5)

- Migrations executam automaticamente no startup e em ordem alfabética dos arquivos.
- Não há `down migration` oficial no momento.
- Para projeto TypeScript, `useTypescriptMigrations` deve estar habilitado para localizar migrations compiladas corretamente.

## 3) O que já foi preparado no repositório

No CMS:

- Script final de seed baseado nos mocks do web:
  - `clients/cms/scripts/seed.js`
- Dados de seed separados do script (fonte única):
  - `clients/cms/data/data.json`
- Comando oficial:
  - `yarn workspace cris-cms seed`
- Configuração de migrations TS habilitada:
  - `clients/cms/config/database.ts`

## 4) Como executar agora

Na raiz do monorepo:

1. `yarn workspace cris-cms seed`
2. `yarn workspace cris-cms develop`

Depois validar no Admin do Strapi:

- Single Type `Global`
- Single Type `About`
- Collection Type `Article`

## 5) Próximo passo recomendado (para remover 100% dos mocks)

1. Criar no Strapi um Single Type `Homepage` com campos para hero e projetos.
2. Criar um Single Type `Navigation` (menu/cta/footer contatos).
3. No web, trocar arrays hardcoded por hooks de dados (`TanStack Query`) consumindo a Content API.
4. Manter fallback em adapter mock até cada tela concluir migração.
