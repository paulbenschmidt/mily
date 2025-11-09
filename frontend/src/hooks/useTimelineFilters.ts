import { useState, useMemo } from 'react';
import { FilterOptions } from '@/components/Timeline/FilterDropdown';
import { TimelineEventType } from '@/types/api';

const INITIAL_FILTERS: FilterOptions = {
  startDate: null,
  endDate: null,
  categories: [], // Empty = All selected
  privacyLevels: [], // Empty = All selected
};

/**
 * Hook to manage timeline event filtering
 * Handles filter state, applying filters, and checking for active filters
 */
export function useTimelineFilters(events: TimelineEventType[]) {
  const [filters, setFilters] = useState<FilterOptions>(INITIAL_FILTERS);

  /**
   * Apply new filters, normalizing "all selected" to empty arrays
   */
  const handleFilter = (newFilters: FilterOptions) => {
    // If all categories are selected, clear the array (empty = all)
    const categories = newFilters.categories.length === 3 ? [] : newFilters.categories;
    // If all privacy levels are selected, clear the array (empty = all)
    const privacyLevels = newFilters.privacyLevels.length === 3 ? [] : newFilters.privacyLevels;

    setFilters({
      ...newFilters,
      categories,
      privacyLevels,
    });
  };

  /**
   * Clear all filters back to initial state
   */
  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  /**
   * Apply filters to events
   */
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.event_date);

      // Filter by date range
      if (filters.startDate && new Date(filters.startDate) > eventDate) {
        return false;
      }
      if (filters.endDate && new Date(filters.endDate) < eventDate) {
        return false;
      }

      // Filter by category - empty array means "All" (show all categories)
      if (filters.categories.length > 0 && filters.categories.length < 3 && !filters.categories.includes(event.category)) {
        return false;
      }

      // Filter by privacy level - empty array means "All" (show all levels)
      if (filters.privacyLevels.length > 0 && filters.privacyLevels.length < 3 && !filters.privacyLevels.includes(event.privacy_level)) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  /**
   * Check if any filters are currently active
   */
  const hasActiveFilters =
    filters.startDate !== null ||
    filters.endDate !== null ||
    (filters.categories.length > 0 && filters.categories.length < 3) ||
    (filters.privacyLevels.length > 0 && filters.privacyLevels.length < 3);

  return {
    filters,
    filteredEvents,
    hasActiveFilters,
    handleFilter,
    handleClearFilters,
  };
}
