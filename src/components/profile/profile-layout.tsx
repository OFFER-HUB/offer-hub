import Header from "@/layouts/Header";
import EditProfileButton from "./edit-profile-button";
import ProfileDetails from "./profile-details";
import ProfileHeader from "./profile-header";
import ProfileSidebar from "./profile-sidebar";
import ProfileStats from "./profile-stats";

export default function ProfileLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mt-10 mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 border-r pr-4">
            <div className="md:sticky md:top-6">
              <ProfileHeader />
              <hr className="my-4" />
              <ProfileSidebar />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-gray-800">
                Profile Information
              </h1>
              <EditProfileButton />
            </div>

            <ProfileDetails />
            <ProfileStats />
          </div>
        </div>
      </main>
    </div>
  );
}
