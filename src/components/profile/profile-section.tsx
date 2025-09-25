'use client'

import { useState } from 'react'
import ProfileCard from './profile-card'
import EditProfileForm from './edit-profile-form'
import ChangePasswordForm from './change-password-form'

type ProfileView = 'overview' | 'edit' | 'security'

interface ProfileSectionProps {
  className?: string
}

export default function ProfileSection({ className }: ProfileSectionProps) {
  const [currentView, setCurrentView] = useState<ProfileView>('overview')
  const [userData, setUserData] = useState({
    name: 'Aminu A.',
    email: 'youremail@domain.com',
    phone: '',
    avatar: '/verificationImage.svg',
  })

  const handleSaveProfile = (data: any) => {
    setUserData((prev) => ({
      ...prev,
      name: data.name,
      email: data.email,
      phone: data.phone,
    }))
    setCurrentView('overview')
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <ProfileCard
            user={userData}
            onEditProfile={() => setCurrentView('edit')}
            onSecurity={() => setCurrentView('security')}
          />
        )
      case 'edit':
        return (
          <EditProfileForm
            user={{
              id: 'temp-id',
              wallet_address: 'temp-wallet',
              username: 'temp-user',
              name: userData.name,
              email: userData.email,
            }}
            onBack={() => setCurrentView('overview')}
            onSave={handleSaveProfile}
          />
        )
      case 'security':
        return <ChangePasswordForm onBack={() => setCurrentView('overview')} />
      default:
        return null
    }
  }

  return <div className={className}>{renderCurrentView()}</div>
}
