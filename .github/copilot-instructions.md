# Copilot Instructions — CRIS

## Fonte de verdade

- Sempre seguir `docs/engineering-rules.md` como baseline de arquitetura, convenções e documentação.
- Em caso de conflito, priorizar a decisão arquitetural mais restritiva (maior separação de responsabilidades).

## Regras mandatórias

1. Aplicar Clean Architecture com dependências apontando para domínio/camadas internas.
2. Não colocar lógica de negócio em componente visual (`components`) nem em controller Strapi.
3. Não consumir API diretamente em páginas/componentes; usar camada de acesso a dados.
4. Manter validação de fronteira com Zod no web e validação/sanitização no CMS.
5. Evitar acoplamento entre contrato externo (DTO) e modelo interno de domínio.

## Contexto atual obrigatório

- `clients/cms` está em fase inicial de Strapi.
- `clients/web` ainda contém partes mockadas.
- Toda evolução deve facilitar migração de mocks para dados reais sem alterar UI desnecessariamente.

## Critérios de implementação

- Preferir mudanças pequenas, incrementais e com baixo risco.
- Preservar consistência com stack atual (React 19, Vite 6, Tailwind 4, TanStack Query 5, Router 1, Strapi 5).
- Antes de propor padrão novo, validar se já existe padrão equivalente no repositório.
