import { JSX } from 'react';
import PillTabs from '../tabs/pill-tabs';
import React from 'react';

interface TabItem {
  label: string;
  value: string;
  component: JSX.Element;
}

interface DisputeTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  tabsListclassName?: string;
}

export default function DisputeTabs({
  tabs,
  defaultValue = 'unassigned',
  className,
  tabsListclassName,
}: DisputeTabsProps) {
  return (
    <PillTabs
      tabs={tabs}
      defaultValue={defaultValue}
      className={className}
      tabsListclassName={tabsListclassName}
    />
  );
}
