'use client';

import { ReactNode, useMemo } from 'react';
import PillTabs from '@/components/tabs/pill-tabs';
import { usePathname, useRouter } from 'next/navigation';

export default function TabsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const current = useMemo(() => {
    if (pathname?.endsWith('/active')) return 'active';
    if (pathname?.endsWith('/completed')) return 'completed';
    if (pathname?.endsWith('/analytics')) return 'analytics';
    if (pathname?.endsWith('/dispute')) return 'dispute';
    return 'active-project';
  }, [pathname]);

  const tabs = [
    { label: 'Active project', value: 'active', href: '/onboarding/dashboard/active', component: <div /> },
    { label: 'Completed', value: 'completed', href: '/onboarding/dashboard/completed', component: <div /> },
    { label: 'Analytics', value: 'analytics', href: '/onboarding/dashboard/analytics', component: <div /> },
    { label: 'Dispute', value: 'dispute', href: '/onboarding/dashboard/dispute', component: <div /> },
  ];

  const sectionTitle = useMemo(() => {
    switch (current) {
      case 'active':
        return 'Manage Projects';
      case 'completed':
        return 'Manage Projects';
      case 'analytics':
        return 'Mobile App UI/UX design';
      case 'dispute':
        return 'Manage Projects';
      default:
        return '';
    }
  }, [current]);

  return (
    <>
      <h1 className='text-sm text-gray-700 bg-white p-4 rounded-lg text-center mb-6 font-semibold'>{sectionTitle}</h1>
      <div className='max-w-2xl mx-auto bg-white p-8 rounded-lg overflow-hidden'>
        <PillTabs
          tabs={tabs}
          value={current}
          onValueChange={(v) => {
            const target = tabs.find(t => t.value === v)?.href;
            if (target) router.push(target);
          }}
          renderContent={false}
          tabsListclassName='bg-[#002333] rounded-[8px] px-1 py-6 text-white'
          triggerClassName='text-white'
          activeTriggerClassName='data-[state=active]:bg-[#15949C] data-[state=active]:text-white'
          inactiveTriggerClassName='data-[state=inactive]:text-white/90'
        />
        <div className='mt-8 max-h-[70vh] overflow-y-auto no-scrollbar pr-1'>{children}</div>
      </div>
    </>
  );
}


