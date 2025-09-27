"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Loader2, AlertTriangleIcon } from 'lucide-react';

interface LoadingSkeletonProps {
  type?: 'table' | 'cards' | 'form' | 'list';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'cards', 
  count = 3 
}) => {
  const renderTableSkeleton = () => (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );

  const renderCardsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex justify-end space-x-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );

  switch (type) {
    case 'table':
      return renderTableSkeleton();
    case 'form':
      return renderFormSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'cards':
    default:
      return renderCardsSkeleton();
  }
};

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'Loading...', 
  children 
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <LoadingSpinner message={message} />
      </div>
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  action, 
  icon 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {icon && (
        <div className="text-gray-400">
          {icon}
        </div>
      )}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 max-w-sm">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  error?: Error;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title, 
  description, 
  action, 
  error 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="text-red-500">
        <AlertTriangleIcon className="h-12 w-12" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 max-w-sm">{description}</p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-600">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

