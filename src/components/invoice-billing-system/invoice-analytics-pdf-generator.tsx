import React from 'react'
import { Document, Page, Text, View, pdf, StyleSheet } from '@react-pdf/renderer'
import type { InvoiceAnalytics, Invoice } from '@/types/invoice.types'
import { formatCurrency, formatDate } from '@/utils/invoice-helpers'

// PDF Styles for analytics
const analyticsStyles = StyleSheet.create({
  page: {
    flexDirection: 'column' as const,
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#15949C',
    borderBottomStyle: 'solid' as const,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#002333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#002333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid' as const,
    paddingBottom: 5,
  },
  summaryGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    padding: 15,
    backgroundColor: '#DEEFE7',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
    fontWeight: 'bold' as const,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#002333',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 8,
    color: '#666666',
  },
  tableHeader: {
    flexDirection: 'row' as const,
    backgroundColor: '#002333',
    padding: 10,
    marginBottom: 1,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold' as const,
  },
  tableRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid' as const,
    padding: 10,
    minHeight: 35,
  },
  tableCell: {
    fontSize: 10,
    color: '#333333',
    paddingRight: 10,
  },
  statusCell: {
    width: '25%',
  },
  countCell: {
    width: '20%',
    textAlign: 'center' as const,
  },
  percentageCell: {
    width: '20%',
    textAlign: 'center' as const,
  },
  revenueCell: {
    width: '35%',
    textAlign: 'right' as const,
  },
  customerNameCell: {
    width: '60%',
    fontWeight: 'bold' as const,
  },
  customerRevenueCell: {
    width: '40%',
    textAlign: 'right' as const,
  },
  monthlyRevenueRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    borderBottomStyle: 'solid' as const,
  },
  monthLabel: {
    fontSize: 10,
    color: '#333333',
    width: '40%',
  },
  monthValue: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#002333',
    textAlign: 'right' as const,
    width: '60%',
  },
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center' as const,
    fontSize: 8,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    borderTopStyle: 'solid' as const,
    paddingTop: 10,
  }
})

interface AnalyticsPDFData {
  analytics: InvoiceAnalytics
  statusData: Array<{ name: string; value: number; color: string }>
  topCustomers: Array<{ name: string; revenue: number }>
  timeRange: string
}

