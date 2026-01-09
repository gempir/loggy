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

  // Create a new regex instance to avoid state issues
  const urlRegex =
    /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi

  let match = urlRegex.exec(text)
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
    match = urlRegex.exec(text)
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  // If no matches were found, return the entire text as one segment
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: text,
    })
  }

  return segments
}
