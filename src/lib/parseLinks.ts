// URL detection regex that matches http, https, and common TLDs without protocol
const URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi

export interface TextSegment {
  type: 'text' | 'link'
  content: string
  href?: string // The actual URL to link to (with protocol)
}

/**
 * Parse text and split it into text and link segments
 * Links will be made clickable with target="_blank"
 */
export function parseTextWithLinks(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  let lastIndex = 0

  // Reset regex state
  URL_REGEX.lastIndex = 0

  let match = URL_REGEX.exec(text)
  while (match !== null) {
    const matchedText = match[0]
    const matchIndex = match.index

    // Add any text before this match
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, matchIndex),
      })
    }

    // Add the URL segment
    // If the URL doesn't start with a protocol, add https://
    const href = matchedText.match(/^https?:\/\//i) ? matchedText : `https://${matchedText}`

    segments.push({
      type: 'link',
      content: matchedText,
      href,
    })

    lastIndex = matchIndex + matchedText.length
    match = URL_REGEX.exec(text)
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  // If no URLs were found, return the original text as a single segment
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: text,
    })
  }

  return segments
}
