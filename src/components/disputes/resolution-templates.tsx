'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Template,
  TemplateType,
  DisputeCategory,
  TemplateStatus,
  ResolutionTemplatesProps
} from '@/types/templates.types';
import { useResolutionTemplates, useTemplatesByCategory } from '@/hooks/use-resolution-templates';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Edit,
  Copy,
  Download,
  Eye,
  Star,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function ResolutionTemplates({
  disputeId,
  onTemplateSelect,
  showCustomization = true,
  filterByDisputeType = false,
  allowQuickActions = true
}: ResolutionTemplatesProps) {
  const {
    templates,
    isLoading,
    error,
    searchResults,
    actions
  } = useResolutionTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<DisputeCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TemplateStatus | 'all'>('active');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'success_rate' | 'last_modified'>('usage');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filter templates based on search and filters
  const filteredTemplates = React.useMemo(() => {
    let filtered = templates;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(template => template.status === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.metadata.usageCount - a.metadata.usageCount;
        case 'success_rate':
          return b.metadata.successRate - a.metadata.successRate;
        case 'last_modified':
          return new Date(b.metadata.lastModified).getTime() - new Date(a.metadata.lastModified).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [templates, searchQuery, selectedType, selectedCategory, selectedStatus, sortBy]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    onTemplateSelect?.(template);
  };

  const handleQuickAction = async (action: string, template: Template) => {
    switch (action) {
      case 'duplicate':
        try {
          await actions.duplicateTemplate(template.id, `${template.name} (Copy)`);
        } catch (error) {
          console.error('Failed to duplicate template:', error);
        }
        break;
      case 'export':
        try {
          const blob = await actions.exportTemplate(template.id, 'pdf');
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${template.name}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Failed to export template:', error);
        }
        break;
      case 'preview':
        setSelectedTemplate(template);
        setShowPreview(true);
        break;
    }
  };

  const getTemplateIcon = (type: TemplateType) => {
    switch (type) {
      case 'communication': return <Users className="h-4 w-4" />;
      case 'evidence_request': return <FileText className="h-4 w-4" />;
      case 'mediation_proposal': return <Users className="h-4 w-4" />;
      case 'resolution_proposal': return <CheckCircle className="h-4 w-4" />;
      case 'decision_notification': return <AlertCircle className="h-4 w-4" />;
      case 'escalation_notice': return <TrendingUp className="h-4 w-4" />;
      case 'closure_notification': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: TemplateStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'draft': return 'bg-yellow-500';
      case 'archived': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 animate-pulse" />
          <span>Loading templates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Templates</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => actions.getTemplates()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resolution Templates</h2>
          <p className="text-gray-600">Manage and apply standardized dispute resolution templates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedType} onValueChange={(value: TemplateType | 'all') => setSelectedType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="evidence_request">Evidence Request</SelectItem>
                  <SelectItem value="mediation_proposal">Mediation Proposal</SelectItem>
                  <SelectItem value="resolution_proposal">Resolution Proposal</SelectItem>
                  <SelectItem value="decision_notification">Decision Notification</SelectItem>
                  <SelectItem value="escalation_notice">Escalation Notice</SelectItem>
                  <SelectItem value="closure_notification">Closure Notification</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usage">Most Used</SelectItem>
                  <SelectItem value="success_rate">Success Rate</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="last_modified">Recently Modified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="payment_dispute">Payment Dispute</SelectItem>
                      <SelectItem value="quality_dispute">Quality Dispute</SelectItem>
                      <SelectItem value="scope_dispute">Scope Dispute</SelectItem>
                      <SelectItem value="deadline_dispute">Deadline Dispute</SelectItem>
                      <SelectItem value="communication_issue">Communication Issue</SelectItem>
                      <SelectItem value="contract_breach">Contract Breach</SelectItem>
                      <SelectItem value="intellectual_property">Intellectual Property</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                    >
                      Grid
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                    >
                      List
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{filteredTemplates.length} templates found</span>
        <div className="flex items-center space-x-4">
          <span>Showing {filteredTemplates.length} of {templates.length}</span>
        </div>
      </div>

      {/* Templates Grid/List */}
      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
      }>
        <AnimatePresence>
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${
                selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(template.status)} text-white`}>
                        {getTemplateIcon(template.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{template.description}</p>
                      </div>
                    </div>
                    {allowQuickActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleQuickAction('preview', template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickAction('duplicate', template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickAction('export', template)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Template Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium">{template.metadata.successRate}%</span>
                    </div>
                    <Progress value={template.metadata.successRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{template.metadata.usageCount} uses</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{template.metadata.averageResolutionTime}h avg</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Quality Indicators */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(template.status)}`} />
                      <span className="text-xs text-gray-600 capitalize">{template.status}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {template.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {template.mobileOptimized && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Mobile
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full"
                    size="sm"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filters to find templates.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Template
          </Button>
        </div>
      )}

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Template Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {selectedTemplate.type}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {selectedTemplate.category}
                  </div>
                  <div>
                    <span className="font-medium">Success Rate:</span> {selectedTemplate.metadata.successRate}%
                  </div>
                  <div>
                    <span className="font-medium">Usage:</span> {selectedTemplate.metadata.usageCount} times
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Template Sections</h4>
                {selectedTemplate.sections.map((section) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">{section.title}</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.content}</p>
                    {section.variables.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-gray-600">Variables:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {section.variables.map((variable) => (
                            <Badge key={variable.id} variant="outline" className="text-xs">
                              {variable.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}