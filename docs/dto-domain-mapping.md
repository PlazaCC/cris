# Mapeamento DTO → Domain (Strapi → Web)

## Visão Geral

Este documento define o mapeamento entre os DTOs retornados pela API do Strapi e os tipos de domínio usados no cliente web.

**Responsabilidade:** Camada de adaptadores (lib/adapters ou features/\*/adapters) deve implementar funções de mapeamento que transformam DTOs em tipos de domínio.

**Princípio:** DTOs não devem vazar para camadas internas. Componentes visuais e lógica de negócio devem consumir apenas tipos de domínio.

---

## 1. Project (Portfolio)

### DTO Strapi (API Response)

```typescript
// GET /api/projects?populate=deep
{
  data: [
    {
      id: number;
      documentId: string;
      attributes: {
        slug: string;
        title: string;
        description: string;
        year: string;
        blur_color: string;
        badges: string[];
        cover_images: {
          desktop: { data: { attributes: { url: string; ... } } };
          mobile: { data: { attributes: { url: string; ... } } };
        };
        blocks: Array<
          | { __component: 'portfolio.scope-block'; title: string; paragraphs: string[] }
          | { __component: 'portfolio.quote-title-block'; text: string }
          | { __component: 'portfolio.paragraph-block'; text: string[] }
          | { __component: 'portfolio.images-block'; images: [...] }
          | { __component: 'portfolio.results-block'; results: [...] }
        >;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
      };
    }
  ];
  meta: { pagination: {...} };
}
```

### Domain Type (Web)

```typescript
// clients/web/src/interfaces.ts
type Project = {
  slug: string
  title: string
  description: string
  badge: string[]
  year: string
  cover_images: { desktop: string; mobile: string }
  blocks: Block[]
  blur_color: string
}

type Block =
  | { type: 'scope'; title: string; paragraphs: string[] }
  | { type: 'quote-title'; text: string }
  | { type: 'paragraph'; text: string[] }
  | { type: 'images'; images: { desktop: string; mobile: string }[] }
  | {
      type: 'results'
      results: { value: string; positive: boolean; label: string }[]
    }
```

### Mapeamento (Adapter)

```typescript
// clients/web/src/lib/adapters/project-adapter.ts

function mapStrapiImageToUrl(strapiImage: any): string {
  return strapiImage?.data?.attributes?.url || ''
}

function mapStrapiResponsiveImage(component: any): {
  desktop: string
  mobile: string
} {
  return {
    desktop: mapStrapiImageToUrl(component.desktop),
    mobile: mapStrapiImageToUrl(component.mobile),
  }
}

function mapStrapiBlockToDomain(strapiBlock: any): Block {
  switch (strapiBlock.__component) {
    case 'portfolio.scope-block':
      return {
        type: 'scope',
        title: strapiBlock.title,
        paragraphs: strapiBlock.paragraphs,
      }

    case 'portfolio.quote-title-block':
      return {
        type: 'quote-title',
        text: strapiBlock.text,
      }

    case 'portfolio.paragraph-block':
      return {
        type: 'paragraph',
        text: strapiBlock.text,
      }

    case 'portfolio.images-block':
      return {
        type: 'images',
        images: strapiBlock.images.map(mapStrapiResponsiveImage),
      }

    case 'portfolio.results-block':
      return {
        type: 'results',
        results: strapiBlock.results.map((item: any) => ({
          value: item.value,
          positive: item.positive,
          label: item.label,
        })),
      }

    default:
      throw new Error(`Unknown block component: ${strapiBlock.__component}`)
  }
}

export function mapStrapiProjectToDomain(strapiProject: any): Project {
  const attrs = strapiProject.attributes

  return {
    slug: attrs.slug,
    title: attrs.title,
    description: attrs.description,
    badge: attrs.badges,
    year: attrs.year,
    blur_color: attrs.blur_color,
    cover_images: mapStrapiResponsiveImage(attrs.cover_images),
    blocks: attrs.blocks.map(mapStrapiBlockToDomain),
  }
}
```

---

## 2. About

### DTO Strapi (API Response)

```typescript
// GET /api/about?populate=deep
{
  data: {
    id: number;
    documentId: string;
    attributes: {
      title: string;
      body: string;
      clients: string[];
      skills: string[];
      image: {
        desktop: { data: { attributes: { url: string; ... } } };
        mobile: { data: { attributes: { url: string; ... } } };
      };
      email: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  meta: {};
}
```

### Domain Type (Web)

