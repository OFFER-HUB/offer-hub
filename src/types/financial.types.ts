// Financial Management System Types
// Financial types

export interface RevenueStream {
  id: string
  name: string
  type: "commission" | "subscription" | "premium_features" | "advertising"
  amount: number
  currency: string
  date: Date
  projectId?: string
  userId?: string
  status: "pending" | "completed" | "failed"
}

export interface Fee {
  id: string
  name: string
  type: "percentage" | "fixed"
  value: number
  category: "platform" | "payment_processing" | "withdrawal" | "premium"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  type: "revenue" | "expense" | "refund" | "withdrawal"
  amount: number
  currency: string
  description: string
  category: string
  date: Date
  status: "pending" | "completed" | "failed" | "cancelled"
  userId?: string
  projectId?: string
  feeId?: string
  metadata?: Record<string, any>
}

export interface Expense {
  id: string
  name: string
  amount: number
  currency: string
  category: "infrastructure" | "marketing" | "operations" | "development" | "legal"
  date: Date
  description?: string
  isRecurring: boolean
  recurringPeriod?: "monthly" | "quarterly" | "yearly"
}

export interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  monthlyRecurringRevenue: number
  averageTransactionValue: number
  transactionCount: number
  successRate: number
  topRevenueStreams: RevenueStream[]
  revenueGrowth: number
  expenseGrowth: number
}

export interface TaxInfo {
  id: string
  period: string
  taxableIncome: number
  taxRate: number
  taxAmount: number
  status: "calculated" | "filed" | "paid"
  dueDate: Date
  filedDate?: Date
  paidDate?: Date
}

export interface FinancialReport {
  id: string
  name: string
  type: "profit_loss" | "revenue_analysis" | "expense_report" | "tax_report"
  period: {
    start: Date
    end: Date
  }
  data: any
  generatedAt: Date
  generatedBy: string
}

export interface PaymentProcessingMetrics {
  totalProcessed: number
  successfulPayments: number
  failedPayments: number
  successRate: number
  averageProcessingTime: number
  processingFees: number
  chargebacks: number
  refunds: number
}

export interface ProfitabilityAnalysis {
  byCategory: Record<string, number>
  byTimeframe: Record<string, number>
  byUserSegment: Record<string, number>
  byProjectType: Record<string, number>
  trends: {
    period: string
    profit: number
    margin: number
  }[]
}
