'use client';

import { Card, CardContent } from '@/components/ui/card';
import { requestedPaymentsCards } from '@/lib/mockData/analytics-mock-data';

export default function PaymentMetricsCards() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
      {requestedPaymentsCards.map((m, idx) => (
        <Card
          key={idx}
          className={
            m.variant === 'secondary'
              ? 'rounded-2xl border-[3px] border-[#7FE7E5] bg-[#E8FFFE]'
              : 'rounded-2xl border-[3px] border-[#FFE2A9] bg-[#FFF6E6]'
          }
        >
          <CardContent className='px-8 py-6'>
            <div className='text-[#6B7A89] text-sm text-center'>{m.label}</div>
            <div className='text-[#001821] text-[32px] leading-none font-extrabold mt-2 text-center'>${m.amount}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


