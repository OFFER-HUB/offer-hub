'use client';

import { SelectItem } from '@/components/ui/select';

import { SelectContent } from '@/components/ui/select';

import { SelectValue } from '@/components/ui/select';

import { SelectTrigger } from '@/components/ui/select';

import { Select } from '@/components/ui/select';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  CheckCircle,
  Edit,
  Lock,
  CreditCardIcon,
  BanknoteIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Sample payment methods
const paymentMethods = [
  {
    id: 1,
    type: 'credit_card',
    name: 'Visa ending in 4242',
    last4: '4242',
    expiry: '12/25',
    isDefault: true,
    brand: 'visa',
  },
  {
    id: 2,
    type: 'paypal',
    name: 'PayPal',
    email: 'user@example.com',
    isDefault: false,
    brand: 'paypal',
  },
  {
    id: 3,
    type: 'bank_account',
    name: 'Bank Account ending in 5678',
    last4: '5678',
    isDefault: false,
    brand: 'bank',
  },
];

// Sample payment history
const paymentHistory = [
  {
    id: 'TRX-001',
    date: '2023-05-15',
    description: 'Website Redesign Project',
    amount: 1250.0,
    method: 'Visa ending in 4242',
  },
  {
    id: 'TRX-002',
    date: '2023-05-10',
    description: 'Logo Design Project',
    amount: 450.0,
    method: 'PayPal',
  },
  {
    id: 'TRX-003',
    date: '2023-04-28',
    description: 'Content Writing',
    amount: 350.0,
    method: 'Visa ending in 4242',
  },
];

