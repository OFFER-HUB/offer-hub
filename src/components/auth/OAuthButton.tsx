import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface OAuthButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function OAuthButton({
  icon,
  label,
  onClick,
  disabled,
}: OAuthButtonProps) {
  return (
    <Button
      type='button'
      variant='outline'
      className='w-full flex items-center gap-2 py-6 text-base font-medium border border-input'
      onClick={onClick}
      disabled={disabled}
    >
      <span className='text-xl'>{icon}</span>
      {label}
    </Button>
  );
}
