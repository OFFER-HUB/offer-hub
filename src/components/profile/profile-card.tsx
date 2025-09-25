'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Shield } from 'lucide-react';

interface ProfileCardProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onEditProfile: () => void;
  onSecurity: () => void;
}

export default function ProfileCard({
  user,
  onEditProfile,
  onSecurity,
}: ProfileCardProps) {
  return (
    <div className='flex flex-col justify-center items-center min-h-[60vh]'>
      {/* Avatar */}
      <Avatar className='w-24 h-24'>
        <AvatarImage
          src={user.avatar || '/verificationImage.svg'}
          alt={user.name}
        />
        <AvatarFallback className='text-xl font-semibold bg-gray-100'>
          {user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className='space-y-2 mb-6'>
        <h2 className='text-xl font-semibold text-gray-900'>{user.name}</h2>
        <p className='text-gray-600'>{user.email}</p>
      </div>
      <Card className='w-full max-w-md bg-white shadow-sm border border-gray-200'>
        <CardContent className='p-2 text-center'>
          <div className='flex flex-col items-center space-y-6'>
            {/* Action Buttons */}
            <div className='w-full space-y-3'>
              <Button
                onClick={onEditProfile}
                className='w-full justify-start h-12 text-left hover:bg-gray-50 bg-transparent shadow-none border-none'
              >
                <Edit className='w-4 h-4 mr-3' />
                Edit profile information
              </Button>

              <Button
                onClick={onSecurity}
                className='w-full justify-start h-12 text-left hover:bg-gray-50 bg-transparent shadow-none border-none'
              >
                <Shield className='w-4 h-4 mr-3' />
                Security
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
