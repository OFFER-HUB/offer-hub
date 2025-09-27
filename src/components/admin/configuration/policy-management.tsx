"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Play,
  Pause,
  TestTube,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Copy,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock3
} from 'lucide-react';
import { policyService } from '@/services/policy.service';
import { 
  Policy, 
  PolicyCategory, 
  PolicyType, 
  PolicyStatus, 
  PolicyPriority,
  PolicyScope,
  PolicyViolation,
  PolicyTest,
  TestData,
  TestResult
} from '@/types/policy.types';
import { toast } from 'sonner';

interface PolicyManagementProps {
  className?: string;
}

const POLICY_CATEGORIES: PolicyCategory[] = [
  'user_behavior',
  'content_moderation',
  'transaction',
  'security',
  'compliance',
  'performance',
  'feature_access',
  'data_protection',
  'communication',
  'system'
];

const POLICY_TYPES: PolicyType[] = [
  'prevention',
  'detection',
  'response',
  'enforcement',
  'validation',
  'notification',
  'escalation',
  'audit'
];

const POLICY_STATUSES: PolicyStatus[] = [
  'draft',
  'active',
  'inactive',
  'deprecated',
  'testing',
  'suspended'
];

const POLICY_PRIORITIES: PolicyPriority[] = [
  'low',
  'medium',
  'high',
  'critical'
];

const POLICY_SCOPES: PolicyScope[] = [
  'global',
  'user_group',
  'individual_user',
  'feature',
  'transaction_type',
  'content_type',
  'geographic',
  'time_based'
];

