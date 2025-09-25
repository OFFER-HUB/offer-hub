// Centralized Mock Data for Financial Management System
// This file contains all mock data used throughout the application
// Replace with actual API calls when integrating with backend

import type {
  RevenueStream,
  Fee,
  Transaction,
  Expense,
  FinancialMetrics,
  PaymentProcessingMetrics,
  ProfitabilityAnalysis,
} from '@/types/financial.types'

// Revenue Streams Mock Data
export const mockRevenueStreams: RevenueStream[] = [
  {
    id: '1',
    name: 'Platform Commission',
    type: 'commission',
    amount: 25420.5,
    currency: 'USD',
    date: new Date('2024-01-15'),
    status: 'completed',
  },
  {
    id: '2',
    name: 'Premium Subscriptions',
    type: 'subscription',
    amount: 18950.0,
    currency: 'USD',
    date: new Date('2024-01-15'),
    status: 'completed',
  },
  {
    id: '3',
    name: 'Featured Listings',
    type: 'premium_features',
    amount: 8200.0,
    currency: 'USD',
    date: new Date('2024-01-14'),
    status: 'completed',
  },
  {
    id: '4',
    name: 'Sponsored Content',
    type: 'advertising',
    amount: 5100.0,
    currency: 'USD',
    date: new Date('2024-01-13'),
    status: 'completed',
  },
  {
    id: '5',
    name: 'API Access Fees',
    type: 'premium_features', // Changed from "api" to valid type
    amount: 3400.0,
    currency: 'USD',
    date: new Date('2024-01-12'),
    status: 'completed',
  },
]

// Expense Breakdown Mock Data
export const mockExpenseBreakdownData = [
  { name: 'Infrastructure', value: 15420, color: '#3B82F6' },
  { name: 'Marketing', value: 12800, color: '#10B981' },
  { name: 'Operations', value: 8900, color: '#F59E0B' },
  { name: 'Development', value: 6700, color: '#8B5CF6' },
  { name: 'Legal', value: 3200, color: '#EF4444' },
]

// Fees Mock Data
export const mockFees: Fee[] = [
  {
    id: 'fee_001',
    name: 'Platform Commission',
    type: 'percentage',
    value: 5.0,
    category: 'platform',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'fee_002',
    name: 'Payment Processing',
    type: 'percentage',
    value: 2.9,
    category: 'payment_processing',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'fee_003',
    name: 'Withdrawal Fee',
    type: 'fixed',
    value: 2.5,
    category: 'withdrawal',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'fee_004',
    name: 'Premium Features',
    type: 'percentage',
    value: 3.5,
    category: 'premium',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

// Transactions Mock Data
export const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    type: 'revenue',
    amount: 1250.0,
    currency: 'USD',
    description: 'Project completion fee',
    category: 'commission',
    date: new Date('2024-01-15'),
    status: 'completed',
    projectId: 'proj_123',
  },
  {
    id: 'txn_002',
    type: 'expense',
    amount: 299.99,
    currency: 'USD',
    description: 'AWS Infrastructure',
    category: 'infrastructure',
    date: new Date('2024-01-14'),
    status: 'completed',
  },
  {
    id: 'txn_003',
    type: 'revenue',
    amount: 89.99,
    currency: 'USD',
    description: 'Premium subscription',
    category: 'subscription',
    date: new Date('2024-01-13'),
    status: 'completed',
    userId: 'user_456',
  },
  {
    id: 'txn_004',
    type: 'revenue',
    amount: 450.0,
    currency: 'USD',
    description: 'Featured listing fee',
    category: 'premium_features',
    date: new Date('2024-01-12'),
    status: 'completed',
    userId: 'user_789',
  },
  {
    id: 'txn_005',
    type: 'expense',
    amount: 150.0,
    currency: 'USD',
    description: 'Marketing campaign',
    category: 'marketing',
    date: new Date('2024-01-11'),
    status: 'completed',
  },
]

