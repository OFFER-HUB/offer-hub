import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface FormFieldProps {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'textarea';
  textareaRows?: number;
}

export function FormField({
  label,
  id,
  placeholder,
  value,
  onChange,
  type = 'text',
  textareaRows = 5
}: FormFieldProps) {
  return (
    <div className='space-y-2'>
      <label htmlFor={id} className='text-sm font-medium text-gray-700'>
        {label}
      </label>
      {type === 'textarea' ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-full min-h-[120px] resize-none rounded-lg border border-gray-300'
          rows={textareaRows}
        />
      ) : (
        <Input
          id={id}
          type='text'
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-full rounded-lg border border-gray-300'
        />
      )}
    </div>
  );
} 