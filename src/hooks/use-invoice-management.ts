'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Invoice,
  InvoiceFilters,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceAnalytics,
  InvoiceItem,
} from '@/types/invoice.types'
import {
  generateInvoiceNumber,
  calculateItemTotal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateInvoiceTotal,
  isInvoiceOverdue,
} from '@/utils/invoice-helpers'
import { generateMockInvoices } from '@/data/mock-invoice-data'

export const useInvoiceManagement = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize with mock data
  useEffect(() => {
    const mockInvoices = generateMockInvoices()
    setInvoices(mockInvoices)
  }, [])

  // Helper function to get date range based on time range string
  const getDateRangeFromTimeRange = useCallback((timeRange: string) => {
    const now = new Date()
    const endDate = new Date(now)
    const startDate = new Date(now)

    switch (timeRange) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1) // Default to 1 month
    }

    return { startDate, endDate }
  }, [])

  // Filter invoices by time range
  const getInvoicesInTimeRange = useCallback((timeRange?: string) => {
    if (!timeRange) return invoices

    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange)
    
    return invoices.filter(invoice => {
      const issueDate = new Date(invoice.issueDate)
      return issueDate >= startDate && issueDate <= endDate
    })
  }, [invoices, getDateRangeFromTimeRange])

  const createInvoice = useCallback(async (request: CreateInvoiceRequest): Promise<Invoice> => {
    setLoading(true)
    setError(null)

    try {
      // Calculate totals
      const itemsWithTotals = request.items.map((item) => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        total: calculateItemTotal(item.quantity, item.unitPrice),
      }))

      const subtotal = calculateSubtotal(itemsWithTotals)
      const taxAmount = calculateTaxAmount(subtotal, 8.5) // Default tax rate
      const total = calculateInvoiceTotal(subtotal, taxAmount)

      const newInvoice: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        invoiceNumber: generateInvoiceNumber(),
        status: 'draft',
        customer: {
          id: request.customerId,
          name: 'Customer Name', // Would be fetched from customer service
          email: 'customer@example.com',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
        },
        company: {
          name: 'Offer Hub',
          email: 'billing@offerhub.com',
          address: {
            street: '456 Business Ave',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA',
          },
        },
        items: itemsWithTotals,
        subtotal,
        taxAmount,
        total,
        currency: request.currency,
        dueDate: request.dueDate,
        issueDate: new Date(),
        notes: request.notes,
        terms: request.terms,
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId: request.projectId,
        milestoneId: request.milestoneId,
      }

      setInvoices((prev) => [...prev, newInvoice])
      return newInvoice
    } catch (err) {
      setError('Failed to create invoice')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateInvoice = useCallback(
    async (id: string, updates: UpdateInvoiceRequest): Promise<Invoice> => {
      setLoading(true)
      setError(null)

      try {
        const updatedInvoices = invoices.map((invoice) => {
          if (invoice.id === id) {
            // Create a copy of the invoice first
            let updatedInvoice: Invoice = { ...invoice, updatedAt: new Date() }

            // Handle items separately to maintain proper typing
            if (updates.items) {
              const itemsWithTotals: InvoiceItem[] = updates.items.map((item, index) => ({
                ...item,
                id: invoice.items[index]?.id || Math.random().toString(36).substr(2, 9),
                total: calculateItemTotal(item.quantity, item.unitPrice),
              }))

              const subtotal = calculateSubtotal(itemsWithTotals)
              const taxAmount = calculateTaxAmount(subtotal, 8.5)
              const total = calculateInvoiceTotal(subtotal, taxAmount)

              updatedInvoice = {
                ...updatedInvoice,
                items: itemsWithTotals,
                subtotal,
                taxAmount,
                total,
              }
            }

            // Apply other updates (excluding items since we handled it above)
            const { items: _, ...otherUpdates } = updates
            updatedInvoice = {
              ...updatedInvoice,
              ...otherUpdates,
            }

            return updatedInvoice
          }
          return invoice
        })

        setInvoices(updatedInvoices)
        return updatedInvoices.find((inv) => inv.id === id)!
      } catch (err) {
        setError('Failed to update invoice')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [invoices],
  )

  const deleteInvoice = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
    } catch (err) {
      setError('Failed to delete invoice')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getFilteredInvoices = useCallback(
    (filters: InvoiceFilters): Invoice[] => {
      return invoices.filter((invoice) => {
        if (filters.status && !filters.status.includes(invoice.status)) {
          return false
        }

        if (filters.dateRange) {
          const issueDate = new Date(invoice.issueDate)
          if (issueDate < filters.dateRange.start || issueDate > filters.dateRange.end) {
            return false
          }
        }

        if (filters.customer && !invoice.customer.name.toLowerCase().includes(filters.customer.toLowerCase())) {
          return false
        }

        if (filters.minAmount && invoice.total < filters.minAmount) {
          return false
        }

        if (filters.maxAmount && invoice.total > filters.maxAmount) {
          return false
        }

        if (filters.currency && invoice.currency !== filters.currency) {
          return false
        }

        return true
      })
    },
    [invoices],
  )

  // Updated getInvoiceAnalytics to accept optional timeRange parameter
  const getInvoiceAnalytics = useCallback((timeRange?: string): InvoiceAnalytics => {
    // Use filtered invoices based on time range, or all invoices if no time range
    const filteredInvoices = timeRange ? getInvoicesInTimeRange(timeRange) : invoices
    
    const totalInvoices = filteredInvoices.length
    const paidInvoices = filteredInvoices.filter((inv) => inv.status === 'paid').length
    const pendingInvoices = filteredInvoices.filter((inv) => ['sent', 'viewed'].includes(inv.status)).length
    const overdueInvoices = filteredInvoices.filter((inv) => isInvoiceOverdue(inv)).length
    const totalRevenue = filteredInvoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)

    const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0

    // Calculate average payment time
    const paidInvoicesWithPaymentDate = filteredInvoices.filter((inv) => inv.status === 'paid' && inv.paymentDate)
    const averagePaymentTime =
      paidInvoicesWithPaymentDate.length > 0
        ? paidInvoicesWithPaymentDate.reduce((sum, inv) => {
            const paymentTime = (inv.paymentDate!.getTime() - inv.issueDate.getTime()) / (1000 * 60 * 60 * 24)
            return sum + paymentTime
          }, 0) / paidInvoicesWithPaymentDate.length
        : 0

    // Generate monthly revenue data based on filtered invoices and time range
    const generateMonthlyRevenue = () => {
      if (!timeRange) {
        // Default mock data when no time range is specified
        return [
          { month: 'Jan', revenue: 15000, invoiceCount: 12 },
          { month: 'Feb', revenue: 18000, invoiceCount: 15 },
          { month: 'Mar', revenue: 22000, invoiceCount: 18 },
          { month: 'Apr', revenue: 19000, invoiceCount: 16 },
          { month: 'May', revenue: 25000, invoiceCount: 20 },
          { month: 'Jun', revenue: 28000, invoiceCount: 22 },
        ]
      }

      // Generate monthly data based on actual filtered invoices
      const { startDate } = getDateRangeFromTimeRange(timeRange)
      const monthlyData: { [key: string]: { revenue: number; count: number } } = {}

      filteredInvoices.forEach(invoice => {
        if (invoice.status === 'paid') {
          const monthKey = invoice.issueDate.toLocaleDateString('en-US', { 
            month: 'short',
            year: startDate.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined 
          })
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, count: 0 }
          }
          
          monthlyData[monthKey].revenue += invoice.total
          monthlyData[monthKey].count += 1
        }
      })

      return Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          invoiceCount: data.count,
        }))
        .sort((a, b) => {
          // Sort by month chronologically
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          return months.indexOf(a.month.substring(0, 3)) - months.indexOf(b.month.substring(0, 3))
        })
    }

    const monthlyRevenue = generateMonthlyRevenue()

    return {
      totalInvoices,
      totalRevenue,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      averagePaymentTime,
      paymentRate,
      monthlyRevenue,
    }
  }, [invoices, getInvoicesInTimeRange, getDateRangeFromTimeRange])

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getFilteredInvoices,
    getInvoiceAnalytics, 
    getInvoicesInTimeRange, 
  }
}