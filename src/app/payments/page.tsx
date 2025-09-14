'use client'

import { useState } from 'react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import PaymentTabs from '@/components/payments/payment-tabs'
import PaymentOverview from '@/components/payments/payment-overview'
import PaymentHistory from '@/components/payments/payment-history'
import PendingPayments from '@/components/payments/pending-payments'
import InvoiceGenerator from '@/components/payments/invoice-generator'
import TaxDocuments from '@/components/payments/tax-documents'
import PaymentMethods from '@/components/payments/payment-methods'
import { User, Bell, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Simple Header component defined inline
function SimpleHeader() {
  return (
    <header className='border-b border-gray-200 bg-white'>
      <div className='container mx-auto px-4 max-w-7xl'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center'>
            <Link href='/' className='flex items-center'>
              <span className='text-xl font-bold text-[#15949C]'>Offer Hub</span>
            </Link>
            <nav className='ml-10 hidden space-x-8 md:flex'>
              <Link href='/find-workers' className='text-[#002333] hover:text-[#15949C]'>
                Find Talent
              </Link>
              <Link href='/post-project' className='text-[#002333] hover:text-[#15949C]'>
                Post a Project
              </Link>
              <Link href='/messages' className='text-[#002333] hover:text-[#15949C]'>
                Messages
              </Link>
              <Link href='/payments' className='text-[#15949C] font-medium'>
                Payments
              </Link>
            </nav>
          </div>
          <div className='flex items-center space-x-4'>
            <Button variant='ghost' size='icon' className='text-[#002333]'>
              <Search className='h-5 w-5' />
            </Button>
            <Button variant='ghost' size='icon' className='text-[#002333]'>
              <Bell className='h-5 w-5' />
            </Button>
            <Button variant='ghost' size='icon' className='text-[#002333]'>
              <User className='h-5 w-5' />
            </Button>
            <Button variant='ghost' size='icon' className='md:hidden text-[#002333]'>
              <Menu className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

// Simple Footer component defined inline
function SimpleFooter() {
  return (
    <footer className='bg-[#002333] text-white py-8'>
      <div className='container mx-auto px-4 max-w-7xl'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div>
            <h3 className='text-lg font-bold mb-4'>Offer Hub</h3>
            <p className='text-sm text-gray-300'>Connect with top freelancers and clients for your next project.</p>
          </div>
          <div>
            <h4 className='font-medium mb-4'>For Freelancers</h4>
            <ul className='space-y-2 text-sm text-gray-300'>
              <li>
                <a href='#' className='hover:text-white'>
                  Find Work
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Create Profile
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className='font-medium mb-4'>For Clients</h4>
            <ul className='space-y-2 text-sm text-gray-300'>
              <li>
                <a href='#' className='hover:text-white'>
                  Post a Project
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Find Freelancers
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Enterprise Solutions
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className='font-medium mb-4'>Resources</h4>
            <ul className='space-y-2 text-sm text-gray-300'>
              <li>
                <a href='#' className='hover:text-white'>
                  Help Center
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Blog
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Community
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className='border-t border-gray-700 mt-8 pt-8 text-sm text-gray-300'>
          <p>© {new Date().getFullYear()} Offer Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <SimpleHeader />

      <main className='flex-1'>
        <div className='bg-gradient-to-r from-[#002333] to-[#15949C] text-white py-10'>
          <div className='container mx-auto px-4 max-w-7xl'>
            <h1 className='text-3xl font-bold mb-2'>Payments & Invoicing</h1>
            <p className='opacity-90'>Manage your financial transactions, invoices, and payment methods</p>
          </div>
        </div>

        <div className='container mx-auto px-4 py-8 max-w-7xl'>
          <PaymentTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className='mt-6'>
            <TabsContent value='overview' className='mt-0'>
              <PaymentOverview />
            </TabsContent>

            <TabsContent value='history' className='mt-0'>
              <PaymentHistory />
            </TabsContent>

            <TabsContent value='pending' className='mt-0'>
              <PendingPayments />
            </TabsContent>

            <TabsContent value='invoices' className='mt-0'>
              <InvoiceGenerator />
            </TabsContent>

            <TabsContent value='tax' className='mt-0'>
              <TaxDocuments />
            </TabsContent>

            <TabsContent value='methods' className='mt-0'>
              <PaymentMethods />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SimpleFooter />
    </div>
  )
}

