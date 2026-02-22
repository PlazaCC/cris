# Engineering Rules — CRIS Monorepo

## 1) Objetivo

Este documento define o baseline técnico do projeto para manter:

- Clean Architecture (dependências apontando para dentro)
- Separação de responsabilidades (UI, domínio, dados)
- Boas práticas de tipagem, validação e segurança
- Aderência à documentação oficial compatível com as versões usadas no repositório

## 2) Stack atual e versões (fonte: package.json do monorepo)

### Monorepo

- Node.js: `22.x` (obrigatório no root)
- Yarn: `4.9.2`
- Workspaces: `clients/*`, `shared/*`

### Web (`clients/web`)

- React `19.1.x`
- TypeScript `5.8.x`
- Vite `6.3.x`
- Tailwind CSS `4.1.x`
- TanStack Query `5.81.x`
- TanStack Router `1.124.x`
- Axios `1.10.x`
- Zustand `5.0.x`
- Zod `3.25.x`
- Radix UI (`@radix-ui/*`) para primitives de UI

### CMS (`clients/cms`)

- Strapi `5.36.1`
- Node suportado pelo CMS: `>=20 <=24` (compatível com root `22.x`)
- PostgreSQL driver: `pg 8.8.0`

## 3) Documentação oficial (usar sempre estas referências)

> Regra: para dúvidas de implementação, priorizar docs oficiais abaixo antes de blog/post aleatório.

- Node.js: https://nodejs.org/docs/latest-v22.x/api/
- Yarn Berry (v4): https://yarnpkg.com/features/workspaces
- TypeScript: https://www.typescriptlang.org/docs/
- React 19: https://react.dev/
- Vite: https://vite.dev/guide/
- Tailwind CSS v4: https://tailwindcss.com/docs/installation/using-vite
- TanStack Query v5: https://tanstack.com/query/v5
- TanStack Router v1: https://tanstack.com/router/latest
- Zod: https://zod.dev/
- Zustand: https://zustand.docs.pmnd.rs/
- Axios: https://axios-http.com/docs/intro
- Radix UI: https://www.radix-ui.com/primitives/docs/overview/introduction
- Strapi v5 docs: https://docs.strapi.io/
- Strapi CLI: https://docs.strapi.io/dev-docs/cli
- Strapi Content API: https://docs.strapi.io/cms/api/content-api

## 4) Baseline de Clean Architecture

## 4.1 Web (`clients/web/src`)

Camadas e responsabilidades:

- `pages/` e componentes de rota: **apenas apresentação e composição**.
- `components/`: componentes visuais e blocos reutilizáveis (sem regra de negócio).
- `features/` (criar para novos fluxos): casos de uso por contexto funcional.
- `entities/` (criar para novos fluxos): modelos de domínio, contratos e regras puras.
- `lib/` e `shared` (quando aplicável): utilitários técnicos e integrações.

Regras:

1. UI não acessa API diretamente.
2. Toda chamada HTTP deve passar por client/adapters centralizados.
3. DTO de API nunca vaza direto para componente sem mapeamento para tipo de domínio.
4. Validação de entrada/saída em fronteiras com Zod.
5. Hooks de dados (TanStack Query) ficam em `features/*/hooks` (ou pasta equivalente), não dentro de componentes de UI genéricos.

## 4.2 CMS (`clients/cms/src/api`)

Fluxo padrão:

- `routes` define contrato HTTP
- `controllers` orquestram request/response
- `services` concentram regra de negócio e acesso a dados

Regras:

1. Controller sem regra de negócio complexa.
2. Sanitização e validação de payload antes de persistir/publicar.
3. Reuso de service para evitar lógica duplicada entre endpoints.
4. Não acoplar estrutura de resposta a necessidades de tela específicas quando puder manter recurso consistente.

## 5) Estado atual do projeto e direção

Contexto atual:

- Strapi acabou de ser iniciado.
- Web ainda está com conteúdo mockado em código.

Diretriz de evolução:

1. Manter mocks apenas em camada de adapter (`mock repository`) e nunca embutido em componente de UI.
2. Introduzir client HTTP único para Strapi e tipar respostas.
3. Migrar página a página de mock para dados reais via Query hooks.
4. Criar mapeadores `Strapi -> Domain` por recurso (about, article, author, etc).

## 6) Convenções e qualidade

- TypeScript strict no web deve permanecer habilitado.
- Evitar `any`; quando inevitável, encapsular e documentar motivo.
- Componentes React: `PascalCase`; arquivos utilitários: `kebab-case`.
- Não misturar responsabilidade de estilo, estado de domínio e I/O no mesmo módulo.
- Toda nova dependência deve ser justificada e adicionada à seção de stack deste documento.

## 7) Definition of Done (DoD)

Uma entrega só está pronta quando:

1. Respeita camadas (sem violação de dependência).
2. Possui tipagem consistente de ponta a ponta.
3. Não mantém mock dentro de componente final.
4. Passa lint/build do pacote alterado.
5. Atualiza docs quando houver decisão arquitetural nova.
