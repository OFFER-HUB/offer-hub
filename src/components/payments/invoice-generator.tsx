'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Send,
  Copy,
  Calendar,
  DollarSign,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/text-area';
import { Badge } from '@/components/ui/badge';

// Sample invoice templates
const invoiceTemplates = [
  {
    id: 1,
    name: 'Standard Invoice',
    description: 'Basic invoice template for general use',
  },
  {
    id: 2,
    name: 'Detailed Project Invoice',
    description: 'Detailed template with project milestones',
  },
  {
    id: 3,
    name: 'Hourly Rate Invoice',
    description: 'Template for time-based billing',
  },
  {
    id: 4,
    name: 'Retainer Invoice',
    description: 'Template for recurring retainer agreements',
  },
];

// Sample clients
const clients = [
  {
    id: 1,
    name: 'TechCorp Inc.',
    email: 'billing@techcorp.com',
    address: '123 Tech St, San Francisco, CA',
  },
  {
    id: 2,
    name: 'Creative Studios',
    email: 'accounts@creativestudios.com',
    address: '456 Design Ave, New York, NY',
  },
  {
    id: 3,
    name: 'StartUp Mobile',
    email: 'finance@startupmobile.com',
    address: '789 App Blvd, Austin, TX',
  },
  {
    id: 4,
    name: 'Digital Marketing Co.',
    email: 'payments@digitalmarketing.com',
    address: '101 SEO Lane, Chicago, IL',
  },
];

// Sample recent invoices
const recentInvoices = [
  {
    id: 'INV-2023-001',
    client: 'TechCorp Inc.',
    date: '2023-05-15',
    amount: 1250.0,
    status: 'paid',
  },
  {
    id: 'INV-2023-002',
    client: 'Creative Studios',
    date: '2023-05-10',
    amount: 450.0,
    status: 'paid',
  },
  {
    id: 'INV-2023-003',
    client: 'StartUp Mobile',
    date: '2023-05-01',
    amount: 2500.0,
    status: 'pending',
  },
];

