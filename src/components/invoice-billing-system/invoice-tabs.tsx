'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InvoiceManagement from './invoice-management'
import InvoiceGenerator from './invoice-generator'
import InvoiceAnalytics from './invoice-analytics'
import { FileText, Plus, BarChart3 } from 'lucide-react'

export default function InvoiceTabs() {
  const [activeTab, setActiveTab] = useState('management')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='management' className='flex items-center gap-2'>
          <FileText className='h-4 w-4' />
          <span className='hidden sm:inline'>Invoice Management</span>
          <span className='sm:hidden'>Management</span>
        </TabsTrigger>
        <TabsTrigger value='create' className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          <span className='hidden sm:inline'>Create Invoice</span>
          <span className='sm:hidden'>Create</span>
        </TabsTrigger>
        <TabsTrigger value='analytics' className='flex items-center gap-2'>
          <BarChart3 className='h-4 w-4' />
          <span className='hidden sm:inline'>Analytics</span>
          <span className='sm:hidden'>Analytics</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value='management' className='mt-6'>
        <InvoiceManagement 
          onCreateInvoice={() => setActiveTab('create')}
        />
      </TabsContent>

      <TabsContent value='create' className='mt-6'>
        <InvoiceGenerator
          onInvoiceCreated={() => {
            setActiveTab('management')
          }}
        />
      </TabsContent>

      <TabsContent value='analytics' className='mt-6'>
        <InvoiceAnalytics />
      </TabsContent>
    </Tabs>
  )
}