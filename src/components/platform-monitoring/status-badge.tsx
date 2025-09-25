'use client';

import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'high' | 'low';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant={status === 'high' ? 'destructive' : 'secondary'}
      className={
        status === 'high'
          ? 'bg-orange-100 text-orange-800 hover:bg-orange-100'
          : 'bg-green-100 text-green-800 hover:bg-green-100'
      }
    >
      {status === 'high' ? 'High risk' : 'Low risk'}
    </Badge>
  );
}
