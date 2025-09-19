'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Template,
  TemplateSection,
  TemplateVariable,
  TemplateCustomization,
  TemplateCustomizationProps
} from '@/types/templates.types';
import { useTemplatePreview } from '@/hooks/use-resolution-templates';
import {
  Save,
  Eye,
  EyeOff,
  Edit,
  Undo,
  Redo,
  Copy,
  Download,
  Upload,
  Settings,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  List,
  FileText,
  Smartphone,
  Monitor,
  Tablet,
  Code,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  Variable
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'react-hot-toast';

export function TemplateCustomization({
  template,
  disputeId,
  previewMode = false,
  onSave,
  onPreview,
  onCancel,
  allowVariableEditing = true,
  showPreview = true,
  mobileOptimized = false
}: TemplateCustomizationProps) {
  const [customizations, setCustomizations] = useState<TemplateCustomization['customizations']>([]);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [isPreviewMode, setIsPreviewMode] = useState(previewMode);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const { previewTemplate, isLoading: isPreviewLoading, error: previewError } = useTemplatePreview();

  // Initialize customizations and variables
  useEffect(() => {
    // Initialize variables with default values
    const initialVariables: Record<string, any> = {};
    template.variables.forEach(variable => {
      initialVariables[variable.name] = variable.defaultValue || '';
    });

    template.sections.forEach(section => {
      section.variables.forEach(variable => {
        initialVariables[variable.name] = variable.defaultValue || '';
      });
    });

    setVariables(initialVariables);

    // Initialize customizations for all sections
    const initialCustomizations = template.sections.map(section => ({
      sectionId: section.id,
      modifications: {
        content: section.content,
        variables: {},
        optional: section.optional
      }
    }));

    setCustomizations(initialCustomizations);
    setExpandedSections(template.sections.map(s => s.id));
  }, [template]);

  // Generate preview when variables change
  useEffect(() => {
    if (isPreviewMode && showPreview) {
      generatePreview();
    }
  }, [variables, customizations, isPreviewMode, showPreview]);

  const generatePreview = useCallback(async () => {
    try {
      const content = await previewTemplate(template.id, variables);
      setPreviewContent(content);
      onPreview?.(content);
    } catch (error) {
      console.error('Preview generation failed:', error);
      toast.error('Failed to generate preview');
    }
  }, [template.id, variables, previewTemplate, onPreview]);

  const validateVariables = useCallback(() => {
    const errors: Record<string, string[]> = {};

    template.variables.forEach(variable => {
      const value = variables[variable.name];
      const fieldErrors: string[] = [];

      if (variable.required && (!value || value.toString().trim() === '')) {
        fieldErrors.push('This field is required');
      }

      if (variable.validation) {
        const { pattern, min, max, options } = variable.validation;

        if (pattern && value && !new RegExp(pattern).test(value.toString())) {
          fieldErrors.push('Invalid format');
        }

        if (min !== undefined && value && value.toString().length < min) {
          fieldErrors.push(`Minimum length: ${min} characters`);
        }

        if (max !== undefined && value && value.toString().length > max) {
          fieldErrors.push(`Maximum length: ${max} characters`);
        }

        if (options && value && !options.includes(value.toString())) {
          fieldErrors.push(`Must be one of: ${options.join(', ')}`);
        }
      }

      if (fieldErrors.length > 0) {
        errors[variable.name] = fieldErrors;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [template.variables, variables]);

  const handleVariableChange = (variableName: string, value: any) => {
    setVariables(prev => ({
      ...prev,
      [variableName]: value
    }));
    setIsDirty(true);
  };

  const handleSectionContentChange = (sectionId: string, content: string) => {
    setCustomizations(prev => prev.map(custom =>
      custom.sectionId === sectionId
        ? {
            ...custom,
            modifications: {
              ...custom.modifications,
              content
            }
          }
        : custom
    ));
    setIsDirty(true);
  };

  const handleSectionOptionalChange = (sectionId: string, optional: boolean) => {
    setCustomizations(prev => prev.map(custom =>
      custom.sectionId === sectionId
        ? {
            ...custom,
            modifications: {
              ...custom.modifications,
              optional
            }
          }
        : custom
    ));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!validateVariables()) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    const customization: TemplateCustomization = {
      templateId: template.id,
      customizations,
      previewMode: isPreviewMode,
      saveAsDraft: false
    };

    try {
      onSave?.(customization);
      setIsDirty(false);
      toast.success('Template customization saved');
    } catch (error) {
      toast.error('Failed to save customization');
    }
  };

  const handleReset = () => {
    // Reset to original template values
    const initialVariables: Record<string, any> = {};
    template.variables.forEach(variable => {
      initialVariables[variable.name] = variable.defaultValue || '';
    });

    template.sections.forEach(section => {
      section.variables.forEach(variable => {
        initialVariables[variable.name] = variable.defaultValue || '';
      });
    });

    setVariables(initialVariables);

    const initialCustomizations = template.sections.map(section => ({
      sectionId: section.id,
      modifications: {
        content: section.content,
        variables: {},
        optional: section.optional
      }
    }));

    setCustomizations(initialCustomizations);
    setIsDirty(false);
    setValidationErrors({});
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const renderVariableInput = (variable: TemplateVariable) => {
    const value = variables[variable.name] || '';
    const hasError = validationErrors[variable.name];

    switch (variable.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Textarea
              value={value}
              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
              placeholder={variable.description}
              className={hasError ? 'border-red-500' : ''}
              rows={3}
            />
            {hasError && (
              <div className="text-sm text-red-600">
                {hasError.map((error, idx) => (
                  <div key={idx}>{error}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Input
              type="number"
              value={value}
              onChange={(e) => handleVariableChange(variable.name, parseFloat(e.target.value) || 0)}
              placeholder={variable.description}
              className={hasError ? 'border-red-500' : ''}
              min={variable.validation?.min}
              max={variable.validation?.max}
            />
            {hasError && (
              <div className="text-sm text-red-600">
                {hasError.map((error, idx) => (
                  <div key={idx}>{error}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Input
              type="date"
              value={value}
              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && (
              <div className="text-sm text-red-600">
                {hasError.map((error, idx) => (
                  <div key={idx}>{error}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={!!value}
              onCheckedChange={(checked) => handleVariableChange(variable.name, checked)}
            />
            <Label>{value ? 'Yes' : 'No'}</Label>
          </div>
        );

      case 'array':
        if (variable.validation?.options) {
          return (
            <Select
              value={value}
              onValueChange={(newValue) => handleVariableChange(variable.name, newValue)}
            >
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {variable.validation.options.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return (
          <Input
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.description}
            className={hasError ? 'border-red-500' : ''}
          />
        );

      default:
        return (
          <div className="space-y-2">
            <Input
              value={value}
              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
              placeholder={variable.description}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && (
              <div className="text-sm text-red-600">
                {hasError.map((error, idx) => (
                  <div key={idx}>{error}</div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  const getVariableIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'number': return <Hash className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'boolean': return <ToggleLeft className="h-4 w-4" />;
      case 'array': return <List className="h-4 w-4" />;
      default: return <Variable className="h-4 w-4" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customize Template</h2>
          <p className="text-gray-600">{template.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          {showPreview && (
            <Button
              size="sm"
              variant={isPreviewMode ? "default" : "outline"}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              disabled={isPreviewLoading}
            >
              {isPreviewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {isPreviewMode ? 'Hide Preview' : 'Show Preview'}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleReset} disabled={!isDirty}>
            <Undo className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!isDirty}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customization Panel */}
        <div className="space-y-6">
          {/* Global Variables */}
          {template.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Global Variables</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.variables.map(variable => (
                  <div key={variable.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center space-x-2">
                        {getVariableIcon(variable.type)}
                        <span>{variable.name}</span>
                        {variable.required && <span className="text-red-500">*</span>}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {variable.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{variable.description}</p>
                    {allowVariableEditing && renderVariableInput(variable)}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Template Sections */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Template Sections</h3>
            {template.sections.map((section, index) => {
              const isExpanded = expandedSections.includes(section.id);
              const customization = customizations.find(c => c.sectionId === section.id);

              return (
                <Card key={section.id}>
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleSectionExpansion(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {isExpanded ?
                              <ChevronDown className="h-4 w-4" /> :
                              <ChevronUp className="h-4 w-4" />
                            }
                            <div>
                              <CardTitle className="text-base">{section.title}</CardTitle>
                              <p className="text-sm text-gray-600">Section {index + 1}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {section.optional && (
                              <Badge variant="secondary" className="text-xs">
                                Optional
                              </Badge>
                            )}
                            <Switch
                              checked={!customization?.modifications.optional}
                              onCheckedChange={(checked) =>
                                handleSectionOptionalChange(section.id, !checked)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        {/* Section Content */}
                        <div className="space-y-2">
                          <Label>Content</Label>
                          <Textarea
                            value={customization?.modifications.content || section.content}
                            onChange={(e) => handleSectionContentChange(section.id, e.target.value)}
                            rows={6}
                            className="font-mono text-sm"
                          />
                        </div>

                        {/* Section Variables */}
                        {section.variables.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium">Section Variables</h4>
                            {section.variables.map(variable => (
                              <div key={variable.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="flex items-center space-x-2">
                                    {getVariableIcon(variable.type)}
                                    <span>{variable.name}</span>
                                    {variable.required && <span className="text-red-500">*</span>}
                                  </Label>
                                  <Badge variant="outline" className="text-xs">
                                    {variable.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{variable.description}</p>
                                {allowVariableEditing && renderVariableInput(variable)}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && isPreviewMode && (
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Preview</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {/* Device Toggle */}
                    <div className="flex items-center space-x-1 border rounded-lg p-1">
                      {(['desktop', 'tablet', 'mobile'] as const).map(device => (
                        <Button
                          key={device}
                          size="sm"
                          variant={devicePreview === device ? "default" : "ghost"}
                          onClick={() => setDevicePreview(device)}
                          className="p-1"
                        >
                          {getDeviceIcon(device)}
                        </Button>
                      ))}
                    </div>

                    {/* Refresh Preview */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generatePreview}
                      disabled={isPreviewLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isPreviewLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`border rounded-lg overflow-hidden ${
                  devicePreview === 'mobile' ? 'max-w-sm mx-auto' :
                  devicePreview === 'tablet' ? 'max-w-2xl mx-auto' :
                  'w-full'
                }`}>
                  {isPreviewLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : previewError ? (
                    <div className="flex items-center justify-center p-8 text-red-600">
                      <AlertCircle className="h-6 w-6 mr-2" />
                      <span>Preview failed to load</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-white">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewContent }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center space-x-2">
          {isDirty && (
            <Badge variant="outline" className="text-yellow-600">
              Unsaved changes
            </Badge>
          )}
          {Object.keys(validationErrors).length > 0 && (
            <Badge variant="outline" className="text-red-600">
              {Object.keys(validationErrors).length} validation errors
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isDirty || Object.keys(validationErrors).length > 0}>
            <Save className="h-4 w-4 mr-2" />
            Save Customization
          </Button>
        </div>
      </div>
    </div>
  );
}