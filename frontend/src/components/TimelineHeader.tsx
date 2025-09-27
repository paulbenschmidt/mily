'use client';

import { useState } from 'react';
import { FilterDropdown, FilterOptions } from './FilterDropdown';

interface TimelineHeaderProps {
  onAddEvent?: () => void;
  onFilter?: (filters: FilterOptions) => void;
  onShare?: () => void;
  hasEvents?: boolean;
  currentFilters: FilterOptions;
}

export function TimelineHeader({ onAddEvent, onFilter, onShare, hasEvents = false, currentFilters }: TimelineHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">My Timeline</h1>
          {/* <p className="text-gray-600">A journey through life's moments</p> */}
        </div>

        <div className="flex items-center gap-2">
          {hasEvents && (
            <>
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${(currentFilters.startDate || currentFilters.endDate || currentFilters.category !== 'all') ? 'text-indigo-700 border-indigo-300' : 'text-gray-700 border-gray-300'} bg-white border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  Filter
                  {(currentFilters.startDate || currentFilters.endDate || currentFilters.category !== 'all') && (
                    <span className="ml-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
                  )}
                </button>
                <FilterDropdown 
                  isOpen={isFilterOpen}
                  onClose={() => setIsFilterOpen(false)}
                  onApplyFilters={(filters) => {
                    if (onFilter) onFilter(filters);
                  }}
                  currentFilters={currentFilters}
                />
              </div>
              <button
                onClick={onShare}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            </>
          )}
          {/* Add Event button only shown when there are events */}
          {hasEvents && (
            <button
              onClick={onAddEvent}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
