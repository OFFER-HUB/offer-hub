"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PolicySchema, Policy, PolicyRule, PolicyAction } from '../../../schemas/policy.schema';
import { PolicyService } from '../../../services/policy.service';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Loader2, PlusIcon, TrashIcon, SaveIcon } from 'lucide-react';
import { toast } from 'sonner';

type PolicyFormValues = Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'isActive' | 'createdBy'>;

interface PolicyEditorProps {
  policy?: Policy | null;
  onPolicySaved: () => void;
}

const PolicyEditor: React.FC<PolicyEditorProps> = ({ policy, onPolicySaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PolicyFormValues>({
    resolver: zodResolver(PolicySchema.omit({ id: true, createdAt: true, updatedAt: true, version: true, status: true, isActive: true, createdBy: true })),
    defaultValues: {
      name: '',
      description: '',
      category: 'user_behavior',
      priority: 'medium',
      rules: [{ name: '', type: 'user_behavior', operator: 'equals', value: '', field: '', isActive: true }],
      actions: [{ name: '', type: 'log', parameters: {}, isActive: true }],
      environment: 'development',
      tags: [],
    },
  });

  const { fields: ruleFields, append: appendRule, remove: removeRule } = useFieldArray({
    control,
    name: 'rules',
  });

  const { fields: actionFields, append: appendAction, remove: removeAction } = useFieldArray({
    control,
    name: 'actions',
  });

  useEffect(() => {
    if (policy) {
      reset({
        name: policy.name,
        description: policy.description,
        category: policy.category,
        priority: policy.priority,
        rules: policy.rules,
        actions: policy.actions,
        environment: policy.environment,
        tags: policy.tags || [],
      });
    }
  }, [policy, reset]);

  const onSubmit = async (data: PolicyFormValues) => {
    setSaving(true);
    try {
      if (policy) {
        await PolicyService.updatePolicy(policy.id, data);
        toast.success('Policy updated successfully.');
      } else {
        await PolicyService.createPolicy(data);
        toast.success('Policy created successfully.');
      }
      onPolicySaved();
    } catch (error) {
      toast.error('Failed to save policy.');
      console.error('Error saving policy:', error);
    } finally {
      setSaving(false);
    }
  };

  const addRule = () => {
    appendRule({
      name: '',
      type: 'user_behavior',
      operator: 'equals',
      value: '',
      field: '',
      isActive: true,
    });
  };

  const addAction = () => {
    appendAction({
      name: '',
      type: 'log',
      parameters: {},
      isActive: true,
    });
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
          <CardTitle>Policy Details</CardTitle>
          <CardDescription>Basic information about the policy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Policy Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter policy name"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select {...register('category')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_behavior">User Behavior</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select {...register('priority')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-red-500 text-sm">{errors.priority.message}</p>}
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
              placeholder="Enter policy description"
              rows={3}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Policy Rules</CardTitle>
            <CardDescription>Define the conditions that trigger this policy</CardDescription>
          </div>
          <Button type="button" onClick={addRule} variant="outline" size="sm">
            <PlusIcon className="h-4 w-4 mr-2" /> Add Rule
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {ruleFields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Rule {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeRule(index)}
                  variant="outline"
                  size="sm"
                  disabled={ruleFields.length === 1}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`rules.${index}.name`}>Rule Name</Label>
                  <Input
                    {...register(`rules.${index}.name`)}
                    placeholder="Enter rule name"
                  />
                  {errors.rules?.[index]?.name && (
                    <p className="text-red-500 text-sm">{errors.rules[index]?.name?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rules.${index}.type`}>Type</Label>
                  <Select {...register(`rules.${index}.type`)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_behavior">User Behavior</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="transaction">Transaction</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rules.${index}.operator`}>Operator</Label>
                  <Select {...register(`rules.${index}.operator`)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="not_equals">Not Equals</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="not_contains">Not Contains</SelectItem>
                      <SelectItem value="starts_with">Starts With</SelectItem>
                      <SelectItem value="ends_with">Ends With</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rules.${index}.field`}>Field</Label>
                  <Input
                    {...register(`rules.${index}.field`)}
                    placeholder="e.g., user.reputation, transaction.amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rules.${index}.value`}>Value</Label>
                  <Input
                    {...register(`rules.${index}.value`)}
                    placeholder="Enter value to compare"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rules.${index}.description`}>Description</Label>
                  <Input
                    {...register(`rules.${index}.description`)}
                    placeholder="Rule description"
                  />
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Policy Actions</CardTitle>
            <CardDescription>Define what happens when the policy is triggered</CardDescription>
          </div>
          <Button type="button" onClick={addAction} variant="outline" size="sm">
            <PlusIcon className="h-4 w-4 mr-2" /> Add Action
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionFields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Action {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeAction(index)}
                  variant="outline"
                  size="sm"
                  disabled={actionFields.length === 1}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`actions.${index}.name`}>Action Name</Label>
                  <Input
                    {...register(`actions.${index}.name`)}
                    placeholder="Enter action name"
                  />
                  {errors.actions?.[index]?.name && (
                    <p className="text-red-500 text-sm">{errors.actions[index]?.name?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`actions.${index}.type`}>Action Type</Label>
                  <Select {...register(`actions.${index}.type`)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="warn">Warn</SelectItem>
                      <SelectItem value="notify">Notify</SelectItem>
                      <SelectItem value="log">Log</SelectItem>
                      <SelectItem value="quarantine">Quarantine</SelectItem>
                      <SelectItem value="auto_correct">Auto Correct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`actions.${index}.description`}>Description</Label>
                  <Input
                    {...register(`actions.${index}.description`)}
                    placeholder="Action description"
                  />
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onPolicySaved}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <SaveIcon className="mr-2 h-4 w-4" />
          {policy ? 'Update Policy' : 'Create Policy'}
        </Button>
      </div>
    </form>
  );
};

export default PolicyEditor;
