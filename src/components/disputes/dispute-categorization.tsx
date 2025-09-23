'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle } from 'lucide-react';
import { DisputeAutomationData } from '@/types/dispute-automation.types';

interface DisputeCategorizationProps {
  dispute: DisputeAutomationData;
  onCategorized?: (category: string) => void;
}

const CATEGORIES = [
  { id: 'payment', label: 'Payment Issue' },
  { id: 'quality', label: 'Quality Problem' },
  { id: 'timeline', label: 'Timeline Issue' },
  { id: 'communication', label: 'Communication' },
  { id: 'other', label: 'Other' },
];

export function DisputeCategorization({ dispute, onCategorized }: DisputeCategorizationProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeDispute = async () => {
    setAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const description = dispute.description.toLowerCase();
    let category = 'other';
    let confidence = 0.7;
    
    if (description.includes('payment') || description.includes('money') || description.includes('paid')) {
      category = 'payment';
      confidence = 0.9;
    } else if (description.includes('quality') || description.includes('work') || description.includes('poor')) {
      category = 'quality';
      confidence = 0.85;
    } else if (description.includes('deadline') || description.includes('late') || description.includes('time')) {
      category = 'timeline';
      confidence = 0.8;
    } else if (description.includes('communication') || description.includes('response') || description.includes('contact')) {
      category = 'communication';
      confidence = 0.75;
    }

    setResult({
      category,
      confidence,
      label: CATEGORIES.find(c => c.id === category)?.label || 'Other'
    });
    setAnalyzing(false);
  };

  const acceptResult = () => {
    onCategorized?.(result.category);
  };

  if (analyzing) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-[#149A9B] mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-[#002333] mb-2">Analyzing...</h3>
          <p className="text-[#6D758F]">Categorizing your dispute</p>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#059669]" />
            Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-[#d1fae5] border border-[#a7f3d0] rounded-lg">
              <h4 className="font-medium text-[#002333]">{result.label}</h4>
              <p className="text-sm text-[#6D758F]">
                Confidence: {Math.round(result.confidence * 100)}%
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={acceptResult}
                className="bg-[#059669] hover:bg-[#047857]"
              >
                Accept Classification
              </Button>
              <Button 
                variant="outline"
                onClick={() => setResult(null)}
              >
                Try Again
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
        <CardTitle>Dispute Classification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <Brain className="h-10 w-10 text-[#B4B9C9] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#002333] mb-2">Ready to Classify</h3>
          <p className="text-[#6D758F] mb-6">
            We'll analyze your dispute and suggest the best category.
          </p>
          <Button onClick={analyzeDispute} className="bg-[#149A9B] hover:bg-[#118787]">
            <Brain className="h-4 w-4 mr-2" />
            Analyze Dispute
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}