"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  ToggleLeft, 
  History, 
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Database as DatabaseIcon
} from 'lucide-react';
import SystemConfigurationComponent from '@/components/admin/configuration/system-configuration';
import PolicyManagementComponent from '@/components/admin/configuration/policy-management';
import FeatureTogglesComponent from '@/components/admin/configuration/feature-toggles';
import ConfigurationHistoryComponent from '@/components/admin/configuration/configuration-history';
import PolicyTesterComponent from '@/components/admin/configuration/policy-tester';
import BulkOperationsComponent from '@/components/admin/configuration/bulk-operations';
import AnalyticsDashboardComponent from '@/components/admin/configuration/analytics-dashboard';

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState('system');

  // Mock data for dashboard cards
  const systemStats = {
    totalConfigurations: 156,
    activeConfigurations: 142,
    editableConfigurations: 134,
    categories: 8,
    recentChanges: 12,
    validationErrors: 3,
    healthStatus: 'healthy' as 'healthy' | 'warning' | 'critical',
  };

  const policyStats = {
    totalPolicies: 24,
    activePolicies: 18,
    draftPolicies: 4,
    violations: 7,
    falsePositives: 2,
    avgResponseTime: 45,
    categories: 6,
    healthStatus: 'warning' as 'healthy' | 'warning' | 'critical',
  };

  const featureToggleStats = {
    totalFeatureToggles: 32,
    activeFeatureToggles: 28,
    productionFeatureToggles: 22,
    categories: 8,
    avgRolloutPercentage: 67,
    recentEvaluations: 1456,
    healthStatus: 'healthy' as 'healthy' | 'warning' | 'critical',
  };

  const getHealthColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration Management</h1>
          <p className="text-muted-foreground">
            Comprehensive system configuration, policy management, and feature toggle control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            System Health: Good
          </Badge>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Configuration Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('system')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">System Configuration</CardTitle>
              </div>
              {getHealthIcon(systemStats.healthStatus)}
            </div>
            <CardDescription>
              Platform settings and configuration management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{systemStats.totalConfigurations}</div>
                <div className="text-sm text-muted-foreground">Total Configs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{systemStats.activeConfigurations}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{systemStats.recentChanges}</div>
                <div className="text-sm text-muted-foreground">Recent Changes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{systemStats.categories}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </div>
            {systemStats.validationErrors > 0 && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-700 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {systemStats.validationErrors} validation errors
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policy Management Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('policies')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Policy Management</CardTitle>
              </div>
              {getHealthIcon(policyStats.healthStatus)}
            </div>
            <CardDescription>
              Security policies and compliance enforcement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{policyStats.totalPolicies}</div>
                <div className="text-sm text-muted-foreground">Total Policies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{policyStats.activePolicies}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{policyStats.violations}</div>
                <div className="text-sm text-muted-foreground">Violations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{policyStats.avgResponseTime}ms</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
            </div>
            {policyStats.falsePositives > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center gap-2 text-yellow-700 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {policyStats.falsePositives} false positives
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Toggles Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('features')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ToggleLeft className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Feature Toggles</CardTitle>
              </div>
              {getHealthIcon(featureToggleStats.healthStatus)}
            </div>
            <CardDescription>
              Feature flags and gradual rollout management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{featureToggleStats.totalFeatureToggles}</div>
                <div className="text-sm text-muted-foreground">Total Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{featureToggleStats.activeFeatureToggles}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{featureToggleStats.avgRolloutPercentage}%</div>
                <div className="text-sm text-muted-foreground">Avg Rollout</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{featureToggleStats.recentEvaluations}</div>
                <div className="text-sm text-muted-foreground">Evaluations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Config
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <DatabaseIcon className="h-4 w-4" />
            Bulk Ops
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <SystemConfigurationComponent />
        </TabsContent>

        <TabsContent value="policies">
          <PolicyManagementComponent />
        </TabsContent>

        <TabsContent value="features">
          <FeatureTogglesComponent />
        </TabsContent>

        <TabsContent value="history">
          <ConfigurationHistoryComponent />
        </TabsContent>

        <TabsContent value="testing">
          <PolicyTesterComponent />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkOperationsComponent />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboardComponent />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common configuration management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Bulk Configuration Update</h4>
                  <p className="text-sm text-muted-foreground">Update multiple configurations at once</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Policy Testing</h4>
                  <p className="text-sm text-muted-foreground">Test policies with sample data</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ToggleLeft className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Feature Rollout</h4>
                  <p className="text-sm text-muted-foreground">Manage gradual feature rollouts</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            System Health Overview
          </CardTitle>
          <CardDescription>
            Real-time system health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getHealthIcon(systemStats.healthStatus)}
              </div>
              <div className="text-sm font-medium">Configuration System</div>
              <div className={`text-xs ${getHealthColor(systemStats.healthStatus)}`}>
                {systemStats.healthStatus.toUpperCase()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getHealthIcon(policyStats.healthStatus)}
              </div>
              <div className="text-sm font-medium">Policy Engine</div>
              <div className={`text-xs ${getHealthColor(policyStats.healthStatus)}`}>
                {policyStats.healthStatus.toUpperCase()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getHealthIcon(featureToggleStats.healthStatus)}
              </div>
              <div className="text-sm font-medium">Feature Toggles</div>
              <div className={`text-xs ${getHealthColor(featureToggleStats.healthStatus)}`}>
                {featureToggleStats.healthStatus.toUpperCase()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm font-medium">Active Users</div>
              <div className="text-xs text-muted-foreground">
                {Math.floor(Math.random() * 1000) + 500} ONLINE
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
