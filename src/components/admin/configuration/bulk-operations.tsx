"use client";

import React, { useState, useRef } from 'react';
import { ConfigurationService } from '../../../services/configuration.service';
import { PolicyService } from '../../../services/policy.service';
import { FeatureToggleService } from '../../../services/feature-toggle.service';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { Progress } from '../../ui/progress';
import { 
  Loader2, 
  UploadIcon, 
  DownloadIcon, 
  SettingsIcon, 
  ShieldIcon, 
  ToggleLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertTriangleIcon,
  FileTextIcon,
  DatabaseIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '../../ui/scroll-area';

interface BulkOperationResult {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ item: string; error: string }>;
  warnings: Array<{ item: string; warning: string }>;
}

interface BulkOperationsProps {
  onOperationComplete?: (result: BulkOperationResult) => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({ onOperationComplete }) => {
  const [activeTab, setActiveTab] = useState('import');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [operationResult, setOperationResult] = useState<BulkOperationResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkData, setBulkData] = useState('');
  const [operationType, setOperationType] = useState<'create' | 'update' | 'delete'>('create');
  const [entityType, setEntityType] = useState<'configuration' | 'policy' | 'feature_toggle'>('configuration');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setBulkData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkData.trim()) {
      toast.error('Please provide data to import.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setOperationResult(null);

    try {
      let parsedData: any[];
      try {
        parsedData = JSON.parse(bulkData);
        if (!Array.isArray(parsedData)) {
          throw new Error('Data must be an array of items');
        }
      } catch (error) {
        toast.error('Invalid JSON format.');
        return;
      }

      const result: BulkOperationResult = {
        success: false,
        total: parsedData.length,
        successful: 0,
        failed: 0,
        errors: [],
        warnings: [],
      };

      // Process items in batches
      const batchSize = 5;
      for (let i = 0; i < parsedData.length; i += batchSize) {
        const batch = parsedData.slice(i, i + batchSize);
        
        // Process batch
        for (const item of batch) {
          try {
            switch (entityType) {
              case 'configuration':
                await processConfigurationItem(item, operationType);
                break;
              case 'policy':
                await processPolicyItem(item, operationType);
                break;
              case 'feature_toggle':
                await processFeatureToggleItem(item, operationType);
                break;
            }
            result.successful++;
          } catch (error) {
            result.failed++;
            result.errors.push({
              item: JSON.stringify(item),
              error: (error as Error).message,
            });
          }
        }

        // Update progress
        const processed = Math.min(i + batchSize, parsedData.length);
        setProgress((processed / parsedData.length) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      result.success = result.failed === 0;
      setOperationResult(result);
      onOperationComplete?.(result);

      if (result.success) {
        toast.success(`Successfully processed ${result.successful} items.`);
      } else {
        toast.warning(`Processed ${result.successful} items successfully, ${result.failed} failed.`);
      }

    } catch (error) {
      toast.error('Bulk operation failed.');
      console.error('Bulk operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processConfigurationItem = async (item: any, operation: string) => {
    switch (operation) {
      case 'create':
        await ConfigurationService.createConfiguration(item);
        break;
      case 'update':
        if (!item.id) throw new Error('Configuration ID is required for update');
        await ConfigurationService.updateConfiguration(item.id, item);
        break;
      case 'delete':
        if (!item.id) throw new Error('Configuration ID is required for delete');
        await ConfigurationService.deleteConfiguration(item.id);
        break;
    }
  };

  const processPolicyItem = async (item: any, operation: string) => {
    switch (operation) {
      case 'create':
        await PolicyService.createPolicy(item);
        break;
      case 'update':
        if (!item.id) throw new Error('Policy ID is required for update');
        await PolicyService.updatePolicy(item.id, item);
        break;
      case 'delete':
        if (!item.id) throw new Error('Policy ID is required for delete');
        await PolicyService.deletePolicy(item.id);
        break;
    }
  };

  const processFeatureToggleItem = async (item: any, operation: string) => {
    switch (operation) {
      case 'create':
        await FeatureToggleService.createFeatureToggle(item);
        break;
      case 'update':
        if (!item.id) throw new Error('Feature toggle ID is required for update');
        await FeatureToggleService.updateFeatureToggle(item.id, item);
        break;
      case 'delete':
        if (!item.id) throw new Error('Feature toggle ID is required for delete');
        await FeatureToggleService.deleteFeatureToggle(item.id);
        break;
    }
  };

  const handleBulkExport = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      
      switch (entityType) {
        case 'configuration':
          data = await ConfigurationService.getAllConfigurations();
          break;
        case 'policy':
          const policyResult = await PolicyService.getAllPolicies(1, 1000);
          data = policyResult.policies;
          break;
        case 'feature_toggle':
          const toggleResult = await FeatureToggleService.getAllFeatureToggles(1, 1000);
          data = toggleResult.featureToggles;
          break;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk-${entityType}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.length} ${entityType} items.`);
    } catch (error) {
      toast.error('Export failed.');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSampleData = () => {
    const samples = {
      configuration: [
        {
          category: 'general',
          key: 'site_name',
          value: 'My Platform',
          description: 'The name of the platform',
          dataType: 'string',
          isEditable: true,
          isRequired: true,
          environment: 'production',
        },
        {
          category: 'security',
          key: 'max_login_attempts',
          value: 5,
          description: 'Maximum login attempts before lockout',
          dataType: 'number',
          isEditable: true,
          isRequired: true,
          environment: 'production',
        },
      ],
      policy: [
        {
          name: 'Spam Detection Policy',
          description: 'Detects and prevents spam content',
          category: 'content',
          priority: 'high',
          rules: [
            {
              name: 'Keyword Detection',
              type: 'content',
              operator: 'contains',
              value: ['spam', 'scam', 'fake'],
              field: 'content.body',
              isActive: true,
            },
          ],
          actions: [
            {
              name: 'Block Content',
              type: 'block',
              parameters: { duration: '24h' },
              isActive: true,
            },
          ],
          environment: 'production',
        },
      ],
      feature_toggle: [
        {
          key: 'new_dashboard',
          name: 'New Dashboard UI',
          description: 'Enable the new dashboard interface',
          category: 'ui',
          type: 'boolean',
          defaultValue: false,
          rolloutStrategy: 'percentage',
          rolloutPercentage: 25,
          environment: 'production',
        },
      ],
    };

    setBulkData(JSON.stringify(samples[entityType], null, 2));
  };

  const clearData = () => {
    setBulkData('');
    setSelectedFile(null);
    setOperationResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DatabaseIcon className="h-5 w-5" />
            <span>Bulk Operations</span>
          </CardTitle>
          <CardDescription>
            Import, export, and perform bulk operations on configurations, policies, and feature toggles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import & Process</TabsTrigger>
              <TabsTrigger value="export">Export & Download</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="entityType">Entity Type</Label>
                    <Select value={entityType} onValueChange={(value: any) => setEntityType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="configuration">
                          <div className="flex items-center space-x-2">
                            <SettingsIcon className="h-4 w-4" />
                            <span>Configuration</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="policy">
                          <div className="flex items-center space-x-2">
                            <ShieldIcon className="h-4 w-4" />
                            <span>Policy</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="feature_toggle">
                          <div className="flex items-center space-x-2">
                            <ToggleLeftIcon className="h-4 w-4" />
                            <span>Feature Toggle</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operationType">Operation</Label>
                    <Select value={operationType} onValueChange={(value: any) => setOperationType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="create">Create</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload File</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={() => getSampleData()}>
                        Sample
                      </Button>
                    </div>
                    {selectedFile && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FileTextIcon className="h-4 w-4" />
                        <span>{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkData">Data (JSON)</Label>
                    <Textarea
                      id="bulkData"
                      value={bulkData}
                      onChange={(e) => setBulkData(e.target.value)}
                      placeholder="Enter JSON data or upload a file..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={clearData}>
                      Clear
                    </Button>
                    <Button onClick={handleBulkImport} disabled={loading || !bulkData.trim()}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Process Data
                    </Button>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {operationResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {operationResult.success ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                      <span>Operation Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{operationResult.total}</div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{operationResult.successful}</div>
                        <div className="text-sm text-gray-600">Successful</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{operationResult.failed}</div>
                        <div className="text-sm text-gray-600">Failed</div>
                      </div>
                    </div>

                    {operationResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-600">Errors:</h4>
                        <ScrollArea className="h-32">
                          <div className="space-y-1">
                            {operationResult.errors.map((error, index) => (
                              <Alert key={index}>
                                <XCircleIcon className="h-4 w-4" />
                                <AlertDescription>
                                  <strong>Item:</strong> {error.item}<br />
                                  <strong>Error:</strong> {error.error}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {operationResult.warnings.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-yellow-600">Warnings:</h4>
                        <ScrollArea className="h-32">
                          <div className="space-y-1">
                            {operationResult.warnings.map((warning, index) => (
                              <Alert key={index}>
                                <AlertTriangleIcon className="h-4 w-4" />
                                <AlertDescription>
                                  <strong>Item:</strong> {warning.item}<br />
                                  <strong>Warning:</strong> {warning.warning}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="exportEntityType">Entity Type</Label>
                    <Select value={entityType} onValueChange={(value: any) => setEntityType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="configuration">Configuration</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="feature_toggle">Feature Toggle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert>
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertDescription>
                      Export will download all {entityType} items as a JSON file.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p><strong>Export includes:</strong></p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All {entityType} items</li>
                      <li>Complete configuration data</li>
                      <li>Metadata and relationships</li>
                      <li>Timestamp of export</li>
                    </ul>
                  </div>

                  <Button onClick={handleBulkExport} disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export {entityType.replace('_', ' ')} Data
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOperations;
