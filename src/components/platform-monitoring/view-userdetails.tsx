import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Calendar, Copy, Filter, Heart, Search } from 'lucide-react';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const userDetailData = [
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Darlene Robertson',
    payerEmail: 'contact@smartsolu...',
    amount: '$850',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Guy Hawkins',
    payerEmail: 'contact@creativeh...',
    amount: '$770',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Esther Howard',
    payerEmail: 'support@innovative...',
    amount: '$900',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Wade Warren',
    payerEmail: 'info@dynamicdesig...',
    amount: '$750',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Devon Lane',
    payerEmail: 'hello@nextgenapps...',
    amount: '$780',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Kathryn Murphy',
    payerEmail: 'reachus@futuretec...',
    amount: '$720',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Cameron Williamson',
    payerEmail: 'connect@visionary...',
    amount: '$760',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Floyd Miles',
    payerEmail: 'team@pioneerdigit...',
    amount: '$730',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Ronald Richards',
    payerEmail: 'service@elevatede...',
    amount: '$740',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Annette Black',
    payerEmail: 'info@creativeinnov...',
    amount: '$800',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Dianne Russell',
    payerEmail: 'support@brilliantd...',
    amount: '$700',
  },
  {
    date: '4 April 2025 • 14:03:09',
    payerUserId: 'wdsh1245w',
    payerName: 'Theresa Webb',
    payerEmail: 'hello@cuttingedge...',
    amount: '$810',
  },
];
export default function ViewUserDetails() {
  //   const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    name: 'John D',
    role: 'UI/UX designer | Brand designer | Figma pro',
    location: 'Canada',
    avatar: '/placeholder.svg?height=60&width=60',
  });

  type Customer = {
    name: string;
    userId: string;
    email: string;
  };

  const handleViewAllTransactions = (customer: Customer) => {
    setSelectedUser({
      name: customer.name,
      role: 'UI/UX designer | Brand designer | Figma pro',
      location: 'Canada',
      avatar: '/placeholder.svg?height=60&width=60',
    });
    // setShowUserDetail(true);
  };

  return (
    <div>
      {' '}
      <div>
        {/* User Profile Card */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-4'>
              <Avatar className='w-16 h-16'>
                <AvatarImage src={selectedUser.avatar || '/placeholder.svg'} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='text-sm text-gray-500 mb-1'>
                  {selectedUser.name}
                </div>
                <div className='font-medium text-gray-900 mb-1'>
                  {selectedUser.role}
                </div>
                <div className='text-sm text-gray-500'>
                  {selectedUser.location}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3 mt-5'>
              <Heart className='w-5 h-5 text-red-500 fill-current' />
              <Button className='bg-slate-800 hover:bg-slate-700 text-white rounded-full'>
                Message
              </Button>
              <Button className='rounded-full' variant='destructive'>
                Restrict Account
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Filters */}
        <div className='flex items-center justify-between gap-4 mb-6 w-full'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input placeholder='Search by payer name' className='pl-10' />
          </div>
          <div className='flex gap-3 items-center'>
            <Button variant='outline' className='gap-2 bg-transparent'>
              <Calendar className='w-4 h-4' />
              Select date
            </Button>
            <Button variant='outline' className='gap-2 bg-transparent'>
              <Filter className='w-4 h-4' />
              Filter
            </Button>
            <Button className='bg-slate-800 hover:bg-slate-700 text-white'>
              Export Report
            </Button>
          </div>
        </div>
        {/* User Detail Table */}
        <div className='bg-white rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Payer User ID</TableHead>
                <TableHead>Payer Name</TableHead>
                <TableHead>Payer Email address</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userDetailData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className='text-sm'>{row.date}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <span className='text-blue-600'>{row.payerUserId}</span>
                      <Copy className='w-4 h-4 text-gray-400' />
                    </div>
                  </TableCell>
                  <TableCell>{row.payerName}</TableCell>
                  <TableCell className='text-sm text-gray-600'>
                    {row.payerEmail}
                  </TableCell>
                  <TableCell className='font-medium'>{row.amount}</TableCell>
                  <TableCell>
                    <Button
                      variant='link'
                      className='text-blue-600 p-0'
                      onClick={() =>
                        handleViewAllTransactions({
                          name: row.payerName,
                          userId: row.payerUserId,
                          email: row.payerEmail,
                        })
                      }
                    >
                      View all transactions
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
