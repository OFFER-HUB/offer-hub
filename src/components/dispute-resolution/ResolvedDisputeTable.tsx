// components/dispute-resolution/ResolvedDisputeTable.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const resolvedDisputes = [
  {
    date: '4 April 2025 · 14:03:09',
    name: 'Darlene Robertson',
    ticketId: 'wdsh1245w',
    email: 'contact@smartsolutions.com',
  },
  {
    date: '4 April 2025 · 14:03:09',
    name: 'Guy Hawkins',
    ticketId: 'wdsh1245w',
    email: 'contact@creativehub.com',
  },
  // ... repeat mock data
];

export default function ResolvedDisputeTable() {
  return (
    <div className='border rounded-md'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date initiated</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Email address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resolvedDisputes.map((item) => (
            <TableRow key={item.ticketId}>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className='flex items-center gap-2 text-primary font-medium'>
                {item.ticketId}
                <Button size='icon' variant='ghost' className='h-5 w-5' onClick={() => navigator.clipboard.writeText(item.ticketId)}>
                  <Copy className='w-4 h-4' />
                </Button>
              </TableCell>
              <TableCell>{item.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
