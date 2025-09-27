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
import { Slider } from '@/components/ui/slider';
import { 
  ToggleLeft, 
  ToggleRight,
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
  Clock3,
  Users,
  TrendingUp,
  Settings,
  Zap
} from 'lucide-react';
import { featureToggleService } from '@/services/feature-toggle.service';
import { 
  FeatureToggle, 
  FeatureCategory, 
  FeatureType, 
  FeatureStatus,
  RolloutStrategy,
  AudienceType,
  EvaluationResult,
  EvaluationContext
} from '@/types/feature-toggle.types';
import { toast } from 'sonner';

interface FeatureTogglesProps {
  className?: string;
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  'ui',
  'backend',
  'api',
  'payment',
  'notification',
  'analytics',
  'security',
  'performance',
  'integration',
  'experimental',
  'beta',
  'maintenance'
];

const FEATURE_TYPES: FeatureType[] = [
  'boolean',
  'percentage',
  'gradual',
  'canary',
  'blue_green',
  'a_b_test',
  'multivariate',
  'experimental',
  'kill_switch'
];

const FEATURE_STATUSES: FeatureStatus[] = [
  'draft',
  'development',
  'testing',
  'staging',
  'production',
  'deprecated',
  'archived'
];

const ROLLOUT_STRATEGIES: RolloutStrategy[] = [
  'immediate',
  'gradual',
  'canary',
  'blue_green',
  'percentage',
  'user_based',
  'time_based',
  'geographic',
  'device_based'
];

const AUDIENCE_TYPES: AudienceType[] = [
  'all_users',
  'user_segment',
  'user_group',
  'user_role',
  'beta_users',
  'premium_users',
  'new_users',
  'returning_users',
  'geographic',
  'device_based',
  'custom'
];

const ENVIRONMENTS = ['development', 'staging', 'production', 'testing'];

