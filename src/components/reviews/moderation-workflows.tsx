'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Workflow,
  Plus,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  ArrowDown,
  MoreHorizontal,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useReviewQuality } from '@/hooks/use-review-quality';
import {
  ModerationWorkflow,
  ModerationWorkflowStep,
  ModerationTrigger,
  ModerationCondition,
  ModerationAction,
  ModerationCategory,
  ModerationSeverity,
} from '@/types/review-quality.types';

interface ModerationWorkflowsProps {
  className?: string;
  onWorkflowChange?: (workflow: ModerationWorkflow) => void;
}

interface WorkflowFormData {
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  steps: ModerationWorkflowStep[];
  triggers: ModerationTrigger[];
}

export default function ModerationWorkflows({
  className = '',
  onWorkflowChange,
}: ModerationWorkflowsProps) {
  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ModerationWorkflow | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: '',
    description: '',
    enabled: true,
    priority: 1,
    steps: [],
    triggers: [],
  });

  const {
    state,
    actions,
    loading,
    errors,
  } = useReviewQuality({
    includeWorkflows: true,
  });

  // Mock workflows data
  const mockWorkflows: ModerationWorkflow[] = [
    {
      id: 'wf_1',
      name: 'High-Risk Content Review',
      description: 'Automated workflow for reviewing high-risk content with escalation paths',
      enabled: true,
      priority: 1,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      steps: [
        {
          id: 'step_1',
          name: 'AI Assessment',
          type: 'automated',
          action: 'flag',
          conditions: [
            { field: 'content', operator: 'contains', value: 'inappropriate', caseSensitive: false }
          ],
          order: 1,
        },
        {
          id: 'step_2',
          name: 'Senior Moderator Review',
          type: 'manual',
          action: 'escalate',
          conditions: [],
          assigneeRole: 'senior_moderator',
          timeoutMinutes: 60,
          order: 2,
        },
      ],
      triggers: [
        {
          id: 'trigger_1',
          event: 'review_created',
          conditions: [
            { field: 'quality_score', operator: 'less_than', value: 40 }
          ],
        },
      ],
    },
    {
      id: 'wf_2',
      name: 'Quality Enhancement',
      description: 'Workflow to improve review quality through feedback and suggestions',
      enabled: true,
      priority: 2,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      steps: [
        {
          id: 'step_3',
          name: 'Quality Check',
          type: 'automated',
          action: 'flag',
          conditions: [
            { field: 'quality_score', operator: 'less_than', value: 70 }
          ],
          order: 1,
        },
      ],
      triggers: [
        {
          id: 'trigger_2',
          event: 'quality_scored',
          conditions: [
            { field: 'score', operator: 'less_than', value: 70 }
          ],
        },
      ],
    },
  ];

  const handleCreateWorkflow = async () => {
    try {
      const workflow = await actions.createWorkflow({
        name: formData.name,
        description: formData.description,
        enabled: formData.enabled,
        priority: formData.priority,
        steps: formData.steps,
        triggers: formData.triggers,
      });

      setShowCreateDialog(false);
      setFormData({
        name: '',
        description: '',
        enabled: true,
        priority: 1,
        steps: [],
        triggers: [],
      });

      onWorkflowChange?.(workflow);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const handleUpdateWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      const workflow = await actions.updateWorkflow(selectedWorkflow.id, {
        name: formData.name,
        description: formData.description,
        enabled: formData.enabled,
        priority: formData.priority,
        steps: formData.steps,
        triggers: formData.triggers,
      });

      setShowEditDialog(false);
      setSelectedWorkflow(null);
      onWorkflowChange?.(workflow);
    } catch (error) {
      console.error('Failed to update workflow:', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await actions.deleteWorkflow(workflowId);
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const handleToggleWorkflow = async (workflow: ModerationWorkflow) => {
    try {
      await actions.updateWorkflow(workflow.id, {
        enabled: !workflow.enabled,
      });
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      enabled: true,
      priority: 1,
      steps: [],
      triggers: [],
    });
  };

  const loadWorkflowIntoForm = (workflow: ModerationWorkflow) => {
    setFormData({
      name: workflow.name,
      description: workflow.description,
      enabled: workflow.enabled,
      priority: workflow.priority,
      steps: workflow.steps,
      triggers: workflow.triggers,
    });
  };

  const addStep = () => {
    const newStep: ModerationWorkflowStep = {
      id: `step_${Date.now()}`,
      name: '',
      type: 'automated',
      action: 'flag',
      conditions: [],
      order: formData.steps.length + 1,
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const removeStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
    }));
  };

  const updateStep = (stepId: string, updates: Partial<ModerationWorkflowStep>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    }));
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'automated':
        return <Settings className="w-4 h-4 text-blue-600" />;
      case 'manual':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: ModerationAction) => {
    switch (action) {
      case 'approve':
        return 'text-green-600';
      case 'reject':
        return 'text-red-600';
      case 'flag':
        return 'text-orange-600';
      case 'escalate':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const WorkflowCard = ({ workflow }: { workflow: ModerationWorkflow }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
              <Badge
                variant="outline"
                className={`text-xs ${
                  workflow.enabled
                    ? 'border-green-500 text-green-700'
                    : 'border-gray-500 text-gray-700'
                }`}
              >
                {workflow.enabled ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Priority {workflow.priority}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm mb-3">{workflow.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{workflow.steps.length} steps</span>
              <span>•</span>
              <span>{workflow.triggers.length} triggers</span>
              <span>•</span>
              <span>Modified {new Date(workflow.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={workflow.enabled}
              onCheckedChange={() => handleToggleWorkflow(workflow)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedWorkflow(workflow);
                loadWorkflowIntoForm(workflow);
                setShowEditDialog(true);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteWorkflow(workflow.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Steps Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Workflow Steps:</h4>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border">
                  {getStepIcon(step.type)}
                  <span className="text-sm text-gray-700">{step.name || 'Unnamed Step'}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getActionColor(step.action)}`}
                  >
                    {step.action}
                  </Badge>
                </div>
                {index < workflow.steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const WorkflowForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Workflow Name
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter workflow name"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Priority
          </label>
          <Select
            value={formData.priority.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">High (1)</SelectItem>
              <SelectItem value="2">Medium (2)</SelectItem>
              <SelectItem value="3">Low (3)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Description
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this workflow does"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.enabled}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
        />
        <label className="text-sm font-medium text-gray-700">
          Enable this workflow
        </label>
      </div>

      {/* Steps Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Workflow Steps</h4>
          <Button variant="outline" size="sm" onClick={addStep}>
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>

        <div className="space-y-3">
          {formData.steps.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStepIcon(step.type)}
                  <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(step.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Step Name
                  </label>
                  <Input
                    value={step.name}
                    onChange={(e) => updateStep(step.id, { name: e.target.value })}
                    placeholder="Step name"
                    size="sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Type
                  </label>
                  <Select
                    value={step.type}
                    onValueChange={(value: any) => updateStep(step.id, { type: value })}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automated">Automated</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="escalation">Escalation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Action
                  </label>
                  <Select
                    value={step.action}
                    onValueChange={(value: any) => updateStep(step.id, { action: value })}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                      <SelectItem value="flag">Flag</SelectItem>
                      <SelectItem value="escalate">Escalate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {step.type === 'manual' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Assignee Role
                    </label>
                    <Input
                      value={step.assigneeRole || ''}
                      onChange={(e) => updateStep(step.id, { assigneeRole: e.target.value })}
                      placeholder="e.g., moderator, senior_moderator"
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Timeout (minutes)
                    </label>
                    <Input
                      type="number"
                      value={step.timeoutMinutes || ''}
                      onChange={(e) => updateStep(step.id, { timeoutMinutes: parseInt(e.target.value) })}
                      placeholder="60"
                      size="sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {formData.steps.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Workflow className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No steps defined yet</p>
              <p className="text-xs">Add a step to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const WorkflowsPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Active Workflows</h3>
          <p className="text-sm text-gray-600">Manage automated moderation workflows</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
            </DialogHeader>
            <WorkflowForm />
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleCreateWorkflow} disabled={loading.workflows}>
                {loading.workflows ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  'Create Workflow'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {errors.workflows && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{errors.workflows}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {mockWorkflows.map((workflow) => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}

        {mockWorkflows.length === 0 && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center text-gray-500">
                <Workflow className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No workflows configured</p>
                <p className="text-sm mb-4">Create your first moderation workflow to get started</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
          </DialogHeader>
          <WorkflowForm />
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleUpdateWorkflow} disabled={loading.workflows}>
              {loading.workflows ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                'Update Workflow'
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const TemplatesPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow Templates</h3>
        <p className="text-sm text-gray-600">Quick start with pre-built workflow templates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            name: 'Basic Content Review',
            description: 'Simple automated review for standard content',
            steps: 2,
            category: 'Basic',
          },
          {
            name: 'High-Risk Detection',
            description: 'Multi-step review for potentially harmful content',
            steps: 4,
            category: 'Security',
          },
          {
            name: 'Quality Enhancement',
            description: 'Workflow focused on improving review quality',
            steps: 3,
            category: 'Quality',
          },
          {
            name: 'Compliance Check',
            description: 'Ensure content meets platform policies',
            steps: 3,
            category: 'Compliance',
          },
        ].map((template, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
                <span className="text-xs text-gray-500">{template.steps} steps</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => {
                  // Load template into form
                  setShowCreateDialog(true);
                }}
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderation Workflows</h1>
          <p className="text-gray-600">Configure automated workflows for content moderation</p>
        </div>
        <Button
          variant="outline"
          onClick={() => actions.refreshData()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowsPanel />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplatesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}