// Expenses Mock Data
export const mockExpenses: Expense[] = [
  {
    id: 'exp_001',
    name: 'AWS Infrastructure',
    amount: 2450.0,
    currency: 'USD',
    category: 'infrastructure',
    date: new Date('2024-01-01'),
    description: 'Monthly cloud hosting and services',
    isRecurring: true,
    recurringPeriod: 'monthly',
  },
  {
    id: 'exp_002',
    name: 'Marketing Campaign',
    amount: 5000.0,
    currency: 'USD',
    category: 'marketing',
    date: new Date('2024-01-05'),
    description: 'Q1 digital marketing campaign',
    isRecurring: false,
  },
  {
    id: 'exp_003',
    name: 'Legal Services',
    amount: 1200.0,
    currency: 'USD',
    category: 'legal',
    date: new Date('2024-01-10'),
    description: 'Contract review and compliance',
    isRecurring: false,
  },
  {
    id: 'exp_004',
    name: 'Development Tools',
    amount: 800.0,
    currency: 'USD',
    category: 'development',
    date: new Date('2024-01-08'),
    description: 'Software licenses and development tools',
    isRecurring: true,
    recurringPeriod: 'monthly',
  },
  {
    id: 'exp_005',
    name: 'Office Operations',
    amount: 1500.0,
    currency: 'USD',
    category: 'operations',
    date: new Date('2024-01-03'),
    description: 'Office rent and utilities',
    isRecurring: true,
    recurringPeriod: 'monthly',
  },
]

// Financial Metrics Mock Data
export const mockFinancialMetrics: FinancialMetrics = {
  totalRevenue: 61070.5,
  totalExpenses: 10950.0,
  netProfit: 50120.5,
  profitMargin: 82.1,
  monthlyRecurringRevenue: 12450.0,
  averageTransactionValue: 485.5,
  transactionCount: 1247,
  successRate: 98.5,
  topRevenueStreams: mockRevenueStreams.slice(0, 5),
  revenueGrowth: 15.2,
  expenseGrowth: 8.7,
}

// Payment Processing Metrics Mock Data
export const mockPaymentMetrics: PaymentProcessingMetrics = {
  totalProcessed: 1247850.0,
  successfulPayments: 1229,
  failedPayments: 18,
  successRate: 98.56,
  averageProcessingTime: 2.3,
  processingFees: 36187.65,
  chargebacks: 3,
  refunds: 12,
}

// Profitability Analysis Mock Data
export const mockProfitabilityAnalysis: ProfitabilityAnalysis = {
  byCategory: {
    'Web Development': 45200.0,
    'Graphic Design': 28500.0,
    'Content Writing': 18900.0,
    'Digital Marketing': 22100.0,
    'Mobile Development': 35600.0,
  },
  byTimeframe: {
    'Q1 2024': 89500.0,
    'Q4 2023': 78200.0,
    'Q3 2023': 72100.0,
    'Q2 2023': 68900.0,
  },
  byUserSegment: {
    Enterprise: 125000.0,
    SMB: 85000.0,
    Startups: 45000.0,
    Individual: 25000.0,
  },
  byProjectType: {
    'Fixed Price': 180000.0,
    Hourly: 95000.0,
    Milestone: 65000.0,
  },
  trends: [
    { period: 'Jan 2024', profit: 28500.0, margin: 18.5 },
    { period: 'Dec 2023', profit: 26200.0, margin: 17.2 },
    { period: 'Nov 2023', profit: 24800.0, margin: 16.8 },
    { period: 'Oct 2023', profit: 23100.0, margin: 15.9 },
  ],
}

// Revenue Analysis Data for Charts
export const mockRevenueAnalysisData = [
  { month: 'Jan', revenue: 25420, expenses: 8900, profit: 16520 },
  { month: 'Feb', revenue: 28950, expenses: 9200, profit: 19750 },
  { month: 'Mar', revenue: 32100, expenses: 9800, profit: 22300 },
  { month: 'Apr', revenue: 29800, expenses: 9500, profit: 20300 },
  { month: 'May', revenue: 35200, expenses: 10200, profit: 25000 },
  { month: 'Jun', revenue: 38500, expenses: 10800, profit: 27700 },
]

// Pie Chart Data for Revenue Distribution
export const mockRevenueDistributionData = [
  { name: 'Platform Commission', value: 25420.5, fill: '#3B82F6' },
  { name: 'Premium Subscriptions', value: 18950.0, fill: '#10B981' },
  { name: 'Featured Listings', value: 8200.0, fill: '#F59E0B' },
  { name: 'Sponsored Content', value: 5100.0, fill: '#8B5CF6' },
  { name: 'API Access Fees', value: 3400.0, fill: '#EF4444' },
]
