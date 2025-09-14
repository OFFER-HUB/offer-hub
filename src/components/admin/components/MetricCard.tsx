import type React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  timeframe: string;
  icon: React.ReactNode;
  iconColor: string;
}

export default function MetricCard({
  title,
  value,
  change,
  timeframe,
  icon,
  iconColor,
}: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500'>{title}</p>
            <h3 className='mt-1 text-2xl font-bold'>{value}</h3>
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              iconColor
            )}
          >
            {icon}
          </div>
        </div>

        <div className='mt-4 flex items-center'>
          {isPositive ? (
            <ArrowUpIcon className='h-4 w-4 text-green-500' />
          ) : (
            <ArrowDownIcon className='h-4 w-4 text-red-500' />
          )}
          <span
            className={cn(
              'ml-1 text-sm font-medium',
              isPositive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {Math.abs(change)}% {isPositive ? 'Up' : 'Down'}
          </span>
          <span className='ml-1 text-sm text-gray-500'>{timeframe}</span>
        </div>
      </CardContent>
    </Card>
  );
}
