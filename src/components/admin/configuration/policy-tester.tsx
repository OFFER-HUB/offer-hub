"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PolicyService } from '../../../services/policy.service';
import { Policy } from '../../../types/policy.types';
import { PolicyValidator, PolicyTestResult } from '../../../utils/policy-validators';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Alert, AlertDescription } from '../../ui/alert';
import { Loader2, PlayIcon, TestTubeIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, CopyIcon, DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '../../ui/scroll-area';

interface TestData {
  [key: string]: unknown;
}

interface PolicyTesterProps {
  policy?: Policy | null;
  onPolicyChange?: (policy: Policy) => void;
}

const PolicyTester: React.FC<PolicyTesterProps> = ({ policy, onPolicyChange }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(policy || null);
  const [testResults, setTestResults] = useState<PolicyTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testHistory, setTestHistory] = useState<Array<{
    id: string;
    policyId: string;
    policyName: string;
    testData: TestData;
    result: PolicyTestResult;
    timestamp: Date;
  }>>([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{
    testData: string;
    policyId: string;
  }>({
    defaultValues: {
      testData: '',
      policyId: '',
    },
  });

  const testDataValue = watch('testData');

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    if (policy) {
      setSelectedPolicy(policy);
      setValue('policyId', policy.id);
    }
  }, [policy, setValue]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const { policies: fetchedPolicies } = await PolicyService.getAllPolicies();
      setPolicies(fetchedPolicies);
    } catch (error) {
      toast.error('Failed to load policies.');
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: { testData: string; policyId: string }) => {
    if (!selectedPolicy) {
      toast.error('Please select a policy to test.');
      return;
    }

    setTesting(true);
    try {
      let parsedTestData: TestData;
      
      try {
        parsedTestData = JSON.parse(data.testData);
      } catch (error) {
        toast.error('Invalid JSON format in test data.');
        return;
      }

      // Validate the policy first
      const validationResult = PolicyValidator.validatePolicy(selectedPolicy);
      if (!validationResult.isValid) {
        toast.error(`Policy validation failed: ${validationResult.errors.join(', ')}`);
        return;
      }

      // Test the policy
      const result = PolicyValidator.testPolicy(selectedPolicy, parsedTestData);
      setTestResults(result);

      // Add to test history
      const historyEntry = {
        id: Date.now().toString(),
        policyId: selectedPolicy.id,
        policyName: selectedPolicy.name,
        testData: parsedTestData,
        result,
        timestamp: new Date(),
      };
      setTestHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 tests

      toast.success('Policy test completed.');
    } catch (error) {
      toast.error('Failed to test policy.');
      console.error('Error testing policy:', error);
    } finally {
      setTesting(false);
    }
  };

  const handlePolicySelect = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    setSelectedPolicy(policy || null);
    onPolicyChange?.(policy || null);
  };

  const loadSampleData = (type: 'user' | 'transaction' | 'content') => {
    const sampleData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        reputation: 85,
        subscription: 'premium',
        location: 'US',
        createdAt: '2023-01-01T00:00:00Z',
        lastLogin: '2023-12-01T10:30:00Z',
        isVerified: true,
        accountAge: 365,
      },
      transaction: {
        id: 'txn456',
        userId: 'user123',
        amount: 150.00,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        merchant: 'test-merchant',
        timestamp: '2023-12-01T14:30:00Z',
        paymentMethod: 'credit_card',
        riskScore: 0.2,
      },
      content: {
        id: 'content789',
        userId: 'user123',
        title: 'Test Content',
        body: 'This is test content with some keywords.',
        category: 'general',
        tags: ['test', 'example'],
        createdAt: '2023-12-01T12:00:00Z',
        isPublic: true,
        wordCount: 150,
        language: 'en',
      },
    };

    setValue('testData', JSON.stringify(sampleData[type], null, 2));
  };

  const exportTestResults = () => {
    if (!testResults || !selectedPolicy) return;

    const exportData = {
      policy: {
        id: selectedPolicy.id,
        name: selectedPolicy.name,
        description: selectedPolicy.description,
        category: selectedPolicy.category,
        status: selectedPolicy.status,
      },
      testResults,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policy-test-${selectedPolicy.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyTestData = () => {
    navigator.clipboard.writeText(testDataValue);
    toast.success('Test data copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTubeIcon className="h-5 w-5" />
            <span>Policy Testing & Simulation</span>
          </CardTitle>
          <CardDescription>
            Test policies against sample data to validate behavior and identify issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Policy Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="policyId">Select Policy</Label>
                  <Select
                    value={selectedPolicy?.id || ''}
                    onValueChange={handlePolicySelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a policy to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {policies.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{policy.name}</span>
                            <Badge variant={policy.isActive ? 'default' : 'outline'}>
                              {policy.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPolicy && (
                  <Card className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">{selectedPolicy.name}</h4>
                      <p className="text-sm text-gray-600">{selectedPolicy.description}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{selectedPolicy.category}</Badge>
                        <Badge variant={selectedPolicy.isActive ? 'default' : 'outline'}>
                          {selectedPolicy.status}
                        </Badge>
                        <Badge variant="outline">{selectedPolicy.priority}</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Rules: {selectedPolicy.rules.length} | Actions: {selectedPolicy.actions.length}
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Sample Data */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Sample Test Data</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => loadSampleData('user')}
                    >
                      User
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => loadSampleData('transaction')}
                    >
                      Transaction
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => loadSampleData('content')}
                    >
                      Content
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="testData">Test Data (JSON)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyTestData}
                    >
                      <CopyIcon className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    id="testData"
                    {...register('testData', { required: 'Test data is required' })}
                    placeholder="Enter JSON test data..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  {errors.testData && (
                    <p className="text-red-500 text-sm">{errors.testData.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => reset()}>
                Clear
              </Button>
              <Button type="submit" disabled={testing || !selectedPolicy}>
                {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <PlayIcon className="mr-2 h-4 w-4" />
                Run Test
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TestTubeIcon className="h-5 w-5" />
                <span>Test Results</span>
              </CardTitle>
              <CardDescription>
                Results for policy: {selectedPolicy?.name}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportTestResults}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="violations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="violations">Violations</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="matched">Matched Rules</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="violations" className="space-y-4">
                <div className="flex items-center space-x-2">
                  {testResults.violations.length > 0 ? (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  <span className="font-medium">
                    {testResults.violations.length} Violations Found
                  </span>
                </div>
                {testResults.violations.length > 0 ? (
                  <div className="space-y-2">
                    {testResults.violations.map((violation, index) => (
                      <Alert key={index}>
                        <AlertTriangleIcon className="h-4 w-4" />
                        <AlertDescription>{violation}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <CheckCircleIcon className="h-4 w-4" />
                    <AlertDescription>No policy violations detected.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                <div className="space-y-2">
                  {testResults.suggestions.length > 0 ? (
                    testResults.suggestions.map((suggestion, index) => (
                      <Alert key={index}>
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))
                  ) : (
                    <p className="text-gray-500">No suggestions available.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="matched" className="space-y-4">
                <div className="space-y-2">
                  {testResults.matchedRules.length > 0 ? (
                    testResults.matchedRules.map((rule, index) => (
                      <Card key={index} className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-gray-600">{rule.description}</div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{rule.type}</Badge>
                            <Badge variant="outline">{rule.operator}</Badge>
                            <Badge variant="outline">{rule.field}</Badge>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500">No rules matched the test data.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="space-y-2">
                  {testResults.executedActions.length > 0 ? (
                    testResults.executedActions.map((action, index) => (
                      <Card key={index} className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">{action.name}</div>
                          <div className="text-sm text-gray-600">{action.description}</div>
                          <Badge variant="outline">{action.type}</Badge>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500">No actions would be executed.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
            <CardDescription>History of recent policy tests</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {testHistory.map((entry) => (
                  <Card key={entry.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{entry.policyName}</div>
                        <div className="text-sm text-gray-600">
                          {entry.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={entry.result.violations.length > 0 ? 'destructive' : 'default'}>
                          {entry.result.violations.length} violations
                        </Badge>
                        <Badge variant="outline">
                          {entry.result.matchedRules.length} rules matched
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyTester;
