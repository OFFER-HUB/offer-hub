"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Clock,
  ArrowRight,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  AreaChart,
  BarChart,
  PieChart as PieChartComponent,
} from "@/components/ui/charts";
import { useUserAnalytics } from "@/hooks/use-platform-monitoring";
import { TimeRange } from "@/types/monitoring.types";
import { cn } from "@/lib/utils";

interface AnalyticMetricProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
  subtitle?: string;
}

function AnalyticMetric({
  title,
  value,
  change,
  icon,
  trend = "stable",
  subtitle,
}: AnalyticMetricProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="text-blue-600">{icon}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {change !== undefined && (
            <div className={cn("flex items-center space-x-1", getTrendColor())}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface UserFlowProps {
  data: Array<{
    step: string;
    users: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
}

function UserFlowVisualization({ data }: UserFlowProps) {
  const maxUsers = Math.max(...data.map((d) => d.users));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((step, index) => (
            <div key={step.step} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{step.step}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {step.users.toLocaleString()} users
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {step.conversionRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="relative">
                <div
                  className="bg-blue-200 h-8 rounded-lg flex items-center px-3"
                  style={{ width: `${(step.users / maxUsers) * 100}%` }}
                >
                  <div
                    className="bg-blue-500 h-6 rounded"
                    style={{ width: `${step.conversionRate}%` }}
                  />
                </div>
                {step.dropoffRate > 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    {step.dropoffRate.toFixed(1)}% drop-off
                  </div>
                )}
              </div>

              {index < data.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface HeatmapProps {
  data: Array<{ hour: number; day: string; value: number }>;
}

function ActivityHeatmap({ data }: HeatmapProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxValue = Math.max(...data.map((d) => d.value));

  const getIntensity = (value: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.8) return "bg-blue-900";
    if (intensity > 0.6) return "bg-blue-700";
    if (intensity > 0.4) return "bg-blue-500";
    if (intensity > 0.2) return "bg-blue-300";
    if (intensity > 0) return "bg-blue-100";
    return "bg-gray-100";
  };

  const getValue = (day: string, hour: number) => {
    const item = data.find((d) => d.day === day && d.hour === hour);
    return item?.value || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity Heatmap</CardTitle>
        <p className="text-sm text-gray-600">Activity by day and hour</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex space-x-1 text-xs text-gray-500 mb-2">
            <div className="w-12" /> {/* Day label space */}
            {hours
              .filter((h) => h % 4 === 0)
              .map((hour) => (
                <div key={hour} className="w-4 text-center">
                  {hour}
                </div>
              ))}
          </div>

          {days.map((day) => (
            <div key={day} className="flex items-center space-x-1">
              <div className="w-12 text-xs text-gray-600 font-medium">
                {day}
              </div>
              <div className="flex space-x-1">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "w-4 h-4 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110",
                      getIntensity(getValue(day, hour))
                    )}
                    title={`${day} ${hour}:00 - ${getValue(day, hour)} users`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100" />
            <div className="w-3 h-3 rounded-sm bg-blue-100" />
            <div className="w-3 h-3 rounded-sm bg-blue-300" />
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <div className="w-3 h-3 rounded-sm bg-blue-700" />
            <div className="w-3 h-3 rounded-sm bg-blue-900" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserAnalytics() {
  const { analyticsData, isLoading, error, loadUserAnalytics } =
    useUserAnalytics();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date(),
    interval: "24h",
  });
  const [activeTab, setActiveTab] = useState("overview");

  // Load analytics data when component mounts or time range changes
  useEffect(() => {
    loadUserAnalytics(selectedTimeRange);
  }, [selectedTimeRange, loadUserAnalytics]);

  // Generate mock data for demonstration
  const mockEngagementData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        name: new Date(
          Date.now() - (6 - i) * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-US", { weekday: "short" }),
        activeUsers: Math.floor(Math.random() * 1000) + 500,
        newUsers: Math.floor(Math.random() * 200) + 50,
        returningUsers: Math.floor(Math.random() * 800) + 300,
        sessionDuration: Math.floor(Math.random() * 600) + 180,
      })),
    []
  );

  const mockDeviceData = [
    { name: "Desktop", value: 45, users: 4500 },
    { name: "Mobile", value: 35, users: 3500 },
    { name: "Tablet", value: 20, users: 2000 },
  ];

  const mockLocationData = [
    { name: "United States", users: 3200, sessions: 4500 },
    { name: "United Kingdom", users: 1800, sessions: 2400 },
    { name: "Canada", users: 1200, sessions: 1600 },
    { name: "Germany", users: 900, sessions: 1200 },
    { name: "France", users: 700, sessions: 950 },
  ];

  const mockFunnelData = [
    { step: "Landing Page", users: 10000, conversionRate: 100, dropoffRate: 0 },
    { step: "Sign Up", users: 7500, conversionRate: 75, dropoffRate: 25 },
    { step: "Profile Setup", users: 6000, conversionRate: 80, dropoffRate: 20 },
    { step: "First Project", users: 4200, conversionRate: 70, dropoffRate: 30 },
    { step: "Payment", users: 2940, conversionRate: 70, dropoffRate: 30 },
  ];

  const mockHeatmapData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = [];

    for (const day of days) {
      for (let hour = 0; hour < 24; hour++) {
        data.push({
          hour,
          day,
          value: Math.floor(Math.random() * 100),
        });
      }
    }

    return data;
  }, []);

  const mockRetentionData = [
    { name: "Week 1", period: 0, users: 1000, retentionRate: 100 },
    { name: "Week 2", period: 1, users: 450, retentionRate: 45 },
    { name: "Week 3", period: 2, users: 290, retentionRate: 29 },
    { name: "Week 4", period: 3, users: 210, retentionRate: 21 },
    { name: "Week 5", period: 4, users: 170, retentionRate: 17 },
  ];

  const handleTimeRangeChange = (range: string) => {
    let start: Date;
    const end = new Date();

    switch (range) {
      case "24h":
        start = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    setSelectedTimeRange({
      start,
      end,
      interval: range === "24h" ? "1h" : "24h",
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => loadUserAnalytics(selectedTimeRange)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Analytics</h2>
          <p className="text-gray-600">
            Comprehensive insights into user behavior and engagement
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select onValueChange={handleTimeRangeChange} defaultValue="7d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticMetric
          title="Total Users"
          value={
            analyticsData?.sessionData.totalSessions.toLocaleString() ||
            "12,450"
          }
          change={8.2}
          trend="up"
          icon={<Users className="h-6 w-6" />}
          subtitle="Active users this period"
        />

        <AnalyticMetric
          title="Avg Session Duration"
          value={
            analyticsData
              ? `${Math.round(
                  analyticsData.sessionData.averageSessionDuration / 60
                )}m`
              : "8m 42s"
          }
          change={-2.1}
          trend="down"
          icon={<Clock className="h-6 w-6" />}
          subtitle="Time spent per session"
        />

        <AnalyticMetric
          title="Bounce Rate"
          value={
            analyticsData
              ? `${analyticsData.sessionData.bounceRate.toFixed(1)}%`
              : "23.5%"
          }
          change={-5.3}
          trend="up"
          icon={<Eye className="h-6 w-6" />}
          subtitle="Single page visits"
        />

        <AnalyticMetric
          title="Pages per Session"
          value={analyticsData?.sessionData.pagesPerSession.toFixed(1) || "4.2"}
          change={12.1}
          trend="up"
          icon={<MousePointer className="h-6 w-6" />}
          subtitle="Page views per session"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={mockEngagementData}
                  dataKeys={["activeUsers", "newUsers", "returningUsers"]}
                  height={300}
                  showLegend
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Duration Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={mockEngagementData}
                  dataKeys={["sessionDuration"]}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>

          <ActivityHeatmap data={mockHeatmapData} />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Entry Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Bounce Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>/</TableCell>
                      <TableCell>5,420</TableCell>
                      <TableCell>15.2%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>/projects</TableCell>
                      <TableCell>3,210</TableCell>
                      <TableCell>28.4%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>/about</TableCell>
                      <TableCell>1,890</TableCell>
                      <TableCell>45.1%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Home Page</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Browse Projects</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium">Project Details</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Apply/Contact</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent
                  data={mockDeviceData}
                  height={300}
                  showLegend
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={mockLocationData.map((item) => ({
                    name: item.name,
                    value: item.users,
                  }))}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Avg Session Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLocationData.map((location) => (
                    <TableRow key={location.name}>
                      <TableCell className="font-medium">
                        {location.name}
                      </TableCell>
                      <TableCell>{location.users.toLocaleString()}</TableCell>
                      <TableCell>
                        {location.sessions.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {Math.floor(Math.random() * 300 + 180)}s
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Retention Cohort</CardTitle>
              <p className="text-sm text-gray-600">
                Percentage of users who return after their first visit
              </p>
            </CardHeader>
            <CardContent>
              <LineChart
                data={mockRetentionData}
                dataKeys={["retentionRate"]}
                height={300}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Retention by Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Day 1", "Day 7", "Day 30"].map((period, index) => (
                    <div
                      key={period}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{period}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${[65, 45, 32][index]}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          {[65, 45, 32][index]}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Weekly Churn Rate
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      12.5%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Monthly Churn Rate
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      35.2%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">At-Risk Users</span>
                    <span className="text-lg font-bold text-yellow-600">
                      1,250
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <UserFlowVisualization data={mockFunnelData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Visitors</TableHead>
                      <TableHead>Conversions</TableHead>
                      <TableHead>Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Organic Search</TableCell>
                      <TableCell>8,420</TableCell>
                      <TableCell>1,240</TableCell>
                      <TableCell>14.7%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Direct</TableCell>
                      <TableCell>5,210</TableCell>
                      <TableCell>890</TableCell>
                      <TableCell>17.1%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Social Media</TableCell>
                      <TableCell>3,180</TableCell>
                      <TableCell>285</TableCell>
                      <TableCell>9.0%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Completions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { goal: "Newsletter Signup", rate: 25.4, count: 1240 },
                    { goal: "Project Inquiry", rate: 12.8, count: 620 },
                    { goal: "Account Creation", rate: 8.9, count: 430 },
                    { goal: "First Purchase", rate: 3.2, count: 155 },
                  ].map((goal) => (
                    <div
                      key={goal.goal}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{goal.goal}</p>
                        <p className="text-xs text-gray-600">
                          {goal.count} completions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{goal.rate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
