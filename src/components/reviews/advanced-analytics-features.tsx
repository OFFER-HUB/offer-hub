// Advanced ML features - probably overkill but clients love it

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Plus,
  Save
} from 'lucide-react';

import {
  PredictiveModel,
  PredictionResult,
  TrendForecast,
  MachineLearningPipeline,
  AdvancedAnalyticsConfig,
  TimeSeriesDataPoint,
  ChartAnnotation,
  ChartThreshold
} from '@/types/review-analytics.types';

// ML dashboard - most of this is just for show
interface PredictiveAnalyticsDashboardProps {
  models: PredictiveModel[];
  onTrainModel: (modelId: string) => void;
  onCreateModel: (model: any) => void;
}

export function PredictiveAnalyticsDashboard({
  models,
  onTrainModel,
  onCreateModel
}: PredictiveAnalyticsDashboardProps) {
  const [selectedModel, setSelectedModel] = useState<PredictiveModel | null>(null);
  const [isTraining, setIsTraining] = useState<Set<string>>(new Set()); // TODO: track training status properly

  const handleTrainModel = async (modelId: string) => {
    setIsTraining(prev => new Set(prev).add(modelId));
    try {
      onTrainModel(modelId); // FIXME: should be async
      toast.success('Model training started');
    } catch (error) {
      toast.error('Failed to start model training');
    } finally {
      setIsTraining(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="h-6 w-6" />
            <span>Predictive Analytics</span>
          </h2>
          <p className="text-gray-600">Machine learning predictions</p>
        </div>
        <Button onClick={() => onCreateModel({})}>
          <Plus className="h-4 w-4 mr-2" />
          Create Model
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Basic model cards */}
        {models.map(model => (
          <Card key={model.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedModel(model)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{model.name}</CardTitle>
                <Badge variant={
                  model.status === 'active' ? 'default' : 
                  model.status === 'training' ? 'secondary' : 'outline'
                }>
                  {model.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{model.type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Trained:</span>
                  <span>{new Date(model.lastTrained).toLocaleDateString()}</span>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrainModel(model.id);
                    }}
                    disabled={isTraining.has(model.id)}
                    className="flex-1"
                  >
                    {isTraining.has(model.id) ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Training...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Train
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Model info */}
      {selectedModel && (
        <Card>
          <CardHeader>
            <CardTitle>Model: {selectedModel.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="predictions">Predictions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Model Type</Label>
                    <p className="capitalize">{selectedModel.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label>Accuracy</Label>
                    <div className="flex items-center space-x-2">
                      <Progress value={selectedModel.accuracy * 100} className="flex-1" />
                      <span>{(selectedModel.accuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedModel.features.map((feature, index) => (
                    <Badge key={index} variant="outline">{feature}</Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Training Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span>{(selectedModel.accuracy * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Trained:</span>
                        <span>{new Date(selectedModel.lastTrained).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="predictions" className="space-y-4">
                <p className="text-gray-600">Recent predictions and insights will be displayed here.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Advanced Trend Forecasting
interface TrendForecastVisualizationProps {
  forecast: TrendForecast;
  title: string;
  height?: number;
}

export function TrendForecastVisualization({
  forecast,
  title,
  height = 400
}: TrendForecastVisualizationProps) {
  const chartData = useMemo(() => {
    return forecast.predictions.map((point, index) => ({
      date: point.date,
      actual: point.value,
      predicted: point.value,
      upperBound: forecast.confidenceInterval.upper[index]?.value || point.value,
      lowerBound: forecast.confidenceInterval.lower[index]?.value || point.value
    }));
  }, [forecast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              
              {/* Confidence Interval Area */}
              <Area
                type="monotone"
                dataKey="upperBound"
                fill="#3b82f6"
                fillOpacity={0.1}
                stroke="none"
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                fill="#ffffff"
                fillOpacity={1}
                stroke="none"
              />
              
              {/* Prediction Line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={false}
                name="Forecast"
              />
              
              {/* Anomalies */}
              {forecast.anomalies.map((anomaly, index) => (
                <ReferenceLine
                  key={index}
                  x={anomaly.timestamp.toISOString().split('T')[0]}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: "Anomaly", position: "top" }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Seasonal Patterns */}
        <div className="mt-4 space-y-2">
          <h4 className="font-medium">Detected Patterns</h4>
          <div className="flex flex-wrap gap-2">
            {forecast.seasonality.map((pattern, index) => (
              <Badge key={index} variant="outline">
                {pattern.type} (strength: {(pattern.strength * 100).toFixed(0)}%)
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ML Pipeline Management
interface MLPipelineManagerProps {
  pipelines: MachineLearningPipeline[];
  onRunPipeline: (pipelineId: string) => void;
}

export function MLPipelineManager({
  pipelines,
  onRunPipeline
}: MLPipelineManagerProps) {
  const [runningPipelines, setRunningPipelines] = useState<Set<string>>(new Set());

  const handleRunPipeline = async (pipelineId: string) => {
    setRunningPipelines(prev => new Set(prev).add(pipelineId));
    try {
      await onRunPipeline(pipelineId);
      toast.success('Pipeline started successfully');
    } catch (error) {
      toast.error('Failed to start pipeline');
    } finally {
      setRunningPipelines(prev => {
        const newSet = new Set(prev);
        newSet.delete(pipelineId);
        return newSet;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>ML Pipeline Manager</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pipelines.map(pipeline => (
            <div key={pipeline.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">{pipeline.name}</h4>
                  <p className="text-sm text-gray-600">
                    Last run: {new Date(pipeline.lastRun).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    pipeline.status === 'completed' ? 'default' :
                    pipeline.status === 'running' ? 'secondary' :
                    pipeline.status === 'failed' ? 'destructive' : 'outline'
                  }>
                    {pipeline.status}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleRunPipeline(pipeline.id)}
                    disabled={runningPipelines.has(pipeline.id) || pipeline.status === 'running'}
                  >
                    {runningPipelines.has(pipeline.id) ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Pipeline Stages */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Stages:</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {pipeline.stages.map(stage => (
                    <div key={stage.id} className="flex items-center space-x-1">
                      {stage.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500" />}
                      {stage.status === 'running' && <Activity className="h-3 w-3 text-blue-500 animate-spin" />}
                      {stage.status === 'failed' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                      {stage.status === 'pending' && <Clock className="h-3 w-3 text-gray-400" />}
                      <span className="text-xs">{stage.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline Metrics */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="ml-1 font-medium">{(pipeline.metrics.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Precision:</span>
                  <span className="ml-1 font-medium">{(pipeline.metrics.precision * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Recall:</span>
                  <span className="ml-1 font-medium">{(pipeline.metrics.recall * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">F1 Score:</span>
                  <span className="ml-1 font-medium">{(pipeline.metrics.f1Score * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Advanced Configuration Panel
interface AdvancedConfigurationProps {
  config: AdvancedAnalyticsConfig;
  onUpdateConfig: (config: AdvancedAnalyticsConfig) => void;
}

export function AdvancedConfiguration({
  config,
  onUpdateConfig
}: AdvancedConfigurationProps) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    onUpdateConfig(localConfig);
    toast.success('Configuration updated');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Analytics Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Feature Toggles</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="predictive-models">Predictive Models</Label>
              <Switch
                id="predictive-models"
                checked={localConfig.enablePredictiveModels}
                onCheckedChange={(checked) => 
                  setLocalConfig(prev => ({ ...prev, enablePredictiveModels: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="anomaly-detection">Anomaly Detection</Label>
              <Switch
                id="anomaly-detection"
                checked={localConfig.enableAnomalyDetection}
                onCheckedChange={(checked) => 
                  setLocalConfig(prev => ({ ...prev, enableAnomalyDetection: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sentiment-analysis">Sentiment Analysis</Label>
              <Switch
                id="sentiment-analysis"
                checked={localConfig.enableSentimentAnalysis}
                onCheckedChange={(checked) => 
                  setLocalConfig(prev => ({ ...prev, enableSentimentAnalysis: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="trend-forecasting">Trend Forecasting</Label>
              <Switch
                id="trend-forecasting"
                checked={localConfig.enableTrendForecasting}
                onCheckedChange={(checked) => 
                  setLocalConfig(prev => ({ ...prev, enableTrendForecasting: checked }))
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Performance Settings</h4>
            
            <div>
              <Label>Model Refresh Interval (hours)</Label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={localConfig.modelRefreshInterval}
                onChange={(e) => 
                  setLocalConfig(prev => ({ ...prev, modelRefreshInterval: parseInt(e.target.value) }))
                }
              />
            </div>

            <div>
              <Label>Prediction Horizon (days)</Label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={localConfig.predictionHorizon}
                onChange={(e) => 
                  setLocalConfig(prev => ({ ...prev, predictionHorizon: parseInt(e.target.value) }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}