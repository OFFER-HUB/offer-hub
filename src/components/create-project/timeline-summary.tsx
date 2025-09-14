'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, AlertTriangle } from 'lucide-react';

interface TimelineSummaryProps {
  projectType: 'long-term' | 'short-term';
  duration?: string;
  urgency?: string;
  startDate?: Date;
}

export function TimelineSummary({ projectType, duration, urgency, startDate }: TimelineSummaryProps) {
  const getProjectTypeLabel = (type: 'long-term' | 'short-term') => {
    return type === 'long-term' ? 'Long Term Project' : 'Short Term Project';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-blue-600 bg-blue-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className='border-2 border-gray-100'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold text-gray-800'>
          Timeline Summary
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center gap-3'>
          <Clock className='w-5 h-5 text-gray-500' />
          <div>
            <p className='text-sm font-medium text-gray-700'>Project Type</p>
            <p className='text-base font-semibold text-gray-900'>
              {getProjectTypeLabel(projectType)}
            </p>
          </div>
        </div>

        {duration && (
          <div className='flex items-center gap-3'>
            <Calendar className='w-5 h-5 text-gray-500' />
            <div>
              <p className='text-sm font-medium text-gray-700'>Duration</p>
              <p className='text-base font-semibold text-gray-900'>
                {duration.replace('-', ' ').replace('-', ' ')}
              </p>
            </div>
          </div>
        )}

        {urgency && (
          <div className='flex items-center gap-3'>
            <AlertTriangle className='w-5 h-5 text-gray-500' />
            <div>
              <p className='text-sm font-medium text-gray-700'>Urgency</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(urgency)}`}>
                {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
              </span>
            </div>
          </div>
        )}

        {startDate && (
          <div className='flex items-center gap-3'>
            <Calendar className='w-5 h-5 text-gray-500' />
            <div>
              <p className='text-sm font-medium text-gray-700'>Start Date</p>
              <p className='text-base font-semibold text-gray-900'>
                {startDate.toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 