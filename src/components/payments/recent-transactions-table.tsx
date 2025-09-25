'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  MoreHorizontal,
  Download,
  Eye,
  Copy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

// Sample transaction data
const transactions = [
  {
    id: 'TRX-001',
    date: '2023-05-15',
    description: 'Website Redesign Project',
    amount: 1250.0,
    type: 'income',
    status: 'completed',
    client: 'TechCorp Inc.',
  },
  {
    id: 'TRX-002',
    date: '2023-05-10',
    description: 'Logo Design Project',
    amount: 450.0,
    type: 'income',
    status: 'completed',
    client: 'Creative Studios',
  },
  {
    id: 'TRX-003',
    date: '2023-05-05',
    description: 'Platform Fee',
    amount: 85.0,
    type: 'expense',
    status: 'completed',
    client: 'Offer Hub',
  },
  {
    id: 'TRX-004',
    date: '2023-05-01',
    description: 'Mobile App Development',
    amount: 2500.0,
    type: 'income',
    status: 'pending',
    client: 'StartUp Mobile',
  },
  {
    id: 'TRX-005',
    date: '2023-04-28',
    description: 'Content Writing',
    amount: 350.0,
    type: 'income',
    status: 'completed',
    client: 'Blog Media',
  },
];

export default function RecentTransactionsTable() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
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
          {transactions.map((transaction) => (
            <motion.tr
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className='border-b border-gray-100 hover:bg-gray-50'
              onMouseEnter={() => setHoveredRow(transaction.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className='py-4 px-4'>
                <div className='flex items-center'>
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                      transaction.type === 'income'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className='h-4 w-4 text-green-600' />
                    ) : (
                      <ArrowDownRight className='h-4 w-4 text-red-600' />
                    )}
                  </div>
                  <div>
                    <p className='font-medium text-[#002333]'>
                      {transaction.description}
                    </p>
                    <p className='text-xs text-[#002333]/70'>
                      {transaction.id}
                    </p>
                  </div>
                </div>
              </td>
              <td className='py-4 px-4 text-[#002333]'>
                {new Date(transaction.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className='py-4 px-4 text-[#002333]'>{transaction.client}</td>
              <td className='py-4 px-4'>
                <span
                  className={`font-medium ${
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}$
                  {transaction.amount.toFixed(2)}
                </span>
              </td>
              <td className='py-4 px-4'>
                <Badge
                  className={`${
                    transaction.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                </Badge>
              </td>
              <td className='py-4 px-4 text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='cursor-pointer'>
                      <Eye className='h-4 w-4 mr-2' />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer'>
                      <FileText className='h-4 w-4 mr-2' />
                      View Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer'>
                      <Download className='h-4 w-4 mr-2' />
                      Download Receipt
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer'>
                      <Copy className='h-4 w-4 mr-2' />
                      Copy Transaction ID
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
