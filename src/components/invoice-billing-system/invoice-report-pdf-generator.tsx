import React from 'react'
import { Document, Page, Text, View, pdf, StyleSheet } from '@react-pdf/renderer'
import type { Invoice } from '@/types/invoice.types'
import { formatCurrency, formatDate } from '@/utils/invoice-helpers'

// PDF Styles for the report
const reportStyles = StyleSheet.create({
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#002333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 10,
  },
  summarySection: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#DEEFE7',
  },
  summaryItem: {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#002333',
  },
  tableHeader: {
    flexDirection: 'row' as const,
    backgroundColor: '#002333',
    padding: 8,
    marginBottom: 1,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold' as const,
  },
  tableRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid' as const,
    padding: 8,
    minHeight: 30,
  },
  tableCell: {
    fontSize: 9,
    color: '#333333',
    paddingRight: 5,
  },
  invoiceNumberCell: {
    width: '15%',
  },
  customerCell: {
    width: '25%',
  },
  statusCell: {
    width: '15%',
  },
  dateCell: {
    width: '15%',
  },
  amountCell: {
    width: '15%',
    textAlign: 'right' as const,
  },
  statusBadge: {
    padding: 4,
    fontSize: 8,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
  },
  statusDraft: {
    // backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusSent: {
    // backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  statusPaid: {
    // backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  statusOverdue: {
    // backgroundColor: '#FEE2E2',
    color: '#991B1B',
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

interface ReportData {
  title: string
  generatedAt: string
  totalInvoices: number
  totalRevenue: number
  pendingAmount: number
  overdueAmount: number
  invoices: Invoice[]
}

export async function generateInvoiceReportPDF(invoices: Invoice[]): Promise<Blob> {
  const reportData: ReportData = {
    title: 'Invoice Report',
    generatedAt: new Date().toISOString(),
    totalInvoices: invoices.length,
    totalRevenue: invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0),
    pendingAmount: invoices
      .filter((inv) => inv.status === 'sent')
      .reduce((sum, inv) => sum + inv.total, 0),
    overdueAmount: invoices
      .filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0),
    invoices: invoices
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return { ...reportStyles.statusBadge, ...reportStyles.statusPaid }
      case 'sent':
        return { ...reportStyles.statusBadge, ...reportStyles.statusSent }
      case 'overdue':
        return { ...reportStyles.statusBadge, ...reportStyles.statusOverdue }
      default:
        return { ...reportStyles.statusBadge, ...reportStyles.statusDraft }
    }
  }

  const ReportDocument = () =>
    React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: 'A4', style: reportStyles.page },

        // Header
        React.createElement(
          View,
          { style: reportStyles.header },
          React.createElement(Text, { style: reportStyles.title }, reportData.title),
          React.createElement(
            Text,
            { style: reportStyles.subtitle },
            `Generated on ${formatDate(new Date(reportData.generatedAt))} • ${reportData.totalInvoices} invoices`
          ),
        ),

        // Summary Cards
        React.createElement(
          View,
          { style: reportStyles.summarySection },
          React.createElement(
            View,
            { style: reportStyles.summaryItem },
            React.createElement(Text, { style: reportStyles.summaryLabel }, 'TOTAL INVOICES'),
            React.createElement(Text, { style: reportStyles.summaryValue }, reportData.totalInvoices.toString()),
          ),
          React.createElement(
            View,
            { style: reportStyles.summaryItem },
            React.createElement(Text, { style: reportStyles.summaryLabel }, 'TOTAL REVENUE'),
            React.createElement(Text, { style: reportStyles.summaryValue }, formatCurrency(reportData.totalRevenue)),
          ),
          React.createElement(
            View,
            { style: reportStyles.summaryItem },
            React.createElement(Text, { style: reportStyles.summaryLabel }, 'PENDING'),
            React.createElement(Text, { style: reportStyles.summaryValue }, formatCurrency(reportData.pendingAmount)),
          ),
          React.createElement(
            View,
            { style: reportStyles.summaryItem },
            React.createElement(Text, { style: reportStyles.summaryLabel }, 'OVERDUE'),
            React.createElement(Text, { style: reportStyles.summaryValue }, formatCurrency(reportData.overdueAmount)),
          ),
        ),

        // Table Header
        React.createElement(
          View,
          { style: reportStyles.tableHeader },
          React.createElement(
            Text,
            { style: [reportStyles.tableHeaderText, reportStyles.invoiceNumberCell] },
            'Invoice #'
          ),
          React.createElement(
            Text,
            { style: [reportStyles.tableHeaderText, reportStyles.customerCell] },
            'Customer'
          ),
          React.createElement(
            Text,
            { style: [reportStyles.tableHeaderText, reportStyles.statusCell] },
            'Status'
          ),
          React.createElement(
            Text,
            { style: [reportStyles.tableHeaderText, reportStyles.dateCell] },
            'Issue Date'
          ),
          React.createElement(
            Text,
            { style: [reportStyles.tableHeaderText, reportStyles.dateCell] },
            'Due Date'
          ),
          React.createElement(
            Text,
            { style: [reportStyles.tableHeaderText, reportStyles.amountCell] },
            'Amount'
          ),
        ),

        // Table Rows
        ...reportData.invoices.map((invoice, index) =>
          React.createElement(
            View,
            { key: index, style: reportStyles.tableRow },
            React.createElement(
              Text,
              { style: [reportStyles.tableCell, reportStyles.invoiceNumberCell] },
              invoice.invoiceNumber
            ),
            React.createElement(
              View,
              { style: reportStyles.customerCell },
              React.createElement(
                Text,
                { style: [reportStyles.tableCell, { fontWeight: 'bold' }] },
                invoice.customer.name
              ),
              React.createElement(
                Text,
                { style: [reportStyles.tableCell, { fontSize: 8, color: '#666666' }] },
                invoice.customer.email
              ),
            ),
            React.createElement(
              View,
              { style: reportStyles.statusCell },
              React.createElement(
                Text,
                { style: getStatusStyle(invoice.status) },
                invoice.status.toUpperCase()
              ),
            ),
            React.createElement(
              Text,
              { style: [reportStyles.tableCell, reportStyles.dateCell] },
              formatDate(invoice.issueDate)
            ),
            React.createElement(
              Text,
              { style: [reportStyles.tableCell, reportStyles.dateCell] },
              formatDate(invoice.dueDate)
            ),
            React.createElement(
              Text,
              { style: [reportStyles.tableCell, reportStyles.amountCell] },
              formatCurrency(invoice.total, invoice.currency)
            ),
          ),
        ),

        // Footer
        React.createElement(
          Text,
          { style: reportStyles.footer },
          `Offer Hub Invoice Report • Generated on ${formatDate(new Date())} • Page 1`
        ),
      ),
    )

  const pdfBlob = await pdf(ReportDocument()).toBlob()
  return pdfBlob
}