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
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Environment,
  Tag,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { configurationService } from '@/services/configuration.service';
import { 
  SystemConfiguration, 
  ConfigurationCategory, 
  ConfigurationDataType, 
  Environment as ConfigEnvironment,
  ValidationResult 
} from '@/types/configuration.types';
import { toast } from 'sonner';

interface SystemConfigurationProps {
  className?: string;
}

const CONFIGURATION_CATEGORIES: ConfigurationCategory[] = [
  'general',
  'security',
  'payments',
  'features',
  'notifications',
  'ui',
  'performance',
  'integration',
  'analytics',
  'maintenance'
];

const DATA_TYPES: ConfigurationDataType[] = [
  'string',
  'number',
  'boolean',
  'json',
  'array',
  'object'
];

const ENVIRONMENTS: ConfigEnvironment[] = [
  'development',
  'staging',
  'production',
  'testing'
];

export default function SystemConfigurationComponent({ className }: SystemConfigurationProps) {
  const [configurations, setConfigurations] = useState<SystemConfiguration[]>([]);
  const [filteredConfigurations, setFilteredConfigurations] = useState<SystemConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<ConfigEnvironment>('production');
  const [selectedCategory, setSelectedCategory] = useState<ConfigurationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingConfig, setEditingConfig] = useState<SystemConfiguration | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    category: 'general' as ConfigurationCategory,
    dataType: 'string' as ConfigurationDataType,
    value: '',
    isEditable: true,
    isRequired: false,
    defaultValue: '',
    environment: selectedEnvironment,
    tags: [] as string[],
  });

  useEffect(() => {
    loadConfigurations();
  }, [selectedEnvironment]);

  useEffect(() => {
    filterConfigurations();
  }, [configurations, selectedCategory, searchQuery]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadConfigurations, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configurationService.getConfigurations(
        { environment: selectedEnvironment },
        1,
        1000
      );
      setConfigurations(response.configurations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configurations');
      toast.error('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const filterConfigurations = () => {
    let filtered = configurations;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(config => config.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(config =>
        config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredConfigurations(filtered);
  };

  const handleCreateConfiguration = async () => {
    try {
      setLoading(true);
      await configurationService.createConfiguration({
        ...formData,
        value: parseValue(formData.value, formData.dataType),
        defaultValue: parseValue(formData.defaultValue, formData.dataType),
        updatedBy: 'current-user@example.com', // This should come from auth context
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      await loadConfigurations();
      toast.success('Configuration created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create configuration');
      toast.error('Failed to create configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfiguration = async () => {
    if (!editingConfig) return;

    try {
      setLoading(true);
      await configurationService.updateConfiguration(editingConfig.id, {
        ...formData,
        value: parseValue(formData.value, formData.dataType),
        defaultValue: parseValue(formData.defaultValue, formData.dataType),
        updatedBy: 'current-user@example.com', // This should come from auth context
      });
      
      setIsEditDialogOpen(false);
      setEditingConfig(null);
      resetForm();
      await loadConfigurations();
      toast.success('Configuration updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
      toast.error('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfiguration = async (id: string) => {
    try {
      await configurationService.deleteConfiguration(id);
      await loadConfigurations();
      toast.success('Configuration deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete configuration');
      toast.error('Failed to delete configuration');
    }
  };

  const handleValidateConfiguration = async (config: SystemConfiguration, value: unknown) => {
    try {
      const result = await configurationService.validateConfiguration(config.id, value);
      setValidationResult(result);
    } catch (err) {
      toast.error('Validation failed');
    }
  };

  const openEditDialog = (config: SystemConfiguration) => {
    setEditingConfig(config);
    setFormData({
      key: config.key,
      name: config.key, // Assuming name is same as key for now
      description: config.description,
      category: config.category,
      dataType: config.dataType,
      value: stringifyValue(config.value),
      isEditable: config.isEditable,
      isRequired: config.isRequired,
      defaultValue: stringifyValue(config.defaultValue),
      environment: config.environment,
      tags: config.tags || [],
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      name: '',
      description: '',
      category: 'general',
      dataType: 'string',
      value: '',
      isEditable: true,
      isRequired: false,
      defaultValue: '',
      environment: selectedEnvironment,
      tags: [],
    });
    setValidationResult(null);
  };

  const parseValue = (value: string, dataType: ConfigurationDataType): unknown => {
    try {
      switch (dataType) {
        case 'string':
          return value;
        case 'number':
          return parseFloat(value);
        case 'boolean':
          return value === 'true';
        case 'json':
        case 'object':
          return JSON.parse(value);
        case 'array':
          return JSON.parse(value);
        default:
          return value;
      }
    } catch {
      return value;
    }
  };

  const stringifyValue = (value: unknown): string => {
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  };

  const getCategoryColor = (category: ConfigurationCategory): string => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      security: 'bg-red-100 text-red-800',
      payments: 'bg-green-100 text-green-800',
      features: 'bg-purple-100 text-purple-800',
      notifications: 'bg-yellow-100 text-yellow-800',
      ui: 'bg-indigo-100 text-indigo-800',
      performance: 'bg-orange-100 text-orange-800',
      integration: 'bg-pink-100 text-pink-800',
      analytics: 'bg-cyan-100 text-cyan-800',
      maintenance: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderValueInput = () => {
    switch (formData.dataType) {
      case 'boolean':
        return (
          <Select value={formData.value} onValueChange={(value) => setFormData({ ...formData, value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select boolean value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="Enter numeric value"
          />
        );
      case 'json':
      case 'object':
      case 'array':
        return (
          <Textarea
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="Enter JSON value"
            rows={4}
          />
        );
      default:
        return (
          <Input
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="Enter string value"
          />
        );
    }
  };

  if (loading && configurations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading configurations...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">
            Manage platform settings and configurations dynamically
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
          <Button onClick={loadConfigurations} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Configuration</DialogTitle>
                <DialogDescription>
                  Add a new system configuration item
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="key">Key</Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="e.g., app.timeout"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as ConfigurationCategory })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONFIGURATION_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
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
                    placeholder="Describe what this configuration controls"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataType">Data Type</Label>
                    <Select value={formData.dataType} onValueChange={(value) => setFormData({ ...formData, dataType: value as ConfigurationDataType })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select value={formData.environment} onValueChange={(value) => setFormData({ ...formData, environment: value as ConfigEnvironment })}>
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
                <div>
                  <Label htmlFor="value">Value</Label>
                  {renderValueInput()}
                </div>
                <div>
                  <Label htmlFor="defaultValue">Default Value</Label>
                  <Input
                    id="defaultValue"
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                    placeholder="Default value if not set"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isEditable"
                      checked={formData.isEditable}
                      onCheckedChange={(checked) => setFormData({ ...formData, isEditable: checked })}
                    />
                    <Label htmlFor="isEditable">Editable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isRequired"
                      checked={formData.isRequired}
                      onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
                    />
                    <Label htmlFor="isRequired">Required</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateConfiguration}>
                  <Save className="h-4 w-4" />
                  Create Configuration
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
              <Label htmlFor="environment">Environment</Label>
              <Select value={selectedEnvironment} onValueChange={(value) => setSelectedEnvironment(value as ConfigEnvironment)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map((env) => (
                    <SelectItem key={env} value={env}>
                      <div className="flex items-center gap-2">
                        <Environment className="h-4 w-4" />
                        {env.charAt(0).toUpperCase() + env.slice(1)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ConfigurationCategory | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CONFIGURATION_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
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
                  placeholder="Search configurations..."
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

      {/* Configurations List */}
      <div className="grid gap-4">
        {filteredConfigurations.map((config) => (
          <Card key={config.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{config.key}</h3>
                    <Badge className={getCategoryColor(config.category)}>
                      {config.category}
                    </Badge>
                    <Badge variant="outline">
                      {config.dataType}
                    </Badge>
                    {config.isRequired && (
                      <Badge variant="destructive">Required</Badge                    )}
                    {!config.isEditable && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-muted-foreground">{config.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Environment className="h-3 w-3" />
                      {config.environment}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {new Date(config.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      v{config.version}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Value:</Label>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {stringifyValue(config.value)}
                      </code>
                    </div>
                  </div>
                  {config.tags && config.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {config.tags.map((tag) => (
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
                    onClick={() => openEditDialog(config)}
                    disabled={!config.isEditable}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(config.key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConfiguration(config.id)}
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
            <DialogTitle>Edit Configuration</DialogTitle>
            <DialogDescription>
              Update the configuration values and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-key">Key</Label>
              <Input
                id="edit-key"
                value={formData.key}
                disabled
                className="bg-muted"
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
            <div>
              <Label htmlFor="edit-value">Value</Label>
              {renderValueInput()}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => handleValidateConfiguration(editingConfig!, parseValue(formData.value, formData.dataType))}
              >
                Validate
              </Button>
              {validationResult && (
                <div className="mt-2">
                  {validationResult.isValid ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Valid
                    </div>
                  ) : (
                    <div className="text-red-600">
                      {validationResult.errors.map((error, index) => (
                        <div key={index} className="text-sm">{error.message}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isEditable"
                  checked={formData.isEditable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isEditable: checked })}
                />
                <Label htmlFor="edit-isEditable">Editable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isRequired"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
                />
                <Label htmlFor="edit-isRequired">Required</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateConfiguration}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{configurations.length}</div>
              <div className="text-sm text-muted-foreground">Total Configurations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {configurations.filter(c => c.isEditable).length}
              </div>
              <div className="text-sm text-muted-foreground">Editable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {configurations.filter(c => c.isRequired).length}
              </div>
              <div className="text-sm text-muted-foreground">Required</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(configurations.map(c => c.category)).size}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
