'use client'

import React from 'react'
import { Document, Page, Text, View, pdf } from '@react-pdf/renderer'
import type { Invoice } from '../../types/invoice.types'
import { formatCurrency, formatDate } from '../../utils/invoice-helpers'

import { StyleSheet } from '@react-pdf/renderer'

export const invoicePDFStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '2 solid #002333',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002333',
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#002333',
    marginTop: 5,
  },
  companyInfo: {
    textAlign: 'right',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002333',
    marginBottom: 5,
  },
  address: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002333',
    marginBottom: 10,
    borderBottom: '1 solid #DEEFE7',
    paddingBottom: 5,
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  customerDetails: {
    flex: 1,
  },
  invoiceDetails: {
    flex: 1,
    textAlign: 'right',
  },
  label: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: '#002333',
    marginBottom: 8,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#DEEFE7',
    padding: 10,
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1 solid #DEEFE7',
  },
  tableCell: {
    fontSize: 10,
    color: '#002333',
  },
  descriptionCell: {
    flex: 3,
  },
  quantityCell: {
    flex: 1,
    textAlign: 'center',
  },
  priceCell: {
    flex: 1,
    textAlign: 'right',
  },
  totalCell: {
    flex: 1,
    textAlign: 'right',
  },
  summary: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: 200,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#002333',
  },
  summaryValue: {
    fontSize: 12,
    color: '#002333',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#002333',
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #DEEFE7',
  },
  notes: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
})


interface InvoicePDFGeneratorProps {
  invoice: Invoice
  onGenerated?: (blob: Blob) => void
}

export async function generateInvoicePDF(invoice: Invoice): Promise<Blob> {
  const PDFDocument = () =>
    React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: 'A4', style: invoicePDFStyles.page },

        // Header
        React.createElement(
          View,
          { style: invoicePDFStyles.header },
          React.createElement(
            View,
            null,
            React.createElement(Text, { style: invoicePDFStyles.title }, 'INVOICE'),
            React.createElement(Text, { style: invoicePDFStyles.invoiceNumber }, `#${invoice.invoiceNumber}`),
          ),
          React.createElement(
            View,
            { style: invoicePDFStyles.companyInfo },
            React.createElement(Text, { style: invoicePDFStyles.companyName }, 'Offer Hub'),
            React.createElement(Text, { style: invoicePDFStyles.address }, 'billing@offerhub.com'),
            React.createElement(
              Text,
              { style: invoicePDFStyles.address },
              '456 Business Ave\nSan Francisco, CA 94105\nUSA',
            ),
          ),
        ),

        // Customer and Invoice Details
        React.createElement(
          View,
          { style: invoicePDFStyles.customerInfo },
          React.createElement(
            View,
            { style: invoicePDFStyles.customerDetails },
            React.createElement(Text, { style: invoicePDFStyles.label }, 'BILL TO:'),
            React.createElement(Text, { style: invoicePDFStyles.value }, invoice.customer.name),
            React.createElement(Text, { style: invoicePDFStyles.value }, invoice.customer.email),
            React.createElement(
              Text,
              { style: invoicePDFStyles.value },
              `${invoice.customer.address.street}\n${invoice.customer.address.city}, ${invoice.customer.address.state} ${invoice.customer.address.zipCode}\n${invoice.customer.address.country}`,
            ),
          ),
          React.createElement(
            View,
            { style: invoicePDFStyles.invoiceDetails },
            React.createElement(Text, { style: invoicePDFStyles.label }, 'INVOICE DATE:'),
            React.createElement(Text, { style: invoicePDFStyles.value }, formatDate(invoice.issueDate)),
            React.createElement(Text, { style: invoicePDFStyles.label }, 'DUE DATE:'),
            React.createElement(Text, { style: invoicePDFStyles.value }, formatDate(invoice.dueDate)),
            React.createElement(Text, { style: invoicePDFStyles.label }, 'STATUS:'),
            React.createElement(Text, { style: invoicePDFStyles.value }, invoice.status.toUpperCase()),
          ),
        ),

        // Items Table
        React.createElement(
          View,
          { style: invoicePDFStyles.table },
          React.createElement(
            View,
            { style: invoicePDFStyles.tableHeader },
            React.createElement(
              Text,
              { style: [invoicePDFStyles.tableCell, invoicePDFStyles.descriptionCell, { fontWeight: 'bold' }] },
              'Description',
            ),
            React.createElement(
              Text,
              { style: [invoicePDFStyles.tableCell, invoicePDFStyles.quantityCell, { fontWeight: 'bold' }] },
              'Qty',
            ),
            React.createElement(
              Text,
              { style: [invoicePDFStyles.tableCell, invoicePDFStyles.priceCell, { fontWeight: 'bold' }] },
              'Rate',
            ),
            React.createElement(
              Text,
              { style: [invoicePDFStyles.tableCell, invoicePDFStyles.totalCell, { fontWeight: 'bold' }] },
              'Amount',
            ),
          ),
          ...invoice.items.map((item, index) =>
            React.createElement(
              View,
              { key: index, style: invoicePDFStyles.tableRow },
              React.createElement(
                Text,
                { style: [invoicePDFStyles.tableCell, invoicePDFStyles.descriptionCell] },
                item.description,
              ),
              React.createElement(
                Text,
                { style: [invoicePDFStyles.tableCell, invoicePDFStyles.quantityCell] },
                item.quantity.toString(),
              ),
              React.createElement(
                Text,
                { style: [invoicePDFStyles.tableCell, invoicePDFStyles.priceCell] },
                formatCurrency(item.unitPrice),
              ),
              React.createElement(
                Text,
                { style: [invoicePDFStyles.tableCell, invoicePDFStyles.totalCell] },
                formatCurrency(item.total),
              ),
            ),
          ),
        ),

        // Summary
        React.createElement(
          View,
          { style: invoicePDFStyles.summary },
          React.createElement(
            View,
            { style: invoicePDFStyles.summaryRow },
            React.createElement(Text, { style: invoicePDFStyles.summaryLabel }, 'Subtotal:'),
            React.createElement(Text, { style: invoicePDFStyles.summaryValue }, formatCurrency(invoice.subtotal)),
          ),
          React.createElement(
            View,
            { style: invoicePDFStyles.summaryRow },
            React.createElement(Text, { style: invoicePDFStyles.summaryLabel }, 'Tax:'),
            React.createElement(Text, { style: invoicePDFStyles.summaryValue }, formatCurrency(invoice.taxAmount)),
          ),
          React.createElement(
            View,
            { style: invoicePDFStyles.totalRow },
            React.createElement(Text, { style: invoicePDFStyles.totalLabel }, 'Total:'),
            React.createElement(Text, { style: invoicePDFStyles.totalValue }, formatCurrency(invoice.total)),
          ),
        ),

        // Footer
        invoice.notes &&
          React.createElement(
            View,
            { style: invoicePDFStyles.footer },
            React.createElement(Text, { style: invoicePDFStyles.sectionTitle }, 'Notes'),
            React.createElement(Text, { style: invoicePDFStyles.notes }, invoice.notes),
          ),
      ),
    )

  const pdfBlob = await pdf(PDFDocument()).toBlob()
  return pdfBlob
}

export function InvoicePDFGenerator({ invoice, onGenerated }: InvoicePDFGeneratorProps) {
  const handleGenerate = async () => {
    try {
      const blob = await generateInvoicePDF(invoice)
      onGenerated?.(blob)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    }
  }

  React.useEffect(() => {
    handleGenerate()
  }, [invoice])

  return null
}
