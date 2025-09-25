/**
 * @fileoverview Custom hook for financial management and revenue tracking functionality
 * @author Offer Hub Team
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  FinancialMetrics,
  RevenueStream,
  Transaction,
  Fee,
  Expense,
  PaymentProcessingMetrics,
  ProfitabilityAnalysis,
} from '@/types/financial.types'
import { financialService } from '@/components/admin/financial/financial_service'
import {
  mockRevenueStreams,
  mockExpenseBreakdownData,
  mockFees,
  mockTransactions,
  mockExpenses,
  mockFinancialMetrics,
  mockPaymentMetrics,
  mockProfitabilityAnalysis,
} from '@/data/mock-financial-data'

interface UseFinancialManagementReturn {
  // State
  metrics: FinancialMetrics | null
  revenueStreams: RevenueStream[]
  transactions: Transaction[]
  fees: Fee[]
  expenses: Expense[]
  expenseBreakdownData: Array<{ name: string; value: number; color: string }>
  paymentMetrics: PaymentProcessingMetrics | null
  profitabilityAnalysis: ProfitabilityAnalysis | null
  loading: boolean
  error: string | null

  // Actions
  refreshData: () => Promise<void>
  updateFee: (feeId: string, updates: Partial<Fee>) => Promise<void>
  generateReport: (type: string, period: { start: Date; end: Date }) => Promise<void>
  exportData: (format: 'csv' | 'pdf', additionalData?: any) => Promise<void>
  setDateRange: (range: { start: Date; end: Date }) => void
}

export function useFinancialManagement(): UseFinancialManagementReturn {
  // State management
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [paymentMetrics, setPaymentMetrics] = useState<PaymentProcessingMetrics | null>(null)
  const [profitabilityAnalysis, setProfitabilityAnalysis] = useState<ProfitabilityAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    end: new Date(),
  })

  const [expenseBreakdownData] = useState(mockExpenseBreakdownData)

  // Fetch all financial data
  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      setMetrics(mockFinancialMetrics)
      setRevenueStreams(mockRevenueStreams)
      setTransactions(mockTransactions)
      setFees(mockFees)
      setExpenses(mockExpenses)
      setPaymentMetrics(mockPaymentMetrics)
      setProfitabilityAnalysis(mockProfitabilityAnalysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  const updateFee = useCallback(async (feeId: string, updates: Partial<Fee>) => {
    try {
      const updatedFee = await financialService.updateFee(feeId, updates)
      setFees((prev) => prev.map((fee) => (fee.id === feeId ? updatedFee : fee)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fee')
    }
  }, [])

  const generateReport = useCallback(async (type: string, period: { start: Date; end: Date }) => {
    try {
      await financialService.generateReport(type, period)
      // In a real app, this would trigger a download or show the report
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    }
  }, [])

  const exportData = useCallback(
    async (format: 'csv' | 'pdf', additionalData?: any) => {
      try {
        const exportPayload = {
          ...metrics,
          ...additionalData,
          revenueStreams: mockRevenueStreams, // Use centralized mock data
          expenseBreakdownData: mockExpenseBreakdownData,
          exportDate: new Date().toISOString(),
          reportType: 'Financial Analysis',
        }

        console.log('[v0] Exporting data:', exportPayload)
        const blob = await financialService.exportData(format, exportPayload)

        if (!blob || blob.size === 0) {
          throw new Error('Export service returned invalid blob')
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url

        const timestamp = new Date().toISOString().split('T')[0]
        const fileExtensions = { csv: 'csv', pdf: 'pdf' }
        a.download = `financial-report-${timestamp}.${fileExtensions[format]}`

        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('[v0] Export error:', err)
        setError(err instanceof Error ? err.message : 'Failed to export data')
      }
    },
    [metrics],
  )

  // Load data on mount and when date range changes
  useEffect(() => {
    refreshData()
  }, [refreshData])

  return {
    // State
    metrics,
    revenueStreams,
    transactions,
    fees,
    expenses,
    expenseBreakdownData,
    paymentMetrics,
    profitabilityAnalysis,
    loading,
    error,

    // Actions
    refreshData,
    updateFee,
    generateReport,
    exportData,
    setDateRange,
  }
}
