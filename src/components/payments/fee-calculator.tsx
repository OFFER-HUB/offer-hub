'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  DollarSign,
  Percent,
  TrendingUp,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  FeeCalculatorProps,
  FeeCalculationResult,
  CalculatedFee
} from '@/types/fee-management.types';
import { calculateFees } from '@/utils/fee-calculations';

export function FeeCalculator({ 
  input, 
  onCalculate, 
  showBreakdown = true, 
  showAdvanced = false,
  className 
}: FeeCalculatorProps) {
  const [result, setResult] = useState<FeeCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (input.projectValue <= 0) {
      setError('Project value must be greater than 0');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const calculationResult = await calculateFees(input);
      setResult(calculationResult);
      onCalculate?.(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (input.projectValue > 0) {
      handleCalculate();
    }
  }, [input]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: input.currency
    }).format(amount);
  };

  const getFeeTypeIcon = (type: string) => {
    switch (type) {
      case 'platform_fee':
        return <DollarSign className="h-4 w-4" />;
      case 'service_fee':
        return <Percent className="h-4 w-4" />;
      case 'processing_fee':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Calculator className="h-4 w-4" />;
    }
  };

  const getFeeTypeColor = (type: string) => {
    switch (type) {
      case 'platform_fee':
        return 'bg-blue-100 text-blue-800';
      case 'service_fee':
        return 'bg-green-100 text-green-800';
      case 'processing_fee':
        return 'bg-orange-100 text-orange-800';
      case 'commission':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fee Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#002333]">Project Value</label>
              <div className="text-lg font-semibold text-[#002333]">
                {formatCurrency(input.projectValue)}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#002333]">Project Type</label>
              <Badge variant="outline" className="text-sm capitalize">
                {input.projectType.replace('_', ' ')}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#002333]">User Tier</label>
              <Badge variant="outline" className="text-sm capitalize">
                {input.userTier}
              </Badge>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <Button
            onClick={handleCalculate}
            disabled={isCalculating || input.projectValue <= 0}
            className="w-full sm:w-auto bg-[#149A9B] hover:bg-[#118787]"
          >
            {isCalculating ? 'Calculating...' : 'Recalculate Fees'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Calculation Results
                </span>
                <Badge className="bg-green-100 text-green-800">
                  {result.breakdown.feePercentage.toFixed(1)}% total fees
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#F1F3F7] rounded-lg">
                  <div className="text-2xl font-bold text-[#002333]">
                    {formatCurrency(result.totalAmount)}
                  </div>
                  <div className="text-sm text-[#6D758F]">Gross Amount</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    -{formatCurrency(result.totalAmount - result.netAmount)}
                  </div>
                  <div className="text-sm text-[#6D758F]">Total Fees</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(result.netAmount)}
                  </div>
                  <div className="text-sm text-[#6D758F]">Net Amount</div>
                </div>
              </div>

              {showBreakdown && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-[#002333] mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Fee Breakdown
                    </h4>
                    <div className="space-y-3">
                      {result.fees.map((fee) => (
                        <FeeItem key={fee.id} fee={fee} currency={input.currency} />
                      ))}
                    </div>
                  </div>

                  {result.commissions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-[#002333] mb-3">Commissions</h4>
                        <div className="space-y-3">
                          {result.commissions.map((commission) => (
                            <div
                              key={commission.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-purple-50 rounded-lg gap-2"
                            >
                              <div className="space-y-1">
                                <div className="font-medium text-[#002333] capitalize">
                                  {commission.type.replace('_', ' ')} Commission
                                </div>
                                <div className="text-sm text-[#6D758F]">
                                  To: {commission.recipient.name}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-[#002333]">
                                  {formatCurrency(commission.amount)}
                                </div>
                                <div className="text-sm text-[#6D758F]">
                                  {commission.percentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {showAdvanced && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-[#002333] mb-3">Advanced Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-[#6D758F]">User Tier:</span>
                            <span className="ml-2 text-[#002333]">{result.input.userTier}</span>
                          </div>
                          <div>
                            <span className="text-[#6D758F]">Calculated At:</span>
                            <span className="ml-2 text-[#002333]">
                              {new Date(result.calculatedAt).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#6D758F]">Project Type:</span>
                            <span className="ml-2 text-[#002333]">{result.input.projectType}</span>
                          </div>
                          <div>
                            <span className="text-[#6D758F]">Currency:</span>
                            <span className="ml-2 text-[#002333]">{input.currency}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

interface FeeItemProps {
  fee: CalculatedFee;
  currency: string;
}

function FeeItem({ fee, currency }: FeeItemProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getFeeTypeIcon = (type: string) => {
    switch (type) {
      case 'platform_fee':
        return <DollarSign className="h-4 w-4" />;
      case 'service_fee':
        return <Percent className="h-4 w-4" />;
      case 'processing_fee':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Calculator className="h-4 w-4" />;
    }
  };

  const getFeeTypeColor = (type: string) => {
    switch (type) {
      case 'platform_fee':
        return 'bg-blue-100 text-blue-800';
      case 'service_fee':
        return 'bg-green-100 text-green-800';
      case 'processing_fee':
        return 'bg-orange-100 text-orange-800';
      case 'commission':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-[#E1E4ED] rounded-lg gap-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${getFeeTypeColor(fee.type)}`}>
          {getFeeTypeIcon(fee.type)}
        </div>
        <div className="space-y-1">
          <div className="font-medium text-[#002333]">{fee.name}</div>
          <div className="text-sm text-[#6D758F]">{fee.description}</div>
          {fee.rule.calculationMethod === 'percentage' && fee.percentage && (
            <div className="text-xs text-[#6D758F]">
              {fee.percentage.toFixed(1)}% of project value
            </div>
          )}
          {fee.rule.calculationMethod === 'fixed' && (
            <div className="text-xs text-[#6D758F]">
              Fixed amount
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-[#002333]">
          {formatCurrency(fee.amount)}
        </div>
      </div>
    </div>
  );
}