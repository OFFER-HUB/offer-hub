'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Sample payment history data
const paymentHistory = [
  {
    id: 'INV-2023-001',
    date: '2023-05-15',
    description: 'Website Redesign Project',
    amount: 1250.0,
    type: 'income',
    status: 'completed',
    client: 'TechCorp Inc.',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'INV-2023-002',
    date: '2023-05-10',
    description: 'Logo Design Project',
    amount: 450.0,
    type: 'income',
    status: 'completed',
    client: 'Creative Studios',
    paymentMethod: 'PayPal',
  },
  {
    id: 'FEE-2023-001',
    date: '2023-05-05',
    description: 'Platform Fee',
    amount: 85.0,
    type: 'expense',
    status: 'completed',
    client: 'Offer Hub',
    paymentMethod: 'Automatic Deduction',
  },
  {
    id: 'INV-2023-003',
    date: '2023-05-01',
    description: 'Mobile App Development',
    amount: 2500.0,
    type: 'income',
    status: 'pending',
    client: 'StartUp Mobile',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'INV-2023-004',
    date: '2023-04-28',
    description: 'Content Writing',
    amount: 350.0,
    type: 'income',
    status: 'completed',
    client: 'Blog Media',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'INV-2023-005',
    date: '2023-04-20',
    description: 'SEO Optimization',
    amount: 750.0,
    type: 'income',
    status: 'completed',
    client: 'Digital Marketing Co.',
    paymentMethod: 'PayPal',
  },
  {
    id: 'FEE-2023-002',
    date: '2023-04-15',
    description: 'Platform Fee',
    amount: 55.0,
    type: 'expense',
    status: 'completed',
    client: 'Offer Hub',
    paymentMethod: 'Automatic Deduction',
  },
  {
    id: 'INV-2023-006',
    date: '2023-04-10',
    description: 'UI/UX Design',
    amount: 1800.0,
    type: 'income',
    status: 'completed',
    client: 'Tech Innovations',
    paymentMethod: 'Bank Transfer',
  },
];

export default function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Filter payments based on search term and filters
  const filteredPayments = paymentHistory.filter((payment) => {
    const matchesSearch =
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <motion.div
      variants={container}
      initial='hidden'
      animate='show'
      className='space-y-6'
    >
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View and manage all your past transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col md:flex-row gap-4 mb-6'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Search transactions...'
                  className='pl-10'
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className='flex gap-2'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectItem value='completed'>Completed</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='income'>Income</SelectItem>
                    <SelectItem value='expense'>Expense</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant='outline' size='icon' className='h-10 w-10'>
                  <Calendar className='h-4 w-4' />
                </Button>

                <Button
                  variant='outline'
                  className='hidden md:flex items-center'
                >
                  <Filter className='h-4 w-4 mr-2' />
                  More Filters
                </Button>

                <Button className='bg-[#15949C] hover:bg-[#15949C]/90 hidden md:flex items-center'>
                  <Download className='h-4 w-4 mr-2' />
                  Export
                </Button>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-100'>
                    <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                      Transaction
                    </th>
                    <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                      Date
                    </th>
                    <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                      Client
                    </th>
                    <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                      Payment Method
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
                  {filteredPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      variants={item}
                      className='border-b border-gray-100 hover:bg-gray-50'
                    >
                      <td className='py-4 px-4'>
                        <div className='flex items-center'>
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                              payment.type === 'income'
                                ? 'bg-green-100'
                                : 'bg-red-100'
                            }`}
                          >
                            {payment.type === 'income' ? (
                              <ArrowUpRight className='h-4 w-4 text-green-600' />
                            ) : (
                              <ArrowDownRight className='h-4 w-4 text-red-600' />
                            )}
                          </div>
                          <div>
                            <p className='font-medium text-[#002333]'>
                              {payment.description}
                            </p>
                            <p className='text-xs text-[#002333]/70'>
                              {payment.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='py-4 px-4 text-[#002333]'>
                        {new Date(payment.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className='py-4 px-4 text-[#002333]'>
                        {payment.client}
                      </td>
                      <td className='py-4 px-4 text-[#002333]'>
                        {payment.paymentMethod}
                      </td>
                      <td className='py-4 px-4'>
                        <span
                          className={`font-medium ${
                            payment.type === 'income'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {payment.type === 'income' ? '+' : '-'}$
                          {payment.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className='py-4 px-4'>
                        <Badge
                          className={`${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {payment.status === 'completed'
                            ? 'Completed'
                            : 'Pending'}
                        </Badge>
                      </td>
                      <td className='py-4 px-4 text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 text-[#15949C]'
                        >
                          <FileText className='h-4 w-4 mr-2' />
                          View
                        </Button>
                      </td>
                    </motion.tr>
                  ))}

                  {filteredPayments.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className='py-8 text-center text-[#002333]/70'
                      >
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className='mt-6'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href='#' />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href='#' isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href='#'>2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href='#'>3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href='#' />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