export default function PaymentMethods() {
  const [activeTab, setActiveTab] = useState('cards');
  const [showAddCard, setShowAddCard] = useState(false);

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

  const getCardIcon = (brand: string) => {
    switch (brand) {
      case 'visa':
        return (
          <div className='h-10 w-16 bg-blue-100 rounded flex items-center justify-center'>
            <span className='font-semibold text-blue-800'>VISA</span>
          </div>
        );
      case 'mastercard':
        return (
          <div className='h-10 w-16 bg-red-100 rounded flex items-center justify-center'>
            <span className='font-semibold text-red-800'>MC</span>
          </div>
        );
      case 'paypal':
        return (
          <div className='h-10 w-16 bg-blue-100 rounded flex items-center justify-center'>
            <span className='font-semibold text-blue-800'>PayPal</span>
          </div>
        );
      case 'bank':
        return (
          <div className='h-10 w-16 bg-green-100 rounded flex items-center justify-center'>
            <BanknoteIcon className='h-6 w-6 text-green-800' />
          </div>
        );
      default:
        return (
          <div className='h-10 w-16 bg-gray-100 rounded flex items-center justify-center'>
            <CreditCardIcon className='h-6 w-6 text-gray-800' />
          </div>
        );
    }
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
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='cards'>Payment Methods</TabsTrigger>
            <TabsTrigger value='history'>Payment History</TabsTrigger>
            <TabsTrigger value='settings'>Settings</TabsTrigger>
          </TabsList>

          <TabsContent value='cards' className='space-y-6 mt-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Your Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your payment options
                    </CardDescription>
                  </div>
                  <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
                    <DialogTrigger asChild>
                      <Button className='bg-[#15949C] hover:bg-[#15949C]/90'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                          Add a new card or payment account to your profile
                        </DialogDescription>
                      </DialogHeader>
                      <div className='space-y-4 py-4'>
                        <Tabs defaultValue='card' className='w-full'>
                          <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value='card'>Credit Card</TabsTrigger>
                            <TabsTrigger value='paypal'>PayPal</TabsTrigger>
                            <TabsTrigger value='bank'>Bank Account</TabsTrigger>
                          </TabsList>

                          <TabsContent value='card' className='space-y-4 mt-4'>
                            <div className='space-y-2'>
                              <Label htmlFor='card-number'>Card Number</Label>
                              <Input
                                id='card-number'
                                placeholder='1234 5678 9012 3456'
                              />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                              <div className='space-y-2'>
                                <Label htmlFor='expiry'>Expiry Date</Label>
                                <Input id='expiry' placeholder='MM/YY' />
                              </div>
                              <div className='space-y-2'>
                                <Label htmlFor='cvc'>CVC</Label>
                                <Input id='cvc' placeholder='123' />
                              </div>
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='name'>Name on Card</Label>
                              <Input id='name' placeholder='John Doe' />
                            </div>
                            <div className='flex items-center space-x-2'>
                              <Switch id='default-card' />
                              <Label htmlFor='default-card'>
                                Set as default payment method
                              </Label>
                            </div>
                          </TabsContent>

                          <TabsContent
                            value='paypal'
                            className='space-y-4 mt-4'
                          >
                            <div className='text-center p-6'>
                              <div className='h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <span className='font-bold text-blue-800'>
                                  PayPal
                                </span>
                              </div>
                              <p className='text-[#002333] mb-6'>
                                You'll be redirected to PayPal to connect your
                                account
                              </p>
                              <Button className='bg-blue-600 hover:bg-blue-700'>
                                Connect with PayPal
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value='bank' className='space-y-4 mt-4'>
                            <div className='space-y-2'>
                              <Label htmlFor='account-name'>
                                Account Holder Name
                              </Label>
                              <Input id='account-name' placeholder='John Doe' />
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='account-number'>
                                Account Number
                              </Label>
                              <Input
                                id='account-number'
                                placeholder='123456789'
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label htmlFor='routing-number'>
                                Routing Number
                              </Label>
                              <Input
                                id='routing-number'
                                placeholder='123456789'
                              />
                            </div>
                            <div className='flex items-center space-x-2'>
                              <Switch id='default-bank' />
                              <Label htmlFor='default-bank'>
                                Set as default payment method
                              </Label>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                      <DialogFooter>
                        <Button
                          variant='outline'
                          onClick={() => setShowAddCard(false)}
                        >
                          Cancel
                        </Button>
                        <Button className='bg-[#15949C] hover:bg-[#15949C]/90'>
                          <Lock className='h-4 w-4 mr-2' />
                          Save Payment Method
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      variants={item}
                      className='flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex items-center'>
                        {getCardIcon(method.brand)}
                        <div className='ml-4'>
                          <p className='font-medium text-[#002333]'>
                            {method.name}
                          </p>
                          {method.type === 'credit_card' && (
                            <p className='text-xs text-[#002333]/70'>
                              Expires {method.expiry}
                            </p>
                          )}
                          {method.type === 'paypal' && (
                            <p className='text-xs text-[#002333]/70'>
                              {method.email}
                            </p>
                          )}
                          {method.type === 'bank_account' && (
                            <p className='text-xs text-[#002333]/70'>
                              Bank Account
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center'>
                        {method.isDefault && (
                          <Badge className='mr-4 bg-[#DEEFE7] text-[#002333]'>
                            Default
                          </Badge>
                        )}
                        <div className='flex gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-[#15949C]'
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          {!method.isDefault && (
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-red-500'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Security</CardTitle>
                <CardDescription>
                  Information about how we protect your payment data
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-start gap-4 p-4 bg-[#DEEFE7]/30 rounded-lg'>
                  <div className='h-10 w-10 bg-[#15949C]/10 rounded-full flex items-center justify-center shrink-0'>
                    <Lock className='h-5 w-5 text-[#15949C]' />
                  </div>
                  <div>
                    <h3 className='font-medium text-[#002333] mb-1'>
                      Secure Payment Processing
                    </h3>
                    <p className='text-sm text-[#002333]/70'>
                      All payment information is encrypted using
                      industry-standard SSL technology. We never store your full
                      card details on our servers.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4 p-4 bg-[#DEEFE7]/30 rounded-lg'>
                  <div className='h-10 w-10 bg-[#15949C]/10 rounded-full flex items-center justify-center shrink-0'>
                    <CheckCircle className='h-5 w-5 text-[#15949C]' />
                  </div>
                  <div>
                    <h3 className='font-medium text-[#002333] mb-1'>
                      PCI Compliant
                    </h3>
                    <p className='text-sm text-[#002333]/70'>
                      Our payment processing systems are PCI DSS compliant,
                      ensuring that your payment data is handled according to
                      the highest security standards.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='history' className='space-y-6 mt-6'>
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  Recent transactions using your payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-100'>
                        <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                          Transaction ID
                        </th>
                        <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                          Date
                        </th>
                        <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                          Description
                        </th>
                        <th className='text-left py-3 px-4 text-[#002333]/70 font-medium'>
                          Payment Method
                        </th>
                        <th className='text-right py-3 px-4 text-[#002333]/70 font-medium'>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((transaction) => (
                        <motion.tr
                          key={transaction.id}
                          variants={item}
                          className='border-b border-gray-100 hover:bg-gray-50'
                        >
                          <td className='py-4 px-4 font-medium text-[#002333]'>
                            {transaction.id}
                          </td>
                          <td className='py-4 px-4 text-[#002333]'>
                            {new Date(transaction.date).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </td>
                          <td className='py-4 px-4 text-[#002333]'>
                            {transaction.description}
                          </td>
                          <td className='py-4 px-4 text-[#002333]'>
                            {transaction.method}
                          </td>
                          <td className='py-4 px-4 text-right font-medium text-[#002333]'>
                            ${transaction.amount.toFixed(2)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className='flex justify-center'>
                <Button
                  variant='outline'
                  className='border-[#15949C] text-[#15949C]'
                >
                  View All Transactions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value='settings' className='space-y-6 mt-6'>
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure your payment preferences
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='font-medium text-[#002333]'>
                    Automatic Payments
                  </h3>
                  <div className='flex items-center justify-between p-4 border border-gray-100 rounded-lg'>
                    <div>
                      <p className='font-medium text-[#002333]'>
                        Enable Automatic Payments
                      </p>
                      <p className='text-sm text-[#002333]/70'>
                        Automatically process payments for recurring services
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className='flex items-center justify-between p-4 border border-gray-100 rounded-lg'>
                    <div>
                      <p className='font-medium text-[#002333]'>
                        Payment Reminders
                      </p>
                      <p className='text-sm text-[#002333]/70'>
                        Receive email notifications before payments are
                        processed
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className='space-y-4'>
                  <h3 className='font-medium text-[#002333]'>
                    Currency & Locale
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='currency' className='text-[#002333]/70'>
                        Currency
                      </Label>
                      <Select defaultValue='usd'>
                        <SelectTrigger id='currency' className='mt-1'>
                          <SelectValue placeholder='Select currency' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='usd'>USD - US Dollar</SelectItem>
                          <SelectItem value='eur'>EUR - Euro</SelectItem>
                          <SelectItem value='gbp'>
                            GBP - British Pound
                          </SelectItem>
                          <SelectItem value='cad'>
                            CAD - Canadian Dollar
                          </SelectItem>
                          <SelectItem value='aud'>
                            AUD - Australian Dollar
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='locale' className='text-[#002333]/70'>
                        Locale
                      </Label>
                      <Select defaultValue='en-us'>
                        <SelectTrigger id='locale' className='mt-1'>
                          <SelectValue placeholder='Select locale' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='en-us'>English (US)</SelectItem>
                          <SelectItem value='en-gb'>English (UK)</SelectItem>
                          <SelectItem value='es'>Spanish</SelectItem>
                          <SelectItem value='fr'>French</SelectItem>
                          <SelectItem value='de'>German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className='space-y-4'>
                  <h3 className='font-medium text-[#002333]'>
                    Billing Address
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='name' className='text-[#002333]/70'>
                        Full Name
                      </Label>
                      <Input
                        id='name'
                        defaultValue='John Doe'
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label htmlFor='company' className='text-[#002333]/70'>
                        Company (Optional)
                      </Label>
                      <Input
                        id='company'
                        defaultValue='Acme Inc.'
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label htmlFor='address1' className='text-[#002333]/70'>
                        Address Line 1
                      </Label>
                      <Input
                        id='address1'
                        defaultValue='123 Main St'
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label htmlFor='address2' className='text-[#002333]/70'>
                        Address Line 2
                      </Label>
                      <Input
                        id='address2'
                        defaultValue='Suite 100'
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label htmlFor='city' className='text-[#002333]/70'>
                        City
                      </Label>
                      <Input
                        id='city'
                        defaultValue='San Francisco'
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label htmlFor='state' className='text-[#002333]/70'>
                        State/Province
                      </Label>
                      <Input id='state' defaultValue='CA' className='mt-1' />
                    </div>
                    <div>
                      <Label htmlFor='zip' className='text-[#002333]/70'>
                        ZIP/Postal Code
                      </Label>
                      <Input id='zip' defaultValue='94103' className='mt-1' />
                    </div>
                    <div>
                      <Label htmlFor='country' className='text-[#002333]/70'>
                        Country
                      </Label>
                      <Select defaultValue='us'>
                        <SelectTrigger id='country' className='mt-1'>
                          <SelectValue placeholder='Select country' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='us'>United States</SelectItem>
                          <SelectItem value='ca'>Canada</SelectItem>
                          <SelectItem value='uk'>United Kingdom</SelectItem>
                          <SelectItem value='au'>Australia</SelectItem>
                          <SelectItem value='de'>Germany</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex justify-end gap-3'>
                <Button variant='outline'>Cancel</Button>
                <Button className='bg-[#15949C] hover:bg-[#15949C]/90'>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
