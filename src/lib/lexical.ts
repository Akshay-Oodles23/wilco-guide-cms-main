/**
 * Helpers for building Payload Lexical richText content programmatically.
 * Used when ingesting external content (e.g. Adzuna) that provides plain text.
 */

/** Strip HTML tags from string (e.g. from API descriptions). */
function stripHtml(html: string): string {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Build minimal Lexical editor state JSON from plain text.
 * Splits on double newlines for paragraphs. HTML in input is stripped.
 */
export function plainTextToLexical(plainText: string): { root: unknown } {
  const trimmed = stripHtml((plainText || '').trim())
  if (!trimmed) {
    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [{ type: 'text', format: 0, mode: 'normal', text: 'No description provided.', version: 1 }],
          },
        ],
      },
    }
  }

  const paragraphs = trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
  const children = paragraphs.map((para) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'text',
        format: 0,
        mode: 'normal',
        text: para.replace(/\n/g, ' ').slice(0, 50000),
        version: 1,
      },
    ],
  }))

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
    },
  }
}
