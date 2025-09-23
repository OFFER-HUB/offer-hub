'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Calculator,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Percent,
  FileText
} from 'lucide-react';
import { useFeeManagement } from '@/hooks/use-fee-management';
import {
  FeeManagerProps,
  FeeStructure,
  FeeCalculationInput,
  UserTier,
  ProjectType
} from '@/types/fee-management.types';

export function FeeManager({ userId, projectId, className, onFeeCalculated, onFeeApplied }: FeeManagerProps) {
  const {
    feeStructures,
    calculations,
    transactions,
    isLoading,
    error,
    calculateFees,
    applyFees,
    clearError
  } = useFeeManagement();

  const [activeTab, setActiveTab] = useState('calculator');
  // basic input state
  const [calculationInput, setCalculationInput] = useState<FeeCalculationInput>({
    projectValue: 0,
    projectType: 'fixed',
    userTier: 'basic',
    userId: userId || '',
    projectId: projectId || '',
    currency: 'USD'
  });

  const handleCalculateFees = async () => {
    try {
      const result = await calculateFees(calculationInput);
      onFeeCalculated?.(result);
    } catch {
      // hook handles errors
    }
  };

  const handleApplyFees = async (calculationId: string) => {
    try {
      await applyFees(calculationId);
      const transaction = transactions.find(t => t.calculation.input.projectId === calculationId);
      if (transaction) {
        onFeeApplied?.(transaction);
      }
    } catch {
      // whatever
    }
  };

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <p className="text-red-600">Error: {error}</p>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#002333]">Fee Management</h1>
          <p className="text-[#6D758F] text-sm sm:text-base">Manage fees, commissions, and pricing structures</p>
        </div>
        {/* TODO: add refresh functionality */}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max min-w-full lg:grid lg:w-full lg:grid-cols-5">
            <TabsTrigger value="calculator" className="flex items-center gap-2 whitespace-nowrap">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="structures" className="flex items-center gap-2 whitespace-nowrap">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Structures</span>
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center gap-2 whitespace-nowrap">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Commissions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2 whitespace-nowrap">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calculator" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Fee Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#002333] mb-2">
                    Project Value *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6D758F]" />
                    <Input
                      type="number"
                      value={calculationInput.projectValue}
                      onChange={(e) => setCalculationInput(prev => ({
                        ...prev,
                        projectValue: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#002333] mb-2">
                    Project Type *
                  </label>
                  <select
                    value={calculationInput.projectType}
                    onChange={(e) => setCalculationInput(prev => ({
                      ...prev,
                      projectType: e.target.value as ProjectType
                    }))}
                    className="w-full p-2 border border-[#E1E4ED] rounded-md focus:ring-2 focus:ring-[#149A9B] focus:border-transparent"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="milestone">Milestone</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#002333] mb-2">
                    User Tier *
                  </label>
                  <select
                    value={calculationInput.userTier}
                    onChange={(e) => setCalculationInput(prev => ({
                      ...prev,
                      userTier: e.target.value as UserTier
                    }))}
                    className="w-full p-2 border border-[#E1E4ED] rounded-md focus:ring-2 focus:ring-[#149A9B] focus:border-transparent"
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#002333] mb-2">
                    Currency *
                  </label>
                  <select
                    value={calculationInput.currency}
                    onChange={(e) => setCalculationInput(prev => ({
                      ...prev,
                      currency: e.target.value
                    }))}
                    className="w-full p-2 border border-[#E1E4ED] rounded-md focus:ring-2 focus:ring-[#149A9B] focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleCalculateFees}
                disabled={isLoading || calculationInput.projectValue <= 0}
                className="w-full sm:w-auto bg-[#149A9B] hover:bg-[#118787]"
              >
                {isLoading ? 'Calculating...' : 'Calculate Fees'}
              </Button>
            </CardContent>
          </Card>

          {calculations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Calculations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calculations.slice(0, 3).map((calc) => (
                    <div key={calc.calculatedAt} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-[#F1F3F7] rounded-lg gap-3">
                      <div className="space-y-1">
                        <div className="font-medium text-[#002333]">
                          ${calc.input.projectValue.toLocaleString()} - {calc.input.projectType}
                        </div>
                        <div className="text-sm text-[#6D758F]">
                          Net: ${calc.netAmount.toLocaleString()} | Fees: ${calc.breakdown.platformFees.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {calc.breakdown.feePercentage.toFixed(1)}%
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleApplyFees(calc.input.projectId)}
                          className="bg-[#149A9B] hover:bg-[#118787]"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="structures" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-[#002333]">Fee Structures</h2>
            <Button className="bg-[#149A9B] hover:bg-[#118787] w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Structure
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {feeStructures.map((structure) => (
              <Card key={structure.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg">{structure.name}</CardTitle>
                      <p className="text-sm text-[#6D758F] mt-1">Fee structure for {structure.userTiers.join(', ')} users</p>
                    </div>
                    <Badge variant={structure.isActive ? "default" : "secondary"}>
                      {structure.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-[#002333] mb-1">User Tiers</div>
                    <div className="flex flex-wrap gap-1">
                      {structure.userTiers.map((tier) => (
                        <Badge key={tier} variant="outline" className="text-xs">
                          {tier}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Project types removed for simplicity */}

                  <div>
                    <div className="text-sm font-medium text-[#002333] mb-1">Fee Rules</div>
                    <div className="text-sm text-[#6D758F]">
                      {structure.rules.length} rule{structure.rules.length !== 1 ? 's' : ''} configured
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4 sm:space-y-6">
          <h2 className="text-lg font-semibold text-[#002333]">Commission Management</h2>
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-[#6D758F]">
                <Users className="h-12 w-12 mx-auto mb-3 text-[#B4B9C9]" />
                <p>TODO: Commission distribution component will be implemented next</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          <h2 className="text-lg font-semibold text-[#002333]">Fee Analytics</h2>
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-[#6D758F]">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-[#B4B9C9]" />
                <p>TODO: Analytics dashboard</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
          <h2 className="text-lg font-semibold text-[#002333]">Fee Transactions</h2>
          
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-[#6D758F]">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-[#B4B9C9]" />
                  <p>No fee transactions found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-medium text-[#002333]">
                          Transaction #{transaction.id.slice(-8)}
                        </div>
                        <div className="text-sm text-[#6D758F]">
                          Project: {transaction.projectId} | User: {transaction.userId}
                        </div>
                        <div className="text-sm text-[#6D758F]">
                          Total: ${transaction.calculation.totalAmount.toLocaleString()} | 
                          Net: ${transaction.calculation.netAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={transaction.status === 'applied' ? 'default' : 'secondary'}
                        >
                          {transaction.status}
                        </Badge>
                        {transaction.processedAt && (
                          <span className="text-xs text-[#6D758F]">
                            {new Date(transaction.processedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}