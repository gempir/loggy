import { useEffect, useRef, useState } from 'react'
import type { ParsedEmote } from '@/hooks/useChannelEmotes'

interface EmoteProps {
  emote: ParsedEmote
}

export function Emote({ emote }: EmoteProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<'above' | 'below'>('above')
  const emoteRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Get larger emote URLs for tooltip (3x size)
  const largeAvifUrl = emote.urlAvif?.replace(/\/1x\./, '/3x.')
  const largeWebpUrl = emote.urlWebp?.replace(/\/1x\./, '/3x.')
  const largeFallbackUrl = emote.url.replace(/\/1x\./, '/3x.')

  useEffect(() => {
    if (showTooltip && emoteRef.current) {
      const rect = emoteRef.current.getBoundingClientRect()
      const spaceAbove = rect.top
      const tooltipHeight = 140 // Approximate tooltip height

      // If not enough space above, show below
      if (spaceAbove < tooltipHeight) {
        setTooltipPosition('below')
      } else {
        setTooltipPosition('above')
      }
    }
  }, [showTooltip])

  return (
    <span
      ref={emoteRef}
      role="img"
      aria-label={emote.name}
      className="relative inline-block align-middle mx-px cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Use <picture> for optimal format with fallback */}
      <picture>
        {emote.urlAvif && <source srcSet={emote.urlAvif} type="image/avif" />}
        {emote.urlWebp && <source srcSet={emote.urlWebp} type="image/webp" />}
        <img
          src={emote.url}
          alt={emote.name}
          title={emote.name}
          className="inline-block align-middle h-[1.75em] w-auto"
          loading="lazy"
        />
      </picture>

      {/* Tooltip */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 flex flex-col items-center gap-2 px-3 py-2.5 rounded-lg bg-black/85 backdrop-blur-sm border border-white/10 shadow-xl whitespace-nowrap pointer-events-none ${
            tooltipPosition === 'above'
              ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
              : 'top-full left-1/2 -translate-x-1/2 mt-2'
          }`}
          style={{ minWidth: '120px' }}
        >
          {/* Large emote preview with format fallback */}
          <picture>
            {largeAvifUrl && <source srcSet={largeAvifUrl} type="image/avif" />}
            {largeWebpUrl && <source srcSet={largeWebpUrl} type="image/webp" />}
            <img
              src={largeFallbackUrl}
              alt={emote.name}
              className="h-16 w-auto object-contain"
              loading="lazy"
            />
          </picture>

          {/* Emote name */}
          <span className="text-white font-semibold text-sm">{emote.name}</span>

          {/* Author */}
          {emote.ownerName && <span className="text-gray-400 text-xs">by {emote.ownerName}</span>}

          {/* 7TV badge */}
          <div className="flex items-center gap-1.5 text-xs">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 109.6 80.9"
              fill="currentColor"
              role="img"
              aria-label="7TV"
            >
              <title>7TV</title>
              <path
                fill="#4FC2BC"
                d="M85.4,0H24.2L0,40.5l24.2,40.4h61.2l24.2-40.4L85.4,0z M75.8,64.9H33.8L12.8,40.5l21-24.4h42l21,24.4L75.8,64.9z"
              />
              <polygon
                fill="#4FC2BC"
                points="67.6,27.4 50.8,27.4 43.2,36.2 50.8,45 59.3,45 51.7,53.5 59.3,53.5 74.8,36.2"
              />
            </svg>
            <span className="text-[#4FC2BC] font-medium">7TV</span>
          </div>

          {/* Tooltip arrow */}
          <div
            className={`absolute w-2.5 h-2.5 bg-black/85 border border-white/10 rotate-45 ${
              tooltipPosition === 'above'
                ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0'
                : 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0'
            }`}
          />
        </div>
      )}
    </span>
  )
}