export default function PolicyManagementComponent({ className }: PolicyManagementProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [tests, setTests] = useState<PolicyTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<PolicyStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testingPolicy, setTestingPolicy] = useState<Policy | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'user_behavior' as PolicyCategory,
    type: 'validation' as PolicyType,
    priority: 'medium' as PolicyPriority,
    scope: 'global' as PolicyScope,
    isGlobal: false,
    tags: [] as string[],
    rules: [] as Array<{
      name: string;
      type: string;
      operator: string;
      value: string;
      field: string;
    }>,
    actions: [] as Array<{
      name: string;
      type: string;
      parameters: Record<string, unknown>;
    }>,
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, selectedCategory, selectedStatus, searchQuery]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadPolicies, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await policyService.getPolicies({}, 1, 1000);
      setPolicies(response.policies as Policy[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const loadViolations = async (policyId?: string) => {
    try {
      const response = await policyService.getPolicyViolations(policyId);
      setViolations(response.violations);
    } catch (err) {
      toast.error('Failed to load violations');
    }
  };

  const loadTests = async (policyId?: string) => {
    try {
      const response = await policyService.getPolicyTests(policyId || '');
      setTests(response.tests);
    } catch (err) {
      toast.error('Failed to load tests');
    }
  };

  const filterPolicies = () => {
    let filtered = policies;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(policy => policy.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(policy => policy.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(policy =>
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPolicies(filtered);
  };

  const handleCreatePolicy = async () => {
    try {
      setLoading(true);
      await policyService.createPolicy({
        ...formData,
        rules: formData.rules.map(rule => ({
          id: crypto.randomUUID(),
          name: rule.name,
          description: '',
          type: rule.type as any,
          operator: rule.operator as any,
          value: rule.value,
          field: rule.field,
          isActive: true,
          weight: 1,
        })),
        actions: formData.actions.map(action => ({
          id: crypto.randomUUID(),
          name: action.name,
          description: '',
          type: action.type as any,
          parameters: action.parameters,
          isActive: true,
          order: 1,
        })),
        conditions: [],
        environment: 'production',
        createdBy: 'current-user@example.com',
        updatedBy: 'current-user@example.com',
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      await loadPolicies();
      toast.success('Policy created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create policy');
      toast.error('Failed to create policy');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async () => {
    if (!editingPolicy) return;

    try {
      setLoading(true);
      await policyService.updatePolicy(editingPolicy.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        priority: formData.priority,
        scope: formData.scope,
        isGlobal: formData.isGlobal,
        tags: formData.tags,
        updatedBy: 'current-user@example.com',
      });
      
      setIsEditDialogOpen(false);
      setEditingPolicy(null);
      resetForm();
      await loadPolicies();
      toast.success('Policy updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update policy');
      toast.error('Failed to update policy');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      await policyService.deletePolicy(id);
      await loadPolicies();
      toast.success('Policy deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete policy');
      toast.error('Failed to delete policy');
    }
  };

  const handleActivatePolicy = async (id: string) => {
    try {
      await policyService.activatePolicy(id);
      await loadPolicies();
      toast.success('Policy activated successfully');
    } catch (err) {
      toast.error('Failed to activate policy');
    }
  };

  const handleDeactivatePolicy = async (id: string) => {
    try {
      await policyService.deactivatePolicy(id);
      await loadPolicies();
      toast.success('Policy deactivated successfully');
    } catch (err) {
      toast.error('Failed to deactivate policy');
    }
  };

  const handleTestPolicy = async () => {
    if (!testingPolicy) return;

    try {
      setLoading(true);
      const testData: TestData = {
        userId: 'test-user-123',
        sessionId: 'test-session-456',
        context: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '192.168.1.1',
          location: 'US',
          device: 'desktop',
          browser: 'chrome',
        },
        input: {
          action: 'login',
          timestamp: new Date().toISOString(),
        },
        environment: 'production',
      };

      const result = await policyService.testPolicy(testingPolicy.id, testData);
      setTestResult(result);
    } catch (err) {
      toast.error('Failed to test policy');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (policy: Policy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      category: policy.category,
      type: policy.type,
      priority: policy.priority,
      scope: policy.scope,
      isGlobal: policy.isGlobal,
      tags: policy.tags,
      rules: [],
      actions: [],
    });
    setIsEditDialogOpen(true);
  };

  const openTestDialog = (policy: Policy) => {
    setTestingPolicy(policy);
    setIsTestDialogOpen(true);
    setTestResult(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'user_behavior',
      type: 'validation',
      priority: 'medium',
      scope: 'global',
      isGlobal: false,
      tags: [],
      rules: [],
      actions: [],
    });
  };

  const getStatusColor = (status: PolicyStatus): string => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      deprecated: 'bg-yellow-100 text-yellow-800',
      testing: 'bg-blue-100 text-blue-800',
      suspended: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: PolicyPriority): string => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getViolationStatusIcon = (status: string) => {
    switch (status) {
      case 'detected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'false_positive':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'investigating':
        return <Clock3 className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock3 className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading && policies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading policies...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Policy Management</h1>
          <p className="text-muted-foreground">
            Manage security policies, rules, and enforcement mechanisms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button onClick={loadPolicies} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Policy</DialogTitle>
                <DialogDescription>
                  Create a new security or compliance policy
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Policy Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., User Registration Policy"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as PolicyCategory })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POLICY_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this policy controls and enforces"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as PolicyType })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POLICY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as PolicyPriority })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POLICY_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scope">Scope</Label>
                    <Select value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value as PolicyScope })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POLICY_SCOPES.map((scope) => (
                          <SelectItem key={scope} value={scope}>
                            {scope.charAt(0).toUpperCase() + scope.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isGlobal"
                    checked={formData.isGlobal}
                    onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
                  />
                  <Label htmlFor="isGlobal">Global Policy</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePolicy}>
                  <Save className="h-4 w-4" />
                  Create Policy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as PolicyCategory | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {POLICY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as PolicyStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {POLICY_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies List */}
      <div className="grid gap-4">
        {filteredPolicies.map((policy) => (
          <Card key={policy.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{policy.name}</h3>
                    <Badge className={getStatusColor(policy.status)}>
                      {policy.status}
                    </Badge>
                    <Badge className={getPriorityColor(policy.priority)}>
                      {policy.priority}
                    </Badge>
                    <Badge variant="outline">
                      {policy.category.replace('_', ' ')}
                    </Badge>
                    {policy.isGlobal && (
                      <Badge variant="secondary">Global</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{policy.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {new Date(policy.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      v{policy.version}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Rules: {policy.rules.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Actions: {policy.actions.length}</span>
                    </div>
                  </div>
                  {policy.tags && policy.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {policy.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTestDialog(policy)}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(policy)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {policy.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivatePolicy(policy.id)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivatePolicy(policy.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePolicy(policy.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Policy</DialogTitle>
            <DialogDescription>
              Update the policy configuration and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-name">Policy Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as PolicyCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as PolicyPriority })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-scope">Scope</Label>
                <Select value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value as PolicyScope })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_SCOPES.map((scope) => (
                      <SelectItem key={scope} value={scope}>
                        {scope.charAt(0).toUpperCase() + scope.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isGlobal"
                checked={formData.isGlobal}
                onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
              />
              <Label htmlFor="edit-isGlobal">Global Policy</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePolicy}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Policy</DialogTitle>
            <DialogDescription>
              Test the policy with sample data to verify it works correctly
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {testingPolicy && (
              <div>
                <h4 className="font-semibold mb-2">Testing: {testingPolicy.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {testingPolicy.description}
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Test Data:</h5>
                  <pre className="text-sm">
{JSON.stringify({
  userId: 'test-user-123',
  sessionId: 'test-session-456',
  context: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ipAddress: '192.168.1.1',
    location: 'US',
    device: 'desktop',
    browser: 'chrome',
  },
  input: {
    action: 'login',
    timestamp: new Date().toISOString(),
  },
  environment: 'production',
}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {testResult && (
              <div className="space-y-4">
                <h5 className="font-medium">Test Results:</h5>
                <div className={`p-4 rounded-lg ${testResult.triggered ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.triggered ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <span className="font-medium">
                      {testResult.triggered ? 'Policy Triggered' : 'Policy Not Triggered'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Execution time: {testResult.executionTime}ms
                  </div>
                  {testResult.actions && testResult.actions.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium text-sm mb-1">Actions:</div>
                      <ul className="text-sm space-y-1">
                        {testResult.actions.map((action, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span>{action.type}</span>
                            {action.executed ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {testResult.errors && testResult.errors.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium text-sm mb-1 text-red-600">Errors:</div>
                      <ul className="text-sm text-red-600 space-y-1">
                        {testResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleTestPolicy} disabled={loading}>
              <TestTube className="h-4 w-4" />
              {loading ? 'Testing...' : 'Run Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{policies.length}</div>
              <div className="text-sm text-muted-foreground">Total Policies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {policies.filter(p => p.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {policies.filter(p => p.status === 'draft').length}
              </div>
              <div className="text-sm text-muted-foreground">Draft</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(policies.map(p => p.category)).size}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
