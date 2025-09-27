"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  History, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RotateCcw,
  Eye,
  Trash2,
  Download,
  Filter,
  Search,
  User,
  Calendar,
  ArrowLeft,
  ArrowRight,
  GitCommit,
  GitBranch,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { configurationService } from '@/services/configuration.service';
import { 
  ConfigurationChange,
  ConfigurationHistory,
  ChangeType,
  ChangeStatus,
  ChangeImpact,
  SystemConfiguration
} from '@/types/configuration.types';
import { toast } from 'sonner';

interface ConfigurationHistoryProps {
  className?: string;
  configurationId?: string;
}

const CHANGE_TYPES: ChangeType[] = ['create', 'update', 'delete', 'rollback'];
const CHANGE_STATUSES: ChangeStatus[] = ['pending', 'approved', 'applied', 'failed', 'rolled_back'];
const CHANGE_IMPACTS: ChangeImpact[] = ['low', 'medium', 'high', 'critical'];

export default function ConfigurationHistoryComponent({ className, configurationId }: ConfigurationHistoryProps) {
  const [changes, setChanges] = useState<ConfigurationChange[]>([]);
  const [history, setHistory] = useState<ConfigurationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChangeType, setSelectedChangeType] = useState<ChangeType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ChangeStatus | 'all'>('all');
  const [selectedImpact, setSelectedImpact] = useState<ChangeImpact | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false);
  const [selectedChange, setSelectedChange] = useState<ConfigurationChange | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadChanges();
    if (configurationId) {
      loadHistory();
    }
  }, [configurationId, page, selectedChangeType, selectedStatus, selectedImpact]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadChanges, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configurationService.getConfigurationChanges(
        page,
        20,
        {
          configurationId,
          changeType: selectedChangeType !== 'all' ? selectedChangeType : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }
      );
      setChanges(response.changes);
      setTotalPages(Math.ceil(response.total / 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration changes');
      toast.error('Failed to load configuration changes');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!configurationId) return;
    
    try {
      const response = await configurationService.getConfigurationHistory(configurationId, page, 20);
      setHistory(response);
    } catch (err) {
      toast.error('Failed to load configuration history');
    }
  };

  const handleRollback = async () => {
    if (!selectedChange) return;

    try {
      setLoading(true);
      await configurationService.rollbackConfiguration(
        selectedChange.configurationId,
        selectedChange.version || 1
      );
      
      setIsRollbackDialogOpen(false);
      setSelectedChange(null);
      setRollbackReason('');
      await loadChanges();
      toast.success('Configuration rolled back successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rollback configuration');
      toast.error('Failed to rollback configuration');
    } finally {
      setLoading(false);
    }
  };

  const openRollbackDialog = (change: ConfigurationChange) => {
    setSelectedChange(change);
    setIsRollbackDialogOpen(true);
  };

  const getChangeTypeColor = (type: ChangeType): string => {
    const colors = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      rollback: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: ChangeStatus): string => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      applied: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      rolled_back: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getImpactColor = (impact: ChangeImpact): string => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[impact] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: ChangeStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'applied':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'rolled_back':
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatValue = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return JSON.stringify(value);
  };

  if (loading && changes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading configuration history...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration History</h1>
          <p className="text-muted-foreground">
            Track and manage configuration changes with rollback capabilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button onClick={loadChanges} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Change Type</label>
              <Select value={selectedChangeType} onValueChange={(value) => setSelectedChangeType(value as ChangeType | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {CHANGE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ChangeStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {CHANGE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Impact</label>
              <Select value={selectedImpact} onValueChange={(value) => setSelectedImpact(value as ChangeImpact | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impacts</SelectItem>
                  {CHANGE_IMPACTS.map((impact) => (
                    <SelectItem key={impact} value={impact}>
                      {impact.charAt(0).toUpperCase() + impact.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Tabs */}
      <Tabs defaultValue="changes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="changes">Recent Changes</TabsTrigger>
          {configurationId && (
            <TabsTrigger value="history">Configuration History</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="changes" className="space-y-4">
          {/* Changes List */}
          <div className="grid gap-4">
            {changes.map((change) => (
              <Card key={change.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getChangeTypeColor(change.changeType)}>
                          {change.changeType}
                        </Badge>
                        <Badge className={getStatusColor(change.status)}>
                          {getStatusIcon(change.status)}
                          <span className="ml-1">{change.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge className={getImpactColor(change.impact)}>
                          {change.impact}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>Changed by {change.createdBy}</span>
                          <Clock className="h-3 w-3" />
                          <span>{new Date(change.createdAt).toLocaleString()}</span>
                        </div>
                        {change.reason && (
                          <p className="text-sm text-muted-foreground">
                            Reason: {change.reason}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Previous Value:</h4>
                          <code className="bg-muted px-2 py-1 rounded text-sm block">
                            {change.previousValue ? formatValue(change.previousValue) : 'N/A'}
                          </code>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">New Value:</h4>
                          <code className="bg-muted px-2 py-1 rounded text-sm block">
                            {formatValue(change.newValue)}
                          </code>
                        </div>
                      </div>
                      {change.appliedAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Applied at {new Date(change.appliedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {change.rolledBackAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <RotateCcw className="h-3 w-3" />
                          <span>Rolled back at {new Date(change.rolledBackAt).toLocaleString()}</span>
                          {change.rollbackReason && (
                            <span> - {change.rollbackReason}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRollbackDialog(change)}
                        disabled={change.status === 'rolled_back' || change.changeType === 'create'}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        {configurationId && (
          <TabsContent value="history" className="space-y-4">
            {/* Configuration History */}
            <div className="grid gap-4">
              {history.map((historyItem) => (
                <Card key={historyItem.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <GitCommit className="h-4 w-4" />
                          <Badge variant="outline">v{historyItem.version}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(historyItem.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>By {historyItem.createdBy}</span>
                        </div>
                        <div className="mt-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {formatValue(historyItem.value)}
                          </code>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Handle rollback to specific version
                          setSelectedChange({
                            id: '',
                            configurationId: configurationId,
                            previousValue: null,
                            newValue: historyItem.value,
                            changeType: 'rollback',
                            status: 'pending',
                            impact: 'medium',
                            createdBy: 'current-user@example.com',
                            createdAt: new Date(),
                            version: historyItem.version,
                          });
                          setIsRollbackDialogOpen(true);
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Rollback Dialog */}
      <Dialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rollback Configuration</DialogTitle>
            <DialogDescription>
              Are you sure you want to rollback this configuration change? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedChange && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Change Details:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {selectedChange.changeType}
                  </div>
                  <div>
                    <span className="font-medium">Impact:</span> {selectedChange.impact}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(selectedChange.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Created by:</span> {selectedChange.createdBy}
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Rollback Reason</label>
              <textarea
                className="w-full mt-1 p-2 border rounded-md"
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                placeholder="Explain why you're rolling back this change..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRollbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRollback} 
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <RotateCcw className="h-4 w-4" />
              {loading ? 'Rolling back...' : 'Rollback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Change Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{changes.length}</div>
              <div className="text-sm text-muted-foreground">Total Changes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {changes.filter(c => c.status === 'applied').length}
              </div>
              <div className="text-sm text-muted-foreground">Applied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {changes.filter(c => c.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {changes.filter(c => c.status === 'rolled_back').length}
              </div>
              <div className="text-sm text-muted-foreground">Rolled Back</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
