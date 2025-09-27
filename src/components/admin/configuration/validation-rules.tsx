"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ConfigurationValidationRule } from '../../../types/configuration.types';
import { ConfigurationService } from '../../../services/configuration.service';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Loader2, PlusIcon, TrashIcon, SaveIcon, TestTubeIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ValidationRulesProps {
  configurationId?: string;
  onRulesUpdated?: () => void;
}

const ValidationRules: React.FC<ValidationRulesProps> = ({ configurationId, onRulesUpdated }) => {
  const [rules, setRules] = useState<ConfigurationValidationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<{
    rules: ConfigurationValidationRule[];
  }>({
    defaultValues: {
      rules: [],
    },
  });

  const { fields: ruleFields, append: appendRule, remove: removeRule } = useFieldArray({
    control,
    name: 'rules',
  });

  useEffect(() => {
    if (configurationId) {
      fetchRules();
    } else {
      setLoading(false);
    }
  }, [configurationId]);

  const fetchRules = async () => {
    if (!configurationId) return;
    
    setLoading(true);
    try {
      const config = await ConfigurationService.getConfigurationById(configurationId);
      setRules(config.validationRules || []);
      reset({ rules: config.validationRules || [] });
    } catch (error) {
      toast.error('Failed to load validation rules.');
      console.error('Error fetching validation rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: { rules: ConfigurationValidationRule[] }) => {
    if (!configurationId) {
      toast.error('No configuration selected.');
      return;
    }

    setSaving(true);
    try {
      await ConfigurationService.updateConfiguration(configurationId, { validationRules: data.rules });
      setRules(data.rules);
      toast.success('Validation rules updated successfully.');
      onRulesUpdated?.();
    } catch (error) {
      toast.error('Failed to update validation rules.');
      console.error('Error updating validation rules:', error);
    } finally {
      setSaving(false);
    }
  };

  const addRule = () => {
    appendRule({
      id: '',
      type: 'regex',
      value: '',
      message: '',
      isActive: true,
    });
  };

  const testValidation = async (rule: ConfigurationValidationRule, testValue: string) => {
    setTesting(true);
    try {
      const result = await ConfigurationService.validateConfiguration(configurationId!, testValue);
      if (result.isValid) {
        toast.success('Validation passed.');
      } else {
        toast.error(`Validation failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      toast.error('Failed to test validation.');
      console.error('Error testing validation:', error);
    } finally {
      setTesting(false);
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
    <Card>
      <CardHeader>
        <CardTitle>Validation Rules</CardTitle>
        <CardDescription>
          Define validation rules for configuration values
          {configurationId && ` (Configuration ID: ${configurationId})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!configurationId ? (
          <p className="text-center text-gray-500">
            Please select a configuration to manage its validation rules.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Validation Rules</h3>
              <Button type="button" onClick={addRule} variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" /> Add Rule
              </Button>
            </div>

            {ruleFields.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No validation rules defined. Click "Add Rule" to create one.
              </p>
            ) : (
              <div className="space-y-4">
                {ruleFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Rule {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          onClick={() => removeRule(index)}
                          variant="outline"
                          size="sm"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`rules.${index}.type`}>Validation Type</Label>
                        <Select {...register(`rules.${index}.type`)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regex">Regular Expression</SelectItem>
                            <SelectItem value="min">Minimum Value</SelectItem>
                            <SelectItem value="max">Maximum Value</SelectItem>
                            <SelectItem value="enum">Enum Values</SelectItem>
                            <SelectItem value="custom">Custom Function</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.rules?.[index]?.type && (
                          <p className="text-red-500 text-sm">{errors.rules[index]?.type?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`rules.${index}.value`}>Validation Value</Label>
                        <Input
                          {...register(`rules.${index}.value`)}
                          placeholder="Enter validation value"
                        />
                        {errors.rules?.[index]?.value && (
                          <p className="text-red-500 text-sm">{errors.rules[index]?.value?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`rules.${index}.message`}>Error Message</Label>
                        <Input
                          {...register(`rules.${index}.message`)}
                          placeholder="Enter error message"
                        />
                        {errors.rules?.[index]?.message && (
                          <p className="text-red-500 text-sm">{errors.rules[index]?.message?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            {...register(`rules.${index}.isActive`)}
                            defaultChecked={true}
                          />
                          <Label htmlFor={`rules.${index}.isActive`}>Active</Label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <strong>Examples:</strong>
                          <ul className="mt-1 space-y-1">
                            <li><strong>Regex:</strong> ^[a-zA-Z0-9]+$ (alphanumeric only)</li>
                            <li><strong>Min:</strong> 0 (minimum value)</li>
                            <li><strong>Max:</strong> 100 (maximum value)</li>
                            <li><strong>Enum:</strong> ["option1", "option2", "option3"]</li>
                          </ul>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const testValue = prompt('Enter test value:');
                            if (testValue !== null) {
                              testValidation(rules[index], testValue);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          disabled={testing}
                        >
                          {testing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTubeIcon className="h-4 w-4" />
                          )}
                          Test
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={fetchRules}>
                Reset
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <SaveIcon className="mr-2 h-4 w-4" />
                Save Rules
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationRules;
