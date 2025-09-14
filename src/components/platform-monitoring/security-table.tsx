import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Copy } from 'lucide-react';
import FilterToolbar from './filter-toolbar';

// Sample data
const transactionData = [
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Darlene Robertson',
    email: 'contact@smartsolu...',
    amount: '$850',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Guy Hawkins',
    email: 'contact@creativeh...',
    amount: '$770',
    status: 'low',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Esther Howard',
    email: 'support@innovative...',
    amount: '$900',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Wade Warren',
    email: 'info@dynamicdesig...',
    amount: '$750',
    status: 'low',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Devon Lane',
    email: 'hello@nextgenapps...',
    amount: '$780',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Kathryn Murphy',
    email: 'reachus@futuretec...',
    amount: '$720',
    status: 'low',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Cameron Williamson',
    email: 'connect@visionary...',
    amount: '$760',
    status: 'low',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Floyd Miles',
    email: 'team@pioneerdigit...',
    amount: '$730',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Ronald Richards',
    email: 'service@elevatede...',
    amount: '$740',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Annette Black',
    email: 'info@creativeinnov...',
    amount: '$800',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Dianne Russell',
    email: 'support@brilliantd...',
    amount: '$700',
    status: 'high',
  },
  {
    date: '4 April 2025 • 14:03:09',
    userId: 'wdsh1245w',
    customerName: 'Theresa Webb',
    email: 'hello@cuttingedge...',
    amount: '$810',
    status: 'high',
  },
];
type Customer = {
  name: string;
  userId: string;
  email: string;
};
export default function SecurityAlertTable() {
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    name: 'John D',
    role: 'UI/UX designer | Brand designer | Figma pro',
    location: 'Canada',
    avatar: '/placeholder.svg?height=60&width=60',
  });
  console.log(selectedUser, showUserDetail);
  const handleUserClick = () => {
    setShowUserDetail(true);
  };

  const handleViewAllTransactions = (customer: Customer) => {
    setSelectedUser({
      name: customer.name,
      role: 'UI/UX designer | Brand designer | Figma pro',
      location: 'Canada',
      avatar: '/placeholder.svg?height=60&width=60',
    });
    setShowUserDetail(true);
  };
  return (
    <div>
      <FilterToolbar />
      <div className='bg-white rounded-lg border mt-3'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Email address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className='text-sm'>{row.date}</TableCell>
                <TableCell>
                  <Button
                    variant='link'
                    className='p-0 h-auto font-normal text-left'
                    onClick={handleUserClick}
                  >
                    {row.customerName}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <span className='text-blue-600'>{row.userId}</span>
                    <Copy className='w-4 h-4 text-gray-400' />
                  </div>
                </TableCell>
                <TableCell className='text-sm text-gray-600'>
                  {row.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.status === 'high' ? 'destructive' : 'secondary'
                    }
                    className={
                      row.status === 'high'
                        ? 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                        : 'bg-green-100 text-green-800 hover:bg-green-100'
                    }
                  >
                    {row.status === 'high' ? 'High risk' : 'Low risk'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant='link'
                    className='text-blue-600 p-0'
                    onClick={() =>
                      handleViewAllTransactions({
                        name: row.customerName,
                        userId: row.userId,
                        email: row.email,
                      })
                    }
                  >
                    View details of risk
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
