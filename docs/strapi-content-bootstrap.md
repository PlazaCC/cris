# Strapi Content Bootstrap — Inventário de mocks e prática recomendada

## 1) Conteúdo mockado identificado no `clients/web`

### About

- `src/pages/about/components/hero.tsx`
  - ✅ **Estrutura mapeada**: título, body, image (desktop/mobile)
- `src/pages/about/components/clients.tsx`
  - ✅ **Estrutura mapeada**: clients array
- `src/pages/about/components/skills.tsx`
  - ✅ **Estrutura mapeada**: skills array
- **Status**: Schema reformulado para estrutura explícita (singleType `about`)

### Home

- `src/pages/home/index.tsx`
  - Hero com título/subtítulo hardcoded.
  - Imagem de header hardcoded (`./images/header-1.png`).
  - ✅ **Estrutura mapeada**: Lista `projects` com cover_images (desktop/mobile), badges, year, blur_color
  - Card com título/tags hardcoded → **migrado para Project.badges**
- **Status**: Content-type `project` criado com campos específicos de portfolio

### Work

- `src/pages/work/index.tsx`
  - ✅ **Estrutura mapeada**: Blocos de conteúdo com componentes portfolio
  - Componentes: `scope-block`, `quote-title-block`, `paragraph-block`, `images-block`, `results-block`
- **Status**: Dynamic zone em Project com componentes portfolio específicos

### Globais (layout)

- `src/components/footer.tsx`
  - Links, e-mail, branding, copyright hardcoded.
- `src/components/menu.tsx`
  - Itens de navegação e CTA hardcoded.
- `src/pages/work/components/marquee.tsx`
  - E-mail e microcopy hardcoded.
- **Status**: Mantido como global (já existente), aguarda migração futura

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

## 3) O que foi implementado (Schemas Portfolio-Specific)

### Content Types

- ✅ **`api::project.project`** (collectionType)
  - Substitui `article` com foco em portfolio
  - Campos: slug, title, description, year, blur_color, badges[], cover_images{responsive}, blocks[]
  - Controller, Service e Routes criados

- ✅ **`api::about.about`** (singleType) — **reformulado**
  - Estrutura explícita em vez de dynamic zone
  - Campos: title, body, clients[], skills[], image{responsive}, email

- ✅ **`api::global.global`** (singleType) — mantido
  - Para site metadata, favicon, SEO defaults

### Components

- ✅ **`shared.responsive-image`**
  - Reutilizável para desktop/mobile pattern
  - Usado em: cover_images, about.image, portfolio.images-block

- ✅ **`portfolio.scope-block`**
  - title (string), paragraphs (json/array)

- ✅ **`portfolio.quote-title-block`**
  - text (string)

- ✅ **`portfolio.paragraph-block`**
  - text (json/array)

- ✅ **`portfolio.images-block`**
  - images (repeatable shared.responsive-image)

- ✅ **`portfolio.result-item`**
  - value (string), positive (boolean), label (string)

- ✅ **`portfolio.results-block`**
  - results (repeatable portfolio.result-item)

### Seed Script

- Script atualizado: `clients/cms/scripts/seed.js`
  - Função `resolveResponsiveImage()` para componentes desktop/mobile
  - Função `resolveProjectPayload()` para projetos com novos componentes
  - Função `resolveAboutPayload()` com image{responsive}
  - Suporte a todos os blocos `portfolio.*`
- Dados atualizados: `clients/cms/data/data.json`
  - Estrutura de `about` com campos explícitos
  - Array `projects` com badges, year, blur_color, cover_images, blocks portfolio

### Tipos TypeScript

- Gerados automaticamente: `yarn strapi ts:generate-types`
- Localização: `clients/cms/types/generated/`
- Status: ✅ Validado (seed executou com sucesso)

## 4) Como executar agora

Na raiz do monorepo:

```bash
# Gerar tipos TypeScript após mudanças de schema
yarn workspace cris-cms strapi ts:generate-types

# Executar seed com novos dados
yarn workspace cris-cms seed

# Iniciar Strapi
yarn workspace cris-cms develop
```

Depois validar no Admin do Strapi:

- Single Type `Global` (metadata, favicon, SEO)
- Single Type `About` (title, body, clients, skills, image, email)
- Collection Type `Project` (slug, title, badges, year, blur_color, cover_images, blocks)

## 5) Próximo passo recomendado (para remover 100% dos mocks)

### 5.1 Implementar camada de adaptadores no web

Seguir [docs/dto-domain-mapping.md](./dto-domain-mapping.md) para criar:

- `lib/adapters/strapi-image.ts` — funções auxiliares de mapeamento de media
- `lib/adapters/project-adapter.ts` — DTO → Project domain
- `lib/adapters/about-adapter.ts` — DTO → AboutResponse domain
- `lib/adapters/global-adapter.ts` — DTO → GlobalConfig domain

### 5.2 Integrar TanStack Query

- Criar `features/projects/queries.ts` com `useProjects()` e `useProject(slug)`
- Criar `features/about/queries.ts` com `useAbout()`
- Validar DTOs com Zod na entrada dos adapters

### 5.3 Atualizar componentes

- Substituir mocks por hooks:
  - `pages/home/index.tsx` → `useProjects()`
  - `pages/about/index.tsx` → `useAbout()`
  - `pages/work/index.tsx` → `useProject(slug)` (página de detalhe)

### 5.4 Criar Single Types restantes

- **`api::navigation.navigation`** (menu/footer hardcoded)
- **`api::homepage.homepage`** (hero content, hero image)

### 5.5 Remover old schemas

- Deprecar `api::article.article` se não for mais necessário
- Deprecar componentes `shared.quote`, `shared.rich-text`, `shared.slider` se não forem mais usados

## 6) Referências

- [Engineering Rules](./engineering-rules.md) — baseline de arquitetura e convenções
- [DTO → Domain Mapping](./dto-domain-mapping.md) — guia detalhado de implementação de adapters
- [Strapi 5 Components](https://docs.strapi.io/dev-docs/backend-customization/models#components)
- [Strapi 5 Content-Types](https://docs.strapi.io/dev-docs/backend-customization/models#content-types)
