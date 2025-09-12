"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Edit, 
  Shield, 
  Clock, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { useAdminIntegration } from "@/hooks/use-admin-integration";
import { AdminApiKey, CreateAdminApiKeyDTO, AdminPermission, RateLimitConfig } from "@/types/admin-integration.types";

interface ApiManagementProps {
  className?: string;
}

export function ApiManagement({ className }: ApiManagementProps) {
  const {
    apiKeys,
    isLoadingApiKeys,
    errorApiKeys,
    createApiKey,
    updateApiKey,
    revokeApiKey,
    refreshApiKeys,
  } = useAdminIntegration();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<AdminApiKey | null>(null);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  // Filter API keys based on search and status
  const filteredApiKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         key.created_by.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && key.is_active) ||
                         (statusFilter === "inactive" && !key.is_active);
    return matchesSearch && matchesStatus;
  });

  const handleCreateApiKey = async (data: CreateAdminApiKeyDTO) => {
    try {
      await createApiKey(data);
      setShowCreateDialog(false);
      toast.success("API key created successfully");
    } catch (error) {
      toast.error("Failed to create API key");
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    try {
      await revokeApiKey(id);
      toast.success("API key revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (isActive: boolean, expiresAt?: string) => {
    if (!isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Key Management</h2>
          <p className="text-muted-foreground">
            Manage administrative API keys for external integrations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshApiKeys}
            disabled={isLoadingApiKeys}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingApiKeys ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <CreateApiKeyDialog
              onClose={() => setShowCreateDialog(false)}
              onSubmit={handleCreateApiKey}
            />
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search API keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="grid gap-4">
        {isLoadingApiKeys ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading API keys...
          </div>
        ) : errorApiKeys ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorApiKeys}</AlertDescription>
          </Alert>
        ) : filteredApiKeys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Keys Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "No API keys match your current filters."
                  : "Create your first API key to get started with external integrations."
                }
              </p>
              {(!searchQuery && statusFilter === "all") && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredApiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{apiKey.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created by {apiKey.created_by} • {formatDate(apiKey.created_at)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(apiKey.is_active, apiKey.expires_at)}
                        {apiKey.last_used_at && (
                          <Badge variant="outline" className="text-xs">
                            Last used: {formatDate(apiKey.last_used_at)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApiKey(apiKey);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeApiKey(apiKey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Rate Limit Info */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Rate Limits</span>
                    <div className="flex items-center space-x-4">
                      <span>{apiKey.rate_limit.requests_per_minute}/min</span>
                      <span>{apiKey.rate_limit.requests_per_hour}/hour</span>
                      <span>{apiKey.rate_limit.requests_per_day}/day</span>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {apiKey.permissions.map((permission, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {permission.resource}:{permission.actions.join(",")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>
              Update the API key settings and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedApiKey && (
            <EditApiKeyDialog
              apiKey={selectedApiKey}
              onClose={() => setShowEditDialog(false)}
              onSubmit={async (data) => {
                try {
                  await updateApiKey(selectedApiKey.id, data);
                  toast.success("API key updated");
                  setShowEditDialog(false);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to update API key");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create API Key Dialog Component
interface CreateApiKeyDialogProps {
  onClose: () => void;
  onSubmit: (data: CreateAdminApiKeyDTO) => void;
}

function CreateApiKeyDialog({ onClose, onSubmit }: CreateApiKeyDialogProps) {
  const [formData, setFormData] = useState<CreateAdminApiKeyDTO>({
    name: "",
    permissions: [],
    rate_limit: {
      requests_per_minute: 60,
      requests_per_hour: 1000,
      requests_per_day: 10000,
      burst_limit: 10,
    },
  });

  const [newPermission, setNewPermission] = useState<AdminPermission>({
    resource: "",
    actions: [],
  });

  const availableResources = [
    "users", "projects", "contracts", "services", "reviews", 
    "disputes", "payments", "system", "api-keys", "webhooks", 
    "integrations", "audit-logs"
  ];

  const availableActions = ["read", "write", "delete", "admin", "create", "update"];

  const handleAddPermission = () => {
    if (newPermission.resource && newPermission.actions.length > 0) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, newPermission],
      });
      setNewPermission({ resource: "", actions: [] });
    }
  };

  const handleRemovePermission = (index: number) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.permissions.length > 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">API Key Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter API key name"
          required
        />
      </div>

      <div className="space-y-4">
        <Label>Permissions</Label>
        <div className="space-y-3">
          {formData.permissions.map((permission, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{permission.resource}</Badge>
                <span className="text-sm text-muted-foreground">
                  {permission.actions.join(", ")}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemovePermission(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={newPermission.resource}
            onValueChange={(value) => setNewPermission({ ...newPermission, resource: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent>
              {availableResources.map((resource) => (
                <SelectItem key={resource} value={resource}>
                  {resource}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={newPermission.actions[0] || ""}
            onValueChange={(value) => setNewPermission({ ...newPermission, actions: [value] })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {availableActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button type="button" onClick={handleAddPermission}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Rate Limits</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="requests_per_minute">Per Minute</Label>
            <Input
              id="requests_per_minute"
              type="number"
              value={formData.rate_limit?.requests_per_minute || 0}
              onChange={(e) => setFormData({
                ...formData,
                rate_limit: {
                  requests_per_minute: parseInt(e.target.value) || 0,
                  requests_per_hour: formData.rate_limit?.requests_per_hour || 0,
                  requests_per_day: formData.rate_limit?.requests_per_day || 0,
                  burst_limit: formData.rate_limit?.burst_limit || 0,
                },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requests_per_hour">Per Hour</Label>
            <Input
              id="requests_per_hour"
              type="number"
              value={formData.rate_limit?.requests_per_hour || 0}
              onChange={(e) => setFormData({
                ...formData,
                rate_limit: {
                  requests_per_minute: formData.rate_limit?.requests_per_minute || 0,
                  requests_per_hour: parseInt(e.target.value) || 0,
                  requests_per_day: formData.rate_limit?.requests_per_day || 0,
                  burst_limit: formData.rate_limit?.burst_limit || 0,
                },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requests_per_day">Per Day</Label>
            <Input
              id="requests_per_day"
              type="number"
              value={formData.rate_limit?.requests_per_day || 0}
              onChange={(e) => setFormData({
                ...formData,
                rate_limit: {
                  requests_per_minute: formData.rate_limit?.requests_per_minute || 0,
                  requests_per_hour: formData.rate_limit?.requests_per_hour || 0,
                  requests_per_day: parseInt(e.target.value) || 0,
                  burst_limit: formData.rate_limit?.burst_limit || 0,
                },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="burst_limit">Burst Limit</Label>
            <Input
              id="burst_limit"
              type="number"
              value={formData.rate_limit?.burst_limit || 0}
              onChange={(e) => setFormData({
                ...formData,
                rate_limit: {
                  requests_per_minute: formData.rate_limit?.requests_per_minute || 0,
                  requests_per_hour: formData.rate_limit?.requests_per_hour || 0,
                  requests_per_day: formData.rate_limit?.requests_per_day || 0,
                  burst_limit: parseInt(e.target.value) || 0,
                },
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create API Key</Button>
      </div>
    </form>
  );
}

// Edit API Key Dialog Component
interface EditApiKeyDialogProps {
  apiKey: AdminApiKey;
  onClose: () => void;
  onSubmit: (data: Partial<CreateAdminApiKeyDTO>) => void;
}

function EditApiKeyDialog({ apiKey, onClose, onSubmit }: EditApiKeyDialogProps) {
  const [formData, setFormData] = useState({
    name: apiKey.name,
    is_active: apiKey.is_active,
    rate_limit: apiKey.rate_limit,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">API Key Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="space-y-4">
        <Label>Rate Limits</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="requests_per_minute">Per Minute</Label>
            <Input
              id="requests_per_minute"
              type="number"
              value={formData.rate_limit?.requests_per_minute || 0}
              onChange={(e) => setFormData({
                ...formData,
                rate_limit: {
                  requests_per_minute: parseInt(e.target.value) || 0,
                  requests_per_hour: formData.rate_limit?.requests_per_hour || 0,
                  requests_per_day: formData.rate_limit?.requests_per_day || 0,
                  burst_limit: formData.rate_limit?.burst_limit || 0,
                },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requests_per_hour">Per Hour</Label>
            <Input
              id="requests_per_hour"
              type="number"
              value={formData.rate_limit?.requests_per_hour || 0}
              onChange={(e) => setFormData({
                ...formData,
                rate_limit: {
                  requests_per_minute: formData.rate_limit?.requests_per_minute || 0,
                  requests_per_hour: parseInt(e.target.value) || 0,
                  requests_per_day: formData.rate_limit?.requests_per_day || 0,
                  burst_limit: formData.rate_limit?.burst_limit || 0,
                },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requests_per_day">Per Day</Label>
            <Input
              id="requests_per_day"
              type="number"
              value={formData.rate_limit?.requests_per_day || 0}
              onChange={(e) => setFormData({
                ...formData,
                rate_limit: {
                  requests_per_minute: formData.rate_limit?.requests_per_minute || 0,
                  requests_per_hour: formData.rate_limit?.requests_per_hour || 0,
                  requests_per_day: parseInt(e.target.value) || 0,
                  burst_limit: formData.rate_limit?.burst_limit || 0,
                },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="burst_limit">Burst Limit</Label>
            <Input
              id="burst_limit"
              type="number"
              value={formData.rate_limit?.burst_limit || 0}
              onChange={(e) => setFormData({
                ...formData,
                rate_limit: {
                  requests_per_minute: formData.rate_limit?.requests_per_minute || 0,
                  requests_per_hour: formData.rate_limit?.requests_per_hour || 0,
                  requests_per_day: formData.rate_limit?.requests_per_day || 0,
                  burst_limit: parseInt(e.target.value) || 0,
                },
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Update API Key</Button>
      </div>
    </form>
  );
}
