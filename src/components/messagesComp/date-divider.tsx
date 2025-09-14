import { cn } from '@/lib/utils';

// A simple day divider used in the thread for grouping messages by date.
export function DateDivider({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn('flex items-center justify-center py-2', className)}
      role='separator'
      aria-label={label}
    >
      <span className='rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground'>
        {label}
      </span>
    </div>
  );
}
