'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentHistoryMock } from '@/lib/mockData/payment-history-mock';

export default function PaymentHistoryTable() {
  return (
    <Card className='rounded-2xl border border-[#E6EEF2] bg-[#F8F8F8]'>
      <CardHeader className='pb-0'>
        <CardTitle className='text-center text-[#35505F] text-[14px] font-bold'>
          Payment history
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-4'>
        <div className='no-scrollbar pr-2 divide-y divide-[#EDF3F6]'>
          {paymentHistoryMock.map((row) => (
            <div key={row.id} className='flex items-center justify-between py-4'>
              <div>
                <div className='text-[#2A3C46] text-[14px] font-medium'>{row.freelancer}</div>
                <div className='text-[#8AA2AF] text-[12px]'>{row.note}</div>
              </div>
              <div className='text-[#15949C] font-normal'>${row.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


