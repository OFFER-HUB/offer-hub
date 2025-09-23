'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle
} from 'lucide-react';
import {
  FeeAnalyticsProps,
  FeeAnalytics,
  AnalyticsTrend,
  FeeType,
  UserTier,
  ProjectType
} from '@/types/fee-management.types';

export function FeeAnalyticsComponent({
  analytics,
  onPeriodChange,
  onExport,
  className
}: FeeAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const handlePeriodChange = (period: '7d' | '30d' | '90d' | '1y') => {
    setSelectedPeriod(period);
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    onPeriodChange?.({
      start: start.toISOString(),
      end: now.toISOString()
    });
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    onExport?.(format);
  };

  // Mock data for trends (in real implementation, this would come from analytics.trends)
  const recentTrends = analytics.trends.slice(-7);
  const previousPeriodRevenue = analytics.totalRevenue * 0.85; // Mock previous period data

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#002333] flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Fee Analytics
          </h2>
          <p className="text-[#6D758F] text-sm mt-1">
            Period: {new Date(analytics.period.start).toLocaleDateString()} - {new Date(analytics.period.end).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-1 bg-[#F1F3F7] rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-[#002333] shadow-sm'
                    : 'text-[#6D758F] hover:text-[#002333]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          trend={calculateTrend(analytics.totalRevenue, previousPeriodRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          color="text-green-600"
        />
        <MetricCard
          title="Total Fees"
          value={formatCurrency(analytics.totalFees)}
          trend={calculateTrend(analytics.totalFees, analytics.totalFees * 0.9)}
          icon={<BarChart3 className="h-5 w-5" />}
          color="text-blue-600"
        />
        <MetricCard
          title="Commissions"
          value={formatCurrency(analytics.totalCommissions)}
          trend={calculateTrend(analytics.totalCommissions, analytics.totalCommissions * 0.8)}
          icon={<Users className="h-5 w-5" />}
          color="text-purple-600"
        />
        <MetricCard
          title="Transactions"
          value={analytics.transactionCount.toLocaleString()}
          trend={calculateTrend(analytics.transactionCount, analytics.transactionCount * 0.85)}
          icon={<FileText className="h-5 w-5" />}
          color="text-orange-600"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6D758F]">Avg Fee %</p>
                <p className="text-xl font-bold text-[#002333]">
                  {formatPercentage(analytics.averageFeePercentage)}
                </p>
              </div>
              <Percent className="h-6 w-6 text-[#149A9B]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6D758F]">Refund Rate</p>
                <p className="text-xl font-bold text-[#002333]">
                  {formatPercentage(analytics.refundRate)}
                </p>
              </div>
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6D758F]">Dispute Rate</p>
                <p className="text-xl font-bold text-[#002333]">
                  {formatPercentage(analytics.disputeRate)}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max min-w-full lg:grid lg:w-full lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="flex items-center gap-2 whitespace-nowrap">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Breakdown</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2 whitespace-nowrap">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="segments" className="flex items-center gap-2 whitespace-nowrap">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Segments</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-[#6D758F]">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-[#B4B9C9]" />
                  <p>Revenue trend chart would be displayed here</p>
                  <p className="text-sm mt-1">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fees by Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.feesByType).map(([type, amount]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#149A9B] rounded-full"></div>
                      <span className="text-sm text-[#002333] capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#002333]">
                        {formatCurrency(amount)}
                      </div>
                      <div className="text-xs text-[#6D758F]">
                        {formatPercentage((amount / analytics.totalFees) * 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commissions by Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.commissionsByType).map(([type, amount]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-[#002333] capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#002333]">
                        {formatCurrency(amount)}
                      </div>
                      <div className="text-xs text-[#6D758F]">
                        {formatPercentage((amount / analytics.totalCommissions) * 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#F1F3F7] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-[#6D758F]" />
                      <span className="text-sm text-[#002333]">
                        {new Date(trend.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-right">
                      <div>
                        <div className="text-xs text-[#6D758F]">Revenue</div>
                        <div className="text-sm font-medium text-[#002333]">
                          {formatCurrency(trend.revenue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#6D758F]">Fees</div>
                        <div className="text-sm font-medium text-[#002333]">
                          {formatCurrency(trend.fees)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#6D758F]">Transactions</div>
                        <div className="text-sm font-medium text-[#002333]">
                          {trend.transactionCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by User Tier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.revenueByUserTier).map(([tier, amount]) => (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {tier}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#002333]">
                        {formatCurrency(amount)}
                      </div>
                      <div className="text-xs text-[#6D758F]">
                        {formatPercentage((amount / analytics.totalRevenue) * 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Project Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.revenueByProjectType).map(([type, amount]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#002333]">
                        {formatCurrency(amount)}
                      </div>
                      <div className="text-xs text-[#6D758F]">
                        {formatPercentage((amount / analytics.totalRevenue) * 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  trend: { value: number; isPositive: boolean };
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, trend, icon, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={color}>{icon}</div>
          <div className={`flex items-center gap-1 text-xs ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value.toFixed(1)}%
          </div>
        </div>
        <div>
          <p className="text-sm text-[#6D758F] mb-1">{title}</p>
          <p className="text-xl font-bold text-[#002333]">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Percent({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}