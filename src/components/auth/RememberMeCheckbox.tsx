'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function RememberMeCheckbox({
  checked,
  onChange,
  disabled,
}: RememberMeCheckboxProps) {
  return (
    <div className='flex items-center space-x-2'>
      <Checkbox
        id='keep-logged-in'
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className='border-gray-300 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800'
      />
      <Label
        htmlFor='keep-logged-in'
        className='text-sm text-gray-700 font-normal cursor-pointer'
      >
        Keep me logged in
      </Label>
    </div>
  );
}