```typescript
// clients/web/src/interfaces.ts
type AboutResponse = {
  title: string
  body: string
  clients: string[]
  skills: string[]
  image: { desktop: string; mobile: string }
  email: string
}
```

### Mapeamento (Adapter)

```typescript
// clients/web/src/lib/adapters/about-adapter.ts

export function mapStrapiAboutToDomain(strapiAbout: any): AboutResponse {
  const attrs = strapiAbout.attributes

  return {
    title: attrs.title,
    body: attrs.body,
    clients: attrs.clients,
    skills: attrs.skills,
    image: mapStrapiResponsiveImage(attrs.image),
    email: attrs.email,
  }
}
```

---

## 3. Global

### DTO Strapi

```typescript
{
  data: {
    attributes: {
      siteName: string;
      siteDescription: string;
      favicon: { data: { attributes: { url: string; ... } } };
      defaultSeo: {
        metaTitle: string;
        metaDescription: string;
        shareImage: { data: { attributes: { url: string; ... } } };
      };
    };
  };
}
```

### Domain Type

```typescript
type GlobalConfig = {
  siteName: string
  siteDescription: string
  favicon: string
  defaultSeo: {
    metaTitle: string
    metaDescription: string
    shareImage: string
  }
}
```

### Mapeamento

```typescript
export function mapStrapiGlobalToDomain(strapiGlobal: any): GlobalConfig {
  const attrs = strapiGlobal.attributes

  return {
    siteName: attrs.siteName,
    siteDescription: attrs.siteDescription,
    favicon: mapStrapiImageToUrl(attrs.favicon),
    defaultSeo: {
      metaTitle: attrs.defaultSeo.metaTitle,
      metaDescription: attrs.defaultSeo.metaDescription,
      shareImage: mapStrapiImageToUrl(attrs.defaultSeo.shareImage),
    },
  }
}
```

---

## Diretrizes de Implementação

### 1. Estrutura de Pastas

```
clients/web/src/
  lib/
    adapters/
      about-adapter.ts
      project-adapter.ts
      global-adapter.ts
      strapi-image.ts  # Funções auxiliares compartilhadas
```

### 2. Validação com Zod

Sempre validar DTOs na entrada da camada de adaptadores:

```typescript
import { z } from 'zod'

const StrapiProjectDTOSchema = z.object({
  attributes: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    // ... demais campos
  }),
})

export function mapStrapiProjectToDomain(strapiProject: unknown): Project {
  const validated = StrapiProjectDTOSchema.parse(strapiProject)
  // ... restante do mapeamento
}
```

### 3. Uso com TanStack Query

```typescript
// clients/web/src/features/projects/queries.ts
import { useQuery } from '@tanstack/react-query'
import { mapStrapiProjectToDomain } from '@/lib/adapters/project-adapter'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch(
        'http://localhost:1337/api/projects?populate=deep'
      )
      const data = await response.json()
      return data.data.map(mapStrapiProjectToDomain)
    },
  })
}
```

### 4. Error Boundaries

Sempre envolver componentes que consomem dados da API com Error Boundaries para capturar erros de validação/mapeamento:

```tsx
// clients/web/src/pages/work/index.tsx
import { ErrorBoundary } from 'react-error-boundary'

export function WorkPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ProjectsList />
    </ErrorBoundary>
  )
}
```

---

## Checklist de Implementação

- [ ] Criar `lib/adapters/strapi-image.ts` com funções auxiliares
- [ ] Criar `lib/adapters/project-adapter.ts` com mapeamento de Project
- [ ] Criar `lib/adapters/about-adapter.ts` com mapeamento de About
- [ ] Criar `lib/adapters/global-adapter.ts` com mapeamento de Global
- [ ] Adicionar validação Zod em todos os adapters
- [ ] Criar `features/projects/queries.ts` com TanStack Query hooks
- [ ] Criar `features/about/queries.ts` com TanStack Query hooks
- [ ] Atualizar páginas para consumir hooks em vez de mocks
- [ ] Adicionar Error Boundaries nas rotas principais
- [ ] Atualizar testes unitários dos adapters
- [ ] Documentar estratégia de cache do TanStack Query

---

## Referências

- [Strapi 5 REST API Documentation](https://docs.strapi.io/dev-docs/api/rest)
- [TanStack Query v5](https://tanstack.com/query/v5)
- [Zod Validation](https://zod.dev/)
- [Clean Architecture - Adapters Layer](../engineering-rules.md#adaptadores)
