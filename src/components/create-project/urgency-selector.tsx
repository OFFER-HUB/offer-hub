'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface UrgencySelectorProps {
  urgency: string;
  onUrgencyChange: (urgency: string) => void;
  label?: string;
}

const urgencyOptions = [
  { value: 'low', label: 'Low - Flexible timeline' },
  { value: 'medium', label: 'Medium - Standard timeline' },
  { value: 'high', label: 'High - Urgent delivery needed' },
  { value: 'critical', label: 'Critical - ASAP delivery required' },
];

export function UrgencySelector({ urgency, onUrgencyChange, label = 'Project Urgency' }: UrgencySelectorProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='urgency' className='text-sm font-medium text-gray-700'>
        {label}
      </Label>
      <Select value={urgency} onValueChange={onUrgencyChange}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Select project urgency' />
        </SelectTrigger>
        <SelectContent>
          {urgencyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 