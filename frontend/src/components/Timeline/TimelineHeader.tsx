'use client';

import { useState } from 'react';
import { FilterDropdown, FilterOptions } from './FilterDropdown';
import { SmallText, Button } from '@/components/ui';

interface TimelineHeaderProps {
  mode?: 'owner' | 'viewer';
  onAddEvent?: () => void;
  onFilter?: (filters: FilterOptions) => void;
  onShare?: () => void;
  hasEvents?: boolean;
  currentFilters: FilterOptions;
  title?: string;
  ownerInfo?: {
    name: string;
    profilePicture?: string;
  };
  isMobile: boolean;
}

export function TimelineHeader({
  onAddEvent,
  onFilter,
  onShare,
  hasEvents = false,
  currentFilters,
  mode = 'owner',
  title,
  ownerInfo,
  isMobile,
}: TimelineHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const displayTitle = title || (mode === 'owner' ? 'My Timeline' : `${ownerInfo?.name || 'User'}'s Timeline`);

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-secondary-200/50 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <SmallText className="font-semibold">{displayTitle}</SmallText>
        </div>

        <div className="flex items-center gap-2">
          {hasEvents && (
            <>
              <div className="relative">
                <Button
                  variant={(currentFilters.startDate || currentFilters.endDate || currentFilters.category !== 'all') ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <svg className={`w-4 h-4 ${!isMobile ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  {!isMobile && 'Filter'}
                  {(currentFilters.startDate || currentFilters.endDate || currentFilters.category !== 'all') && (
                    <span className="ml-1 w-2 h-2 bg-white rounded-full"></span>
                  )}
                </Button>
                <FilterDropdown
                  isOpen={isFilterOpen}
                  onClose={() => setIsFilterOpen(false)}
                  onApplyFilters={(filters) => {
                    if (onFilter) onFilter(filters);
                  }}
                  currentFilters={currentFilters}
                />
              </div>
              {/* Share button - only in owner mode */}
              {mode === 'owner' && onShare && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onShare}
                >
                  <svg className={`w-4 h-4 ${!isMobile ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  {!isMobile && 'Share'}
                </Button>
              )}
            </>
          )}
          {/* Add Event button - only in owner mode and when there are events */}
          {hasEvents && mode === 'owner' && onAddEvent && (
            <Button
              size="sm"
              onClick={onAddEvent}
            >
              <svg className={`w-4 h-4 ${!isMobile ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {!isMobile && 'Add Event'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
