'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, FileSpreadsheet, Printer } from 'lucide-react'
import { useFinancialManagement } from '@/hooks/use-financial-management'
import { ExpensePieChart } from './charts/expense-pie-chart'
import { ReportSummaryCards } from './reporting/report-summary-cards'
import { ProfitLossTab } from './reporting/profit-loss-tab'
import { RevenueAnalysisTab } from './reporting/revenue-analysis-tab'

export default function FinancialReporting() {
  const { metrics, profitabilityAnalysis, revenueStreams, expenses, expenseBreakdownData, exportData } =
    useFinancialManagement()
  const [selectedReport, setSelectedReport] = useState('profit_loss')
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
    to: new Date(),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getExportData = () => ({
    ...metrics,
    revenueStreams,
    expenseBreakdownData,
    expenses,
    type: selectedReport,
    period: selectedPeriod,
    dateRange,
  })

  const handleGenerateReport = async () => {
    try {
      console.log('[v0] Generate report clicked with data:', getExportData())
      await exportData('pdf', getExportData())
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header with Controls */}
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-[#002333]'>Financial Reporting</h2>
          <p className='text-[#002333]/70'>Generate comprehensive financial reports and analytics</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className='w-48'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='profit_loss'>Profit & Loss</SelectItem>
              <SelectItem value='revenue_analysis'>Revenue Analysis</SelectItem>
              <SelectItem value='expense_report'>Expense Report</SelectItem>
              <SelectItem value='tax_report'>Tax Report</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='weekly'>Weekly</SelectItem>
              <SelectItem value='monthly'>Monthly</SelectItem>
              <SelectItem value='quarterly'>Quarterly</SelectItem>
              <SelectItem value='yearly'>Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} className='bg-[#15949C] hover:bg-[#15949C]/90 text-white'>
            <Download className='h-4 w-4 mr-2' />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Report Summary Cards */}
      <ReportSummaryCards metrics={metrics} formatCurrency={formatCurrency} />

      {/* Report Content Tabs */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4 bg-white border border-[#15949C]/20'>
          <TabsTrigger value='profit_loss' className='data-[state=active]:bg-[#15949C] data-[state=active]:text-white'>
            Profit & Loss
          </TabsTrigger>
          <TabsTrigger
            value='revenue_analysis'
            className='data-[state=active]:bg-[#15949C] data-[state=active]:text-white'
          >
            Revenue Analysis
          </TabsTrigger>
          <TabsTrigger
            value='expense_report'
            className='data-[state=active]:bg-[#15949C] data-[state=active]:text-white'
          >
            Expense Report
          </TabsTrigger>
          <TabsTrigger value='tax_report' className='data-[state=active]:bg-[#15949C] data-[state=active]:text-white'>
            Tax Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value='profit_loss'>
          <ProfitLossTab formatCurrency={formatCurrency} />
        </TabsContent>

        <TabsContent value='revenue_analysis'>
          <RevenueAnalysisTab
            profitabilityAnalysis={profitabilityAnalysis}
            metrics={metrics}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value='expense_report' className='space-y-6'>
          {/* Expense Breakdown Chart */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-[#002333]'>Expense Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpensePieChart data={expenseBreakdownData} formatCurrency={formatCurrency} />
                <div className='mt-4 space-y-2'>
                  {expenseBreakdownData.map((item, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
                        <span className='text-sm text-[#002333]'>{item.name}</span>
                      </div>
                      <span className='font-medium text-[#002333]'>{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-[#002333]'>Expense Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {expenseBreakdownData.map((expense, index) => (
                    <div key={index} className='p-4 bg-[#DEEFE7]/20 rounded-lg'>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='font-medium text-[#002333]'>{expense.name}</span>
                        <span className='text-sm text-green-600'>-{Math.floor(Math.random() * 10 + 2)}%</span>
                      </div>
                      <div className='text-2xl font-bold text-[#002333] mb-1'>{formatCurrency(expense.value)}</div>
                      <div className='text-xs text-[#002333]/70'>
                        vs {formatCurrency(expense.value * 1.1)} last month
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='tax_report' className='space-y-6'>
          {/* Tax Summary */}
          <Card>
            <CardHeader>
              <CardTitle className='text-[#002333]'>Tax Summary</CardTitle>
              <CardDescription>Tax calculations and compliance information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='text-center p-6 bg-[#DEEFE7]/20 rounded-lg'>
                  <div className='text-2xl font-bold text-[#002333]'>
                    {formatCurrency(metrics?.totalRevenue ? metrics.totalRevenue * 0.21 : 0)}
                  </div>
                  <div className='text-sm text-[#002333]/70 mt-1'>Estimated Tax Liability</div>
                  <div className='text-xs text-[#002333]/50 mt-2'>21% corporate rate</div>
                </div>
                <div className='text-center p-6 bg-[#15949C]/10 rounded-lg'>
                  <div className='text-2xl font-bold text-[#15949C]'>
                    {formatCurrency(metrics?.totalExpenses ? metrics.totalExpenses * 0.15 : 0)}
                  </div>
                  <div className='text-sm text-[#002333]/70 mt-1'>Deductible Expenses</div>
                  <div className='text-xs text-[#002333]/50 mt-2'>Business expenses</div>
                </div>
                <div className='text-center p-6 bg-green-50 rounded-lg'>
                  <div className='text-2xl font-bold text-green-600'>
                    {formatCurrency(
                      metrics?.totalRevenue && metrics?.totalExpenses
                        ? (metrics.totalRevenue - metrics.totalExpenses) * 0.21
                        : 0,
                    )}
                  </div>
                  <div className='text-sm text-[#002333]/70 mt-1'>Net Tax Due</div>
                  <div className='text-xs text-[#002333]/50 mt-2'>After deductions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Compliance Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className='text-[#002333]'>Tax Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[
                  { item: 'Quarterly tax filing', status: 'completed', dueDate: '2024-04-15' },
                  { item: 'Annual tax return', status: 'pending', dueDate: '2024-03-15' },
                  { item: 'Sales tax reporting', status: 'completed', dueDate: '2024-01-31' },
                  { item: '1099 forms issued', status: 'completed', dueDate: '2024-01-31' },
                ].map((item, index) => (
                  <div key={index} className='flex items-center justify-between p-4 border border-[#DEEFE7] rounded-lg'>
                    <div>
                      <div className='font-medium text-[#002333]'>{item.item}</div>
                      <div className='text-sm text-[#002333]/70'>Due: {item.dueDate}</div>
                    </div>
                    <Badge
                      className={
                        item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className='text-[#002333]'>Export Options</CardTitle>
          <CardDescription>Download reports in various formats for external analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <Button
              onClick={() => {
                console.log('[v0] CSV export clicked with data:', getExportData())
                exportData('csv', getExportData())
              }}
              variant='outline'
              className='border-[#15949C] text-[#15949C] hover:bg-[#DEEFE7]'
            >
              <FileSpreadsheet className='h-4 w-4 mr-2' />
              Export as CSV
            </Button>
            <Button
              onClick={() => {
                console.log('[v0] PDF export clicked with data:', getExportData())
                exportData('pdf', getExportData())
              }}
              variant='outline'
              className='border-[#15949C] text-[#15949C] hover:bg-[#DEEFE7]'
            >
              <Printer className='h-4 w-4 mr-2' />
              Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
