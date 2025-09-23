'use client';

import React from 'react';
import { FeeManager } from '@/components/payments/fee-manager';
import { FeeCalculator } from '@/components/payments/fee-calculator';
import { CommissionDistribution } from '@/components/payments/commission-distribution';
import { FeeAnalyticsComponent } from '@/components/payments/fee-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Users, TrendingUp, Settings } from 'lucide-react';
import {
  FeeCalculationInput,
  CalculatedCommission,
  FeeAnalytics
} from '@/types/fee-management.types';

// demo data
const mockCalculationInput: FeeCalculationInput = {
  projectValue: 1000,
  projectType: 'fixed',
  userTier: 'basic',
  userId: 'user_123',
  projectId: 'project_456',
  currency: 'USD'
};

const mockCommissions: CalculatedCommission[] = [
  {
    id: 'comm_1',
    type: 'referral',
    amount: 50,
    percentage: 5,
    description: 'Referral commission for bringing new client',
    status: 'pending',
    dueDate: '2024-01-15',
    recipient: {
      id: 'user_789',
      name: 'John Smith',
      type: 'affiliate',
      accountDetails: {
        paypalEmail: 'john@example.com'
      },
      paymentPreferences: {
        method: 'paypal',
        currency: 'USD',
        frequency: 'monthly',
        minimumAmount: 25
      }
    }
  },
  {
    id: 'comm_2',
    type: 'partner',
    amount: 75,
    percentage: 7.5,
    description: 'Partner commission for enterprise client',
    status: 'applied',
    dueDate: '2024-01-20',
    recipient: {
      id: 'partner_123',
      name: 'Tech Solutions Inc',
      type: 'partner',
      accountDetails: {
        bankAccount: '**** 1234'
      },
      paymentPreferences: {
        method: 'bank_transfer',
        currency: 'USD',
        frequency: 'weekly',
        minimumAmount: 50
      }
    }
  }
];

const mockAnalytics: FeeAnalytics = {
  period: {
    start: '2024-01-01',
    end: '2024-01-31'
  },
  totalRevenue: 125000,
  totalFees: 8750,
  totalCommissions: 3250,
  feesByType: {
    platform_fee: 5000,
    service_fee: 2500,
    processing_fee: 1250
  },
  commissionsByType: {
    referral: 1500,
    partner: 1000,
    affiliate: 500
  },
  revenueByUserTier: {
    basic: 45000,
    premium: 35000,
    enterprise: 30000,
    vip: 15000
  },
  revenueByProjectType: {
    fixed: 50000,
    hourly: 35000,
    milestone: 25000,
    subscription: 15000
  },
  averageFeePercentage: 7.0,
  transactionCount: 150,
  refundRate: 2.5,
  disputeRate: 1.2,
  trends: [
    { date: '2024-01-01', revenue: 4000, fees: 280, commissions: 120, transactionCount: 5 },
    { date: '2024-01-02', revenue: 4200, fees: 294, commissions: 126, transactionCount: 6 },
    { date: '2024-01-03', revenue: 3800, fees: 266, commissions: 114, transactionCount: 4 },
    { date: '2024-01-04', revenue: 4500, fees: 315, commissions: 135, transactionCount: 7 },
    { date: '2024-01-05', revenue: 4100, fees: 287, commissions: 123, transactionCount: 5 },
    { date: '2024-01-06', revenue: 4300, fees: 301, commissions: 129, transactionCount: 6 },
    { date: '2024-01-07', revenue: 3900, fees: 273, commissions: 117, transactionCount: 4 }
  ]
};

export default function FeeManagementDemo() {
  const handleFeeCalculated = (result: any) => {
    console.log('Fee calculated:', result);
  };

  const handleFeeApplied = (transaction: any) => {
    console.log('Fee applied:', transaction);
  };

  const handleCommissionDistribute = async (commissionIds: string[]) => {
    console.log('Distributing commissions:', commissionIds);
    await new Promise(resolve => setTimeout(resolve, 1000)); // fake delay
  };

  const handleRecipientUpdate = (recipientId: string, updates: any) => {
    console.log('Updating recipient:', recipientId, updates);
  };

  const handlePeriodChange = (period: { start: string; end: string }) => {
    console.log('Period changed:', period);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log('Exporting as:', format);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#002333]">
            Fee Management System Demo
          </h1>
          <p className="text-[#6D758F] text-sm sm:text-base max-w-2xl mx-auto">
            Fee management system demo with calculations, commission distribution, and analytics
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-max min-w-full lg:grid lg:w-full lg:grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center gap-2 whitespace-nowrap">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Calculator</span>
              </TabsTrigger>
              <TabsTrigger value="commissions" className="flex items-center gap-2 whitespace-nowrap">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Commissions</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 whitespace-nowrap">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Fee Management System</CardTitle>
              </CardHeader>
              <CardContent>
                <FeeManager
                  userId="demo_user_123"
                  projectId="demo_project_456"
                  onFeeCalculated={handleFeeCalculated}
                  onFeeApplied={handleFeeApplied}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Calculator & Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <FeeCalculator
                  input={mockCalculationInput}
                  onCalculate={handleFeeCalculated}
                  showBreakdown={true}
                  showAdvanced={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <CommissionDistribution
                  commissions={mockCommissions}
                  onDistribute={handleCommissionDistribute}
                  onRecipientUpdate={handleRecipientUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Analytics & Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <FeeAnalyticsComponent
                  analytics={mockAnalytics}
                  onPeriodChange={handlePeriodChange}
                  onExport={handleExport}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}