'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Unassigned', value: 'unassigned' },
  { label: 'Active', value: 'active' },
  { label: 'Resolved', value: 'resolved' },
];

export default function DisputeTabs({ activeTab }: { activeTab: string }) {
  const pathname = usePathname();

  return (
    <div className='flex border-b gap-6'>
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={`${pathname}?tab=${tab.value}`}
          className={cn(
            'pb-2 border-b-2',
            activeTab === tab.value
              ? 'border-primary text-primary font-medium'
              : 'border-transparent text-muted-foreground hover:text-primary'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
