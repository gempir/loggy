import { Camera, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export interface SnapshotButtonProps {
  isActive: boolean
  onStart: () => void
  onStop: () => void
  onPastSnapshot: (seconds: number) => void
}

export function SnapshotButton({ isActive, onStart, onStop, onPastSnapshot }: SnapshotButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleStartStop = () => {
    if (isActive) {
      onStop()
    } else {
      onStart()
      setShowDropdown(false)
    }
  }

  const handlePastSnapshot = (seconds: number) => {
    onPastSnapshot(seconds)
    setShowDropdown(false)
  }

  const pastOptions = [
    { label: 'Past 60 seconds', seconds: 60 },
    { label: 'Past 3 minutes', seconds: 180 },
    { label: 'Past 5 minutes', seconds: 300 },
  ]

  return (
    <div className="relative">
      <div className="flex items-stretch gap-0">
        {/* Main button */}
        <button
          type="button"
          onClick={handleStartStop}
          className={`flex items-center gap-2 px-3 py-2 rounded-l-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-accent hover:bg-accent-hover text-white'
          }`}
          title={isActive ? 'Stop snapshot' : 'Start snapshot'}
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">{isActive ? 'Stop' : 'Start'} Snapshot</span>
        </button>

        {/* Dropdown trigger */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isActive}
          className={`px-2 py-2 border-l rounded-r-lg text-sm transition-colors ${
            isActive
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 cursor-not-allowed opacity-75'
              : 'bg-accent hover:bg-accent-hover text-white border-accent-hover'
          }`}
          title="Snapshot options"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown menu */}
      {showDropdown && !isActive && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setShowDropdown(false)}
            aria-label="Close dropdown"
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 z-50 bg-bg-secondary border border-border rounded-lg shadow-xl overflow-hidden min-w-[180px]">
            <div className="p-2 border-b border-border">
              <span className="text-xs text-text-muted">Quick Snapshots</span>
            </div>
            {pastOptions.map((option) => (
              <button
                key={option.seconds}
                type="button"
                onClick={() => handlePastSnapshot(option.seconds)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-bg-hover transition-colors text-text-primary"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
