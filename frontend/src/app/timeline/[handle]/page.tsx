'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { authApiClient } from '@/utils/auth-api';
import { TimelineEventType } from '@/types/api';
import { TimelineView } from '@/components/Timeline';
import { useAuth } from '@/contexts/AuthContext';
import { useTimelineFilters } from '@/hooks/useTimelineFilters';

// This route is technically public, but access rules are gated by the backend API as follows:
// 1. If viewer IS authenticated and is the owner: Return PUBLIC + FRIENDS events
// 2. If viewer IS authenticated and has accepted share: Return PUBLIC + FRIENDS events
// 3. If user.is_public = True: Return all PUBLIC events (no auth required)
// 4. Otherwise: Return 404

export default function ViewTimeline() {
  const params = useParams();
  const { isMobile } = useAuth();
  const handle = params.handle as string;

  const [events, setEvents] = useState<TimelineEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<{
    name: string;
    profilePicture?: string;
  } | null>(null);

  // Use timeline filters hook
  const { filters, filteredEvents, hasActiveFilters, handleFilter, handleClearFilters } = useTimelineFilters(events);

  useEffect(() => {
    if (handle) {
      fetchTimelineData();
    }
  }, [handle]);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the timeline data from the backend
      const response = await authApiClient.getTimelineByHandle(handle);

      setEvents(response.events);
      setOwnerInfo({
        name: `${response.user.first_name}`.trim(),
        profilePicture: response.user.profile_picture,
      });
    } catch (err) {
      setError('Timeline not found or not accessible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TimelineView
      mode="viewer"
      filteredEvents={filteredEvents}
      totalEventCount={events.length}
      loading={loading}
      error={error}
      onFilter={handleFilter}
      onClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
      currentFilters={filters}
      ownerInfo={ownerInfo || undefined}
      isMobile={isMobile}
    />
  );
}
