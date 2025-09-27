"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FeatureToggleSchema, FeatureToggle, FeatureToggleTargetAudience } from '../../../schemas/feature-toggle.schema';
import { FeatureToggleService } from '../../../services/feature-toggle.service';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Loader2, SaveIcon } from 'lucide-react';
import { toast } from 'sonner';

type FeatureToggleFormValues = Omit<FeatureToggle, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'createdBy'>;

interface FeatureToggleEditorProps {
  featureToggle?: FeatureToggle | null;
  onFeatureToggleSaved: () => void;
}

const FeatureToggleEditor: React.FC<FeatureToggleEditorProps> = ({ featureToggle, onFeatureToggleSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<FeatureToggleFormValues>({
    resolver: zodResolver(FeatureToggleSchema.omit({ id: true, createdAt: true, updatedAt: true, version: true, status: true, createdBy: true })),
    defaultValues: {
      key: '',
      name: '',
      description: '',
      category: 'ui',
      isActive: false,
      type: 'boolean',
      defaultValue: true,
      rolloutStrategy: 'all',
      rolloutPercentage: 100,
      environment: 'development',
      tags: [],
    },
  });

  const rolloutStrategy = watch('rolloutStrategy');

  useEffect(() => {
    if (featureToggle) {
      reset({
        key: featureToggle.key,
        name: featureToggle.name,
        description: featureToggle.description,
        category: featureToggle.category,
        isActive: featureToggle.isActive,
        type: featureToggle.type,
        defaultValue: featureToggle.defaultValue,
        rolloutStrategy: featureToggle.rolloutStrategy,
        rolloutPercentage: featureToggle.rolloutPercentage || 100,
        targetAudience: featureToggle.targetAudience,
        dependencies: featureToggle.dependencies,
        environment: featureToggle.environment,
        tags: featureToggle.tags || [],
      });
    }
  }, [featureToggle, reset]);

  const onSubmit = async (data: FeatureToggleFormValues) => {
    setSaving(true);
    try {
      if (featureToggle) {
        await FeatureToggleService.updateFeatureToggle(featureToggle.id, data);
        toast.success('Feature toggle updated successfully.');
      } else {
        await FeatureToggleService.createFeatureToggle(data);
        toast.success('Feature toggle created successfully.');
      }
      onFeatureToggleSaved();
    } catch (error) {
      toast.error('Failed to save feature toggle.');
      console.error('Error saving feature toggle:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Toggle Details</CardTitle>
          <CardDescription>Basic information about the feature toggle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key">Feature Key *</Label>
              <Input
                id="key"
                {...register('key')}
                placeholder="e.g., new_dashboard_ui"
              />
              {errors.key && <p className="text-red-500 text-sm">{errors.key.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Feature Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., New Dashboard UI"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select {...register('category')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ui">UI</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="experiment">Experiment</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select {...register('type')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="variant">Variant</SelectItem>
                  <SelectItem value="gradual">Gradual</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select {...register('environment')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                </SelectContent>
              </Select>
              {errors.environment && <p className="text-red-500 text-sm">{errors.environment.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter feature toggle description"
              rows={3}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rollout Configuration</CardTitle>
          <CardDescription>Configure how the feature is rolled out to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rolloutStrategy">Rollout Strategy</Label>
              <Select {...register('rolloutStrategy')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rollout strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="user_group">User Group</SelectItem>
                  <SelectItem value="attributes">Attributes</SelectItem>
                </SelectContent>
              </Select>
              {errors.rolloutStrategy && <p className="text-red-500 text-sm">{errors.rolloutStrategy.message}</p>}
            </div>
            {rolloutStrategy === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="rolloutPercentage">Rollout Percentage</Label>
                <Input
                  id="rolloutPercentage"
                  type="number"
                  min="0"
                  max="100"
                  {...register('rolloutPercentage', { valueAsNumber: true })}
                  placeholder="Enter percentage (0-100)"
                />
                {errors.rolloutPercentage && <p className="text-red-500 text-sm">{errors.rolloutPercentage.message}</p>}
              </div>
            )}
          </div>

          {rolloutStrategy === 'user_group' && (
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                placeholder="Define user group criteria (JSON format)"
                rows={4}
              />
              <p className="text-sm text-gray-500">
                Example: {JSON.stringify({ name: "Premium Users", type: "user_group", criteria: [{ field: "subscription", operator: "equals", value: "premium" }] }, null, 2)}
              </p>
            </div>
          )}

          {rolloutStrategy === 'attributes' && (
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Attribute Criteria</Label>
              <Textarea
                id="targetAudience"
                placeholder="Define attribute-based criteria (JSON format)"
                rows={4}
              />
              <p className="text-sm text-gray-500">
                Example: {JSON.stringify({ name: "High Value Users", type: "attributes", criteria: [{ field: "total_spent", operator: "greater_than", value: 1000 }] }, null, 2)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Value</CardTitle>
          <CardDescription>Set the default value for this feature toggle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="defaultValue">Default Value</Label>
            <Input
              id="defaultValue"
              {...register('defaultValue')}
              placeholder="Enter default value (true/false for boolean, string for variant)"
            />
            {errors.defaultValue && <p className="text-red-500 text-sm">{errors.defaultValue.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dependencies</CardTitle>
          <CardDescription>Define feature dependencies (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="dependencies">Feature Dependencies</Label>
            <Textarea
              id="dependencies"
              placeholder="Define feature dependencies (JSON format)"
              rows={4}
            />
            <p className="text-sm text-gray-500">
              Example: {JSON.stringify([{ featureKey: "user_authentication", condition: "enabled" }], null, 2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onFeatureToggleSaved}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <SaveIcon className="mr-2 h-4 w-4" />
          {featureToggle ? 'Update Feature Toggle' : 'Create Feature Toggle'}
        </Button>
      </div>
    </form>
  );
};

export default FeatureToggleEditor;
