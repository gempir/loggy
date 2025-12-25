import { useQuery } from '@tanstack/react-query'
import type { FullMessage } from '@/api/model'

export interface ParsedEmote {
  id: string
  name: string
  url: string
  ownerName?: string
  animated: boolean
}

export type EmoteMap = Map<string, ParsedEmote>

interface EmoteFile {
  name: string
  format?: string
}

interface EmoteHost {
  url?: string
  files?: EmoteFile[]
}

interface EmoteData {
  host?: EmoteHost
  animated?: boolean
  owner?: {
    display_name?: string
    username?: string
  }
}

interface ActiveEmote {
  id: string
  name: string
  data?: EmoteData
}

interface EmoteSetResponse {
  id: string
  emotes?: ActiveEmote[]
}

// The /v3/users/{platform}/{id} endpoint returns a connection directly
interface UserConnectionResponse {
  id: string
  platform: string
  username: string
  display_name: string
  emote_set_id?: string
  emote_set?: EmoteSetResponse
}

async function fetchChannelEmotes(channelId: string): Promise<EmoteMap> {
  const emoteMap: EmoteMap = new Map()

  if (!channelId) {
    return emoteMap
  }

  try {
    // Fetch the 7TV user connection by their Twitch ID
    const response = await fetch(`https://7tv.io/v3/users/twitch/${channelId}`)

    if (!response.ok) {
      // Channel might not have 7TV emotes
      console.log('7TV API response not OK:', response.status)
      return emoteMap
    }

    const connectionData = (await response.json()) as UserConnectionResponse

    // The emote_set is directly on the connection response
    if (!connectionData.emote_set?.emotes) {
      console.log('No emote set found for channel')
      return emoteMap
    }

    // Build the emote map
    for (const emote of connectionData.emote_set.emotes) {
      const emoteData = emote.data
      if (!emoteData) continue

      // Build the CDN URL for the emote
      // 7TV CDN format: https://cdn.7tv.app/emote/{emote_id}/{size}.{format}
      const baseUrl = emoteData.host?.url || `//cdn.7tv.app/emote/${emote.id}`
      const files = emoteData.host?.files || []

      // Find the best file for display (prefer WEBP, fallback to others)
      const preferredFile =
        files.find((f) => f.name === '1x.webp') ||
        files.find((f) => f.name === '1x.avif') ||
        files.find((f) => f.name === '1x.gif') ||
        files.find((f) => f.name === '1x.png') ||
        files[0]

      const fileName = preferredFile?.name || '1x.webp'

      emoteMap.set(emote.name, {
        id: emote.id,
        name: emote.name,
        url: `https:${baseUrl}/${fileName}`,
        ownerName: emoteData.owner?.display_name || emoteData.owner?.username,
        animated: emoteData.animated || false,
      })
    }

    console.log(`Loaded ${emoteMap.size} 7TV emotes for channel ID ${channelId}`)
  } catch (error) {
    console.error('Failed to fetch 7TV emotes for channel:', channelId, error)
  }

  return emoteMap
}

// Extract the Twitch channel ID from message tags
export function extractChannelId(messages: FullMessage[]): string | null {
  if (!messages || messages.length === 0) return null

  // Try to find the room-id tag in the first message
  const firstMessage = messages[0]
  if (firstMessage.tags && firstMessage.tags['room-id']) {
    return firstMessage.tags['room-id']
  }

  // Fallback: try to find it in any message
  for (const message of messages.slice(0, 10)) {
    if (message.tags?.['room-id']) {
      return message.tags['room-id']
    }
  }

  return null
}

export function useChannelEmotes(channelId: string | null) {
  return useQuery({
    queryKey: ['7tv-emotes', channelId],
    queryFn: () => fetchChannelEmotes(channelId || ''),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    enabled: !!channelId,
  })
}

// Parse message text and split into text segments and emotes
export interface MessagePart {
  type: 'text' | 'emote'
  content: string
  emote?: ParsedEmote
}

export function parseMessageWithEmotes(text: string, emoteMap: EmoteMap): MessagePart[] {
  if (!emoteMap || emoteMap.size === 0) {
    return [{ type: 'text', content: text }]
  }

  const parts: MessagePart[] = []
  const words = text.split(/(\s+)/)

  for (const word of words) {
    // Check if word is whitespace
    if (/^\s+$/.test(word)) {
      // Append to last text part or create new one
      if (parts.length > 0 && parts[parts.length - 1].type === 'text') {
        parts[parts.length - 1].content += word
      } else {
        parts.push({ type: 'text', content: word })
      }
      continue
    }

    const emote = emoteMap.get(word)
    if (emote) {
      parts.push({ type: 'emote', content: word, emote })
    } else {
      // Append to last text part or create new one
      if (parts.length > 0 && parts[parts.length - 1].type === 'text') {
        parts[parts.length - 1].content += word
      } else {
        parts.push({ type: 'text', content: word })
      }
    }
  }

  return parts
}
