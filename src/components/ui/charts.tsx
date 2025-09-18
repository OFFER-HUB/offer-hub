"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  AreaChart as RechartsAreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart as RechartsScatterChart,
  Scatter,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";

// Common colors for charts
const CHART_COLORS = [
  "#15949C",
  "#002333",
  "#4F46E5",
  "#059669",
  "#DC2626",
  "#D97706",
  "#7C3AED",
  "#DB2777",
  "#2563EB",
  "#0891B2",
  "#65A30D",
  "#CA8A04",
];

export interface ChartData {
  name: string;
  value?: number;
  [key: string]: any;
}

interface BaseChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  className?: string;
}

interface LineChartProps extends BaseChartProps {
  dataKeys?: string[];
  strokeWidth?: number;
  showDots?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function LineChart({
  data,
  dataKeys = ["value"],
  height = 300,
  strokeWidth = 2,
  showDots = true,
  showGrid = true,
  showLegend = false,
  className = "",
}: LineChartProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
          <XAxis
            dataKey="name"
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={strokeWidth}
              dot={
                showDots
                  ? {
                      fill: CHART_COLORS[index % CHART_COLORS.length],
                      strokeWidth: 0,
                      r: 4,
                    }
                  : false
              }
              activeDot={{
                r: 6,
                fill: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BarChartProps extends BaseChartProps {
  dataKey?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function BarChart({
  data,
  dataKey = "value",
  height = 300,
  showGrid = true,
  showLegend = false,
  orientation = "vertical",
  className = "",
}: BarChartProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={orientation === "horizontal" ? "horizontal" : "vertical"}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
          <XAxis
            type={orientation === "horizontal" ? "number" : "category"}
            dataKey={orientation === "horizontal" ? undefined : "name"}
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type={orientation === "horizontal" ? "category" : "number"}
            dataKey={orientation === "horizontal" ? "name" : undefined}
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          {showLegend && <Legend />}
          <Bar dataKey={dataKey} fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AreaChartProps extends BaseChartProps {
  dataKeys?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

export function AreaChart({
  data,
  dataKeys = ["value"],
  height = 300,
  showGrid = true,
  showLegend = false,
  stacked = false,
  className = "",
}: AreaChartProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
          <XAxis
            dataKey="name"
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId={stacked ? "1" : undefined}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              fillOpacity={0.6}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartProps extends BaseChartProps {
  dataKey?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChart({
  data,
  dataKey = "value",
  height = 300,
  showLegend = true,
  showLabels = false,
  innerRadius = 0,
  outerRadius,
  className = "",
}: PieChartProps) {
  const radius = outerRadius || Math.min(height * 0.4, 120);

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={
              showLabels
                ? ({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                : false
            }
            outerRadius={radius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ScatterChartProps extends BaseChartProps {
  xDataKey?: string;
  yDataKey?: string;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function ScatterChart({
  data,
  xDataKey = "x",
  yDataKey = "y",
  height = 300,
  showGrid = true,
  showLegend = false,
  className = "",
}: ScatterChartProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
          <XAxis
            type="number"
            dataKey={xDataKey}
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            dataKey={yDataKey}
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          {showLegend && <Legend />}
          <Scatter dataKey={yDataKey} fill={CHART_COLORS[0]} />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

interface RadarChartProps extends BaseChartProps {
  dataKeys?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
}

export function RadarChart({
  data,
  dataKeys = ["value"],
  height = 300,
  showGrid = true,
  showLegend = false,
  className = "",
}: RadarChartProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <PolarGrid />}
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              fillOpacity={0.3}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ComposedChartProps extends BaseChartProps {
  lineDataKeys?: string[];
  barDataKeys?: string[];
  areaDataKeys?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
}

export function MetricsComposedChart({
  data,
  lineDataKeys = [],
  barDataKeys = [],
  areaDataKeys = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  className = "",
}: ComposedChartProps) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
          <XAxis
            dataKey="name"
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          {showLegend && <Legend />}
          {areaDataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              fillOpacity={0.3}
            />
          ))}
          {barDataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={
                CHART_COLORS[
                  (index + areaDataKeys.length) % CHART_COLORS.length
                ]
              }
            />
          ))}
          {lineDataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={
                CHART_COLORS[
                  (index + areaDataKeys.length + barDataKeys.length) %
                    CHART_COLORS.length
                ]
              }
              strokeWidth={2}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
