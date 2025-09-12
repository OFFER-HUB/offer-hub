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
  Plug, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Edit, 
  Play,
  Pause,
  Clock, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Zap,
  Settings,
  Database,
  Cloud,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { useAdminIntegration } from "@/hooks/use-admin-integration";
import { 
  IntegrationProvider, 
  IntegrationInstance, 
  CreateIntegrationInstanceDTO 
} from "@/types/admin-integration.types";

interface IntegrationFrameworksProps {
  className?: string;
}

export function IntegrationFrameworks({ className }: IntegrationFrameworksProps) {
  const {
    integrationProviders,
    integrationInstances,
    isLoading,
    error,
    createIntegrationInstance,
    updateIntegrationInstance,
    deleteIntegrationInstance,
    refreshIntegrationProviders,
    refreshIntegrationInstances,
  } = useAdminIntegration();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<IntegrationInstance | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);

  // Filter integration instances
  const filteredInstances = integrationInstances.filter(instance => {
    const matchesSearch = instance.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && instance.is_active) ||
                         (statusFilter === "inactive" && !instance.is_active);
    const matchesProvider = providerFilter === "all" || instance.provider_id === providerFilter;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const handleCreateInstance = async (data: CreateIntegrationInstanceDTO) => {
    try {
      await createIntegrationInstance(data);
      setShowCreateDialog(false);
      toast.success("Integration instance created successfully");
    } catch (error) {
      toast.error("Failed to create integration instance");
    }
  };

  const handleDeleteInstance = async (id: string) => {
    try {
      await deleteIntegrationInstance(id);
      toast.success("Integration instance deleted successfully");
    } catch (error) {
      toast.error("Failed to delete integration instance");
    }
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

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case "webhook":
        return <Zap className="h-5 w-5 text-blue-500" />;
      case "api":
        return <Database className="h-5 w-5 text-green-500" />;
      case "sdk":
        return <Settings className="h-5 w-5 text-purple-500" />;
      case "plugin":
        return <Plug className="h-5 w-5 text-orange-500" />;
      default:
        return <Cloud className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProviderName = (providerId: string) => {
    const provider = integrationProviders.find(p => p.id === providerId);
    return provider?.name || "Unknown Provider";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Integration Frameworks</h2>
          <p className="text-muted-foreground">
            Connect with third-party services and platforms
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refreshIntegrationProviders();
              refreshIntegrationInstances();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Integration
              </Button>
            </DialogTrigger>
            <CreateIntegrationDialog
              providers={integrationProviders}
              onClose={() => setShowCreateDialog(false)}
              onSubmit={handleCreateInstance}
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
                  placeholder="Search integrations..."
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
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {integrationProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Integration Instances */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading integrations...
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredInstances.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Plug className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Integrations Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery || statusFilter !== "all" || providerFilter !== "all"
                  ? "No integrations match your current filters."
                  : "Create your first integration to connect with external services."
                }
              </p>
              {(!searchQuery && statusFilter === "all" && providerFilter === "all") && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Integration
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredInstances.map((instance) => {
            const provider = integrationProviders.find(p => p.id === instance.provider_id);
            return (
              <Card key={instance.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getProviderIcon(provider?.type || "unknown")}
                      </div>
                      <div>
                        <h3 className="font-semibold">{instance.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {provider?.name || "Unknown Provider"}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(instance.is_active)}
                          <Badge variant="outline" className="text-xs">
                            {provider?.type || "unknown"}
                          </Badge>
                          {instance.last_sync_at && (
                            <Badge variant="outline" className="text-xs">
                              Last sync: {formatDate(instance.last_sync_at)}
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
                          setSelectedInstance(instance);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInstance(instance.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Configuration Preview */}
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Configuration</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {Object.keys(instance.config || {}).length} settings
                        </Badge>
                        {provider?.documentation_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(provider.documentation_url, "_blank", "noopener,noreferrer")}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Supported Events */}
                  {provider?.supported_events && provider.supported_events.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Supported Events</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {provider.supported_events.slice(0, 5).map((event, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {provider.supported_events.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{provider.supported_events.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Integration</DialogTitle>
            <DialogDescription>
              Update the integration instance settings.
            </DialogDescription>
          </DialogHeader>
          {selectedInstance && (
            <EditIntegrationDialog
              instance={selectedInstance}
              providers={integrationProviders}
              onClose={() => setShowEditDialog(false)}
              onSubmit={async (data) => {
                try {
                  await updateIntegrationInstance(selectedInstance.id, data);
                  toast.success("Integration updated");
                  setShowEditDialog(false);
                } catch {
                  toast.error("Failed to update integration");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Integration Dialog Component
interface CreateIntegrationDialogProps {
  providers: IntegrationProvider[];
  onClose: () => void;
  onSubmit: (data: CreateIntegrationInstanceDTO) => void;
}

function CreateIntegrationDialog({ providers, onClose, onSubmit }: CreateIntegrationDialogProps) {
  const [formData, setFormData] = useState<CreateIntegrationInstanceDTO>({
    provider_id: "",
    name: "",
    config: {},
    credentials: {},
  });

  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
  const [configFields, setConfigFields] = useState<Record<string, any>>({});
  const [credentialFields, setCredentialFields] = useState<Record<string, any>>({});

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    setSelectedProvider(provider || null);
    setFormData({ ...formData, provider_id: providerId });
    
    // Initialize config fields based on provider schema
    if (provider?.config_schema) {
      const fields: Record<string, any> = {};
      Object.keys(provider.config_schema).forEach(key => {
        fields[key] = "";
      });
      setConfigFields(fields);
    }
    
    // Initialize credential fields based on auth method
    if (provider?.auth_method) {
      const fields: Record<string, any> = {};
      switch (provider.auth_method) {
        case "api_key":
          fields.api_key = "";
          break;
        case "oauth":
          fields.client_id = "";
          fields.client_secret = "";
          break;
        case "basic":
          fields.username = "";
          fields.password = "";
          break;
      }
      setCredentialFields(fields);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfigFields({ ...configFields, [key]: value });
    setFormData({ ...formData, config: { ...configFields, [key]: value } });
  };

  const handleCredentialChange = (key: string, value: any) => {
    setCredentialFields({ ...credentialFields, [key]: value });
    setFormData({ ...formData, credentials: { ...credentialFields, [key]: value } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.provider_id && formData.name) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="provider">Integration Provider</Label>
        <Select onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                <div className="flex items-center space-x-2">
                  {getProviderIcon(provider.type)}
                  <span>{provider.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Integration Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter integration name"
          required
        />
      </div>

      {selectedProvider && (
        <>
          {/* Configuration Fields */}
          {Object.keys(selectedProvider.config_schema || {}).length > 0 && (
            <div className="space-y-4">
              <Label>Configuration</Label>
              <div className="space-y-3">
                {Object.entries(selectedProvider.config_schema || {}).map(([key, schema]: [string, any]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{schema.description || key}</Label>
                    {schema.type === "string" ? (
                      <Input
                        id={key}
                        value={configFields[key] || ""}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        placeholder={schema.description || `Enter ${key}`}
                        required={schema.required}
                      />
                    ) : schema.type === "number" ? (
                      <Input
                        id={key}
                        type="number"
                        value={configFields[key] || ""}
                        onChange={(e) => handleConfigChange(key, parseInt(e.target.value) || 0)}
                        placeholder={schema.description || `Enter ${key}`}
                        required={schema.required}
                      />
                    ) : schema.type === "boolean" ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={key}
                          checked={configFields[key] || false}
                          onCheckedChange={(checked) => handleConfigChange(key, checked)}
                        />
                        <Label htmlFor={key}>{schema.description || key}</Label>
                      </div>
                    ) : (
                      <Textarea
                        id={key}
                        value={configFields[key] || ""}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        placeholder={schema.description || `Enter ${key}`}
                        required={schema.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credential Fields */}
          <div className="space-y-4">
            <Label>Credentials</Label>
            <div className="space-y-3">
              {Object.keys(credentialFields).map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{key.replace(/_/g, " ").toUpperCase()}</Label>
                  <Input
                    id={key}
                    type={key.includes("password") || key.includes("secret") ? "password" : "text"}
                    value={credentialFields[key] || ""}
                    onChange={(e) => handleCredentialChange(key, e.target.value)}
                    placeholder={`Enter ${key}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Provider Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Provider Information</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Type:</strong> {selectedProvider.type}</p>
              <p><strong>Auth Method:</strong> {selectedProvider.auth_method}</p>
              {selectedProvider.documentation_url && (
                <p>
                  <strong>Documentation:</strong>{" "}
                  <a 
                    href={selectedProvider.documentation_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Documentation
                  </a>
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.provider_id || !formData.name}>
          Create Integration
        </Button>
      </div>
    </form>
  );
}

// Edit Integration Dialog Component
interface EditIntegrationDialogProps {
  instance: IntegrationInstance;
  providers: IntegrationProvider[];
  onClose: () => void;
  onSubmit: (data: Partial<CreateIntegrationInstanceDTO>) => void;
}

function EditIntegrationDialog({ instance, providers, onClose, onSubmit }: EditIntegrationDialogProps) {
  const [formData, setFormData] = useState({
    name: instance.name,
    is_active: instance.is_active,
    config: instance.config,
  });

  const provider = providers.find(p => p.id === instance.provider_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Integration Name</Label>
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

      {provider && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            {getProviderIcon(provider.type)}
            <span className="text-sm font-medium">{provider.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <p><strong>Type:</strong> {provider.type}</p>
            <p><strong>Auth Method:</strong> {provider.auth_method}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Update Integration</Button>
      </div>
    </form>
  );
}

// Helper function to get provider icon
function getProviderIcon(type: string) {
  switch (type) {
    case "webhook":
      return <Zap className="h-4 w-4 text-blue-500" />;
    case "api":
      return <Database className="h-4 w-4 text-green-500" />;
    case "sdk":
      return <Settings className="h-4 w-4 text-purple-500" />;
    case "plugin":
      return <Plug className="h-4 w-4 text-orange-500" />;
    default:
      return <Cloud className="h-4 w-4 text-gray-500" />;
  }
}
