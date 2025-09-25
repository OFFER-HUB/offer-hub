'use client';
import { useState } from 'react';
import ProfileOverview from '@/components/admin-profile/ProfileOverview';
import EditProfileForm from '@/components/admin-profile/EditProfileForm';
import SecuritySettings from '@/components/admin-profile/SecuritySettings';
import Sidebar from '@/components/admin/layouts/Sidebar';


const mockAdmin = {
  firstName: 'Aminu',
  lastName: 'Abdulrasheed',
  email: 'youremail@domain.com',
  phone: '',
  avatar: '/person1.png',
};

type View = 'overview' | 'edit' | 'security';

export default function AdminProfilePage() {
  const [view, setView] = useState<View>('overview');
  const [admin, setAdmin] = useState(mockAdmin);

  const handleSaveProfile = (data: Partial<typeof mockAdmin>) => {
    setAdmin((prev) => ({ ...prev, ...data }));
    setView('overview');
  };

  return (
    <>
      <div className='min-h-screen bg-white'>
        <div className='flex'>
          <Sidebar />
          <main className='flex-1 flex flex-col items-center justify-center relative'>
            {view === 'overview' && (
              <ProfileOverview
                admin={admin}
                onEditProfile={() => setView('edit')}
                onSecurity={() => setView('security')}
              />
            )}
            {view === 'edit' && (
              <EditProfileForm
                user={admin}
                onBack={() => setView('overview')}
                onSave={handleSaveProfile}
              />
            )}
            {view === 'security' && (
              <SecuritySettings onBack={() => setView('overview')} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
