'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';

export default function ConditionalAnalytics() {
  const [shouldTrack, setShouldTrack] = useState(true);

  useEffect(() => {
    const isExcluded = localStorage.getItem('mily_excludeFromAnalytics') === 'true';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const isProduction = apiUrl.includes('production');

    setShouldTrack(!isExcluded && isProduction);
  }, []);

  if (!shouldTrack) {
    return null;
  }

  return <Analytics />;
}
