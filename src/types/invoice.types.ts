export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  taxRate?: number
}

export interface InvoiceCustomer {
  id: string
  name: string
  email: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  taxId?: string
}

export interface InvoiceCompany {
  name: string
  email: string
  phone?: string
  website?: string
  logo?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  taxId?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  status: InvoiceStatus
  customer: InvoiceCustomer
  company: InvoiceCompany
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  total: number
  currency: string
  exchangeRate?: number
  dueDate: Date
  issueDate: Date
  paymentDate?: Date
  notes?: string
  terms?: string
  createdAt: Date
  updatedAt: Date
  projectId?: string
  milestoneId?: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded'

export interface InvoiceTemplate {
  id: string
  name: string
  description: string
  isDefault: boolean
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  layout: 'modern' | 'classic' | 'minimal' | 'professional'
  includeCompanyLogo: boolean
  includePaymentTerms: boolean
  includeNotes: boolean
}

export interface InvoiceAnalytics {
  totalInvoices: number
  totalRevenue: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  averagePaymentTime: number
  paymentRate: number
  monthlyRevenue: Array<{
    month: string
    revenue: number
    invoiceCount: number
  }>
}

export interface InvoiceFilters {
  status?: InvoiceStatus[]
  dateRange?: {
    start: Date
    end: Date
  }
  customer?: string
  minAmount?: number
  maxAmount?: number
  currency?: string
}

export interface CreateInvoiceRequest {
  customerId: string
  items: Omit<InvoiceItem, 'id' | 'total'>[]
  dueDate: Date
  currency: string
  notes?: string
  terms?: string
  templateId?: string
  projectId?: string
  milestoneId?: string
}

export interface UpdateInvoiceRequest {
  status?: InvoiceStatus
  items?: Omit<InvoiceItem, 'id' | 'total'>[]
  dueDate?: Date
  notes?: string
  terms?: string
  paymentDate?: Date
}
