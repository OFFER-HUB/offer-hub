
import { Eye, Edit, Trash2, Download, Send, MoreHorizontal, DollarSign, FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Invoice } from '@/types/invoice.types'
import {
  formatCurrency,
  formatDate,
  getInvoiceStatusColor,
  getInvoiceStatusLabel,
  isInvoiceOverdue,
  getDaysUntilDue,
} from '@/utils/invoice-helpers'

interface InvoiceTableProps {
  invoices: Invoice[]
  loading: boolean
  onView: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
  onSend: (invoice: Invoice) => void
  onMarkAsPaid: (invoice: Invoice) => void
  onDownload: (invoice: Invoice) => void
  onCreateNew?: () => void
}

export function InvoiceTable({
  invoices,
  loading,
  onView,
  onEdit,
  onDelete,
  onSend,
  onMarkAsPaid,
  onDownload,
  onCreateNew,
}: InvoiceTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-[#002333]/70'>Loading invoices...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center py-8'>
            <FileText className='h-12 w-12 text-[#002333]/30 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-[#002333] mb-2'>No invoices found</h3>
            <p className='text-[#002333]/70 mb-4'>Create your first invoice to get started</p>
            {onCreateNew && (
              <Button onClick={onCreateNew} className='bg-[#15949C] hover:bg-[#15949C]/90'>
                <Plus className='h-4 w-4 mr-2' />
                Create Invoice
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-[#002333]'>Invoices ({invoices.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const overdue = isInvoiceOverdue(invoice)
              const daysUntilDue = getDaysUntilDue(invoice.dueDate)

              return (
                <TableRow key={invoice.id} className='hover:bg-[#DEEFE7]/20'>
                  <TableCell className='font-medium text-[#002333]'>{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className='font-medium text-[#002333]'>{invoice.customer.name}</div>
                      <div className='text-sm text-[#002333]/70'>{invoice.customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getInvoiceStatusColor(invoice.status)}>
                      {getInvoiceStatusLabel(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-[#002333]/80'>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>
                    <div className='text-[#002333]/80'>{formatDate(invoice.dueDate)}</div>
                    {!overdue && daysUntilDue <= 7 && daysUntilDue > 0 && (
                      <div className='text-xs text-orange-600'>Due in {daysUntilDue} days</div>
                    )}
                  </TableCell>
                  <TableCell className='font-medium text-[#002333]'>
                    {formatCurrency(invoice.total, invoice.currency)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => onView(invoice)}>
                          <Eye className='h-4 w-4 mr-2' />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(invoice)}>
                          <Edit className='h-4 w-4 mr-2' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {invoice.status === 'draft' && (
                          <DropdownMenuItem onClick={() => onSend(invoice)}>
                            <Send className='h-4 w-4 mr-2' />
                            Send
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => onMarkAsPaid(invoice)}>
                            <DollarSign className='h-4 w-4 mr-2' />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onDownload(invoice)}>
                          <Download className='h-4 w-4 mr-2' />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(invoice)} className='text-red-600'>
                          <Trash2 className='h-4 w-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}