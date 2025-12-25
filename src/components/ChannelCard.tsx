import { Link } from '@tanstack/react-router'
import { BarChart3, MessageSquare, User } from 'lucide-react'

interface ChannelCardProps {
  name: string
}

export function ChannelCard({ name }: ChannelCardProps) {
  return (
    <div className="group bg-bg-secondary border border-border rounded-lg p-4 hover:border-accent/50 hover:bg-bg-tertiary transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-twitch/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-twitch" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
              {name}
            </h3>
            <p className="text-xs text-text-muted">Twitch Channel</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/channel/$channel"
          params={{ channel: name }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary hover:bg-bg-hover border border-border rounded text-xs font-medium transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Logs
        </Link>
        <Link
          to="/channel/$channel/stats"
          params={{ channel: name }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary hover:bg-bg-hover border border-border rounded text-xs font-medium transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Stats
        </Link>
      </div>
    </div>
  )
}
