# Deep Populate Middleware

## Objetivo

Middleware customizado para Strapi v5 que permite populate profundo automático usando `populate=deep` na query string, eliminando a necessidade de especificar campos manualmente.

## Funcionamento

1. Intercepta requisições REST API com `populate=deep`
2. Analisa o schema do content type automaticamente
3. Constrói objeto de populate recursivo incluindo:
   - Relações (relations)
   - Componentes (components)
   - Media fields
   - Dynamic zones
4. Previne loops circulares com tracking de models visitados
5. Respeita limite de profundidade configurável

## Configuração

Em `config/middlewares.ts`:

```typescript
{
  name: 'global::deep-populate',
  config: {
    maxDepth: 5,  // Profundidade máxima de recursão
    excludeFields: ['createdBy', 'updatedBy'],  // Campos a ignorar
  },
}
```

## Uso

### Frontend

```typescript
// Antes (verboso, precisa atualizar ao adicionar campos)
const url =
  '/api/projects?populate[badges]=*&populate[cover_images][populate][0]=desktop&populate[cover_images][populate][1]=mobile&populate[blocks][on][portfolio.scope-block]=true...'

// Depois (genérico, nunca precisa mudar)
const url = '/api/projects?populate=deep'
```

### Exemplo de Resposta

Com `populate=deep`, o middleware automaticamente traz:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Lovesicky",
      "slug": "lovesicky-2025",
      "badges": [
        { "id": 1, "name": "3D", "slug": "3d", "color": "#3B82F6" }
      ],
      "cover_images": {
        "desktop": {
          "id": 5,
          "url": "/uploads/project_1.png",
          "formats": { "large": {...}, "medium": {...} }
        },
        "mobile": {
          "id": 6,
          "url": "/uploads/project_1_mobile.png",
          "formats": { "large": {...}, "medium": {...} }
        }
      },
      "blocks": [
        {
          "__component": "portfolio.images-block",
          "images": [
            {
              "desktop": { "id": 7, "url": "...", "formats": {...} },
              "mobile": { "id": 8, "url": "...", "formats": {...} }
            }
          ]
        }
      ]
    }
  ]
}
```

Todas as imagens, relações e componentes vêm populados automaticamente.

### Benefícios

- ✅ Não precisa alterar endpoints ao adicionar campos no CMS
- ✅ Traz todas as imagens, relações e componentes automaticamente
- ✅ Previne loops circulares
- ✅ Configurável (profundidade máxima)
- ✅ Fallback seguro para `populate=*` em caso de erro

## Mapeamento de Content Types

O middleware mapeia automaticamente os endpoints para seus UIDs:

- `/api/global` → `api::global.global`
- `/api/projects` → `api::project.project`
- `/api/badges` → `api::badge.badge`

Para novos content types, adicione no mapa `uidMap` em `deep-populate.ts`.

## Arquitetura

- **Separação de responsabilidades**: Lógica de populate no CMS (backend)
- **Frontend agnóstico**: Frontend apenas requisita `populate=deep`
- **Type-safe**: Usa tipos do Strapi Core
- **Extensível**: Fácil adicionar novos content types no mapa
