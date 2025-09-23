/**
 * @fileoverview Interactive demo page for automated dispute resolution system
 * @author Offer Hub Team
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Brain,
  Calculator,
  Users,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { DisputeInitiation } from '@/components/disputes/dispute-initiation';
import { DisputeCategorization } from '@/components/disputes/dispute-categorization';
import { DisputePriority } from '@/components/disputes/dispute-priority';
import {
  DisputeAutomationData,
  DisputeCategory,
  PriorityCalculationResult
} from '@/types/dispute-automation.types';

// Mock dispute data for demo
const DEMO_DISPUTES: DisputeAutomationData[] = [
  {
    id: 'demo_dispute_1',
    projectId: 'proj_001',
    clientId: 'client_001',
    freelancerId: 'freelancer_001',
    disputeType: 'payment_dispute',
    category: 'payment_issues',
    priority: 'high',
    status: 'initiated',
    amount: 2500,
    currency: 'USD',
    description: 'Client has not released payment for completed milestone despite delivering all requirements. The work was completed on time and meets all specified criteria. Multiple attempts to contact client have been unsuccessful.',
    evidence: [],
    timeline: [
      {
        id: 'event_1',
        type: 'status_change',
        timestamp: new Date().toISOString(),
        actor: 'freelancer_001',
        action: 'Dispute initiated',
        details: 'Payment dispute submitted'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo_dispute_2',
    projectId: 'proj_002',
    clientId: 'client_002',
    freelancerId: 'freelancer_002',
    disputeType: 'quality_dispute',
    category: 'deliverable_quality',
    priority: 'medium',
    status: 'categorized',
    amount: 1200,
    currency: 'USD',
    description: 'The delivered website does not match the design specifications provided. Several key features are missing and the responsive design is not working properly on mobile devices.',
    evidence: [],
    timeline: [
      {
        id: 'event_2',
        type: 'status_change',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actor: 'client_002',
        action: 'Dispute initiated',
        details: 'Quality dispute submitted'
      }
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo_dispute_3',
    projectId: 'proj_003',
    clientId: 'client_003',
    freelancerId: 'freelancer_003',
    disputeType: 'communication_dispute',
    category: 'communication_breakdown',
    priority: 'low',
    status: 'assigned',
    amount: 800,
    currency: 'USD',
    description: 'Freelancer has been unresponsive for the past week. No updates on project progress and not answering messages. Need clarification on current status.',
    evidence: [],
    timeline: [
      {
        id: 'event_3',
        type: 'status_change',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        actor: 'client_003',
        action: 'Dispute initiated',
        details: 'Communication dispute submitted'
      }
    ],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default function AutomatedDisputeDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [selectedDispute, setSelectedDispute] = useState<DisputeAutomationData>(DEMO_DISPUTES[0]);
  const [demoSteps, setDemoSteps] = useState<Record<string, boolean>>({
    initiation: false,
    categorization: false,
    priority: false,
    assignment: false,
  });

  const markStepComplete = (step: string) => {
    setDemoSteps(prev => ({ ...prev, [step]: true }));
  };

  const getStepIcon = (step: string, completed: boolean) => {
    const icons = {
      initiation: <FileText className="h-4 w-4" />,
      categorization: <Brain className="h-4 w-4" />,
      priority: <Calculator className="h-4 w-4" />,
      assignment: <Users className="h-4 w-4" />,
    };
    
    if (completed) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    
    return icons[step as keyof typeof icons] || <Clock className="h-4 w-4" />;
  };

  const completedStepsCount = Object.values(demoSteps).filter(Boolean).length;
  const progressPercentage = (completedStepsCount / 4) * 100;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-[#e4f7f7] rounded-lg">
            <TrendingUp className="h-6 w-6 text-[#149A9B]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Automated Dispute Resolution Demo
            </h1>
            <p className="text-gray-600">
              Interactive demonstration of the comprehensive dispute automation system
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card className="bg-gradient-to-r from-[#e4f7f7] to-[#f0fdfe] border-[#96dfdf]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Demo Progress</h3>
              <Badge className="bg-[#e4f7f7] text-[#0d6e6e]">
                {completedStepsCount}/4 Steps Complete
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#149A9B] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-4">
              {[
                { key: 'initiation', label: 'Dispute Initiation' },
                { key: 'categorization', label: 'AI Categorization' },
                { key: 'priority', label: 'Priority Scoring' },
                { key: 'assignment', label: 'Mediator Assignment' },
              ].map((step) => (
                <div key={step.key} className="flex items-center space-x-2">
                  {getStepIcon(step.key, demoSteps[step.key])}
                  <span className={`text-sm ${demoSteps[step.key] ? 'text-green-600' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Tabs */}
      <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="transition-all duration-300 ease-in-out hover:bg-[#149A9B]/10 hover:scale-105 data-[state=active]:bg-[#149A9B] data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="initiation" className="transition-all duration-300 ease-in-out hover:bg-[#149A9B]/10 hover:scale-105 data-[state=active]:bg-[#149A9B] data-[state=active]:text-white">Initiation</TabsTrigger>
          <TabsTrigger value="categorization" className="transition-all duration-300 ease-in-out hover:bg-[#149A9B]/10 hover:scale-105 data-[state=active]:bg-[#149A9B] data-[state=active]:text-white">Categorization</TabsTrigger>
          <TabsTrigger value="priority" className="transition-all duration-300 ease-in-out hover:bg-[#149A9B]/10 hover:scale-105 data-[state=active]:bg-[#149A9B] data-[state=active]:text-white">Priority</TabsTrigger>
          <TabsTrigger value="analytics" className="transition-all duration-300 ease-in-out hover:bg-[#149A9B]/10 hover:scale-105 data-[state=active]:bg-[#149A9B] data-[state=active]:text-white">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="animate-in slide-in-from-bottom fade-in duration-700 ease-out">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Overview */}
            <Card className="animate-in slide-in-from-bottom fade-in duration-500 delay-100">
              <CardHeader>
                <CardTitle>System Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg animate-in slide-in-from-bottom fade-in duration-500 delay-200">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Intelligent Dispute Processing</h4>
                      <p className="text-sm text-gray-600">AI-powered categorization and prioritization</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-[#e4f7f7] rounded-lg animate-in slide-in-from-bottom fade-in duration-500 delay-300">
                    <Brain className="h-5 w-5 text-[#149A9B]" />
                    <div>
                      <h4 className="font-medium">Automated Assignment</h4>
                      <p className="text-sm text-gray-600">Smart mediator matching based on expertise</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg animate-in slide-in-from-bottom fade-in duration-500 delay-400">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Performance Analytics</h4>
                      <p className="text-sm text-gray-600">Real-time metrics and success tracking</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg animate-in slide-in-from-bottom fade-in duration-500 delay-500">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Escalation Management</h4>
                      <p className="text-sm text-gray-600">Automatic escalation based on priority and time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Disputes */}
            <Card className="animate-in slide-in-from-bottom fade-in duration-500 delay-150">
              <CardHeader>
                <CardTitle>Sample Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DEMO_DISPUTES.map((dispute, index) => (
                    <div 
                      key={dispute.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all animate-in slide-in-from-bottom fade-in duration-500 ${
                        selectedDispute.id === dispute.id 
                          ? 'border-[#149A9B] bg-[#e4f7f7]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ 
                        animationDelay: `${250 + (index * 100)}ms` 
                      }}
                      onClick={() => setSelectedDispute(dispute)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{dispute.disputeType.replace('_', ' ').toUpperCase()}</h4>
                        <Badge className={`text-xs ${
                          dispute.priority === 'high' ? 'bg-red-100 text-red-800' :
                          dispute.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {dispute.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {dispute.description}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>${dispute.amount}</span>
                        <span>{dispute.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full mt-4 animate-in slide-in-from-bottom fade-in duration-500 delay-600"
                  onClick={() => setActiveDemo('initiation')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Initiation Tab */}
        <TabsContent value="initiation" className="animate-in slide-in-from-bottom fade-in duration-700 ease-out">
          <Card className="animate-in slide-in-from-bottom fade-in duration-500 delay-100">
            <CardHeader>
              <CardTitle>Dispute Initiation Demo</CardTitle>
              <p className="text-gray-600">
                Experience the multi-step dispute creation process with validation and evidence upload.
              </p>
            </CardHeader>
            <CardContent>
              <DisputeInitiation
                projectId="demo_project_001"
                onDisputeCreated={(dispute) => {
                  markStepComplete('initiation');
                  setActiveDemo('categorization');
                }}
                onCancel={() => setActiveDemo('overview')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categorization Tab */}
        <TabsContent value="categorization" className="animate-in slide-in-from-bottom fade-in duration-700 ease-out">
          <Card className="animate-in slide-in-from-bottom fade-in duration-500 delay-100">
            <CardHeader>
              <CardTitle>AI Categorization Demo</CardTitle>
              <p className="text-gray-600">
                Watch as AI analyzes dispute content and automatically categorizes it with confidence scoring.
              </p>
            </CardHeader>
            <CardContent>
              <DisputeCategorization
                dispute={selectedDispute}
                autoStart={true}
                onCategorized={(category: DisputeCategory, confidence: number) => {
                  markStepComplete('categorization');
                  setTimeout(() => setActiveDemo('priority'), 2000);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Priority Tab */}
        <TabsContent value="priority" className="animate-in slide-in-from-bottom fade-in duration-700 ease-out">
          <Card className="animate-in slide-in-from-bottom fade-in duration-500 delay-100">
            <CardHeader>
              <CardTitle>Priority Assessment Demo</CardTitle>
              <p className="text-gray-600">
                See how the system calculates priority scores using multiple factors and recommends handling procedures.
              </p>
            </CardHeader>
            <CardContent>
              <DisputePriority
                dispute={selectedDispute}
                autoCalculate={true}
                onPriorityCalculated={(result: PriorityCalculationResult) => {
                  markStepComplete('priority');
                  markStepComplete('assignment'); // Auto-complete assignment for demo
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="animate-in slide-in-from-bottom fade-in duration-700 ease-out">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <Card className="animate-in slide-in-from-bottom fade-in duration-500 delay-100">
              <CardHeader>
                <CardTitle className="text-sm">System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">94.5%</div>
                    <div className="text-sm text-gray-600">Resolution Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#149A9B]">3.2 days</div>
                    <div className="text-sm text-gray-600">Average Resolution Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">89%</div>
                    <div className="text-sm text-gray-600">User Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="animate-in slide-in-from-bottom fade-in duration-500 delay-200">
              <CardHeader>
                <CardTitle className="text-sm">Dispute Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: 'Payment Issues', percentage: 35, color: 'bg-red-500' },
                    { category: 'Quality Concerns', percentage: 28, color: 'bg-orange-500' },
                    { category: 'Timeline Disputes', percentage: 20, color: 'bg-[#149A9B]' },
                    { category: 'Communication', percentage: 17, color: 'bg-green-500' },
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="animate-in slide-in-from-bottom fade-in duration-500 delay-300">
              <CardHeader>
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Dispute Resolved', time: '2 min ago', type: 'success' },
                    { action: 'Priority Calculated', time: '5 min ago', type: 'info' },
                    { action: 'Mediator Assigned', time: '12 min ago', type: 'info' },
                    { action: 'New Dispute Created', time: '18 min ago', type: 'warning' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        'bg-[#149A9B]'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.action}</div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Demo Completion */}
      {completedStepsCount === 4 && (
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Demo Complete! 🎉
            </h3>
            <p className="text-green-700 mb-4">
              You've successfully experienced all key features of the automated dispute resolution system.
            </p>
            <Button 
              onClick={() => {
                setDemoSteps({ initiation: false, categorization: false, priority: false, assignment: false });
                setActiveDemo('overview');
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Reset Demo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}