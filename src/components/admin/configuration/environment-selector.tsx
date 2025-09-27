"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Loader2, GlobeIcon, ShieldIcon, CodeIcon, TestTubeIcon } from 'lucide-react';
import { toast } from 'sonner';

type Environment = 'development' | 'staging' | 'production' | 'testing';

interface EnvironmentSelectorProps {
  currentEnvironment: Environment;
  onEnvironmentChange: (environment: Environment) => void;
  showEnvironmentInfo?: boolean;
}

const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  currentEnvironment,
  onEnvironmentChange,
  showEnvironmentInfo = true,
}) => {
  const [loading, setLoading] = useState(false);

  const environments = [
    {
      value: 'development' as Environment,
      label: 'Development',
      description: 'Local development environment',
      icon: <CodeIcon className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      value: 'testing' as Environment,
      label: 'Testing',
      description: 'Automated testing environment',
      icon: <TestTubeIcon className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      value: 'staging' as Environment,
      label: 'Staging',
      description: 'Pre-production environment',
      icon: <ShieldIcon className="h-4 w-4" />,
      color: 'bg-orange-100 text-orange-800',
    },
    {
      value: 'production' as Environment,
      label: 'Production',
      description: 'Live production environment',
      icon: <GlobeIcon className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800',
    },
  ];

  const handleEnvironmentChange = async (environment: Environment) => {
    if (environment === currentEnvironment) return;

    setLoading(true);
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      onEnvironmentChange(environment);
      toast.success(`Switched to ${environments.find(env => env.value === environment)?.label} environment.`);
    } catch (error) {
      toast.error('Failed to switch environment.');
      console.error('Error switching environment:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentEnvInfo = environments.find(env => env.value === currentEnvironment);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GlobeIcon className="h-5 w-5" />
          <span>Environment</span>
        </CardTitle>
        <CardDescription>
          Select the environment to manage configurations, policies, and feature toggles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Select
              value={currentEnvironment}
              onValueChange={handleEnvironmentChange}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                {environments.map((env) => (
                  <SelectItem key={env.value} value={env.value}>
                    <div className="flex items-center space-x-2">
                      {env.icon}
                      <span>{env.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {currentEnvInfo && (
            <Badge className={currentEnvInfo.color}>
              <div className="flex items-center space-x-1">
                {currentEnvInfo.icon}
                <span>{currentEnvInfo.label}</span>
              </div>
            </Badge>
          )}
        </div>

        {showEnvironmentInfo && currentEnvInfo && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-900 mb-2">
              {currentEnvInfo.label} Environment
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {currentEnvInfo.description}
            </p>
            <div className="text-xs text-gray-500">
              <strong>Current Environment:</strong> {currentEnvironment}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Switching environment...</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {environments.map((env) => (
            <Button
              key={env.value}
              variant={currentEnvironment === env.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleEnvironmentChange(env.value)}
              disabled={loading}
              className="flex flex-col items-center space-y-1 h-auto py-3"
            >
              {env.icon}
              <span className="text-xs">{env.label}</span>
            </Button>
          ))}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Environment Guidelines:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Development:</strong> Safe for experimentation and testing</li>
            <li><strong>Testing:</strong> Automated testing and validation</li>
            <li><strong>Staging:</strong> Final testing before production</li>
            <li><strong>Production:</strong> Live environment - changes affect users</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentSelector;