export default function InvoiceGenerator() {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [invoiceItems, setInvoiceItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { description: '', quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...invoiceItems];
    newItems.splice(index, 1);
    setInvoiceItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    setInvoiceItems(newItems);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((total, item) => total + item.amount, 0);
  };

  return (
    <motion.div
      variants={container}
      initial='hidden'
      animate='show'
      className='space-y-6'
    >
      <motion.div variants={item}>
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='create'>Create Invoice</TabsTrigger>
            <TabsTrigger value='history'>Invoice History</TabsTrigger>
          </TabsList>

          <TabsContent value='create' className='space-y-6 mt-6'>
            <Card>
              <CardHeader>
                <CardTitle>Create New Invoice</CardTitle>
                <CardDescription>
                  Generate a professional invoice for your clients
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <Label
                      htmlFor='invoice-number'
                      className='text-[#002333] font-medium'
                    >
                      Invoice Number
                    </Label>
                    <Input
                      id='invoice-number'
                      placeholder='INV-2023-001'
                      className='mt-1'
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor='invoice-date'
                      className='text-[#002333] font-medium'
                    >
                      Invoice Date
                    </Label>
                    <div className='relative mt-1'>
                      <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#002333]/70 h-4 w-4' />
                      <Input id='invoice-date' type='date' className='pl-10' />
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <Label
                      htmlFor='due-date'
                      className='text-[#002333] font-medium'
                    >
                      Due Date
                    </Label>
                    <div className='relative mt-1'>
                      <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#002333]/70 h-4 w-4' />
                      <Input id='due-date' type='date' className='pl-10' />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor='client'
                      className='text-[#002333] font-medium'
                    >
                      Client
                    </Label>
                    <Select>
                      <SelectTrigger className='mt-1'>
                        <SelectValue placeholder='Select a client' />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem
                            key={client.id}
                            value={client.id.toString()}
                          >
                            {client.name}
                          </SelectItem>
                        ))}
                        <SelectItem value='new'>+ Add New Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-medium text-[#002333]'>
                      Invoice Items
                    </h3>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 border-[#15949C] text-[#15949C]'
                      onClick={handleAddItem}
                    >
                      <Plus className='h-4 w-4 mr-1' />
                      Add Item
                    </Button>
                  </div>

                  <div className='space-y-4'>
                    {invoiceItems.map((item, index) => (
                      <div
                        key={index}
                        className='grid grid-cols-12 gap-4 items-center'
                      >
                        <div className='col-span-5'>
                          <Input
                            placeholder='Item description'
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'description',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className='col-span-2'>
                          <Input
                            type='number'
                            placeholder='Qty'
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'quantity',
                                Number.parseInt(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div className='col-span-2'>
                          <div className='relative'>
                            <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#002333]/70 h-4 w-4' />
                            <Input
                              type='number'
                              placeholder='Rate'
                              className='pl-10'
                              value={item.rate}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  'rate',
                                  Number.parseFloat(e.target.value)
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className='col-span-2'>
                          <div className='relative'>
                            <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#002333]/70 h-4 w-4' />
                            <Input
                              type='number'
                              placeholder='Amount'
                              className='pl-10'
                              value={item.amount}
                              disabled
                            />
                          </div>
                        </div>
                        <div className='col-span-1'>
                          {invoiceItems.length > 1 && (
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50'
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='flex justify-end mt-6'>
                    <div className='w-64 space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-[#002333]/70'>Subtotal</span>
                        <span className='font-medium'>
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-[#002333]/70'>Tax (0%)</span>
                        <span className='font-medium'>$0.00</span>
                      </div>
                      <Separator />
                      <div className='flex justify-between'>
                        <span className='font-medium text-[#002333]'>
                          Total
                        </span>
                        <span className='font-bold text-[#002333]'>
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor='notes' className='text-[#002333] font-medium'>
                    Notes
                  </Label>
                  <Textarea
                    id='notes'
                    placeholder='Add any additional notes or payment instructions...'
                    className='mt-1 min-h-[100px]'
                  />
                </div>

                <div className='flex justify-end gap-3'>
                  <Button
                    variant='outline'
                    className='border-[#15949C] text-[#15949C]'
                  >
                    <FileText className='h-4 w-4 mr-2' />
                    Save as Draft
                  </Button>
                  <Button
                    variant='outline'
                    className='border-[#15949C] text-[#15949C]'
                  >
                    <Download className='h-4 w-4 mr-2' />
                    Download PDF
                  </Button>
                  <Button className='bg-[#15949C] hover:bg-[#15949C]/90'>
                    <Send className='h-4 w-4 mr-2' />
                    Send Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='history' className='space-y-6 mt-6'>
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>
                  View and manage your past invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-100'>
                        <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                          Invoice #
                        </th>
                        <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                          Client
                        </th>
                        <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                          Date
                        </th>
                        <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                          Amount
                        </th>
                        <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                          Status
                        </th>
                        <th className='text-right py-3 px-4 text-[#002333]/70 font-medium'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((invoice) => (
                        <motion.tr
                          key={invoice.id}
                          variants={item}
                          className='border-b border-gray-100 hover:bg-gray-50'
                        >
                          <td className='py-4 px-4 font-medium text-[#002333]'>
                            {invoice.id}
                          </td>
                          <td className='py-4 px-4 text-[#002333]'>
                            {invoice.client}
                          </td>
                          <td className='py-4 px-4 text-[#002333]'>
                            {new Date(invoice.date).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </td>
                          <td className='py-4 px-4 font-medium text-[#002333]'>
                            ${invoice.amount.toFixed(2)}
                          </td>
                          <td className='py-4 px-4'>
                            <Badge
                              className={`${
                                invoice.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                            </Badge>
                          </td>
                          <td className='py-4 px-4 text-right'>
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 text-[#15949C]'
                              >
                                <FileText className='h-4 w-4 mr-2' />
                                View
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 text-[#15949C]'
                              >
                                <Copy className='h-4 w-4 mr-2' />
                                Duplicate
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
