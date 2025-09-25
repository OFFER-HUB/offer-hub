// TypingIndicator: subtle 'John is typing…' with animated dots.
//
export function TypingIndicator({
  name = 'John',
  align = 'left',
}: {
  name?: string;
  align?: 'left' | 'right';
}) {
  return (
    <div
      className={`flex w-full ${
        align === 'right' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div className='inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground'>
        <span className='whitespace-nowrap'>{name} is typing</span>
        <span className='flex items-center gap-1'>
          <span className='inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-200ms]' />
          <span className='inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-100ms]' />
          <span className='inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70' />
        </span>
      </div>
    </div>
  );
}
