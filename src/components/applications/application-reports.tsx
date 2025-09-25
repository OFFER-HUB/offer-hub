'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button,
} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Input,
} from '@/components/ui/input';
import {
  Label,
} from '@/components/ui/label';
import {
  Textarea,
} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import {
  ApplicationReport,
  ApplicationReportMetric,
  ApplicationAnalyticsFilter,
  ExportOptions,
  ExportFormat,
  VisualizationType,
  ApplicationMetricType,
  CalculationType,
  DisplayFormat,
  AggregationType,
} from '@/types/application-analytics.types';
import { useApplicationAnalytics } from '@/hooks/use-application-analytics';
import { ApplicationAnalyticsCalculator } from '@/utils/analytics-helpers';

interface ApplicationReportsProps {
  className?: string;
}

interface ReportBuilderProps {
  onSave: (report: Omit<ApplicationReport, 'id' | 'createdAt' | 'lastGenerated'>) => void;
  onCancel: () => void;
  existingReport?: ApplicationReport;
}

interface FilterBuilderProps {
  filters: ApplicationAnalyticsFilter;
  onChange: (filters: ApplicationAnalyticsFilter) => void;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({
  onSave,
  onCancel,
  existingReport,
}) => {
  const [reportData, setReportData] = useState<Partial<ApplicationReport>>({
    name: existingReport?.name || '',
    description: existingReport?.description || '',
    filters: existingReport?.filters || {
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
    metrics: existingReport?.metrics || [],
    visualizations: existingReport?.visualizations || [],
    schedule: existingReport?.schedule,
    createdBy: 'current-user',
  });

  const handleSave = () => {
    if (reportData.name && reportData.metrics && reportData.metrics.length > 0) {
      onSave(reportData as Omit<ApplicationReport, 'id' | 'createdAt' | 'lastGenerated'>);
    }
  };

  const addMetric = () => {
    const newMetric: ApplicationReportMetric = {
      id: `metric_${Date.now()}`,
      name: 'New Metric',
      type: ApplicationMetricType.COUNT,
      calculation: CalculationType.COUNT,
      format: DisplayFormat.NUMBER,
    };

    setReportData(prev => ({
      ...prev,
      metrics: [...(prev.metrics || []), newMetric],
    }));
  };

  const updateMetric = (index: number, metric: ApplicationReportMetric) => {
    setReportData(prev => ({
      ...prev,
      metrics: prev.metrics?.map((m, i) => i === index ? metric : m) || [],
    }));
  };

  const removeMetric = (index: number) => {
    setReportData(prev => ({
      ...prev,
      metrics: prev.metrics?.filter((_, i) => i !== index) || [],
    }));
  };

  const toggleVisualization = (viz: VisualizationType) => {
    setReportData(prev => ({
      ...prev,
      visualizations: prev.visualizations?.includes(viz)
        ? prev.visualizations.filter(v => v !== viz)
        : [...(prev.visualizations || []), viz],
    }));
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='report-name'>Report Name</Label>
          <Input
            id='report-name'
            value={reportData.name || ''}
            onChange={(e) => setReportData(prev => ({ ...prev, name: e.target.value }))}
            placeholder='Enter report name'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='report-description'>Description</Label>
          <Textarea
            id='report-description'
            value={reportData.description || ''}
            onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
            placeholder='Enter report description'
            rows={3}
          />
        </div>
      </div>

      <Tabs defaultValue='metrics' className='w-full'>
        <TabsList>
          <TabsTrigger value='metrics'>Metrics</TabsTrigger>
          <TabsTrigger value='filters'>Filters</TabsTrigger>
          <TabsTrigger value='visualizations'>Visualizations</TabsTrigger>
          <TabsTrigger value='schedule'>Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value='metrics' className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-medium'>Report Metrics</h3>
            <Button onClick={addMetric} variant='outline'>
              Add Metric
            </Button>
          </div>

          {reportData.metrics?.map((metric, index) => (
            <Card key={metric.id}>
              <CardContent className='pt-4'>
                <div className='grid grid-cols-4 gap-4'>
                  <div className='space-y-2'>
                    <Label>Name</Label>
                    <Input
                      value={metric.name}
                      onChange={(e) => updateMetric(index, { ...metric, name: e.target.value })}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Type</Label>
                    <Select
                      value={metric.type}
                      onValueChange={(value) => updateMetric(index, { ...metric, type: value as ApplicationMetricType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ApplicationMetricType).map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>Calculation</Label>
                    <Select
                      value={metric.calculation}
                      onValueChange={(value) => updateMetric(index, { ...metric, calculation: value as CalculationType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CalculationType).map(calc => (
                          <SelectItem key={calc} value={calc}>{calc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>Format</Label>
                    <div className='flex space-x-2'>
                      <Select
                        value={metric.format}
                        onValueChange={(value) => updateMetric(index, { ...metric, format: value as DisplayFormat })}
                      >
                        <SelectTrigger className='flex-1'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(DisplayFormat).map(format => (
                            <SelectItem key={format} value={format}>{format}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => removeMetric(index)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value='filters' className='space-y-4'>
          <FilterBuilder
            filters={reportData.filters!}
            onChange={(filters) => setReportData(prev => ({ ...prev, filters }))}
          />
        </TabsContent>

        <TabsContent value='visualizations' className='space-y-4'>
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Select Visualizations</h3>
            <div className='grid grid-cols-3 gap-4'>
              {Object.values(VisualizationType).map(viz => (
                <div key={viz} className='flex items-center space-x-2'>
                  <Checkbox
                    id={viz}
                    checked={reportData.visualizations?.includes(viz) || false}
                    onCheckedChange={() => toggleVisualization(viz)}
                  />
                  <Label htmlFor={viz} className='text-sm'>
                    {viz.replace(/_/g, ' ').toLowerCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='schedule' className='space-y-4'>
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Report Schedule</h3>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='enable-schedule'
                checked={reportData.schedule?.enabled || false}
                onCheckedChange={(checked) => setReportData(prev => ({
                  ...prev,
                  schedule: {
                    ...prev.schedule,
                    frequency: 'weekly',
                    time: '09:00',
                    recipients: [],
                    enabled: checked as boolean,
                  },
                }))}
              />
              <Label htmlFor='enable-schedule'>Enable automatic report generation</Label>
            </div>

            {reportData.schedule?.enabled && (
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Frequency</Label>
                  <Select
                    value={reportData.schedule.frequency}
                    onValueChange={(value) => setReportData(prev => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule!,
                        frequency: value as 'daily' | 'weekly' | 'monthly' | 'quarterly',
                      },
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='daily'>Daily</SelectItem>
                      <SelectItem value='weekly'>Weekly</SelectItem>
                      <SelectItem value='monthly'>Monthly</SelectItem>
                      <SelectItem value='quarterly'>Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Time</Label>
                  <Input
                    type='time'
                    value={reportData.schedule.time}
                    onChange={(e) => setReportData(prev => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule!,
                        time: e.target.value,
                      },
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className='flex justify-end space-x-2'>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Report
        </Button>
      </div>
    </div>
  );
};

const FilterBuilder: React.FC<FilterBuilderProps> = ({ filters, onChange }) => {
  const updateDateRange = (field: 'from' | 'to', value: string) => {
    onChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: new Date(value),
      },
    });
  };

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-medium'>Report Filters</h3>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>From Date</Label>
          <Input
            type='date'
            value={filters.dateRange.from.toISOString().split('T')[0]}
            onChange={(e) => updateDateRange('from', e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label>To Date</Label>
          <Input
            type='date'
            value={filters.dateRange.to.toISOString().split('T')[0]}
            onChange={(e) => updateDateRange('to', e.target.value)}
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>Project Value Range</Label>
          <div className='flex space-x-2'>
            <Input
              type='number'
              placeholder='Min'
              value={filters.projectValueRange?.min || ''}
              onChange={(e) => onChange({
                ...filters,
                projectValueRange: {
                  min: parseInt(e.target.value) || 0,
                  max: filters.projectValueRange?.max || 100000,
                },
              })}
            />
            <Input
              type='number'
              placeholder='Max'
              value={filters.projectValueRange?.max || ''}
              onChange={(e) => onChange({
                ...filters,
                projectValueRange: {
                  min: filters.projectValueRange?.min || 0,
                  max: parseInt(e.target.value) || 100000,
                },
              })}
            />
          </div>
        </div>
        <div className='space-y-2'>
          <Label>Success Rate Threshold</Label>
          <Input
            type='number'
            min='0'
            max='100'
            placeholder='Success rate %'
            value={filters.successRate || ''}
            onChange={(e) => onChange({
              ...filters,
              successRate: parseInt(e.target.value) || undefined,
            })}
          />
        </div>
      </div>
    </div>
  );
};

export const ApplicationReports: React.FC<ApplicationReportsProps> = ({
  className = '',
}) => {
  const {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    exportData,
  } = useApplicationAnalytics();

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState<ApplicationReport | undefined>();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedReportForExport, setSelectedReportForExport] = useState<ApplicationReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleCreateReport = useCallback(async (
    reportData: Omit<ApplicationReport, 'id' | 'createdAt' | 'lastGenerated'>
  ) => {
    try {
      await createReport(reportData);
      setShowBuilder(false);
      setEditingReport(undefined);
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  }, [createReport]);

  const handleUpdateReport = useCallback(async (
    reportData: Omit<ApplicationReport, 'id' | 'createdAt' | 'lastGenerated'>
  ) => {
    if (editingReport) {
      try {
        await updateReport(editingReport.id, reportData);
        setShowBuilder(false);
        setEditingReport(undefined);
      } catch (error) {
        console.error('Failed to update report:', error);
      }
    }
  }, [updateReport, editingReport]);

  const handleDeleteReport = useCallback(async (reportId: string) => {
    try {
      await deleteReport(reportId);
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  }, [deleteReport]);

  const handleGenerateReport = useCallback(async (reportId: string) => {
    try {
      await generateReport(reportId);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  }, [generateReport]);

  const handleExportReport = useCallback(async (format: ExportFormat) => {
    if (selectedReportForExport) {
      try {
        const exportOptions: ExportOptions = {
          format,
          includeCharts: true,
          includeData: true,
          includeMetadata: true,
          filters: selectedReportForExport.filters,
        };

        await exportData(exportOptions);
        setExportDialogOpen(false);
        setSelectedReportForExport(null);
      } catch (error) {
        console.error('Failed to export report:', error);
      }
    }
  }, [selectedReportForExport, exportData]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading.isLoading && reports.length === 0) {
    return (
      <Card className={className}>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center h-32'>
            <div className='text-gray-500'>Loading reports...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold'>Application Reports</h2>
          <p className='text-gray-600'>Create and manage custom analytics reports</p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          Create New Report
        </Button>
      </div>

      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <p className='text-red-600'>Error: {error}</p>
          </CardContent>
        </Card>
      )}

      <div className='grid gap-6'>
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle>{report.name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
                <div className='flex space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    Generate
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setSelectedReportForExport(report);
                      setExportDialogOpen(true);
                    }}
                  >
                    Export
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setEditingReport(report);
                      setShowBuilder(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid grid-cols-3 gap-4 text-sm'>
                  <div>
                    <p className='font-medium text-gray-600'>Created</p>
                    <p>{formatDate(report.createdAt)}</p>
                  </div>
                  <div>
                    <p className='font-medium text-gray-600'>Last Generated</p>
                    <p>{report.lastGenerated ? formatDate(report.lastGenerated) : 'Never'}</p>
                  </div>
                  <div>
                    <p className='font-medium text-gray-600'>Schedule</p>
                    <p>{report.schedule?.enabled ? report.schedule.frequency : 'Manual'}</p>
                  </div>
                </div>

                <div>
                  <p className='font-medium text-gray-600 mb-2'>Metrics ({report.metrics.length})</p>
                  <div className='flex flex-wrap gap-2'>
                    {report.metrics.slice(0, 5).map((metric) => (
                      <Badge key={metric.id} variant='secondary'>
                        {metric.name}
                      </Badge>
                    ))}
                    {report.metrics.length > 5 && (
                      <Badge variant='outline'>+{report.metrics.length - 5} more</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <p className='font-medium text-gray-600 mb-2'>Visualizations ({report.visualizations.length})</p>
                  <div className='flex flex-wrap gap-2'>
                    {report.visualizations.slice(0, 4).map((viz) => (
                      <Badge key={viz} variant='outline'>
                        {viz.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                    ))}
                    {report.visualizations.length > 4 && (
                      <Badge variant='outline'>+{report.visualizations.length - 4} more</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && !loading.isLoading && (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='text-gray-500'>
                <p className='text-lg font-medium mb-2'>No reports found</p>
                <p>Create your first custom report to get started</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingReport ? 'Edit Report' : 'Create New Report'}
            </DialogTitle>
            <DialogDescription>
              Configure your custom analytics report with metrics, filters, and visualizations.
            </DialogDescription>
          </DialogHeader>
          <ReportBuilder
            existingReport={editingReport}
            onSave={editingReport ? handleUpdateReport : handleCreateReport}
            onCancel={() => {
              setShowBuilder(false);
              setEditingReport(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Report</DialogTitle>
            <DialogDescription>
              Choose the format to export your report data.
            </DialogDescription>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-4 py-4'>
            {Object.values(ExportFormat).map(format => (
              <Button
                key={format}
                variant='outline'
                onClick={() => handleExportReport(format)}
                className='h-16'
              >
                <div className='text-center'>
                  <div className='font-medium'>{format.toUpperCase()}</div>
                  <div className='text-xs text-gray-500'>
                    {format === ExportFormat.PDF ? 'Portable Document' :
                     format === ExportFormat.EXCEL ? 'Spreadsheet' :
                     format === ExportFormat.CSV ? 'Comma Separated' :
                     format === ExportFormat.JSON ? 'JavaScript Object' :
                     'Image Format'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationReports;