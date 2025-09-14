'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  ClockIcon,
  FileText,
  CreditCard,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

interface PaymentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function PaymentTabs({
  activeTab,
  setActiveTab,
}: PaymentTabsProps) {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className='h-4 w-4 mr-2' />,
    },
    {
      id: 'history',
      label: 'Payment History',
      icon: <Receipt className='h-4 w-4 mr-2' />,
    },
    {
      id: 'pending',
      label: 'Pending Payments',
      icon: <ClockIcon className='h-4 w-4 mr-2' />,
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: <FileText className='h-4 w-4 mr-2' />,
    },
    {
      id: 'tax',
      label: 'Tax Documents',
      icon: <FileSpreadsheet className='h-4 w-4 mr-2' />,
    },
    {
      id: 'methods',
      label: 'Payment Methods',
      icon: <CreditCard className='h-4 w-4 mr-2' />,
    },
  ];

  return (
    <div className='relative'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2'>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className='relative flex items-center justify-center'
            >
              {tab.icon}
              <span className='hidden sm:inline'>{tab.label}</span>
              <span className='sm:hidden'>
                {tab.id === 'overview'
                  ? 'Overview'
                  : tab.id === 'methods'
                  ? 'Methods'
                  : tab.label.split(' ')[0]}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId='activeTab'
                  className='absolute bottom-0 left-0 right-0 h-0.5 bg-[#15949C]'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
