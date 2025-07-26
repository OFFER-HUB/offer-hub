import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PillTabsProps } from '@/types';
import React from 'react';
import clsx from 'clsx';

export default function PillTabs({
  tabs,
  defaultValue,
  className,
  tabsListclassName,
}: PillTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.value}
      className={className || 'w-full'}
    >
      <TabsList
        className={
          'inline-flex justify-start w-full gap-2 p-1 bg-transparent rounded-full ' +
          tabsListclassName
        }
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-medium transition-all',
              'data-[state=active]:bg-[#002333] data-[state=active]:text-white',
              'data-[state=inactive]:text-[#002333]'
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
}