export async function generateAnalyticsPDF(data: AnalyticsPDFData): Promise<Blob> {
  const { analytics, statusData, topCustomers, timeRange } = data

  // Calculate percentages for status distribution
  const totalInvoices = analytics.totalInvoices || 1 // Avoid division by zero
  const statusWithPercentages = statusData.map(status => ({
    ...status,
    percentage: ((status.value / totalInvoices) * 100).toFixed(1)
  }))

  // Get time range label
  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '1month': return 'Last Month'
      case '3months': return 'Last 3 Months' 
      case '6months': return 'Last 6 Months'
      case '1year': return 'Last Year'
      default: return 'All Time'
    }
  }

  const AnalyticsDocument = () =>
    React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: 'A4', style: analyticsStyles.page },

        // Header
        React.createElement(
          View,
          { style: analyticsStyles.header },
          React.createElement(Text, { style: analyticsStyles.title }, 'Invoice Analytics Report'),
          React.createElement(
            Text,
            { style: analyticsStyles.subtitle },
            `Period: ${getTimeRangeLabel(timeRange)} • Generated on ${formatDate(new Date())}`
          ),
        ),

        // Summary Overview
        React.createElement(
          View,
          { style: analyticsStyles.section },
          React.createElement(Text, { style: analyticsStyles.sectionTitle }, 'Overview'),
          React.createElement(
            View,
            { style: analyticsStyles.summaryGrid },
            React.createElement(
              View,
              { style: analyticsStyles.summaryCard },
              React.createElement(Text, { style: analyticsStyles.cardTitle }, 'TOTAL REVENUE'),
              React.createElement(Text, { style: analyticsStyles.cardValue }, formatCurrency(analytics.totalRevenue)),
              React.createElement(Text, { style: analyticsStyles.cardDescription }, 'All paid invoices'),
            ),
            React.createElement(
              View,
              { style: analyticsStyles.summaryCard },
              React.createElement(Text, { style: analyticsStyles.cardTitle }, 'TOTAL INVOICES'),
              React.createElement(Text, { style: analyticsStyles.cardValue }, analytics.totalInvoices.toString()),
              React.createElement(Text, { style: analyticsStyles.cardDescription }, 'All created invoices'),
            ),
            React.createElement(
              View,
              { style: analyticsStyles.summaryCard },
              React.createElement(Text, { style: analyticsStyles.cardTitle }, 'PAYMENT RATE'),
              React.createElement(Text, { style: analyticsStyles.cardValue }, `${analytics.paymentRate.toFixed(1)}%`),
              React.createElement(Text, { style: analyticsStyles.cardDescription }, 'Invoices paid on time'),
            ),
            React.createElement(
              View,
              { style: analyticsStyles.summaryCard },
              React.createElement(Text, { style: analyticsStyles.cardTitle }, 'AVG PAYMENT TIME'),
              React.createElement(Text, { style: analyticsStyles.cardValue }, `${analytics.averagePaymentTime} days`),
              React.createElement(Text, { style: analyticsStyles.cardDescription }, 'Average time to payment'),
            ),
          ),
        ),

        // Invoice Status Distribution
        React.createElement(
          View,
          { style: analyticsStyles.section },
          React.createElement(Text, { style: analyticsStyles.sectionTitle }, 'Invoice Status Distribution'),
          React.createElement(
            View,
            { style: analyticsStyles.tableHeader },
            React.createElement(Text, { style: [analyticsStyles.tableHeaderText, analyticsStyles.statusCell] }, 'Status'),
            React.createElement(Text, { style: [analyticsStyles.tableHeaderText, analyticsStyles.countCell] }, 'Count'),
            React.createElement(Text, { style: [analyticsStyles.tableHeaderText, analyticsStyles.percentageCell] }, 'Percentage'),
            React.createElement(Text, { style: [analyticsStyles.tableHeaderText, analyticsStyles.revenueCell] }, 'Revenue'),
          ),
          ...statusWithPercentages.map((status, index) =>
            React.createElement(
              View,
              { key: index, style: analyticsStyles.tableRow },
              React.createElement(
                Text,
                { style: [analyticsStyles.tableCell, analyticsStyles.statusCell] },
                status.name
              ),
              React.createElement(
                Text,
                { style: [analyticsStyles.tableCell, analyticsStyles.countCell] },
                status.value.toString()
              ),
              React.createElement(
                Text,
                { style: [analyticsStyles.tableCell, analyticsStyles.percentageCell] },
                `${status.percentage}%`
              ),
              React.createElement(
                Text,
                { style: [analyticsStyles.tableCell, analyticsStyles.revenueCell] },
                formatCurrency(0) // You might want to calculate actual revenue per status
              ),
            ),
          ),
        ),

        // Top Customers
        topCustomers.length > 0 && React.createElement(
          View,
          { style: analyticsStyles.section },
          React.createElement(Text, { style: analyticsStyles.sectionTitle }, 'Top Customers'),
          React.createElement(
            View,
            { style: analyticsStyles.tableHeader },
            React.createElement(Text, { style: [analyticsStyles.tableHeaderText, analyticsStyles.customerNameCell] }, 'Customer'),
            React.createElement(Text, { style: [analyticsStyles.tableHeaderText, analyticsStyles.customerRevenueCell] }, 'Revenue'),
          ),
          ...topCustomers.slice(0, 10).map((customer, index) =>
            React.createElement(
              View,
              { key: index, style: analyticsStyles.tableRow },
              React.createElement(
                Text,
                { style: [analyticsStyles.tableCell, analyticsStyles.customerNameCell] },
                customer.name
              ),
              React.createElement(
                Text,
                { style: [analyticsStyles.tableCell, analyticsStyles.customerRevenueCell] },
                formatCurrency(customer.revenue)
              ),
            ),
          ),
        ),

        // Monthly Revenue (if available)
        analytics.monthlyRevenue && analytics.monthlyRevenue.length > 0 && React.createElement(
          View,
          { style: analyticsStyles.section },
          React.createElement(Text, { style: analyticsStyles.sectionTitle }, 'Monthly Revenue Trend'),
          ...analytics.monthlyRevenue.slice(-12).map((month, index) =>
            React.createElement(
              View,
              { key: index, style: analyticsStyles.monthlyRevenueRow },
              React.createElement(Text, { style: analyticsStyles.monthLabel }, month.month),
              React.createElement(Text, { style: analyticsStyles.monthValue }, formatCurrency(month.revenue)),
            ),
          ),
        ),

        // Footer
        React.createElement(
          Text,
          { style: analyticsStyles.footer },
          `Offer Hub Analytics Report • Generated on ${formatDate(new Date())} • Page 1`
        ),
      ),
    )

  const pdfBlob = await pdf(AnalyticsDocument()).toBlob()
  return pdfBlob
}