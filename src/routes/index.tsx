import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronRight, Hash, MessageSquare, Search, User } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [channelInput, setChannelInput] = useState('')
  const [userName, setUserName] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [channelError, setChannelError] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const { apiBaseUrl } = useApiConfig()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    if (!channelInput.trim()) return channels

    const query = channelInput.toLowerCase()
    return channels.filter((channel) => channel.name.toLowerCase().includes(query))
  }, [channels, channelInput])

  // Dropdown suggestions (limit to 8 for performance)
  const dropdownChannels = useMemo(() => {
    return filteredChannels.slice(0, 8)
  }, [filteredChannels])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const channel = channelInput.trim()
    const user = userName.trim()

    // If channel is empty, mark as required
    if (!channel) {
      setChannelError(true)
      inputRef.current?.focus()
      return
    }

    setChannelError(false)
    setShowDropdown(false)

    if (user) {
      // Navigate to user logs
      navigate({
        to: '/user/$channel/$user',
        params: { channel, user },
      })
    } else {
      // Navigate to channel
      navigate({
        to: '/channel/$channel',
        params: { channel },
      })
    }
  }

  const handleChannelInputChange = (value: string) => {
    setChannelInput(value)
    setChannelError(false)
    setShowDropdown(true)
    setHighlightedIndex(-1)
  }

  const selectChannel = (channelName: string) => {
    setChannelInput(channelName)
    setShowDropdown(false)
    setChannelError(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || dropdownChannels.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < dropdownChannels.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : dropdownChannels.length - 1))
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setHighlightedIndex(-1)
    } else if (e.key === 'Tab' && highlightedIndex >= 0) {
      e.preventDefault()
      selectChannel(dropdownChannels[highlightedIndex].name)
    }
  }

  // If Enter is pressed and an item is highlighted, select it instead of submitting
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showDropdown && highlightedIndex >= 0) {
      e.preventDefault()
      selectChannel(dropdownChannels[highlightedIndex].name)
    }
  }

  return (
    <div className="px-4 py-6">
      {/* Search Section */}
      <div className="mb-8 max-w-xl mx-auto">
        <form onSubmit={handleSearch} onKeyDown={handleFormKeyDown}>
          <div className="flex gap-2">
            {/* Channel Input with Autocomplete */}
            <div className="relative flex-1" ref={dropdownRef}>
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Channel"
                aria-label="Channel name"
                value={channelInput}
                onChange={(e) => handleChannelInputChange(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                className={`w-full pl-11 pr-4 py-3 bg-bg-secondary border rounded-lg focus:outline-none focus:ring-2 placeholder:text-text-muted ${
                  channelError
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : 'border-border focus:border-accent focus:ring-accent/20'
                }`}
              />

              {/* Autocomplete Dropdown */}
              {showDropdown && channelInput && dropdownChannels.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {dropdownChannels.map((channel, index) => (
                    <button
                      key={channel.userID}
                      type="button"
                      onClick={() => selectChannel(channel.name)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-colors ${
                        index === highlightedIndex
                          ? 'bg-accent/20 text-accent'
                          : 'hover:bg-bg-tertiary text-text-primary'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-twitch shrink-0" />
                      <span className="truncate">#{channel.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {channelError && (
                <p className="absolute -bottom-5 left-0 text-xs text-error">Channel is required</p>
              )}
            </div>

            {/* Username Input */}
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Username (optional)"
                aria-label="Username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-text-muted"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-5 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors shrink-0"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
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
          {channelInput && (
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
            <p>No channels found matching "{channelInput}"</p>
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
