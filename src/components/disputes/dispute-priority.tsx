'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { DisputeAutomationData, PriorityCalculationResult } from '@/types/dispute-automation.types';

interface DisputePriorityProps {
  dispute: DisputeAutomationData;
  autoCalculate?: boolean;
  onPriorityCalculated?: (result: PriorityCalculationResult) => void;
}

const PRIORITIES = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  high: { label: 'High', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  critical: { label: 'Critical', color: 'bg-red-200 text-red-900', icon: AlertTriangle },
};

export function DisputePriority({ dispute, autoCalculate, onPriorityCalculated }: DisputePriorityProps) {
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<PriorityCalculationResult | null>(null);

  useEffect(() => {
    if (autoCalculate) {
      calculatePriority();
    }
  }, [autoCalculate]);

  const calculatePriority = async () => {
    setCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let priority = 'low';
    let score = 30;
    
    if (dispute.amount > 1000) {
      score += 30;
    } else if (dispute.amount > 500) {
      score += 15;
    }
    
    if (dispute.priority === 'high' || dispute.priority === 'critical') {
      score += 25;
    } else if (dispute.priority === 'medium') {
      score += 10;
    }
    
    if (score >= 70) {
      priority = 'high';
    } else if (score >= 50) {
      priority = 'medium';
    }

    setResult({
      priority: priority as PriorityCalculationResult['priority'],
      score,
      factors: {
        amount: dispute.amount > 1000 ? 30 : dispute.amount > 500 ? 15 : 0,
        urgency: dispute.priority === 'high' || dispute.priority === 'critical' ? 25 : dispute.priority === 'medium' ? 10 : 0,
        userHistory: 0,
        projectComplexity: 0,
        timelineSensitivity: 0,
        communicationQuality: 0,
      },
      reasoning: [
        `Amount: $${dispute.amount}`,
        `Current Priority: ${dispute.priority}`,
        `Type: ${dispute.disputeType}`
      ],
      recommendedTimeline: priority === 'high' ? 24 : priority === 'medium' ? 48 : 72
    });
    setCalculating(false);
  };

  const acceptPriority = () => {
    if (result) {
      onPriorityCalculated?.(result);
    }
  };

  if (calculating) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calculator className="h-12 w-12 text-[#149A9B] mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-[#002333] mb-2">Calculating Priority...</h3>
          <p className="text-[#6D758F]">Analyzing dispute factors</p>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    const priorityInfo = PRIORITIES[result.priority];
    const Icon = priorityInfo.icon;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#059669]" />
            Priority Calculated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F1F3F7] rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium text-[#002333]">{priorityInfo.label} Priority</span>
                </div>
                <p className="text-sm text-[#6D758F]">Score: {result.score}/100</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${priorityInfo.color}`}>
                {priorityInfo.label}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-[#002333] mb-2">Factors Considered:</h4>
              <ul className="text-sm text-[#6D758F] space-y-1">
                {result.reasoning.map((factor, index) => (
                  <li key={index}>• {factor}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={acceptPriority}
                className="bg-[#149A9B] hover:bg-[#118787]"
              >
                Accept Priority
              </Button>
              <Button 
                variant="outline"
                onClick={() => setResult(null)}
              >
                Recalculate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <Calculator className="h-10 w-10 text-[#B4B9C9] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#002333] mb-2">Calculate Priority</h3>
          <p className="text-[#6D758F] mb-6">
            We'll determine the priority level based on dispute details.
          </p>
          <Button onClick={calculatePriority} className="bg-[#149A9B] hover:bg-[#118787]">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Priority
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}