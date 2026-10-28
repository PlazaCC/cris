const toIdToken = (value: string) => value.trim().replace(/[^\w-]+/g, '-')

/**
 * Exportações do Figma repetem ids entre arquivos (ex.: `paint0_linear_0_4`).
 * Com vários SVGs inline na mesma página, um passaria a usar o gradiente do
 * outro. Prefixa todos os ids e referências com `scope` e guarda o nome
 * original da camada em `data-name`, usado como seletor nas animações.
 *
 * Determinístico (sem ids aleatórios) para o HTML do SSR bater com a hidratação.
 */
export function scopeSvgIds(svg: string, scope: string) {
  const scoped = (id: string) => `${scope}-${toIdToken(id)}`

  return svg
    .replace(
      /\sid="([^"]+)"/g,
      (_, id: string) => ` id="${scoped(id)}" data-name="${id}"`
    )
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${scoped(id)})`)
    .replace(
      /(xlink:)?href="#([^"]+)"/g,
      (_, xlink: string | undefined, id: string) =>
        `${xlink ?? ''}href="#${scoped(id)}"`
    )
}
