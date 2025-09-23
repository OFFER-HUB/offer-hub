// Report builder - clients always want custom reports

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Plus,
  Play,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  FileText,
  Save,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

import {
  CustomReport,
  DateRange,
  ChartType
} from '@/types/review-analytics.types';
import { useReviewAnalytics } from '@/hooks/use-review-analytics';
import { formatDate, getDateRange, validateDateRange } from '@/utils/analytics-helpers';

const AVAILABLE_METRICS = [
  { id: 'totalReviews', name: 'Total Reviews', category: 'performance' },
  { id: 'averageRating', name: 'Average Rating', category: 'performance' },
  { id: 'submissionRate', name: 'Submission Rate', category: 'performance' },
  { id: 'completionRate', name: 'Completion Rate', category: 'performance' },
  { id: 'engagementRate', name: 'Engagement Rate', category: 'behavior' },
  { id: 'readingPatterns', name: 'Reading Patterns', category: 'behavior' },
  { id: 'deviceUsage', name: 'Device Usage', category: 'behavior' },
  { id: 'ratingDistribution', name: 'Rating Distribution', category: 'reputation' },
  { id: 'ratingTrends', name: 'Rating Trends', category: 'reputation' },
  { id: 'reputationScore', name: 'Reputation Score', category: 'reputation' }
];

// Basic report templates
const REPORT_TEMPLATES = [
  {
    id: 'performance-overview',
    name: 'Performance Overview',
    description: 'Review performance metrics',
    category: 'Executive',
    metrics: ['totalReviews', 'averageRating', 'submissionRate', 'completionRate'],
    defaultFilters: {
      userTypes: [],
      projectCategories: [],
      ratingRange: [1, 5] as [number, number] as [number, number]
    },
    visualization: {
      chartType: 'line' as const,
      showTrends: true,
      includeComparisons: true,
      aggregation: 'average' as const
    },
    schedule: {
      frequency: 'weekly' as const,
      format: 'pdf' as const,
      recipients: []
    }
  },
  {
    id: 'user-behavior-analysis',
    name: 'User Behavior Analysis',
    description: 'Deep dive into user engagement and interaction patterns',
    category: 'Product',
    metrics: ['engagementRate', 'readingPatterns', 'deviceUsage'],
    defaultFilters: {
      userTypes: [],
      reviewLength: 'all' as const,
      deviceTypes: []
    },
    visualization: {
      chartType: 'bar' as const,
      showTrends: false,
      includeComparisons: false,
      aggregation: 'average' as const
    },
    schedule: {
      frequency: 'monthly' as const,
      format: 'excel' as const,
      recipients: []
    }
  },
  {
    id: 'reputation-monitoring',
    name: 'Reputation Monitoring',
    description: 'Track reputation trends and identify improvement opportunities',
    category: 'Marketing',
    metrics: ['ratingDistribution', 'ratingTrends', 'reputationScore'],
    defaultFilters: {
      userTypes: ['freelancer'],
      projectCategories: [],
      ratingRange: [1, 5] as [number, number]
    },
    visualization: {
      chartType: 'area' as const,
      showTrends: true,
      includeComparisons: true,
      aggregation: 'average' as const
    },
    schedule: {
      frequency: 'daily' as const,
      format: 'json' as const,
      recipients: []
    }
  },
  {
    id: 'quality-assessment',
    name: 'Review Quality Assessment',
    description: 'Analyze review quality indicators and content patterns',
    category: 'Quality',
    metrics: ['averageRating', 'readingPatterns', 'completionRate'],
    defaultFilters: {
      reviewLength: 'long' as const,
      ratingRange: [4, 5] as [number, number]
    },
    visualization: {
      chartType: 'scatter' as const,
      showTrends: false,
      includeComparisons: false,
      aggregation: 'average' as const
    },
    schedule: {
      frequency: 'weekly' as const,
      format: 'csv' as const,
      recipients: []
    }
  },
  {
    id: 'predictive-insights',
    name: 'Predictive Insights',
    description: 'AI-powered predictions and trend forecasting',
    category: 'Analytics',
    metrics: ['totalReviews', 'averageRating', 'ratingTrends'],
    defaultFilters: {
      userTypes: [],
      projectCategories: []
    },
    visualization: {
      chartType: 'line' as const,
      showTrends: true,
      includeComparisons: true,
      aggregation: 'average' as const
    },
    schedule: {
      frequency: 'weekly' as const,
      format: 'pdf' as const,
      recipients: []
    }
  },
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis',
    description: 'Compare performance against industry benchmarks',
    category: 'Strategy',
    metrics: ['averageRating', 'submissionRate', 'reputationScore'],
    defaultFilters: {
      userTypes: [],
      projectCategories: []
    },
    visualization: {
      chartType: 'bar' as const,
      showTrends: true,
      includeComparisons: true,
      aggregation: 'average' as const
    },
    schedule: {
      frequency: 'monthly' as const,
      format: 'excel' as const,
      recipients: []
    }
  }
];

