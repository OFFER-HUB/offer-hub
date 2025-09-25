import type { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice.types'

export const calculateItemTotal = (quantity: number, unitPrice: number): number => {
  return Math.round(quantity * unitPrice * 100) / 100
}

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0)
}

export const calculateTaxAmount = (subtotal: number, taxRate: number): number => {
  return Math.round(subtotal * (taxRate / 100) * 100) / 100
}

export const calculateInvoiceTotal = (subtotal: number, taxAmount: number): number => {
  return Math.round((subtotal + taxAmount) * 100) / 100
}

export const generateInvoiceNumber = (prefix = 'INV'): string => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `${prefix}-${timestamp}-${random}`
}

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const getInvoiceStatusColor = (status: InvoiceStatus): string => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    viewed: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    refunded: 'bg-purple-100 text-purple-800',
  }
  return statusColors[status]
}

export const getInvoiceStatusLabel = (status: InvoiceStatus): string => {
  const statusLabels = {
    draft: 'Draft',
    sent: 'Sent',
    viewed: 'Viewed',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  }
  return statusLabels[status]
}

export const isInvoiceOverdue = (invoice: Invoice): boolean => {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return false
  }
  return new Date() > invoice.dueDate
}

export const getDaysUntilDue = (dueDate: Date): number => {
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const validateInvoiceData = (invoice: Partial<Invoice>): string[] => {
  const errors: string[] = []

  if (!invoice.customer?.name) {
    errors.push('Customer name is required')
  }

  if (!invoice.customer?.email) {
    errors.push('Customer email is required')
  }

  if (!invoice.items || invoice.items.length === 0) {
    errors.push('At least one invoice item is required')
  }

  if (invoice.items) {
    invoice.items.forEach((item, index) => {
      if (!item.description) {
        errors.push(`Item ${index + 1}: Description is required`)
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
      }
      if (item.unitPrice <= 0) {
        errors.push(`Item ${index + 1}: Unit price must be greater than 0`)
      }
    })
  }

  if (!invoice.dueDate) {
    errors.push('Due date is required')
  }

  return errors
}

export const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return amount
  }

  try {
    // In a real application, you would use a currency conversion API
    // For now, we'll use mock exchange rates
    const mockRates: Record<string, number> = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      CAD: 1.25,
      AUD: 1.35,
    }

    const fromRate = mockRates[fromCurrency] || 1
    const toRate = mockRates[toCurrency] || 1

    return Math.round((amount / fromRate) * toRate * 100) / 100
  } catch (error) {
    console.error('Currency conversion failed:', error)
    return amount
  }
}

export const exportInvoiceData = (invoices: Invoice[], format: 'csv' | 'json'): string => {
  if (format === 'json') {
    return JSON.stringify(invoices, null, 2)
  }

  // CSV export
  const headers = ['Invoice Number', 'Customer Name', 'Status', 'Issue Date', 'Due Date', 'Total', 'Currency']

  const csvRows = [
    headers.join(','),
    ...invoices.map((invoice) =>
      [
        invoice.invoiceNumber,
        invoice.customer.name,
        invoice.status,
        formatDate(invoice.issueDate),
        formatDate(invoice.dueDate),
        invoice.total,
        invoice.currency,
      ].join(','),
    ),
  ]

  return csvRows.join('\n')
}
