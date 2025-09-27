"use client";

import React, { useState, useEffect } from 'react';
import { ConfigurationService } from '../../../services/configuration.service';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Loader2, RotateCcwIcon, AlertTriangleIcon, HistoryIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ConfigurationHistoryEntry {
  id: string;
  version: number;
  value: unknown;
  changedBy: string;
  changedAt: Date;
  changeType: string;
}

interface RollbackDialogProps {
  configurationId: string;
  configurationName?: string;
  currentVersion: number;
  onRollbackComplete?: () => void;
  children?: React.ReactNode;
}

const RollbackDialog: React.FC<RollbackDialogProps> = ({
  configurationId,
  configurationName,
  currentVersion,
  onRollbackComplete,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ConfigurationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, configurationId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { history: fetchedHistory } = await ConfigurationService.getConfigurationHistory(configurationId);
      setHistory(fetchedHistory);
    } catch (error) {
      toast.error('Failed to load configuration history.');
      console.error('Error fetching configuration history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!selectedVersion) return;

    setRollingBack(true);
    try {
      await ConfigurationService.rollbackConfiguration(configurationId, selectedVersion);
      toast.success(`Configuration rolled back to version ${selectedVersion} successfully.`);
      setOpen(false);
      onRollbackComplete?.();
    } catch (error) {
      toast.error('Failed to rollback configuration.');
      console.error('Error rolling back configuration:', error);
    } finally {
      setRollingBack(false);
    }
  };

  const getVersionInfo = (version: number) => {
    const entry = history.find(h => h.version === version);
    return entry ? {
      changedBy: entry.changedBy,
      changedAt: entry.changedAt,
      changeType: entry.changeType,
    } : null;
  };

  const formatValue = (value: unknown) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <RotateCcwIcon className="h-4 w-4 mr-2" />
            Rollback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RotateCcwIcon className="h-5 w-5" />
            <span>Rollback Configuration</span>
          </DialogTitle>
          <DialogDescription>
            Rollback {configurationName || `configuration ${configurationId}`} to a previous version.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Version to Rollback To</CardTitle>
              <CardDescription>
                Choose a previous version to restore. Current version is {currentVersion}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="version-select">Target Version</Label>
                <Select value={selectedVersion?.toString() || ''} onValueChange={(value) => setSelectedVersion(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a version to rollback to" />
                  </SelectTrigger>
                  <SelectContent>
                    {history
                      .filter(entry => entry.version < currentVersion)
                      .sort((a, b) => b.version - a.version)
                      .map((entry) => {
                        const versionInfo = getVersionInfo(entry.version);
                        return (
                          <SelectItem key={entry.version} value={entry.version.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">Version {entry.version}</span>
                              {versionInfo && (
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <span>{versionInfo.changeType}</span>
                                  <span>•</span>
                                  <span>{new Date(versionInfo.changedAt).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>

              {selectedVersion && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangleIcon className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-orange-900">Rollback Preview</h4>
                        <div className="text-sm text-orange-800 space-y-1">
                          <p><strong>Target Version:</strong> {selectedVersion}</p>
                          {(() => {
                            const versionInfo = getVersionInfo(selectedVersion);
                            return versionInfo ? (
                              <>
                                <p><strong>Changed By:</strong> {versionInfo.changedBy}</p>
                                <p><strong>Changed At:</strong> {new Date(versionInfo.changedAt).toLocaleString()}</p>
                                <p><strong>Change Type:</strong> {versionInfo.changeType}</p>
                              </>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <HistoryIcon className="h-5 w-5" />
                <span>Version History</span>
              </CardTitle>
              <CardDescription>
                Recent changes to this configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No history found for this configuration.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {history
                    .sort((a, b) => b.version - a.version)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-lg border ${
                          entry.version === currentVersion
                            ? 'bg-blue-50 border-blue-200'
                            : selectedVersion === entry.version
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={entry.version === currentVersion ? 'default' : 'outline'}>
                              v{entry.version}
                            </Badge>
                            {entry.version === currentVersion && (
                              <Badge variant="secondary">Current</Badge>
                            )}
                            {selectedVersion === entry.version && (
                              <Badge variant="destructive">Selected</Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.changedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <strong>Changed by:</strong> {entry.changedBy}
                          </p>
                          <p className="text-sm">
                            <strong>Change type:</strong> {entry.changeType}
                          </p>
                          <div className="text-sm">
                            <strong>Value:</strong>
                            <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                              {formatValue(entry.value)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={rollingBack}>
              Cancel
            </Button>
            <Button
              onClick={handleRollback}
              disabled={!selectedVersion || rollingBack || selectedVersion >= currentVersion}
              variant="destructive"
            >
              {rollingBack && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <RotateCcwIcon className="mr-2 h-4 w-4" />
              Rollback to Version {selectedVersion}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RollbackDialog;
