import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

export function EmailInput({
  value,
  onChange,
  error,
  placeholder,
}: EmailInputProps) {
  return (
    <div className='w-full'>
      <Label htmlFor='email'>Email</Label>
      <Input
        id='email'
        type='email'
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'olivia@email.com'}
        autoComplete='email'
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className='text-destructive text-xs mt-1'>{error}</p>}
    </div>
  );
}
