'use client';

import { ViewMode } from '@/hooks/useTimelineViewState';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Segmented control toggle for switching between Timeline and Story view modes.
 * Uses a pill indicator that animates between options.
 */
export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div
      className={`inline-flex items-center bg-secondary-100 rounded-lg p-0.5`}
      role="tablist"
      aria-label="View mode"
    >
      <button
        role="tab"
        aria-selected={viewMode === 'timeline'}
        aria-controls="timeline-view"
        onClick={() => onViewModeChange('timeline')}
        className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 ${
          viewMode === 'timeline'
            ? 'bg-white text-secondary-900 shadow-sm'
            : 'text-secondary-600 hover:text-secondary-900'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="hidden sm:inline">Timeline</span>
        </span>
      </button>

      <button
        role="tab"
        aria-selected={viewMode === 'story'}
        aria-controls="story-view"
        onClick={() => onViewModeChange('story')}
        className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 ${
          viewMode === 'story'
            ? 'bg-white text-secondary-900 shadow-sm'
            : 'text-secondary-600 hover:text-secondary-900'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="hidden sm:inline">Story</span>
        </span>
      </button>
    </div>
  );
}
