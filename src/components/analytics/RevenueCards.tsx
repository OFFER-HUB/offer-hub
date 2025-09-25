'use client';

import { Card, CardContent } from '@/components/ui/card';
import { revenueMetricsMock } from '@/lib/mockData/analytics-mock-data';

export default function RevenueCards() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {revenueMetricsMock.map((m) => (
        <Card key={m.title}>
          <CardContent className='p-4'>
            <div className='text-sm text-gray-500'>{m.title}</div>
            <div className='text-2xl font-semibold mt-1'>{m.value}</div>
            {m.change && (
              <div className='text-xs text-emerald-600 mt-1'>{m.change}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


