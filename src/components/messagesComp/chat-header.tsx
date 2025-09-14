import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { VALIDATION_LIMITS } from '@/constants/magic-numbers';

export function ChatHeader({
  name = 'John Doe',
  avatarUrl = '/placeholder.svg?height=64&width=64',
}: {
  name?: string;
  avatarUrl?: string;
}) {
  return (
    <div className='w-full bg-[#DDF1E7]'>
      <div className='mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6'>
        <Avatar className='size-8 ring-2 ring-white/80'>
          <AvatarImage
            src={avatarUrl || '/placeholder.svg'}
            alt={`${name} avatar`}
          />
          <AvatarFallback>
            {name
              .split(' ')
              .map((n) => n[0])
              .slice(0, VALIDATION_LIMITS.MAX_AVATAR_INITIALS)
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className='truncate text-sm font-semibold'>{name}</span>
      </div>
      <Separator />
    </div>
  );
}