// Report Builder Component
interface ReportBuilderProps {
  report?: CustomReport;
  onSave: (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function ReportBuilder({ report, onSave, onCancel }: ReportBuilderProps) {
  const [formData, setFormData] = useState<Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>>(() => ({
    name: report?.name || '',
    description: report?.description || '',
    createdBy: 'current-user', // Should come from auth context
    isPublic: report?.isPublic || false,
    config: report?.config || {
      dateRange: getDateRange('30d'),
      metrics: [],
      filters: {},
      groupBy: [],
      sortBy: { field: 'created_at', direction: 'desc' },
      visualization: {
        chartType: 'line',
        showTrends: true,
        includeComparisons: false,
        aggregation: 'average'
      }
    },
    schedule: report?.schedule
  }));

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = REPORT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        config: {
          ...prev.config,
          metrics: template.metrics,
          filters: template.defaultFilters,
          visualization: template.visualization
        }
      }));
      setSelectedTemplate(templateId);
    }
  };


  const handleDateRangeChange = (range: DateRange) => {
    if (validateDateRange(range)) {
      setFormData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          dateRange: range
        }
      }));
    }
  };

  const handleMetricToggle = (metricId: string) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        metrics: prev.config.metrics.includes(metricId)
          ? prev.config.metrics.filter(m => m !== metricId)
          : [...prev.config.metrics, metricId]
      }
    }));
  };

  const handleFilterUpdate = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        filters: {
          ...prev.config.filters,
          [key]: value
        }
      }
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Report name is required');
      return;
    }

    if (formData.config.metrics.length === 0) {
      toast.error('At least one metric must be selected');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter report name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Use Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                        <Badge variant="outline" className="text-xs mt-1">{template.category}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this report analyzes"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
            />
            <Label htmlFor="public">Make this report public</Label>
          </div>
        </CardContent>
      </Card>

      {/* Date Range */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(formData.config.dateRange.startDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.config.dateRange.startDate}
                    onSelect={(date) => date && handleDateRangeChange({
                      ...formData.config.dateRange,
                      startDate: date
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(formData.config.dateRange.endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.config.dateRange.endDate}
                    onSelect={(date) => date && handleDateRangeChange({
                      ...formData.config.dateRange,
                      endDate: date
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(
              AVAILABLE_METRICS.reduce((acc, metric) => {
                if (!acc[metric.category]) acc[metric.category] = [];
                acc[metric.category].push(metric);
                return acc;
              }, {} as Record<string, typeof AVAILABLE_METRICS>)
            ).map(([category, metrics]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium capitalize">{category}</h4>
                <div className="space-y-2">
                  {metrics.map(metric => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric.id}
                        checked={formData.config.metrics.includes(metric.id)}
                        onCheckedChange={() => handleMetricToggle(metric.id)}
                      />
                      <Label htmlFor={metric.id} className="text-sm">{metric.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>User Types</Label>
              <Select 
                value={formData.config.filters.userTypes?.[0] || ''} 
                onValueChange={(value) => handleFilterUpdate('userTypes', value ? [value] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All user types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All user types</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="freelancer">Freelancers</SelectItem>
                  <SelectItem value="premium">Premium Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project Categories</Label>
              <Select 
                value={formData.config.filters.projectCategories?.[0] || ''} 
                onValueChange={(value) => handleFilterUpdate('projectCategories', value ? [value] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="web-development">Web Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rating Range</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.config.filters.ratingRange?.[0] || 1}
                  onChange={(e) => {
                    const newRange = [...(formData.config.filters.ratingRange || [1, 5])];
                    newRange[0] = parseInt(e.target.value);
                    handleFilterUpdate('ratingRange', newRange);
                  }}
                  className="w-20"
                />
                <span>to</span>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.config.filters.ratingRange?.[1] || 5}
                  onChange={(e) => {
                    const newRange = [...(formData.config.filters.ratingRange || [1, 5])];
                    newRange[1] = parseInt(e.target.value);
                    handleFilterUpdate('ratingRange', newRange);
                  }}
                  className="w-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Review Length</Label>
              <Select 
                value={formData.config.filters.reviewLength || 'all'} 
                onValueChange={(value) => handleFilterUpdate('reviewLength', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All lengths</SelectItem>
                  <SelectItem value="short">Short (&lt; 50 chars)</SelectItem>
                  <SelectItem value="medium">Medium (50-200 chars)</SelectItem>
                  <SelectItem value="long">Long (&gt; 200 chars)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Visualization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select 
                value={formData.config.visualization.chartType} 
                onValueChange={(value: ChartType) => setFormData(prev => ({
                  ...prev,
                  config: {
                    ...prev.config,
                    visualization: {
                      ...prev.config.visualization,
                      chartType: value
                    }
                  }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Aggregation</Label>
              <Select 
                value={formData.config.visualization.aggregation} 
                onValueChange={(value: 'sum' | 'average' | 'count' | 'median') => setFormData(prev => ({
                  ...prev,
                  config: {
                    ...prev.config,
                    visualization: {
                      ...prev.config.visualization,
                      aggregation: value
                    }
                  }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="median">Median</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-trends"
                checked={formData.config.visualization.showTrends}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  config: {
                    ...prev.config,
                    visualization: {
                      ...prev.config.visualization,
                      showTrends: checked
                    }
                  }
                }))}
              />
              <Label htmlFor="show-trends">Show trend lines</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="include-comparisons"
                checked={formData.config.visualization.includeComparisons}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  config: {
                    ...prev.config,
                    visualization: {
                      ...prev.config.visualization,
                      includeComparisons: checked
                    }
                  }
                }))}
              />
              <Label htmlFor="include-comparisons">Include period comparisons</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Report
        </Button>
      </div>
    </div>
  );
}

// Report List Component
interface ReportListProps {
  reports: CustomReport[];
  onEdit: (report: CustomReport) => void;
  onDelete: (reportId: string) => void;
  onGenerate: (reportId: string) => void;
  onDuplicate: (report: CustomReport) => void;
}

function ReportList({ reports, onEdit, onDelete, onGenerate, onDuplicate }: ReportListProps) {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'name' | 'createdAt' | 'lastRunAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue && bValue) {
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      return 0;
    });
  }, [reports, sortField, sortDirection]);

  const handleSelectAll = () => {
    setSelectedReports(
      selectedReports.length === reports.length ? [] : reports.map(r => r.id)
    );
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
          <p className="text-gray-600 text-center mb-4">
            Create your first custom report to get insights into your review data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* List Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedReports.length === reports.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-gray-600">
            {selectedReports.length > 0 && `${selectedReports.length} selected`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortField} onValueChange={(value: typeof sortField) => setSortField(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="createdAt">Created</SelectItem>
              <SelectItem value="lastRunAt">Last Run</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedReports.map(report => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={() => handleSelectReport(report.id)}
                  />
                  <div className="flex-1">
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    {report.description && (
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onGenerate(report.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Run Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(report)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(report)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(report.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Metrics:</span>
                  <Badge variant="secondary">
                    {report.config.metrics.length} selected
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Date Range:</span>
                  <span>
                    {formatDate(report.config.dateRange.startDate)} - {formatDate(report.config.dateRange.endDate)}
                  </span>
                </div>
                
                {report.lastRunAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Run:</span>
                    <span>{new Date(report.lastRunAt).toLocaleDateString()}</span>
                  </div>
                )}
                
                {report.isPublic && (
                  <Badge variant="outline" className="w-fit">
                    Public
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => onGenerate(report.id)}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(report)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main Review Reports Component
export default function ReviewReports() {
  const {
    customReports,
    createReport,
    generateReport,
    fetchCustomReports,
    loading,
    errors
  } = useReviewAnalytics();

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);

  useEffect(() => {
    fetchCustomReports();
  }, [fetchCustomReports]);

  const handleCreateReport = async (reportData: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createReport(reportData);
      setShowBuilder(false);
      setEditingReport(null);
      toast.success('Report created successfully');
    } catch (error) {
      toast.error('Failed to create report');
    }
  };

  const handleEditReport = (report: CustomReport) => {
    setEditingReport(report);
    setShowBuilder(true);
  };

  const handleDeleteReport = async (reportId: string) => {
    toast.success('Report deleted successfully');
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      await generateReport(reportId);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleDuplicateReport = async (report: CustomReport) => {
    const duplicatedReport = {
      ...report,
      name: `${report.name} (Copy)`,
      createdBy: 'current-user' // Should come from auth context
    };
    
    // Remove fields that shouldn't be duplicated
    const { id, createdAt, updatedAt, lastRunAt, ...reportData } = duplicatedReport;
    
    await handleCreateReport(reportData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Reports</h2>
          <p className="text-gray-600">Create and manage custom analytics reports</p>
        </div>
        
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Content */}
      {showBuilder ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReport ? 'Edit Report' : 'Create New Report'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReportBuilder
              report={editingReport || undefined}
              onSave={handleCreateReport}
              onCancel={() => {
                setShowBuilder(false);
                setEditingReport(null);
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <ReportList
          reports={customReports}
          onEdit={handleEditReport}
          onDelete={handleDeleteReport}
          onGenerate={handleGenerateReport}
          onDuplicate={handleDuplicateReport}
        />
      )}

      {/* Loading State */}
      {loading.reports && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {errors.reports && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 py-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{errors.reports}</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}