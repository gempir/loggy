import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, User } from 'lucide-react'
import { useState } from 'react'
import type { FullMessage, JsonLogsResponse } from '@/api/model'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LogList } from '@/components/LogList'
import { useApiConfig } from '@/hooks/useApiConfig'

type SearchParams = {
  q?: string
}

export const Route = createFileRoute('/user/$channel/$user/search')({
  component: UserSearchPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
    }
  },
})

async function searchUserLogs(
  apiBaseUrl: string,
  channel: string,
  user: string,
  query: string
): Promise<FullMessage[]> {
  const url = `${apiBaseUrl}/channel/${channel}/user/${user}/search?q=${encodeURIComponent(query)}&json=true`

  const response = await fetch(url)
  if (!response.ok) {
    if (response.status === 404) {
      return []
    }
    throw new Error(`Failed to search logs: ${response.status}`)
  }

  const data: JsonLogsResponse = await response.json()
  return data.messages || []
}

function UserSearchPage() {
  const { channel, user } = Route.useParams()
  const { q: initialQuery } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { apiBaseUrl } = useApiConfig()

  const [searchInput, setSearchInput] = useState(initialQuery || '')
  const [activeQuery, setActiveQuery] = useState(initialQuery || '')

  const {
    data: messages,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-search', channel, user, activeQuery, apiBaseUrl],
    queryFn: () => searchUserLogs(apiBaseUrl, channel, user, activeQuery),
    enabled: !!activeQuery,
    staleTime: 1000 * 60 * 5,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setActiveQuery(searchInput.trim())
      navigate({
        search: { q: searchInput.trim() },
      })
    }
  }

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
          <Link to="/" className="hover:text-accent transition-colors">
            Channels
          </Link>
          <span>/</span>
          <Link
            to="/channel/$channel"
            params={{ channel }}
            className="hover:text-accent transition-colors"
          >
            {channel}
          </Link>
          <span>/</span>
          <Link
            to="/user/$channel/$user"
            params={{ channel, user }}
            className="hover:text-accent transition-colors"
          >
            {user}
          </Link>
          <span>/</span>
          <span className="text-text-primary">Search</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-twitch/20 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-twitch" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Search {user}'s Logs</h1>
            <p className="text-text-secondary text-sm">in #{channel}</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-text-muted"
            />
          </div>
          <button
            type="submit"
            disabled={!searchInput.trim()}
            className="px-6 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {activeQuery && (
        <>
          {/* Result Count */}
          {messages && (
            <div className="text-text-secondary text-sm mb-4">
              {messages.length.toLocaleString()} messages found for "{activeQuery}"
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-20">
              <LoadingSpinner size="lg" text="Searching..." />
            </div>
          )}

          {/* Error State */}
          {error && (
            <ErrorDisplay
              title="Search failed"
              message={error instanceof Error ? error.message : 'Unknown error'}
              onRetry={() => refetch()}
            />
          )}

          {/* Results */}
          {!isLoading && !error && messages && (
            <LogList messages={messages} channelName={channel} />
          )}
        </>
      )}

      {/* Empty State */}
      {!activeQuery && (
        <div className="text-center py-12 text-text-secondary">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Enter a search query to find messages</p>
        </div>
      )}
    </div>
  )
}
