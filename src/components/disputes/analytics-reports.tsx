'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  CustomReport,
  ReportMetric,
  AnalyticsFilter,
  VisualizationType,
  MetricType,
  CalculationType,
  DisplayFormat,
  ReportSchedule,
  ExportFormat,
  ExportOptions,
  DisputeStatus,
  DisputeType,
  DisputeCategory,
  DisputePriority
} from '@/types/analytics.types';
import { useDisputeAnalytics } from '@/hooks/use-dispute-analytics';
import { AnalyticsVisualization, ChartContainer, MetricCard } from './analytics-visualization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Edit, Trash, Play, Pause, FileText, BarChart3, Settings, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface ReportFormData {
  name: string;
  description: string;
  filters: AnalyticsFilter;
  metrics: ReportMetric[];
  visualizations: VisualizationType[];
  schedule?: ReportSchedule;
}

export const ReportBuilder: React.FC<{
  onSave: (report: Omit<CustomReport, 'id' | 'createdAt' | 'lastGenerated'>) => void;
  initialData?: CustomReport;
  onCancel: () => void;
}> = ({ onSave, initialData, onCancel }) => {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReportFormData>({
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      filters: initialData.filters,
      metrics: initialData.metrics,
      visualizations: initialData.visualizations,
      schedule: initialData.schedule
    } : {
      name: '',
      description: '',
      filters: {
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date()
        }
      },
      metrics: [],
      visualizations: []
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMetrics, setSelectedMetrics] = useState<ReportMetric[]>(initialData?.metrics || []);
  const [selectedVisualizations, setSelectedVisualizations] = useState<VisualizationType[]>(initialData?.visualizations || []);

  const steps = [
    'Basic Information',
    'Filters',
    'Metrics',
    'Visualizations',
    'Schedule',
    'Preview'
  ];

  const availableMetrics: Omit<ReportMetric, 'id'>[] = [
    { name: 'Total Disputes', type: MetricType.COUNT, calculation: CalculationType.COUNT, format: DisplayFormat.NUMBER },
    { name: 'Resolution Rate', type: MetricType.PERCENTAGE, calculation: CalculationType.PERCENTAGE, format: DisplayFormat.PERCENTAGE },
    { name: 'Average Resolution Time', type: MetricType.AVERAGE, calculation: CalculationType.AVERAGE, format: DisplayFormat.DURATION },
    { name: 'User Satisfaction', type: MetricType.AVERAGE, calculation: CalculationType.AVERAGE, format: DisplayFormat.NUMBER },
    { name: 'Escalation Rate', type: MetricType.PERCENTAGE, calculation: CalculationType.PERCENTAGE, format: DisplayFormat.PERCENTAGE },
    { name: 'Monthly Growth', type: MetricType.TREND, calculation: CalculationType.GROWTH_RATE, format: DisplayFormat.PERCENTAGE }
  ];

  const availableVisualizations = [
    { type: VisualizationType.LINE_CHART, name: 'Line Chart', description: 'Show trends over time' },
    { type: VisualizationType.BAR_CHART, name: 'Bar Chart', description: 'Compare categories' },
    { type: VisualizationType.PIE_CHART, name: 'Pie Chart', description: 'Show distribution' },
    { type: VisualizationType.DONUT_CHART, name: 'Donut Chart', description: 'Show distribution with center text' },
    { type: VisualizationType.AREA_CHART, name: 'Area Chart', description: 'Show trends with filled areas' },
    { type: VisualizationType.GAUGE, name: 'Gauge', description: 'Show progress or performance' },
    { type: VisualizationType.TABLE, name: 'Table', description: 'Show detailed data' },
    { type: VisualizationType.METRIC_CARD, name: 'Metric Cards', description: 'Show key numbers' }
  ];

  const handleMetricToggle = (metric: Omit<ReportMetric, 'id'>) => {
    const existingIndex = selectedMetrics.findIndex(m => m.name === metric.name);
    if (existingIndex >= 0) {
      const newMetrics = [...selectedMetrics];
      newMetrics.splice(existingIndex, 1);
      setSelectedMetrics(newMetrics);
    } else {
      setSelectedMetrics([...selectedMetrics, { ...metric, id: Date.now().toString() }]);
    }
  };

  const handleVisualizationToggle = (viz: VisualizationType) => {
    if (selectedVisualizations.includes(viz)) {
      setSelectedVisualizations(selectedVisualizations.filter(v => v !== viz));
    } else {
      setSelectedVisualizations([...selectedVisualizations, viz]);
    }
  };

  const onSubmit = (data: ReportFormData) => {
    onSave({
      ...data,
      metrics: selectedMetrics,
      visualizations: selectedVisualizations,
      createdBy: 'current-user' // This would come from auth context
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Report Name</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Report name is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter report name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Describe what this report shows"
                    rows={3}
                  />
                )}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label>Date Range</Label>
              <div className="flex space-x-2 mt-2">
                <Controller
                  name="filters.dateRange.from"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : 'Pick start date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <Controller
                  name="filters.dateRange.to"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : 'Pick end date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Controller
                  name="filters.status"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-2 space-y-2">
                      {Object.values(DisputeStatus).map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={status}
                            checked={field.value?.includes(status) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, status]);
                              } else {
                                field.onChange(current.filter(s => s !== status));
                              }
                            }}
                          />
                          <Label htmlFor={status} className="text-sm capitalize">
                            {status.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div>
                <Label>Type</Label>
                <Controller
                  name="filters.type"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-2 space-y-2">
                      {Object.values(DisputeType).map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={field.value?.includes(type) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, type]);
                              } else {
                                field.onChange(current.filter(t => t !== type));
                              }
                            }}
                          />
                          <Label htmlFor={type} className="text-sm capitalize">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Metrics to Include</Label>
              <p className="text-sm text-gray-600 mt-1">Choose the metrics you want to include in your report</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {availableMetrics.map((metric) => (
                <div
                  key={metric.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMetrics.find(m => m.name === metric.name)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleMetricToggle(metric)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{metric.name}</h4>
                      <p className="text-sm text-gray-600">
                        Type: {metric.type} | Format: {metric.format.replace('_', ' ')}
                      </p>
                    </div>
                    <Checkbox
                      checked={selectedMetrics.find(m => m.name === metric.name) !== undefined}
                      readOnly
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Visualizations</Label>
              <p className="text-sm text-gray-600 mt-1">Choose how you want to display your data</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableVisualizations.map((viz) => (
                <div
                  key={viz.type}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedVisualizations.includes(viz.type)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleVisualizationToggle(viz.type)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{viz.name}</h4>
                      <p className="text-sm text-gray-600">{viz.description}</p>
                    </div>
                    <Checkbox
                      checked={selectedVisualizations.includes(viz.type)}
                      readOnly
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Schedule (Optional)</Label>
              <p className="text-sm text-gray-600 mt-1">Set up automatic report generation</p>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="schedule.enabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label>Enable scheduled reports</Label>
            </div>

            {watch('schedule.enabled') && (
              <div className="space-y-4 ml-6">
                <div>
                  <Label>Frequency</Label>
                  <Controller
                    name="schedule.frequency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label>Time</Label>
                  <Controller
                    name="schedule.time"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="time"
                        placeholder="09:00"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label>Recipients (Email addresses, one per line)</Label>
                  <Controller
                    name="schedule.recipients"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        value={field.value?.join('\n') || ''}
                        onChange={(e) => field.onChange(e.target.value.split('\n').filter(email => email.trim()))}
                        placeholder="user@example.com"
                        rows={3}
                      />
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label>Report Preview</Label>
              <p className="text-sm text-gray-600 mt-1">Review your report configuration</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{watch('name') || 'Untitled Report'}</CardTitle>
                <CardDescription>{watch('description') || 'No description provided'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Selected Metrics ({selectedMetrics.length})</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedMetrics.map((metric) => (
                        <Badge key={metric.id} variant="outline">{metric.name}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Selected Visualizations ({selectedVisualizations.length})</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedVisualizations.map((viz) => (
                        <Badge key={viz} variant="outline">
                          {availableVisualizations.find(v => v.type === viz)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {watch('schedule.enabled') && (
                    <div>
                      <h4 className="font-medium">Schedule</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {watch('schedule.frequency')} at {watch('schedule.time')} to {watch('schedule.recipients')?.length || 0} recipients
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {initialData ? 'Edit Report' : 'Create New Report'}
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {currentStep === steps.length - 1 && (
              <Button onClick={handleSubmit(onSubmit)}>
                {initialData ? 'Update Report' : 'Create Report'}
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-px mx-4 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export const ReportsList: React.FC<{
  reports: CustomReport[];
  onEdit: (report: CustomReport) => void;
  onDelete: (reportId: string) => void;
  onGenerate: (reportId: string) => void;
  onToggleSchedule: (reportId: string, enabled: boolean) => void;
}> = ({ reports, onEdit, onDelete, onGenerate, onToggleSchedule }) => {
  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first custom report.
            </p>
          </CardContent>
        </Card>
      ) : (
        reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGenerate(report.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(report)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(report.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created by {report.createdBy}</span>
                  <span className="text-gray-600">
                    {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <span>{report.metrics.length} metrics</span>
                  <span>{report.visualizations.length} visualizations</span>
                  {report.lastGenerated && (
                    <span className="text-gray-600">
                      Last generated: {format(new Date(report.lastGenerated), 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>

                {report.schedule && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={report.schedule.enabled ? 'default' : 'secondary'}>
                        {report.schedule.enabled ? 'Scheduled' : 'Disabled'}
                      </Badge>
                      {report.schedule.enabled && (
                        <span className="text-sm text-gray-600">
                          {report.schedule.frequency} at {report.schedule.time}
                        </span>
                      )}
                    </div>
                    <Switch
                      checked={report.schedule.enabled}
                      onCheckedChange={(enabled) => onToggleSchedule(report.id, enabled)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export const ReportViewer: React.FC<{
  report: CustomReport;
  onExport: (options: ExportOptions) => void;
}> = ({ report, onExport }) => {
  const { disputes, performanceMetrics, chartData, timeSeriesData } = useDisputeAnalytics({
    autoRefresh: false
  });

  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.PDF);

  const handleExport = () => {
    onExport({
      format: exportFormat,
      includeCharts: true,
      includeData: true,
      filters: report.filters
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{report.name}</h2>
          <p className="text-gray-600">{report.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ExportFormat.PDF}>PDF</SelectItem>
              <SelectItem value={ExportFormat.EXCEL}>Excel</SelectItem>
              <SelectItem value={ExportFormat.CSV}>CSV</SelectItem>
              <SelectItem value={ExportFormat.PNG}>PNG</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {report.metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.name}
            value={performanceMetrics ? performanceMetrics[metric.name.toLowerCase().replace(/\s+/g, '')] || 0 : 0}
            format={metric.format === DisplayFormat.PERCENTAGE ? 'percentage' :
                   metric.format === DisplayFormat.DURATION ? 'duration' :
                   metric.format === DisplayFormat.CURRENCY ? 'currency' : 'number'}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {report.visualizations.map((vizType, index) => (
          <AnalyticsVisualization
            key={`${vizType}-${index}`}
            type={vizType}
            data={vizType === VisualizationType.LINE_CHART || vizType === VisualizationType.AREA_CHART ?
                  timeSeriesData : chartData}
            title={`${vizType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}`}
          />
        ))}
      </div>
    </div>
  );
};

export const AnalyticsReports: React.FC = () => {
  const { customReports, createReport, exportData } = useDisputeAnalytics();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);

  const handleSaveReport = async (reportData: Omit<CustomReport, 'id' | 'createdAt' | 'lastGenerated'>) => {
    await createReport(reportData);
    setShowBuilder(false);
    setEditingReport(null);
  };

  const handleEditReport = (report: CustomReport) => {
    setEditingReport(report);
    setShowBuilder(true);
  };

  const handleDeleteReport = (reportId: string) => {
    // Implementation would call API to delete report
    console.log('Delete report:', reportId);
  };

  const handleGenerateReport = (reportId: string) => {
    const report = customReports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
    }
  };

  const handleToggleSchedule = (reportId: string, enabled: boolean) => {
    // Implementation would call API to update schedule
    console.log('Toggle schedule for report:', reportId, enabled);
  };

  if (selectedReport) {
    return (
      <div>
        <Button
          variant="outline"
          onClick={() => setSelectedReport(null)}
          className="mb-4"
        >
          ← Back to Reports
        </Button>
        <ReportViewer
          report={selectedReport}
          onExport={exportData}
        />
      </div>
    );
  }

  if (showBuilder) {
    return (
      <ReportBuilder
        onSave={handleSaveReport}
        initialData={editingReport || undefined}
        onCancel={() => {
          setShowBuilder(false);
          setEditingReport(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Reports</h2>
          <p className="text-gray-600">Create and manage custom analytics reports</p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      <ReportsList
        reports={customReports}
        onEdit={handleEditReport}
        onDelete={handleDeleteReport}
        onGenerate={handleGenerateReport}
        onToggleSchedule={handleToggleSchedule}
      />
    </div>
  );
};