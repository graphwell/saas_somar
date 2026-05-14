'use client';

import { useEffect, useState } from 'react';
import { TrialBanner } from './TrialBanner';

export function TrialBannerWrapper() {
  const [data, setData] = useState<{
    planType: string;
    messagesUsed: number;
    messagesLimit: number;
    periodEnd: string | null;
  } | null>(null);

  useEffect(() => {
    fetch('/api/user/dashboard-stats')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <TrialBanner
      planType={data.planType}
      messagesUsed={data.messagesUsed}
      messagesLimit={data.messagesLimit}
      expiresAt={data.periodEnd}
    />
  );
}
