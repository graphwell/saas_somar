'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Props {
  expiresAt: string | null;
  messagesUsed: number;
  messagesLimit: number;
  planType: string;
}

export function TrialBanner({ expiresAt, messagesUsed, messagesLimit, planType }: Props) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const diff = new Date(expiresAt).getTime() - Date.now();
    setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [expiresAt]);

  if (planType !== 'trial') return null;

  const msgPct = messagesLimit > 0 ? Math.round((messagesUsed / messagesLimit) * 100) : 0;
  const nearMsgLimit = msgPct >= 70;
  const nearExpiry = daysLeft !== null && daysLeft <= 5;

  if (!nearExpiry && !nearMsgLimit) return null;

  const urgent = (daysLeft !== null && daysLeft <= 2) || msgPct >= 90;

  return (
    <div className={`w-full px-4 py-2.5 flex items-center justify-between text-sm border-b ${
      urgent
        ? 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]'
        : 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]'
    }`}>
      <span className="font-medium">
        {nearExpiry && daysLeft !== null
          ? `⏳ Trial expira em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}`
          : `📊 ${msgPct}% das mensagens usadas hoje`}
        {nearExpiry && nearMsgLimit && ` · ${msgPct}% de mensagens usadas`}
      </span>
      <Link
        href="/plano"
        className="ml-4 text-xs font-bold underline underline-offset-2 whitespace-nowrap"
      >
        Fazer upgrade →
      </Link>
    </div>
  );
}
