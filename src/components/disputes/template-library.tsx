'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Template,
  TemplateLibrary,
  TemplateSearchFilters,
  TemplateLibraryProps,
  TemplateType,
  DisputeCategory
} from '@/types/templates.types';
import { useResolutionTemplates } from '@/hooks/use-resolution-templates';
import {
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  BookOpen,
  Tag,
  Calendar,
  Users,
  TrendingUp,
  Star,
  Download,
  Upload,
  RefreshCw,
  FileText,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  X,
  Award,
  Zap,
  Clock,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function TemplateLibrary({
  showSearch = true,
  showFilters = true,
  allowCreation = true,
  allowEditing = true,
  selectionMode = 'single',
  onTemplateSelect,
  onTemplatesSelect,
  defaultFilters,
  compactView = false,
  showMetrics = true
}: TemplateLibraryProps) {
  const {
    templates,
    library,
    isLoading,
    error,
    searchResults,
    actions
  } = useResolutionTemplates();

  const [searchQuery, setSearchQuery] = useState(defaultFilters?.searchQuery || '');
  const [selectedTypes, setSelectedTypes] = useState<TemplateType[]>(defaultFilters?.type || []);
  const [selectedCategories, setSelectedCategories] = useState<DisputeCategory[]>(defaultFilters?.category || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultFilters?.tags || []);
  const [sortBy, setSortBy] = useState(defaultFilters?.sortBy || 'usage');
  const [sortOrder, setSortOrder] = useState(defaultFilters?.sortOrder || 'desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['all']);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load library data
  useEffect(() => {
    actions.getLibrary().catch(console.error);
  }, [actions]);

  // Available filter options
  const availableTypes: TemplateType[] = [
    'communication',
    'evidence_request',
    'mediation_proposal',
    'resolution_proposal',
    'decision_notification',
    'escalation_notice',
    'closure_notification',
    'custom'
  ];

  const availableCategories: DisputeCategory[] = [
    'payment_dispute',
    'quality_dispute',
    'scope_dispute',
    'deadline_dispute',
    'communication_issue',
    'contract_breach',
    'intellectual_property',
    'other'
  ];

  // Filtered and sorted templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query)) ||
        template.metadata.author.toLowerCase().includes(query)
      );
    }

    // Type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(template => selectedTypes.includes(template.type));
    }

    // Category filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(template => selectedCategories.includes(template.category));
    }

    // Tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(template =>
        selectedTags.every(tag => template.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.metadata.lastModified).getTime() - new Date(b.metadata.lastModified).getTime();
          break;
        case 'usage':
          comparison = a.metadata.usageCount - b.metadata.usageCount;
          break;
        case 'success_rate':
          comparison = a.metadata.successRate - b.metadata.successRate;
          break;
        case 'last_modified':
          comparison = new Date(a.metadata.lastModified).getTime() - new Date(b.metadata.lastModified).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [templates, searchQuery, selectedTypes, selectedCategories, selectedTags, sortBy, sortOrder]);

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, Template[]> = {};

    filteredTemplates.forEach(template => {
      const category = template.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(template);
    });

    return groups;
  }, [filteredTemplates]);

  // Available tags from all templates
  const availableTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    templates.forEach(template => {
      template.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));
  }, [templates]);

  const handleTemplateSelect = (template: Template) => {
    if (selectionMode === 'single') {
      setSelectedTemplates([template]);
      onTemplateSelect?.(template);
    } else if (selectionMode === 'multiple') {
      const newSelection = selectedTemplates.find(t => t.id === template.id)
        ? selectedTemplates.filter(t => t.id !== template.id)
        : [...selectedTemplates, template];
      setSelectedTemplates(newSelection);
      onTemplatesSelect?.(newSelection);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        actions.getTemplates(),
        actions.getLibrary()
      ]);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getTemplateIcon = (type: TemplateType) => {
    const icons = {
      communication: Users,
      evidence_request: FileText,
      mediation_proposal: Users,
      resolution_proposal: Award,
      decision_notification: Bell,
      escalation_notice: TrendingUp,
      closure_notification: CheckCircle,
      custom: Edit
    };
    const Icon = icons[type] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 animate-pulse" />
          <span>Loading template library...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span>Template Library</span>
          </h2>
          <p className="text-gray-600">
            Browse and manage your dispute resolution template collection
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {allowCreation && (
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          )}
        </div>
      </div>

      {/* Library Overview */}
      {library && showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{library.totalTemplates}</p>
                  <p className="text-sm text-gray-600">Total Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Tag className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{library.categories.length}</p>
                  <p className="text-sm text-gray-600">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{library.tags.length}</p>
                  <p className="text-sm text-gray-600">Tags</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Date(library.lastUpdated).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Last Updated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <div className="lg:w-80 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Filters</span>
                  {(selectedTypes.length > 0 || selectedCategories.length > 0 || selectedTags.length > 0) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClearFilters}
                      className="h-6 px-2 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Types */}
                <div>
                  <h4 className="font-medium mb-2">Template Types</h4>
                  <div className="space-y-2">
                    {availableTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            }
                          }}
                        />
                        <label htmlFor={type} className="text-sm capitalize">
                          {type.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-2">Categories</h4>
                  <div className="space-y-2">
                    {availableCategories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                        />
                        <label htmlFor={category} className="text-sm capitalize">
                          {category.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Popular Tags */}
                <div>
                  <h4 className="font-medium mb-2">Popular Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.slice(0, 10).map(({ tag, count }) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                      >
                        {tag} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Search and Controls */}
          {showSearch && (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search templates, descriptions, tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Sort and View Controls */}
                  <div className="flex items-center space-x-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usage">Most Used</SelectItem>
                        <SelectItem value="success_rate">Success Rate</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="last_modified">Recently Modified</SelectItem>
                        <SelectItem value="created">Recently Created</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>

                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>{filteredTemplates.length} templates found</span>
              {selectionMode === 'multiple' && selectedTemplates.length > 0 && (
                <Badge variant="outline">
                  {selectedTemplates.length} selected
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Showing {filteredTemplates.length} of {templates.length}</span>
            </div>
          </div>

          {/* Templates by Category */}
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category}>
                <Collapsible
                  open={expandedCategories.includes(category)}
                  onOpenChange={() => toggleCategoryExpansion(category)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto">
                      <div className="flex items-center space-x-2">
                        {expandedCategories.includes(category) ?
                          <ChevronDown className="h-4 w-4" /> :
                          <ChevronRight className="h-4 w-4" />
                        }
                        <h3 className="text-lg font-semibold capitalize">
                          {category.replace('_', ' ')} ({categoryTemplates.length})
                        </h3>
                      </div>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4">
                    <div className={viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                      : 'space-y-3'
                    }>
                      <AnimatePresence>
                        {categoryTemplates.map((template) => (
                          <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <Card
                              className={`hover:shadow-md transition-shadow cursor-pointer ${
                                selectedTemplates.find(t => t.id === template.id)
                                  ? 'ring-2 ring-blue-500'
                                  : ''
                              }`}
                              onClick={() => handleTemplateSelect(template)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                      {getTemplateIcon(template.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 truncate">
                                        {template.name}
                                      </h4>
                                      <p className="text-sm text-gray-600 truncate">
                                        {template.description}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {template.isDefault && (
                                      <Star className="h-4 w-4 text-yellow-500" />
                                    )}
                                    {template.mobileOptimized && (
                                      <Zap className="h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>

                              {!compactView && (
                                <CardContent className="space-y-3">
                                  {/* Metrics */}
                                  <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                      <p className="text-lg font-semibold text-green-600">
                                        {template.metadata.successRate}%
                                      </p>
                                      <p className="text-xs text-gray-600">Success</p>
                                    </div>
                                    <div>
                                      <p className="text-lg font-semibold text-blue-600">
                                        {template.metadata.usageCount}
                                      </p>
                                      <p className="text-xs text-gray-600">Uses</p>
                                    </div>
                                    <div>
                                      <p className="text-lg font-semibold text-purple-600">
                                        {template.metadata.averageResolutionTime}h
                                      </p>
                                      <p className="text-xs text-gray-600">Avg Time</p>
                                    </div>
                                  </div>

                                  {/* Tags */}
                                  <div className="flex flex-wrap gap-1">
                                    {template.tags.slice(0, 3).map(tag => (
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

                                  {/* Status */}
                                  <div className="flex items-center justify-between pt-2 border-t">
                                    <Badge variant="outline" className="text-xs">
                                      {template.status}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      Updated {new Date(template.metadata.lastModified).toLocaleDateString()}
                                    </span>
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No templates found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find templates.
              </p>
              {allowCreation && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}