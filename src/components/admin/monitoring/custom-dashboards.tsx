"use client";

import React, { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  Settings,
  LineChart,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  AlertTriangle,
  Eye,
  Save,
} from "lucide-react";
import {
  LineChart as LineChartComponent,
  BarChart as BarChartComponent,
  PieChart as PieChartComponent,
  AreaChart,
} from "@/components/ui/charts";
import { DashboardWidget } from "@/types/monitoring.types";
import { usePlatformMonitoring } from "@/hooks/use-platform-monitoring";

interface WidgetTemplateProps {
  type: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onAdd: () => void;
}

function WidgetTemplate({
  type,
  icon,
  title,
  description,
  onAdd,
}: WidgetTemplateProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-blue-600">{icon}</div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface DashboardCanvasProps {
  widgets: DashboardWidget[];
  onWidgetDelete: (id: string) => void;
  onWidgetEdit: (widget: DashboardWidget) => void;
}

function DashboardCanvas({
  widgets,
  onWidgetDelete,
  onWidgetEdit,
}: DashboardCanvasProps) {
  const generateMockData = (type: string) => {
    switch (type) {
      case "line-chart":
      case "area-chart":
        return Array.from({ length: 7 }, (_, i) => ({
          name: `Day ${i + 1}`,
          value: Math.floor(Math.random() * 1000) + 100,
        }));
      case "bar-chart":
        return Array.from({ length: 5 }, (_, i) => ({
          name: `Category ${i + 1}`,
          value: Math.floor(Math.random() * 500) + 50,
        }));
      case "pie-chart":
        return [
          { name: "Desktop", value: 45 },
          { name: "Mobile", value: 35 },
          { name: "Tablet", value: 20 },
        ];
      default:
        return [];
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const data = generateMockData(widget.type);

    switch (widget.type) {
      case "metric-card":
        return (
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {widget.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">12,345</p>
                <p className="text-sm text-green-600">+5.2% vs last week</p>
              </div>
            </div>
          </div>
        );
      case "line-chart":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <LineChartComponent data={data} height={200} />
          </div>
        );
      case "bar-chart":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <BarChartComponent data={data} height={200} />
          </div>
        );
      case "pie-chart":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <PieChartComponent data={data} height={200} />
          </div>
        );
      case "area-chart":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <AreaChart data={data} dataKeys={["value"]} height={200} />
          </div>
        );
      case "alert-list":
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-2 p-2 bg-yellow-50 rounded"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">
                    Alert {i + 1}: High CPU usage detected
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p>Widget content will appear here</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[600px] bg-gray-50 rounded-lg p-4">
      {widgets.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Plus className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">
              Your dashboard widgets will appear here
            </p>
            <p className="text-sm">
              Add widgets from the sidebar to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="relative group bg-white rounded-lg border shadow-sm"
            >
              {/* Widget Controls */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onWidgetEdit(widget)}
                    className="h-6 w-6 p-0"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onWidgetEdit(widget)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onWidgetDelete(widget.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Widget Content */}
              {renderWidget(widget)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface WidgetConfigDialogProps {
  widget: DashboardWidget | null;
  open: boolean;
  onClose: () => void;
  onSave: (widget: DashboardWidget) => void;
}

function WidgetConfigDialog({
  widget,
  open,
  onClose,
  onSave,
}: WidgetConfigDialogProps) {
  const [config, setConfig] = useState<DashboardWidget | null>(widget);

  const handleSave = () => {
    if (config) {
      onSave(config);
      onClose();
    }
  };

  if (!widget || !config) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Widget</DialogTitle>
          <DialogDescription>
            Customize the appearance and data source for this widget.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="widget-title">Title</Label>
              <Input
                id="widget-title"
                value={config.title}
                onChange={(e) =>
                  setConfig({ ...config, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="widget-type">Type</Label>
              <Select
                value={config.type}
                onValueChange={(value) =>
                  setConfig({ ...config, type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric Card</SelectItem>
                  <SelectItem value="chart">Chart</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="alert">Alert List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
            <Select
              value={config.refreshInterval?.toString() || "30"}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  refreshInterval: parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="0">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomDashboards() {
  const {
    dashboards,
    activeDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    loadDashboard,
  } = usePlatformMonitoring();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isWidgetPanelOpen, setIsWidgetPanelOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(
    null
  );
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>(
    activeDashboard?.widgets || []
  );

  const [newDashboard, setNewDashboard] = useState({
    name: "",
    description: "",
    isDefault: false,
    shared: false,
  });

  const handleCreateDashboard = async () => {
    try {
      const dashboard = await createDashboard({
        name: newDashboard.name,
        description: newDashboard.description,
        isDefault: newDashboard.isDefault,
        widgets: [],
        layout: { columns: 12, rows: 10, gap: 4 },
        filters: {
          timeRange: {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000),
            end: new Date(),
            interval: "1h",
          },
        },
        refreshInterval: 30,
        createdBy: "current-user",
        shared: newDashboard.shared,
        permissions: [],
      });

      setIsCreateDialogOpen(false);
      setNewDashboard({
        name: "",
        description: "",
        isDefault: false,
        shared: false,
      });
    } catch (error) {
      console.error("Failed to create dashboard:", error);
    }
  };

  const handleWidgetAdd = useCallback((type: string) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: type as any,
      title: `New ${type
        .replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())}`,
      config: {
        chartType: type.includes("chart")
          ? (type.split("-")[0] as any)
          : undefined,
        displayOptions: {
          showLegend: true,
          showGrid: true,
          animation: true,
        },
      },
      position: { x: 0, y: 0 },
      size: { width: 4, height: 2 },
      dataSource: { type: "system" },
    };

    setDashboardWidgets((prev) => [...prev, newWidget]);
    setIsWidgetPanelOpen(false);
  }, []);

  const handleWidgetDelete = useCallback((id: string) => {
    setDashboardWidgets((prev) => prev.filter((widget) => widget.id !== id));
  }, []);

  const handleWidgetEdit = useCallback((widget: DashboardWidget) => {
    setEditingWidget(widget);
  }, []);

  const handleWidgetSave = useCallback((updatedWidget: DashboardWidget) => {
    setDashboardWidgets((prev) =>
      prev.map((widget) =>
        widget.id === updatedWidget.id ? updatedWidget : widget
      )
    );
    setEditingWidget(null);
  }, []);

  const handleSaveDashboard = async () => {
    if (activeDashboard) {
      try {
        await updateDashboard(activeDashboard.id, {
          widgets: dashboardWidgets,
        });
      } catch (error) {
        console.error("Failed to save dashboard:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeDashboard?.name || "Custom Dashboard"}
          </h1>
          {activeDashboard?.isDefault && <Badge>Default</Badge>}
          {activeDashboard?.shared && <Badge variant="outline">Shared</Badge>}
        </div>

        <div className="flex items-center space-x-3">
          <Select
            value={activeDashboard?.id || ""}
            onValueChange={loadDashboard}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select dashboard" />
            </SelectTrigger>
            <SelectContent>
              {dashboards.map((dashboard) => (
                <SelectItem key={dashboard.id} value={dashboard.id}>
                  {dashboard.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet open={isWidgetPanelOpen} onOpenChange={setIsWidgetPanelOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Widget Library</SheetTitle>
                <SheetDescription>
                  Click to add widgets to your dashboard
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Metrics
                  </h3>
                  <div className="space-y-2">
                    <WidgetTemplate
                      type="metric-card"
                      icon={<TrendingUp className="h-5 w-5" />}
                      title="Metric Card"
                      description="Display key metrics and KPIs"
                      onAdd={() => handleWidgetAdd("metric-card")}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Charts
                  </h3>
                  <div className="space-y-2">
                    <WidgetTemplate
                      type="line-chart"
                      icon={<LineChart className="h-5 w-5" />}
                      title="Line Chart"
                      description="Show trends over time"
                      onAdd={() => handleWidgetAdd("line-chart")}
                    />
                    <WidgetTemplate
                      type="bar-chart"
                      icon={<BarChart3 className="h-5 w-5" />}
                      title="Bar Chart"
                      description="Compare categories"
                      onAdd={() => handleWidgetAdd("bar-chart")}
                    />
                    <WidgetTemplate
                      type="pie-chart"
                      icon={<PieChart className="h-5 w-5" />}
                      title="Pie Chart"
                      description="Show proportions"
                      onAdd={() => handleWidgetAdd("pie-chart")}
                    />
                    <WidgetTemplate
                      type="area-chart"
                      icon={<Activity className="h-5 w-5" />}
                      title="Area Chart"
                      description="Visualize cumulative data"
                      onAdd={() => handleWidgetAdd("area-chart")}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Lists
                  </h3>
                  <div className="space-y-2">
                    <WidgetTemplate
                      type="alert-list"
                      icon={<AlertTriangle className="h-5 w-5" />}
                      title="Alert List"
                      description="Show recent alerts"
                      onAdd={() => handleWidgetAdd("alert-list")}
                    />
                    <WidgetTemplate
                      type="table"
                      icon={<Eye className="h-5 w-5" />}
                      title="Data Table"
                      description="Tabular data display"
                      onAdd={() => handleWidgetAdd("table")}
                    />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Dashboard</DialogTitle>
                <DialogDescription>
                  Create a custom dashboard with your preferred widgets and
                  layout.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="dashboard-name">Dashboard Name</Label>
                  <Input
                    id="dashboard-name"
                    value={newDashboard.name}
                    onChange={(e) =>
                      setNewDashboard({
                        ...newDashboard,
                        name: e.target.value,
                      })
                    }
                    placeholder="My Custom Dashboard"
                  />
                </div>

                <div>
                  <Label htmlFor="dashboard-description">Description</Label>
                  <Textarea
                    id="dashboard-description"
                    value={newDashboard.description}
                    onChange={(e) =>
                      setNewDashboard({
                        ...newDashboard,
                        description: e.target.value,
                      })
                    }
                    placeholder="Dashboard description..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="default-dashboard"
                    checked={newDashboard.isDefault}
                    onCheckedChange={(checked) =>
                      setNewDashboard({
                        ...newDashboard,
                        isDefault: checked,
                      })
                    }
                  />
                  <Label htmlFor="default-dashboard">
                    Set as default dashboard
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="shared-dashboard"
                    checked={newDashboard.shared}
                    onCheckedChange={(checked) =>
                      setNewDashboard({
                        ...newDashboard,
                        shared: checked,
                      })
                    }
                  />
                  <Label htmlFor="shared-dashboard">Share with team</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateDashboard}>
                  Create Dashboard
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSaveDashboard}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Dashboard Canvas */}
      <DashboardCanvas
        widgets={dashboardWidgets}
        onWidgetDelete={handleWidgetDelete}
        onWidgetEdit={handleWidgetEdit}
      />

      {/* Widget Configuration Dialog */}
      <WidgetConfigDialog
        widget={editingWidget}
        open={!!editingWidget}
        onClose={() => setEditingWidget(null)}
        onSave={handleWidgetSave}
      />
    </div>
  );
}
