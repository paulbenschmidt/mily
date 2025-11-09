'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';

export default function ConditionalAnalytics() {
  const [shouldTrack, setShouldTrack] = useState(true);

  useEffect(() => {
    const isExcluded = localStorage.getItem('mily_excludeFromAnalytics') === 'true';
    setShouldTrack(!isExcluded);
  }, []);

  if (!shouldTrack) {
    return null;
  }

  return <Analytics />;
}
