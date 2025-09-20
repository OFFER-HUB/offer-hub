'use client';

import React, { useMemo } from 'react';
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  ChartData,
  TimeSeriesData,
  TrendData,
  VisualizationType,
  PerformanceMetrics,
  DisputePattern,
  SegmentData
} from '@/types/analytics.types';
import { AnalyticsCalculator } from '@/utils/analytics-helpers';

interface BaseVisualizationProps {
  data: any[];
  height?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  colorScheme?: string[];
  animation?: boolean;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  icon?: React.ReactNode;
  className?: string;
}

interface ChartContainerProps extends BaseVisualizationProps {
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
  children: React.ReactNode;
}

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  loading = false,
  error,
  children,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>}
        <div className="text-red-600 text-center py-8">
          <p>Error loading chart: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  format = 'number',
  icon,
  className = ''
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'percentage':
        return AnalyticsCalculator.formatPercentage(val);
      case 'currency':
        return `$${AnalyticsCalculator.formatNumber(val)}`;
      case 'duration':
        return AnalyticsCalculator.formatDuration(val);
      default:
        return AnalyticsCalculator.formatNumber(val);
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;

    if (changeType === 'increase') {
      return <span className="text-green-600">↗</span>;
    } else if (changeType === 'decrease') {
      return <span className="text-red-600">↘</span>;
    }
    return <span className="text-gray-500">→</span>;
  };

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatValue(value)}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1">{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-gray-400 ml-4">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export const LineChartVisualization: React.FC<BaseVisualizationProps & {
  xKey: string;
  yKey: string;
  strokeColor?: string;
}> = ({
  data,
  height = 300,
  showTooltip = true,
  showLegend = false,
  xKey,
  yKey,
  strokeColor = '#3B82F6',
  animation = true,
  className = ''
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={xKey}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
          />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ fill: strokeColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={animation ? 1000 : 0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AreaChartVisualization: React.FC<BaseVisualizationProps & {
  xKey: string;
  yKey: string;
  fillColor?: string;
}> = ({
  data,
  height = 300,
  showTooltip = true,
  showLegend = false,
  xKey,
  yKey,
  fillColor = '#3B82F6',
  animation = true,
  className = ''
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={xKey}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
          />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={fillColor}
            fill={`${fillColor}30`}
            strokeWidth={2}
            animationDuration={animation ? 1000 : 0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BarChartVisualization: React.FC<BaseVisualizationProps & {
  xKey: string;
  yKey: string;
  fillColor?: string;
  orientation?: 'horizontal' | 'vertical';
}> = ({
  data,
  height = 300,
  showTooltip = true,
  showLegend = false,
  xKey,
  yKey,
  fillColor = '#3B82F6',
  orientation = 'vertical',
  animation = true,
  className = ''
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type={orientation === 'horizontal' ? 'number' : 'category'}
            dataKey={orientation === 'horizontal' ? undefined : xKey}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis
            type={orientation === 'horizontal' ? 'category' : 'number'}
            dataKey={orientation === 'horizontal' ? xKey : undefined}
            stroke="#6b7280"
            fontSize={12}
          />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Bar
            dataKey={yKey}
            fill={fillColor}
            radius={[2, 2, 0, 0]}
            animationDuration={animation ? 1000 : 0}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PieChartVisualization: React.FC<BaseVisualizationProps & {
  nameKey: string;
  valueKey: string;
  innerRadius?: number;
  outerRadius?: number;
}> = ({
  data,
  height = 300,
  showTooltip = true,
  showLegend = true,
  colorScheme = defaultColors,
  nameKey,
  valueKey,
  innerRadius = 0,
  outerRadius = 80,
  animation = true,
  className = ''
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey={valueKey}
            nameKey={nameKey}
            animationDuration={animation ? 1000 : 0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colorScheme[index % colorScheme.length]}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DonutChartVisualization: React.FC<BaseVisualizationProps & {
  nameKey: string;
  valueKey: string;
  centerText?: string;
  centerValue?: string;
}> = ({
  data,
  height = 300,
  showTooltip = true,
  showLegend = true,
  colorScheme = defaultColors,
  nameKey,
  valueKey,
  centerText,
  centerValue,
  animation = true,
  className = ''
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey={valueKey}
            nameKey={nameKey}
            animationDuration={animation ? 1000 : 0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colorScheme[index % colorScheme.length]}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          {centerText && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-medium fill-gray-600"
            >
              <tspan x="50%" dy="-0.5em">{centerText}</tspan>
              {centerValue && (
                <tspan x="50%" dy="1.2em" className="text-lg font-bold fill-gray-900">
                  {centerValue}
                </tspan>
              )}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GaugeVisualization: React.FC<{
  value: number;
  max: number;
  title: string;
  color?: string;
  height?: number;
  className?: string;
}> = ({
  value,
  max,
  title,
  color = '#3B82F6',
  height = 200,
  className = ''
}) => {
  const data = [
    { name: 'value', value, fill: color },
    { name: 'remaining', value: max - value, fill: '#f3f4f6' }
  ];

  const percentage = (value / max) * 100;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <p className="text-2xl font-bold text-gray-900">{percentage.toFixed(1)}%</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

export const TrendIndicator: React.FC<{
  value: number;
  change: number;
  label: string;
  format?: 'number' | 'percentage' | 'duration';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  value,
  change,
  label,
  format = 'number',
  size = 'md',
  className = ''
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return AnalyticsCalculator.formatPercentage(val);
      case 'duration':
        return AnalyticsCalculator.formatDuration(val);
      default:
        return AnalyticsCalculator.formatNumber(val);
    }
  };

  const getTrendColor = () => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getTrendIcon = () => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={`font-semibold ${sizeClasses[size]}`}>
        {formatValue(value)}
      </span>
      <span className={`${getTrendColor()} ${sizeClasses[size]}`}>
        {getTrendIcon()} {Math.abs(change).toFixed(1)}%
      </span>
      <span className={`text-gray-600 ${sizeClasses[size]}`}>
        {label}
      </span>
    </div>
  );
};

export const HeatmapVisualization: React.FC<{
  data: Array<{ x: string; y: string; value: number }>;
  height?: number;
  colorScheme?: string[];
  className?: string;
}> = ({
  data,
  height = 300,
  colorScheme = ['#f3f4f6', '#3B82F6'],
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  const getIntensity = (value: number) => {
    return value / maxValue;
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return colorScheme[0];
    const index = Math.floor(intensity * (colorScheme.length - 1));
    return colorScheme[Math.min(index + 1, colorScheme.length - 1)];
  };

  const xValues = Array.from(new Set(data.map(d => d.x)));
  const yValues = Array.from(new Set(data.map(d => d.y)));

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="inline-block min-w-full">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${xValues.length}, 1fr)` }}>
          {yValues.map(y =>
            xValues.map(x => {
              const point = data.find(d => d.x === x && d.y === y);
              const value = point?.value || 0;
              const intensity = getIntensity(value);

              return (
                <div
                  key={`${x}-${y}`}
                  className="aspect-square flex items-center justify-center text-xs font-medium border border-gray-200 rounded"
                  style={{ backgroundColor: getColor(intensity) }}
                  title={`${x}, ${y}: ${value}`}
                >
                  {value > 0 && (
                    <span className={intensity > 0.5 ? 'text-white' : 'text-gray-900'}>
                      {value}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export const ProgressRing: React.FC<{
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
  className?: string;
}> = ({
  value,
  max,
  size = 80,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#f3f4f6',
  showText = true,
  className = ''
}) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / max) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-block ${className}`}>
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
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-900">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
};

export const AnalyticsVisualization: React.FC<{
  type: VisualizationType;
  data: any[];
  config?: any;
  title?: string;
  loading?: boolean;
  error?: string;
  className?: string;
}> = ({
  type,
  data,
  config = {},
  title,
  loading = false,
  error,
  className = ''
}) => {
  const renderVisualization = () => {
    switch (type) {
      case VisualizationType.LINE_CHART:
        return (
          <LineChartVisualization
            data={data}
            xKey={config.xKey || 'name'}
            yKey={config.yKey || 'value'}
            {...config}
          />
        );

      case VisualizationType.AREA_CHART:
        return (
          <AreaChartVisualization
            data={data}
            xKey={config.xKey || 'name'}
            yKey={config.yKey || 'value'}
            {...config}
          />
        );

      case VisualizationType.BAR_CHART:
        return (
          <BarChartVisualization
            data={data}
            xKey={config.xKey || 'name'}
            yKey={config.yKey || 'value'}
            {...config}
          />
        );

      case VisualizationType.PIE_CHART:
        return (
          <PieChartVisualization
            data={data}
            nameKey={config.nameKey || 'name'}
            valueKey={config.valueKey || 'value'}
            {...config}
          />
        );

      case VisualizationType.DONUT_CHART:
        return (
          <DonutChartVisualization
            data={data}
            nameKey={config.nameKey || 'name'}
            valueKey={config.valueKey || 'value'}
            {...config}
          />
        );

      case VisualizationType.GAUGE:
        return (
          <GaugeVisualization
            value={config.value || 0}
            max={config.max || 100}
            title={config.title || ''}
            {...config}
          />
        );

      case VisualizationType.HEATMAP:
        return (
          <HeatmapVisualization
            data={data}
            {...config}
          />
        );

      default:
        return <div className="text-center py-8 text-gray-500">Visualization type not supported</div>;
    }
  };

  return (
    <ChartContainer
      title={title}
      loading={loading}
      error={error}
      data={data}
      className={className}
    >
      {renderVisualization()}
    </ChartContainer>
  );
};