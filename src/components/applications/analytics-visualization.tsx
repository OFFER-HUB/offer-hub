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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LabelList,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartData,
  TimeSeriesData,
  SegmentData,
  VisualizationType,
  DisplayOptions,
} from '@/types/application-analytics.types';
import { ApplicationAnalyticsCalculator } from '@/utils/analytics-helpers';

interface AnalyticsVisualizationProps {
  data: ChartData[] | TimeSeriesData[] | SegmentData[];
  type: VisualizationType;
  title?: string;
  description?: string;
  options?: DisplayOptions;
  className?: string;
  height?: number;
  width?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  className?: string;
}

interface ChartConfig {
  colors: string[];
  strokeWidth: number;
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  animation: boolean;
}

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const defaultConfig: ChartConfig = {
  colors: defaultColors,
  strokeWidth: 2,
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  animation: true,
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'stable',
  description,
  className = '',
}) => {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium text-gray-600'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${getTrendColor(trend)}`}>
            <span className='mr-1'>{getTrendIcon(trend)}</span>
            <span>{ApplicationAnalyticsCalculator.formatPercentage(Math.abs(change))}</span>
          </div>
        )}
        {description && (
          <p className='text-sm text-gray-500 mt-1'>{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export const AnalyticsVisualization: React.FC<AnalyticsVisualizationProps> = ({
  data,
  type,
  title,
  description,
  options = {},
  className = '',
  height = 300,
  width = '100%',
}) => {
  const config: ChartConfig = {
    ...defaultConfig,
    colors: options.colorScheme ? [options.colorScheme] : defaultConfig.colors,
    showGrid: options.showGrid ?? defaultConfig.showGrid,
    showLegend: options.showLegend ?? defaultConfig.showLegend,
    showTooltip: options.showTooltip ?? defaultConfig.showTooltip,
    animation: options.animation ?? defaultConfig.animation,
  };

  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: config.colors[index % config.colors.length],
      color: config.colors[index % config.colors.length],
    }));
  }, [data, config.colors]);

  const formatValue = (value: any, type: string) => {
    if (typeof value !== 'number') return value;

    switch (type) {
      case 'currency':
        return ApplicationAnalyticsCalculator.formatCurrency(value);
      case 'percentage':
        return ApplicationAnalyticsCalculator.formatPercentage(value);
      case 'duration':
        return ApplicationAnalyticsCalculator.formatDuration(value);
      default:
        return ApplicationAnalyticsCalculator.formatNumber(value);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-medium text-gray-900'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className='text-sm'>
              {`${entry.dataKey}: ${formatValue(entry.value, 'number')}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderVisualization = () => {
    switch (type) {
      case VisualizationType.LINE_CHART:
        return (
          <LineChart data={processedData}>
            {config.showGrid && <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />}
            <XAxis
              dataKey='name'
              tick={{ fontSize: 12 }}
              stroke='#666'
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke='#666'
            />
            {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend && <Legend />}
            <Line
              type='monotone'
              dataKey='value'
              stroke={config.colors[0]}
              strokeWidth={config.strokeWidth}
              dot={{ fill: config.colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: config.colors[0], strokeWidth: 2 }}
              animationDuration={config.animation ? 1500 : 0}
            />
          </LineChart>
        );

      case VisualizationType.AREA_CHART:
        return (
          <AreaChart data={processedData}>
            {config.showGrid && <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />}
            <XAxis
              dataKey='name'
              tick={{ fontSize: 12 }}
              stroke='#666'
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke='#666'
            />
            {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend && <Legend />}
            <Area
              type='monotone'
              dataKey='value'
              stroke={config.colors[0]}
              strokeWidth={config.strokeWidth}
              fill={`${config.colors[0]}20`}
              animationDuration={config.animation ? 1500 : 0}
            />
          </AreaChart>
        );

      case VisualizationType.BAR_CHART:
        return (
          <BarChart data={processedData}>
            {config.showGrid && <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />}
            <XAxis
              dataKey='name'
              tick={{ fontSize: 12 }}
              stroke='#666'
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke='#666'
            />
            {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend && <Legend />}
            <Bar
              dataKey='value'
              fill={config.colors[0]}
              radius={[4, 4, 0, 0]}
              animationDuration={config.animation ? 1500 : 0}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        );

      case VisualizationType.PIE_CHART:
        return (
          <PieChart>
            <Pie
              data={processedData}
              cx='50%'
              cy='50%'
              innerRadius={0}
              outerRadius={100}
              paddingAngle={2}
              dataKey='value'
              animationDuration={config.animation ? 1500 : 0}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey='name'
                position='outside'
                style={{ fontSize: '12px', fill: '#666' }}
              />
            </Pie>
            {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend && <Legend />}
          </PieChart>
        );

      case VisualizationType.DONUT_CHART:
        return (
          <PieChart>
            <Pie
              data={processedData}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey='value'
              animationDuration={config.animation ? 1500 : 0}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend && <Legend />}
          </PieChart>
        );

      case VisualizationType.SCATTER_PLOT:
        return (
          <ScatterChart data={processedData}>
            {config.showGrid && <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />}
            <XAxis
              dataKey='name'
              tick={{ fontSize: 12 }}
              stroke='#666'
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke='#666'
            />
            {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend && <Legend />}
            <Scatter
              dataKey='value'
              fill={config.colors[0]}
              animationDuration={config.animation ? 1500 : 0}
            />
          </ScatterChart>
        );

      case VisualizationType.RADAR_CHART:
        return (
          <RadarChart data={processedData}>
            <PolarGrid />
            <PolarAngleAxis dataKey='name' tick={{ fontSize: 12 }} />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'dataMax']}
              tick={{ fontSize: 10 }}
            />
            <Radar
              name='Value'
              dataKey='value'
              stroke={config.colors[0]}
              fill={`${config.colors[0]}20`}
              strokeWidth={config.strokeWidth}
              animationDuration={config.animation ? 1500 : 0}
            />
            {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend && <Legend />}
          </RadarChart>
        );

      case VisualizationType.FUNNEL_CHART:
        return (
          <BarChart data={processedData} layout='vertical'>
            {config.showGrid && <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />}
            <XAxis type='number' tick={{ fontSize: 12 }} stroke='#666' />
            <YAxis type='category' dataKey='name' tick={{ fontSize: 12 }} stroke='#666' />
            {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend && <Legend />}
            <Bar dataKey='value' radius={[0, 4, 4, 0]} animationDuration={config.animation ? 1500 : 0}>
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        );

      case VisualizationType.TREEMAP:
        return (
          <PieChart>
            <Pie
              data={processedData}
              cx='50%'
              cy='50%'
              innerRadius={0}
              outerRadius={100}
              paddingAngle={2}
              dataKey='value'
              animationDuration={config.animation ? 1500 : 0}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList dataKey='name' position='outside' style={{ fontSize: '12px', fill: '#666' }} />
            </Pie>
            {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {config.showLegend && <Legend />}
          </PieChart>
        );

      case VisualizationType.GAUGE:
        const gaugeData = processedData[0];
        const percentage = gaugeData ? (gaugeData.value / 100) * 180 : 0;

        return (
          <div className='relative flex items-center justify-center'>
            <svg width='200' height='120' viewBox='0 0 200 120'>
              <defs>
                <linearGradient id='gaugeGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                  <stop offset='0%' stopColor='#EF4444' />
                  <stop offset='50%' stopColor='#F59E0B' />
                  <stop offset='100%' stopColor='#10B981' />
                </linearGradient>
              </defs>
              <path
                d='M 20 100 A 80 80 0 0 1 180 100'
                stroke='#E5E7EB'
                strokeWidth='8'
                fill='none'
              />
              <path
                d='M 20 100 A 80 80 0 0 1 180 100'
                stroke='url(#gaugeGradient)'
                strokeWidth='8'
                strokeDasharray={`${percentage} 251.2`}
                strokeLinecap='round'
                fill='none'
              />
              <text
                x='100'
                y='85'
                textAnchor='middle'
                className='text-2xl font-bold'
                fill='#374151'
              >
                {gaugeData?.value || 0}%
              </text>
            </svg>
          </div>
        );

      case VisualizationType.TABLE:
        return (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Name
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Value
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {processedData.map((row, index) => {
                  const name = 'name' in row ? row.name :
                              'label' in row ? row.label :
                              'segment' in row ? row.segment :
                              `Item ${index + 1}`;
                  const percentage = 'percentage' in row ? row.percentage : undefined;

                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatValue(row.value, 'number')}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {percentage ? ApplicationAnalyticsCalculator.formatPercentage(percentage) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className='flex items-center justify-center h-full text-gray-500'>
            <p>Visualization type not supported</p>
          </div>
        );
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className='flex items-center justify-center h-64 text-gray-500'>
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div style={{ width, height }}>
          {type === VisualizationType.TABLE || type === VisualizationType.GAUGE ? (
            renderVisualization()
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              {renderVisualization()}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsVisualization;