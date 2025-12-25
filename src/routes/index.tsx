import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, Hash, MessageSquare, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useApiConfig } from '@/hooks/useApiConfig'

export const Route = createFileRoute('/')({ component: HomePage })

interface Channel {
  name: string
  userID: string
}

async function fetchChannels(apiBaseUrl: string): Promise<Channel[]> {
  const response = await fetch(`${apiBaseUrl}/channels`)
  if (!response.ok) {
    throw new Error(`Failed to fetch channels: ${response.status}`)
  }
  const data = await response.json()
  return data.channels || []
}

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { apiBaseUrl } = useApiConfig()

  const {
    data: channels,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['channels', apiBaseUrl],
    queryFn: () => fetchChannels(apiBaseUrl),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const filteredChannels = useMemo(() => {
    if (!channels) return []
    if (!searchQuery.trim()) return channels

    const query = searchQuery.toLowerCase()
    return channels.filter((channel) => channel.name.toLowerCase().includes(query))
  }, [channels, searchQuery])

  return (
    <div className="px-4 py-6">
      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Stats Bar */}
      {channels && (
        <div className="flex items-center justify-center gap-6 mb-8 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-accent" />
            <span>
              <strong className="text-text-primary">{channels.length.toLocaleString()}</strong>{' '}
              channels
            </span>
          </div>
          {searchQuery && (
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-accent" />
              <span>
                <strong className="text-text-primary">
                  {filteredChannels.length.toLocaleString()}
                </strong>{' '}
                matching
              </span>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Loading channels..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorDisplay
          title="Failed to load channels"
          message={error instanceof Error ? error.message : 'Unknown error'}
          onRetry={() => refetch()}
        />
      )}

      {/* Channel Grid */}
      {!isLoading &&
        !error &&
        filteredChannels &&
        (filteredChannels.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No channels found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
            {filteredChannels.map((channel) => (
              <Link
                key={channel.userID}
                to="/channel/$channel"
                params={{ channel: channel.name }}
                className="group bg-bg-secondary border border-border rounded-lg p-4 hover:border-accent/50 hover:bg-bg-tertiary transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-twitch/20 rounded-lg flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-twitch" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                        #{channel.name}
                      </h3>
                      <p className="text-xs text-text-muted font-mono truncate">
                        ID: {channel.userID}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ))}
    </div>
  )
}
