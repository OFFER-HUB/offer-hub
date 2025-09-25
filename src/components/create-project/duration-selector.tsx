'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DurationSelectorProps {
  duration: string;
  onDurationChange: (duration: string) => void;
  label?: string;
}

const durationOptions = [
  { value: '1-2-weeks', label: '1-2 weeks' },
  { value: '2-4-weeks', label: '2-4 weeks' },
  { value: '1-2-months', label: '1-2 months' },
  { value: '2-3-months', label: '2-3 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: '6-months-plus', label: '6+ months' },
];

export function DurationSelector({ duration, onDurationChange, label = 'Project Duration' }: DurationSelectorProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='duration' className='text-sm font-medium text-gray-700'>
        {label}
      </Label>
      <Select value={duration} onValueChange={onDurationChange}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Select project duration' />
        </SelectTrigger>
        <SelectContent>
          {durationOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 