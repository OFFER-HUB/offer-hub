'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AccountManagementTable from '@/components/user-management/account-management'
import UserVerificationTable from '@/components/user-management/UserVerificationTable'
import UserAnalyticsTable from '@/components/user-management/UserAnalyticsTable'
import ProfileSection from '@/components/profile/profile-section'
import { AdminAuth } from '@/components/admin/AdminAuth'
import { useAdminUsersApi } from '@/hooks/api-connections/use-admin-users-api'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

// Component that uses useSearchParams - needs to be wrapped in Suspense
function UserVerificationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('verification')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { getAuthToken } = useAdminUsersApi()

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['verification', 'account', 'analytics', 'profile'].includes(tab)) {
      setActiveTab(tab)
    } else {
      setActiveTab('verification')
    }
  }, [searchParams])

  useEffect(() => {
    // Check if user is already authenticated
    const token = getAuthToken()
    if (token) {
      setIsAuthenticated(true)
    }
  }, [getAuthToken])

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    if (value === 'verification') {
      router.replace(pathname, { scroll: false })
    } else {
      router.replace(`${pathname}?tab=${value}`, { scroll: false })
    }
  }

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className='flex flex-col h-full'>
      <div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
          <div className='overflow-x-auto'>
            <TabsList className='w-full justify-start rounded-none bg-white h-auto p-2 md:p-3 min-w-max gap-1 md:gap-2'>
              <TabsTrigger
                value='verification'
                className='rounded-full text-black px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm data-[state=active]:border-[#002333] data-[state=active]:bg-[#002333] data-[state=active]:text-white'
              >
                User Verification
              </TabsTrigger>
              <TabsTrigger
                value='account'
                className='rounded-full text-black px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm data-[state=active]:border-[#002333] data-[state=active]:bg-[#002333] data-[state=active]:text-white'
              >
                Account management
              </TabsTrigger>
              <TabsTrigger
                value='analytics'
                className='rounded-full text-black px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm data-[state=active]:border-[#002333] data-[state=active]:bg-[#002333] data-[state=active]:text-white'
              >
                User analytics
              </TabsTrigger>
              <TabsTrigger
                value='profile'
                className='rounded-full text-black px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm data-[state=active]:border-[#002333] data-[state=active]:bg-[#002333] data-[state=active]:text-white'
              >
                Profile
              </TabsTrigger>
            </TabsList>
          </div>
          <div className='w-full px-2 md:container md:mx-auto md:px-4 py-3 md:py-6'>
            <TabsContent value='verification' className='m-0 p-2 md:p-6'>
              <UserVerificationTable />
            </TabsContent>
            <TabsContent value='account' className='m-0 p-2 md:p-6'>
              <AccountManagementTable />
            </TabsContent>
            <TabsContent value='analytics' className='m-0 p-2 md:p-6'>
              <UserAnalyticsTable />
            </TabsContent>
            <TabsContent value='profile' className='m-0 h-full p-2 md:p-6'>
              <ProfileSection className='h-full' />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

// Main component that wraps UserVerificationContent in Suspense
export default function UserVerificationPage() {
  return (
    <Suspense fallback={<div className='flex flex-col h-full items-center justify-center'>Loading...</div>}>
      <UserVerificationContent />
    </Suspense>
  )
}