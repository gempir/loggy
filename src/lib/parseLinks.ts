import LinkifyIt from 'linkify-it'

export interface TextSegment {
  type: 'text' | 'link'
  content: string
  href?: string // The actual URL to link to (with protocol)
}

/**
 * Parse text and split it into text and link segments
 * Links will be made clickable with target="_blank"
 * Uses linkify-it library to detect URLs including those without protocols
 */
export function parseTextWithLinks(text: string): TextSegment[] {
  const segments: TextSegment[] = []

  // Initialize linkify-it
  const linkify = new LinkifyIt()

  // Find all links in the text
  const matches = linkify.match(text)

  if (!matches || matches.length === 0) {
    return [{ type: 'text', content: text }]
  }

  let lastIndex = 0

  for (const match of matches) {
    // Add any text before this match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      })
    }

    // Add the URL segment
    // Normalize http:// to https:// for security
    const href = match.url.replace(/^http:\/\//, 'https://')

    segments.push({
      type: 'link',
      content: match.text,
      href,
    })

    lastIndex = match.lastIndex
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  return segments
}
