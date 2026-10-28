import sanitizeHtml from 'sanitize-html'

/*
 * Os parágrafos dos blocos são HTML injetado na página pública com
 * dangerouslySetInnerHTML, então tudo que chega do painel passa por aqui
 * antes de ir para o banco: só formatação de texto e links sobrevivem.
 */
export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'a',
      'ul',
      'ol',
      'li',
    ],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
}
