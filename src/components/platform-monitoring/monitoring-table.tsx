'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Transaction, SelectedUser } from './platform-monitoring-page';

interface MonitoringTableProps {
  transactionData: Transaction[];
  selectedUser: SelectedUser;
  onViewAllTransactions: (customer: {
    name: string;
    userId: string;
    email: string;
  }) => void;
  onUserClick: () => void;
}

export default function MonitoringTable({
  transactionData,
  onViewAllTransactions,
  onUserClick,
}: MonitoringTableProps) {
  return (
    <div className='bg-white rounded-lg border mt-3'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Email address</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactionData.map((row, index) => (
            <TableRow key={index}>
              <TableCell className='text-sm'>{row.date}</TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <span className='text-blue-600'>{row.userId}</span>
                  <Copy className='w-4 h-4 text-gray-400' />
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant='link'
                  className='p-0 h-auto font-normal text-left'
                  onClick={onUserClick}
                >
                  {row.customerName}
                </Button>
              </TableCell>
              <TableCell className='text-sm text-gray-600'>
                {row.email}
              </TableCell>
              <TableCell className='font-medium'>{row.amount}</TableCell>
              <TableCell>
                <Button
                  variant='link'
                  className='text-blue-600 p-0'
                  onClick={() =>
                    onViewAllTransactions({
                      name: row.customerName,
                      userId: row.userId,
                      email: row.email,
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
    // <Tabs value={activeTab}>
    //   <TabsContent value="all-transaction" className="mt-0">

    //   </TabsContent>

    //   {/* <TabsContent value="security-alerts" className="mt-0">
    //     <div className="bg-white rounded-lg border">
    //       <Table>
    //         <TableHeader>
    //           <TableRow>
    //             <TableHead>Date</TableHead>
    //             <TableHead>Customer Name</TableHead>
    //             <TableHead>User ID</TableHead>
    //             <TableHead>Email address</TableHead>
    //             <TableHead>Status</TableHead>
    //             <TableHead>Action</TableHead>
    //           </TableRow>
    //         </TableHeader>
    //         <TableBody>
    //           {transactionData.map((row, index) => (
    //             <TableRow key={index}>
    //               <TableCell className="text-sm">{row.date}</TableCell>
    //               <TableCell>
    //                 <Button
    //                   variant="link"
    //                   className="p-0 h-auto font-normal text-left"
    //                   onClick={onUserClick}
    //                 >
    //                   {row.customerName}
    //                 </Button>
    //               </TableCell>
    //               <TableCell>
    //                 <div className="flex items-center gap-2">
    //                   <span className="text-blue-600">{row.userId}</span>
    //                   <Copy className="w-4 h-4 text-gray-400" />
    //                 </div>
    //               </TableCell>
    //               <TableCell className="text-sm text-gray-600">
    //                 {row.email}
    //               </TableCell>
    //               <TableCell>
    //                 <StatusBadge status={row.status} />
    //               </TableCell>
    //               <TableCell>
    //                 <Button
    //                   variant="link"
    //                   className="text-blue-600 p-0"
    //                   onClick={() =>
    //                     onViewAllTransactions({
    //                       name: row.customerName,
    //                       userId: row.userId,
    //                       email: row.email,
    //                     })
    //                   }
    //                 >
    //                   View details of risk
    //                 </Button>
    //               </TableCell>
    //             </TableRow>
    //           ))}
    //         </TableBody>
    //       </Table>
    //     </div>
    //   </TabsContent> */}
    // </Tabs>
  );
}
