'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  FileText,
  User,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Sample pending payments data
const pendingPayments = [
  {
    id: 'PMT-001',
    projectName: 'Mobile App Development',
    client: 'StartUp Mobile',
    amount: 2500.0,
    dueDate: '2023-06-15',
    status: 'awaiting_payment',
    progress: 100,
    milestones: [
      { name: 'Design Phase', amount: 750, status: 'paid' },
      { name: 'Development Phase', amount: 1250, status: 'paid' },
      { name: 'Testing & Deployment', amount: 500, status: 'awaiting_payment' },
    ],
  },
  {
    id: 'PMT-002',
    projectName: 'E-commerce Website',
    client: 'Fashion Boutique',
    amount: 1800.0,
    dueDate: '2023-06-10',
    status: 'awaiting_approval',
    progress: 90,
    milestones: [
      { name: 'UI/UX Design', amount: 600, status: 'paid' },
      { name: 'Frontend Development', amount: 700, status: 'paid' },
      { name: 'Backend Integration', amount: 500, status: 'awaiting_approval' },
    ],
  },
  {
    id: 'PMT-003',
    projectName: 'Content Marketing Campaign',
    client: 'Health Products Inc.',
    amount: 950.0,
    dueDate: '2023-06-05',
    status: 'in_progress',
    progress: 65,
    milestones: [
      { name: 'Strategy Development', amount: 300, status: 'paid' },
      { name: 'Content Creation', amount: 400, status: 'in_progress' },
      { name: 'Distribution & Analytics', amount: 250, status: 'pending' },
    ],
  },
];

export default function PendingPayments() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'awaiting_payment':
        return (
          <Badge className='bg-amber-100 text-amber-800'>
            Awaiting Payment
          </Badge>
        );
      case 'awaiting_approval':
        return (
          <Badge className='bg-blue-100 text-blue-800'>Awaiting Approval</Badge>
        );
      case 'in_progress':
        return (
          <Badge className='bg-purple-100 text-purple-800'>In Progress</Badge>
        );
      case 'paid':
        return <Badge className='bg-green-100 text-green-800'>Paid</Badge>;
      case 'pending':
        return <Badge className='bg-gray-100 text-gray-800'>Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getTotalDue = () => {
    return pendingPayments.reduce((total, payment) => {
      if (payment.status === 'awaiting_payment') {
        return total + payment.amount;
      }
      return total;
    }, 0);
  };

  const getNextDueDate = () => {
    const dueDates = pendingPayments
      .filter((payment) => payment.status === 'awaiting_payment')
      .map((payment) => new Date(payment.dueDate));

    if (dueDates.length === 0) return null;

    return new Date(Math.min(...dueDates.map((date) => date.getTime())));
  };

  const nextDueDate = getNextDueDate();

  return (
    <motion.div
      variants={container}
      initial='hidden'
      animate='show'
      className='space-y-6'
    >
      <motion.div variants={item}>
        <Alert className='bg-[#DEEFE7]/30 border-[#15949C]'>
          <AlertCircle className='h-4 w-4 text-[#15949C]' />
          <AlertTitle className='text-[#002333] font-medium'>
            Payment Summary
          </AlertTitle>
          <AlertDescription className='text-[#002333]/70'>
            You have {pendingPayments.length} pending payments totaling $
            {getTotalDue().toFixed(2)}.
            {nextDueDate && (
              <span>
                {' '}
                The next payment is due on{' '}
                {nextDueDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                .
              </span>
            )}
          </AlertDescription>
        </Alert>
      </motion.div>

      <div className='grid grid-cols-1 gap-6'>
        {pendingPayments.map((payment, index) => (
          <motion.div key={payment.id} variants={item}>
            <Card>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>{payment.projectName}</CardTitle>
                    <CardDescription>
                      Project with {payment.client}
                    </CardDescription>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                  <div className='flex flex-col'>
                    <span className='text-sm text-[#002333]/70 mb-1'>
                      Amount Due
                    </span>
                    <span className='text-2xl font-bold text-[#002333]'>
                      ${payment.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-sm text-[#002333]/70 mb-1'>
                      Due Date
                    </span>
                    <span className='text-lg font-medium text-[#002333] flex items-center'>
                      <Calendar className='h-4 w-4 mr-2 text-[#15949C]' />
                      {new Date(payment.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-sm text-[#002333]/70 mb-1'>
                      Project Progress
                    </span>
                    <div className='flex items-center gap-2'>
                      <Progress value={payment.progress} className='h-2' />
                      <span className='text-sm font-medium'>
                        {payment.progress}%
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className='my-4' />

                <div className='space-y-3'>
                  <h4 className='font-medium text-[#002333]'>Milestones</h4>
                  {payment.milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center'>
                        {milestone.status === 'paid' ? (
                          <CheckCircle className='h-5 w-5 text-green-600 mr-3' />
                        ) : milestone.status === 'in_progress' ? (
                          <Clock className='h-5 w-5 text-purple-600 mr-3' />
                        ) : (
                          <XCircle className='h-5 w-5 text-gray-400 mr-3' />
                        )}
                        <span className='font-medium text-[#002333]'>
                          {milestone.name}
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='text-[#002333]'>
                          ${milestone.amount.toFixed(2)}
                        </span>
                        {getStatusBadge(milestone.status)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className='flex justify-end mt-6 gap-3'>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        className='border-[#15949C] text-[#15949C]'
                      >
                        <FileText className='h-4 w-4 mr-2' />
                        View Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invoice Details</DialogTitle>
                        <DialogDescription>
                          Invoice for {payment.projectName} with{' '}
                          {payment.client}
                        </DialogDescription>
                      </DialogHeader>
                      <div className='space-y-4 py-4'>
                        <div className='flex justify-between items-center'>
                          <div>
                            <p className='text-sm text-[#002333]/70'>
                              Invoice ID
                            </p>
                            <p className='font-medium'>{payment.id}</p>
                          </div>
                          <div>
                            <p className='text-sm text-[#002333]/70'>Date</p>
                            <p className='font-medium'>
                              {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <p className='text-sm text-[#002333]/70'>Client</p>
                          <div className='flex items-center mt-1'>
                            <User className='h-4 w-4 mr-2 text-[#15949C]' />
                            <p className='font-medium'>{payment.client}</p>
                          </div>
                        </div>

                        <div>
                          <p className='text-sm text-[#002333]/70'>Project</p>
                          <p className='font-medium'>{payment.projectName}</p>
                        </div>

                        <Separator />

                        <div>
                          <p className='font-medium mb-2'>Milestones</p>
                          <div className='space-y-2'>
                            {payment.milestones.map((milestone, idx) => (
                              <div key={idx} className='flex justify-between'>
                                <span>{milestone.name}</span>
                                <span>${milestone.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className='flex justify-between font-bold'>
                          <span>Total</span>
                          <span>${payment.amount.toFixed(2)}</span>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant='outline'>Download PDF</Button>
                        <Button className='bg-[#15949C] hover:bg-[#15949C]/90'>
                          <CreditCard className='h-4 w-4 mr-2' />
                          Pay Now
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {payment.status === 'awaiting_payment' && (
                    <Button className='bg-[#15949C] hover:bg-[#15949C]/90'>
                      <CreditCard className='h-4 w-4 mr-2' />
                      Pay Now
                    </Button>
                  )}

                  {payment.status === 'awaiting_approval' && (
                    <Button className='bg-[#15949C] hover:bg-[#15949C]/90'>
                      <CheckCircle className='h-4 w-4 mr-2' />
                      Approve Work
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
