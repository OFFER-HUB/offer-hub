// Chart components for analytics dashboard

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterPlot,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

import {
  ChartData,
  TimeSeriesDataPoint,
  RatingDistribution,
  MetricCard,
  ChartType,
  WidgetConfig,
  ChartAnnotation,
  ChartThreshold,
  ChartZoomConfig,
  ChartBrushConfig,
  ChartInteractionConfig
} from '@/types/review-analytics.types';
import { generateColorPalette } from '@/utils/analytics-helpers';

// Metric cards - could use some refactoring
interface MetricCardProps {
  metric: MetricCard;
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export function EnhancedMetricCard({ 
  metric, 
  size = 'md', 
  showTrend = true, 
  interactive = false,
  onClick 
}: MetricCardProps) {
  const { title, value, change, changeType, trend, format } = metric;

  // TODO: Support more formats
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'duration':
        return `${val}h`; // probably should be minutes for response time
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!change) return <Minus className="h-4 w-4 text-gray-400" />;
    
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <Card 
      className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">{formatValue(value)}</span>
            {change && (
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-500' : 
                  changeType === 'decrease' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {showTrend && trend && trend.length > 0 && (
          <div className="w-20 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={changeType === 'increase' ? '#10b981' : changeType === 'decrease' ? '#ef4444' : '#6b7280'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}

// Time series charts - way too many props
interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  title: string;
  height?: number;
  showBrush?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  enableZoom?: boolean;
  enableDataLabels?: boolean;
  comparisonData?: TimeSeriesDataPoint[];
  annotations?: ChartAnnotation[];
  thresholds?: ChartThreshold[];
  customTooltip?: (active: boolean, payload: any[], label: string) => React.ReactNode;
  color?: string;
  type?: 'line' | 'area' | 'bar';
  yAxisLabel?: string;
  xAxisLabel?: string;
  onDataPointClick?: (data: TimeSeriesDataPoint) => void;
}

export function TimeSeriesChart({
  data,
  title,
  height = 400,
  showBrush = false,
  showGrid = true,
  showTooltip = true, // always true anyway
  showLegend = false,
  enableZoom = false, // TODO: implement zoom
  enableDataLabels = false,
  comparisonData, // unused for now
  annotations = [],
  thresholds = [],
  customTooltip,
  color = '#3b82f6',
  type = 'line',
  yAxisLabel,
  xAxisLabel,
  onDataPointClick
}: TimeSeriesChartProps) {
  // const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  // const [selectedDataPoints, setSelectedDataPoints] = useState<number[]>([]);
  // const [crosshairData, setCrosshairData] = useState<any>(null); // not implemented yet

  const chartData = useMemo(() => {
    // Simple date formatting
    return data.map(point => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }, [data]);

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="date" />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fill={color} 
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="date" />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="value" fill={color} />
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="date" />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
            />
            {showBrush && <Brush />}
          </LineChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Rating Distribution Chart
interface RatingDistributionChartProps {
  distribution: RatingDistribution;
  title?: string;
  showPercentages?: boolean;
  interactive?: boolean;
  height?: number;
  onSegmentClick?: (rating: number, count: number) => void;
}

export function RatingDistributionChart({
  distribution,
  title = "Rating Distribution",
  showPercentages = true,
  interactive = true,
  height = 300,
  onSegmentClick
}: RatingDistributionChartProps) {
  const data = useMemo(() => {
    const values = [
      { name: '1 Star', value: distribution.oneStar, rating: 1 },
      { name: '2 Stars', value: distribution.twoStar, rating: 2 },
      { name: '3 Stars', value: distribution.threeStar, rating: 3 },
      { name: '4 Stars', value: distribution.fourStar, rating: 4 },
      { name: '5 Stars', value: distribution.fiveStar, rating: 5 }
    ];
    
    const total = values.reduce((sum, item) => sum + item.value, 0);
    
    return values.map(item => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    }));
  }, [distribution]);

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']; // quick hardcoded colors

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">Count: {data.value}</p>
          {showPercentages && (
            <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onClick={interactive ? (data) => onSegmentClick?.(data.rating, data.value) : undefined}
                cursor={interactive ? 'pointer' : 'default'}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Basic heatmap - performance issues with large datasets
interface HeatmapProps {
  data: Array<{ x: string; y: string; value: number }>;
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
}

export function Heatmap({
  data,
  title,
  xAxisLabel,
  height = 400
}: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<any>(null);

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));

  const getIntensity = (value: number) => {
    if (maxValue === minValue) return 0.5;
    return (value - minValue) / (maxValue - minValue);
  };

  const getCellColor = (value: number) => {
    const intensity = getIntensity(value);
    // TODO: Make colors configurable
    return `rgba(220, 38, 38, ${intensity * 0.8 + 0.2})`;
  };

  const uniqueXValues = [...new Set(data.map(d => d.x))];
  const uniqueYValues = [...new Set(data.map(d => d.y))];

  // Simple grid calculation
  const cellWidth = 100 / uniqueXValues.length;
  const cellHeight = 100 / uniqueYValues.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {data.map((cell, index) => {
              const xIndex = uniqueXValues.indexOf(cell.x);
              const yIndex = uniqueYValues.indexOf(cell.y);
              
              return (
                <rect
                  key={index}
                  x={xIndex * cellWidth}
                  y={yIndex * cellHeight}
                  width={cellWidth}
                  height={cellHeight}
                  fill={getCellColor(cell.value)}
                  stroke="white"
                  strokeWidth="0.5"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              );
            })}
          </svg>
          
          {hoveredCell && (
            <div className="absolute top-2 left-2 bg-white p-2 border rounded shadow">
              <p className="text-sm font-semibold">
                {hoveredCell.x} × {hoveredCell.y}
              </p>
              <p className="text-sm">Value: {hoveredCell.value}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <span>{xAxisLabel}</span>
          <div className="flex items-center space-x-2">
            <span>Low</span>
            <div className="w-20 h-4 bg-gradient-to-r from-red-100 to-red-600 rounded"></div>
            <span>High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Multi-Chart Comparison Component
interface MultiChartComparisonProps {
  datasets: Array<{
    name: string;
    data: TimeSeriesDataPoint[];
    color: string;
  }>;
  title: string;
  height?: number;
  chartType?: 'line' | 'area' | 'bar';
}

export function MultiChartComparison({
  datasets,
  title,
  height = 400,
  chartType = 'line'
}: MultiChartComparisonProps) {
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>(
    datasets.map(d => d.name)
  );

  const combinedData = useMemo(() => {
    if (datasets.length === 0) return [];
    
    const allDates = [...new Set(datasets.flatMap(d => d.data.map(p => p.date)))].sort();
    
    return allDates.map(date => {
      const point: any = { date: new Date(date).toLocaleDateString() };
      
      datasets.forEach(dataset => {
        const dataPoint = dataset.data.find(p => p.date === date);
        point[dataset.name] = dataPoint?.value || 0;
      });
      
      return point;
    });
  }, [datasets]);

  const toggleDataset = (name: string) => {
    setSelectedDatasets(prev => 
      prev.includes(name) 
        ? prev.filter(d => d !== name)
        : [...prev, name]
    );
  };

  const renderChart = () => {
    const commonProps = {
      data: combinedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {datasets.map(dataset => 
              selectedDatasets.includes(dataset.name) && (
                <Area
                  key={dataset.name}
                  type="monotone"
                  dataKey={dataset.name}
                  stackId="1"
                  stroke={dataset.color}
                  fill={dataset.color}
                  fillOpacity={0.6}
                />
              )
            )}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {datasets.map(dataset => 
              selectedDatasets.includes(dataset.name) && (
                <Bar
                  key={dataset.name}
                  dataKey={dataset.name}
                  fill={dataset.color}
                />
              )
            )}
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {datasets.map(dataset => 
              selectedDatasets.includes(dataset.name) && (
                <Line
                  key={dataset.name}
                  type="monotone"
                  dataKey={dataset.name}
                  stroke={dataset.color}
                  strokeWidth={2}
                />
              )
            )}
          </LineChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <div className="flex flex-wrap gap-2">
          {datasets.map(dataset => (
            <Badge
              key={dataset.name}
              variant={selectedDatasets.includes(dataset.name) ? "default" : "outline"}
              className="cursor-pointer"
              style={{
                backgroundColor: selectedDatasets.includes(dataset.name) ? dataset.color : 'transparent',
                borderColor: dataset.color,
                color: selectedDatasets.includes(dataset.name) ? 'white' : dataset.color
              }}
              onClick={() => toggleDataset(dataset.name)}
            >
              {dataset.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Progress Ring Component
interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  showValue?: boolean;
}

export function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  label,
  showValue = true
}: ProgressRingProps) {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / max) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{percentage.toFixed(1)}%</span>
          </div>
        )}
      </div>
      {label && (
        <p className="text-sm font-medium text-center text-gray-600">{label}</p>
      )}
    </div>
  );
}