export default function FeatureTogglesComponent({ className }: FeatureTogglesProps) {
  const [featureToggles, setFeatureToggles] = useState<FeatureToggle[]>([]);
  const [filteredFeatureToggles, setFilteredFeatureToggles] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<FeatureStatus | 'all'>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFeatureToggle, setEditingFeatureToggle] = useState<FeatureToggle | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEvaluateDialogOpen, setIsEvaluateDialogOpen] = useState(false);
  const [evaluatingFeatureToggle, setEvaluatingFeatureToggle] = useState<FeatureToggle | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    category: 'ui' as FeatureCategory,
    type: 'boolean' as FeatureType,
    rolloutStrategy: 'immediate' as RolloutStrategy,
    rolloutPercentage: 0,
    environment: selectedEnvironment,
    isActive: false,
    targetAudience: {
      name: 'All Users',
      type: 'all_users' as AudienceType,
      criteria: [],
      size: 0,
      percentage: 100,
    },
    conditions: [] as Array<{
      name: string;
      type: string;
      operator: string;
      value: string;
      field: string;
    }>,
  });

  useEffect(() => {
    loadFeatureToggles();
  }, [selectedEnvironment]);

  useEffect(() => {
    filterFeatureToggles();
  }, [featureToggles, selectedCategory, selectedStatus, searchQuery]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadFeatureToggles, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadFeatureToggles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await featureToggleService.getFeatureToggles(
        { environment: selectedEnvironment as any },
        1,
        1000
      );
      setFeatureToggles(response.featureToggles as FeatureToggle[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature toggles');
      toast.error('Failed to load feature toggles');
    } finally {
      setLoading(false);
    }
  };

  const filterFeatureToggles = () => {
    let filtered = featureToggles;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ft => ft.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(ft => ft.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(ft =>
        ft.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ft.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFeatureToggles(filtered);
  };

  const handleCreateFeatureToggle = async () => {
    try {
      setLoading(true);
      await featureToggleService.createFeatureToggle({
        ...formData,
        status: 'draft',
        targetAudience: {
          id: crypto.randomUUID(),
          name: formData.targetAudience.name,
          description: '',
          type: formData.targetAudience.type,
          criteria: formData.targetAudience.criteria,
          size: formData.targetAudience.size,
          percentage: formData.targetAudience.percentage,
          isActive: true,
          createdBy: 'current-user@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        conditions: formData.conditions.map(condition => ({
          id: crypto.randomUUID(),
          featureToggleId: '',
          name: condition.name,
          description: '',
          type: condition.type as any,
          operator: condition.operator as any,
          value: condition.value,
          field: condition.field,
          isActive: true,
          weight: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        dependencies: [],
        metrics: {
          id: crypto.randomUUID(),
          featureToggleId: '',
          metric: 'adoption_rate' as any,
          value: 0,
          baseline: 0,
          target: 100,
          threshold: 80,
          status: 'unknown' as any,
          timestamp: new Date(),
          environment: selectedEnvironment as any,
        },
        metadata: {},
        createdBy: 'current-user@example.com',
        updatedBy: 'current-user@example.com',
        tags: [],
        version: 1,
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      await loadFeatureToggles();
      toast.success('Feature toggle created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create feature toggle');
      toast.error('Failed to create feature toggle');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeatureToggle = async () => {
    if (!editingFeatureToggle) return;

    try {
      setLoading(true);
      await featureToggleService.updateFeatureToggle(editingFeatureToggle.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        rolloutStrategy: formData.rolloutStrategy,
        rolloutPercentage: formData.rolloutPercentage,
        isActive: formData.isActive,
        updatedBy: 'current-user@example.com',
      });
      
      setIsEditDialogOpen(false);
      setEditingFeatureToggle(null);
      resetForm();
      await loadFeatureToggles();
      toast.success('Feature toggle updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feature toggle');
      toast.error('Failed to update feature toggle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeatureToggle = async (id: string) => {
    try {
      await featureToggleService.deleteFeatureToggle(id);
      await loadFeatureToggles();
      toast.success('Feature toggle deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feature toggle');
      toast.error('Failed to delete feature toggle');
    }
  };

  const handleActivateFeatureToggle = async (id: string) => {
    try {
      await featureToggleService.activateFeatureToggle(id);
      await loadFeatureToggles();
      toast.success('Feature toggle activated successfully');
    } catch (err) {
      toast.error('Failed to activate feature toggle');
    }
  };

  const handleDeactivateFeatureToggle = async (id: string) => {
    try {
      await featureToggleService.deactivateFeatureToggle(id);
      await loadFeatureToggles();
      toast.success('Feature toggle deactivated successfully');
    } catch (err) {
      toast.error('Failed to deactivate feature toggle');
    }
  };

  const handleUpdateRolloutPercentage = async (id: string, percentage: number) => {
    try {
      await featureToggleService.updateRolloutPercentage(id, percentage);
      await loadFeatureToggles();
      toast.success('Rollout percentage updated successfully');
    } catch (err) {
      toast.error('Failed to update rollout percentage');
    }
  };

  const handleEvaluateFeatureToggle = async () => {
    if (!evaluatingFeatureToggle) return;

    try {
      setLoading(true);
      const context: EvaluationContext = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.1',
        location: 'US',
        device: 'desktop',
        browser: 'chrome',
        userAttributes: {
          userId: 'test-user-123',
          role: 'user',
          plan: 'premium',
        },
        sessionData: {
          sessionId: 'test-session-456',
          loginTime: new Date().toISOString(),
        },
        requestData: {
          path: '/dashboard',
          method: 'GET',
        },
      };

      const result = await featureToggleService.evaluateFeatureToggle(
        evaluatingFeatureToggle.key,
        context
      );
      setEvaluationResult(result);
    } catch (err) {
      toast.error('Failed to evaluate feature toggle');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (featureToggle: FeatureToggle) => {
    setEditingFeatureToggle(featureToggle);
    setFormData({
      key: featureToggle.key,
      name: featureToggle.name,
      description: featureToggle.description,
      category: featureToggle.category,
      type: featureToggle.type,
      rolloutStrategy: featureToggle.rolloutStrategy,
      rolloutPercentage: featureToggle.rolloutPercentage,
      environment: featureToggle.environment,
      isActive: featureToggle.isActive,
      targetAudience: {
        name: 'All Users',
        type: 'all_users',
        criteria: [],
        size: 0,
        percentage: 100,
      },
      conditions: [],
    });
    setIsEditDialogOpen(true);
  };

  const openEvaluateDialog = (featureToggle: FeatureToggle) => {
    setEvaluatingFeatureToggle(featureToggle);
    setIsEvaluateDialogOpen(true);
    setEvaluationResult(null);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      name: '',
      description: '',
      category: 'ui',
      type: 'boolean',
      rolloutStrategy: 'immediate',
      rolloutPercentage: 0,
      environment: selectedEnvironment,
      isActive: false,
      targetAudience: {
        name: 'All Users',
        type: 'all_users',
        criteria: [],
        size: 0,
        percentage: 100,
      },
      conditions: [],
    });
  };

  const getStatusColor = (status: FeatureStatus): string => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      development: 'bg-blue-100 text-blue-800',
      testing: 'bg-yellow-100 text-yellow-800',
      staging: 'bg-orange-100 text-orange-800',
      production: 'bg-green-100 text-green-800',
      deprecated: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: FeatureCategory): string => {
    const colors = {
      ui: 'bg-purple-100 text-purple-800',
      backend: 'bg-blue-100 text-blue-800',
      api: 'bg-green-100 text-green-800',
      payment: 'bg-yellow-100 text-yellow-800',
      notification: 'bg-pink-100 text-pink-800',
      analytics: 'bg-indigo-100 text-indigo-800',
      security: 'bg-red-100 text-red-800',
      performance: 'bg-orange-100 text-orange-800',
      integration: 'bg-cyan-100 text-cyan-800',
      experimental: 'bg-gray-100 text-gray-800',
      beta: 'bg-violet-100 text-violet-800',
      maintenance: 'bg-slate-100 text-slate-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading && featureToggles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading feature toggles...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Toggles</h1>
          <p className="text-muted-foreground">
            Manage feature flags and gradual rollouts dynamically
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
          <Button onClick={loadFeatureToggles} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Feature Toggle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Feature Toggle</DialogTitle>
                <DialogDescription>
                  Create a new feature flag for controlling functionality
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="key">Feature Key</Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="e.g., enable_dark_mode"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Feature Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Dark Mode"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this feature toggle controls"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as FeatureCategory })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FEATURE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as FeatureType })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FEATURE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select value={formData.environment} onValueChange={(value) => setFormData({ ...formData, environment: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENVIRONMENTS.map((env) => (
                          <SelectItem key={env} value={env}>
                            {env.charAt(0).toUpperCase() + env.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rolloutStrategy">Rollout Strategy</Label>
                    <Select value={formData.rolloutStrategy} onValueChange={(value) => setFormData({ ...formData, rolloutStrategy: value as RolloutStrategy })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLLOUT_STRATEGIES.map((strategy) => (
                          <SelectItem key={strategy} value={strategy}>
                            {strategy.charAt(0).toUpperCase() + strategy.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rolloutPercentage">Rollout Percentage: {formData.rolloutPercentage}%</Label>
                    <Slider
                      value={[formData.rolloutPercentage]}
                      onValueChange={(value) => setFormData({ ...formData, rolloutPercentage: value[0] })}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFeatureToggle}>
                  <Save className="h-4 w-4" />
                  Create Feature Toggle
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env.charAt(0).toUpperCase() + env.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as FeatureCategory | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {FEATURE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as FeatureStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {FEATURE_STATUSES.map((status) => (
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
                  placeholder="Search feature toggles..."
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

      {/* Feature Toggles List */}
      <div className="grid gap-4">
        {filteredFeatureToggles.map((featureToggle) => (
          <Card key={featureToggle.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {featureToggle.isActive ? (
                        <ToggleRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                      <h3 className="text-lg font-semibold">{featureToggle.name}</h3>
                    </div>
                    <Badge className={getStatusColor(featureToggle.status)}>
                      {featureToggle.status}
                    </Badge>
                    <Badge className={getCategoryColor(featureToggle.category)}>
                      {featureToggle.category}
                    </Badge>
                    <Badge variant="outline">
                      {featureToggle.type.replace('_', ' ')}
                    </Badge>
                    {featureToggle.isActive && (
                      <Badge variant="secondary">
                        {featureToggle.rolloutPercentage}% rollout
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{featureToggle.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {new Date(featureToggle.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      {featureToggle.rolloutStrategy.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {featureToggle.targetAudience?.type.replace('_', ' ') || 'all_users'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>v{featureToggle.version}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Key:</Label>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {featureToggle.key}
                      </code>
                    </div>
                  </div>
                  {featureToggle.tags && featureToggle.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {featureToggle.tags.map((tag) => (
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
                    onClick={() => openEvaluateDialog(featureToggle)}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(featureToggle)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {featureToggle.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivateFeatureToggle(featureToggle.id)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivateFeatureToggle(featureToggle.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFeatureToggle(featureToggle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {featureToggle.rolloutStrategy === 'percentage' && (
                <div className="mt-4">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-medium">Rollout Percentage:</Label>
                    <div className="flex-1">
                      <Slider
                        value={[featureToggle.rolloutPercentage]}
                        onValueChange={(value) => handleUpdateRolloutPercentage(featureToggle.id, value[0])}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12">
                      {featureToggle.rolloutPercentage}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Feature Toggle</DialogTitle>
            <DialogDescription>
              Update the feature toggle configuration and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-name">Feature Name</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as FeatureCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEATURE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-rolloutStrategy">Rollout Strategy</Label>
                <Select value={formData.rolloutStrategy} onValueChange={(value) => setFormData({ ...formData, rolloutStrategy: value as RolloutStrategy })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLLOUT_STRATEGIES.map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {strategy.charAt(0).toUpperCase() + strategy.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-rolloutPercentage">Rollout Percentage: {formData.rolloutPercentage}%</Label>
              <Slider
                value={[formData.rolloutPercentage]}
                onValueChange={(value) => setFormData({ ...formData, rolloutPercentage: value[0] })}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFeatureToggle}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evaluate Dialog */}
      <Dialog open={isEvaluateDialogOpen} onOpenChange={setIsEvaluateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Evaluate Feature Toggle</DialogTitle>
            <DialogDescription>
              Test the feature toggle with sample user context
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {evaluatingFeatureToggle && (
              <div>
                <h4 className="font-semibold mb-2">Evaluating: {evaluatingFeatureToggle.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {evaluatingFeatureToggle.description}
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Test Context:</h5>
                  <pre className="text-sm">
{JSON.stringify({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  ipAddress: '192.168.1.1',
  location: 'US',
  device: 'desktop',
  browser: 'chrome',
  userAttributes: {
    userId: 'test-user-123',
    role: 'user',
    plan: 'premium',
  },
  sessionData: {
    sessionId: 'test-session-456',
    loginTime: new Date().toISOString(),
  },
  requestData: {
    path: '/dashboard',
    method: 'GET',
  },
}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {evaluationResult && (
              <div className="space-y-4">
                <h5 className="font-medium">Evaluation Results:</h5>
                <div className={`p-4 rounded-lg ${evaluationResult.enabled ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {evaluationResult.enabled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="font-medium">
                      {evaluationResult.enabled ? 'Feature Enabled' : 'Feature Disabled'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Reason: {evaluationResult.reason}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Evaluation time: {evaluationResult.evaluationTime}ms
                  </div>
                  {evaluationResult.variant && (
                    <div className="text-sm">
                      <span className="font-medium">Variant: </span>
                      <Badge variant="outline">{evaluationResult.variant}</Badge>
                    </div>
                  )}
                  {evaluationResult.conditions && evaluationResult.conditions.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium text-sm mb-1">Matching Conditions:</div>
                      <ul className="text-sm space-y-1">
                        {evaluationResult.conditions.map((condition, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evaluationResult.rolloutPercentage !== undefined && (
                    <div className="mt-2">
                      <div className="font-medium text-sm mb-1">Rollout Details:</div>
                      <div className="text-sm text-muted-foreground">
                        Percentage: {evaluationResult.rolloutPercentage}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEvaluateDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleEvaluateFeatureToggle} disabled={loading}>
              <Zap className="h-4 w-4" />
              {loading ? 'Evaluating...' : 'Evaluate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Toggle Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{featureToggles.length}</div>
              <div className="text-sm text-muted-foreground">Total Feature Toggles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {featureToggles.filter(ft => ft.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {featureToggles.filter(ft => ft.status === 'production').length}
              </div>
              <div className="text-sm text-muted-foreground">In Production</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(featureToggles.map(ft => ft.category)).size}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
