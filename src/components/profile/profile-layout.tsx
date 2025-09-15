"use client";

import { useEffect, useState } from "react";
import Header from "@/layouts/Header";
import EditProfileButton from "./edit-profile-button";
import ProfileDetails from "./profile-details";
import ProfileHeader from "./profile-header";
import ProfileSidebar from "./profile-sidebar";
import ProfileStats from "./profile-stats";
import { AchievementSystem } from "@/components/reputation/achievement-system";
import { useProfileApi } from "@/hooks/api-connections/use-profile-api";
import { User } from '@/types/user.types';

export default function ProfileLayout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { user, isLoading, error, fetchProfile } = useProfileApi();

  // TODO: Replace with actual user ID from authentication context
  const TEMP_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

  useEffect(() => {
    fetchProfile(TEMP_USER_ID);
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mt-10 mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-red-800 font-semibold mb-1">Error Loading Profile</h2>
            <p className="text-red-600 text-sm">{error.message}</p>
            <button 
              onClick={() => fetchProfile(TEMP_USER_ID)}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 border-r pr-4">
            <div className="md:sticky md:top-6">
              <ProfileHeader user={currentUser} isLoading={isLoading} />
              <hr className="my-4" />
              <ProfileSidebar />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-gray-800">
                Profile Information
              </h1>
              <EditProfileButton 
                user={currentUser} 
                onProfileUpdate={handleProfileUpdate}
                disabled={isLoading || !currentUser}
              />
            </div>

            <ProfileDetails user={currentUser} isLoading={isLoading} />
            <ProfileStats />

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Achievements
              </h2>
              <div className="border p-2 rounded-lg">
                <AchievementSystem userId={currentUser?.id || TEMP_USER_ID} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
