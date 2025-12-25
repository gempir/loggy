import { Link } from '@tanstack/react-router'
import { Github, MessageSquare } from 'lucide-react'
import { useApiConfig } from '@/hooks/useApiConfig'
import { useFavorites } from '@/hooks/useFavorites'
import { ApiSettings } from './ApiSettings'

export default function Header() {
  const { apiBaseUrl } = useApiConfig()
  const { favorites } = useFavorites()

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <img
                src="/logo.png"
                alt="Loggy"
                className="w-9 h-9 rounded-lg group-hover:opacity-90 transition-opacity"
              />
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-lg text-twitch">Loggy</span>
              </div>
            </Link>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0">
                <span className="text-text-muted text-sm flex-shrink-0">|</span>
                {favorites.map((favorite, index) => (
                  <Link
                    key={`${favorite.type}-${favorite.channel}-${favorite.user || ''}-${index}`}
                    to={favorite.type === 'channel' ? '/channel/$channel' : '/user/$channel/$user'}
                    params={
                      favorite.type === 'channel'
                        ? { channel: favorite.channel }
                        : { channel: favorite.channel, user: favorite.user! }
                    }
                    className="flex items-center gap-1 px-2 py-1 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    {favorite.type === 'channel' ? (
                      <span>#{favorite.channel}</span>
                    ) : (
                      <span>
                        #{favorite.channel}/{favorite.user}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
              activeProps={{
                className:
                  'flex items-center gap-2 px-3 py-2 text-sm text-text-primary bg-bg-secondary rounded-lg',
              }}
              activeOptions={{ exact: true }}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Channels</span>
            </Link>

            <a
              href={apiBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">API</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            <ApiSettings />

            <a
              href="https://github.com/gempir/loggy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
              title="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
