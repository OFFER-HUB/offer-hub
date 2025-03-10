"use client";

import Discounts from "@/components/modules/authentication/pages/discounts";
import Titles from "@/components/modules/authentication/pages/titles";
import UserProfile from "@/components/modules/authentication/pages/user-profile";
import useSidebar from "@/components/modules/authentication/ui/sidebar/hooks/use-sidebar";
import SettingsSidebar from "@/components/modules/authentication/ui/sidebar/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const UserProfilePage = () => {
  const { currentTab, setCurrentTab } = useSidebar();

  return (
    <Card className={cn("overflow-hidden h-full w-full mb-10 flex")}>
      <div className="flex flex-col md:flex-row w-full">
        <SettingsSidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          className="lg:w-1/6 w-full h-1/4 lg:h-full"
        />
        <div className="flex flex-col w-full md:w-5/6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary-700 dark:text-white">
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <Card className={cn("overflow-hidden h-full w-full")}>
              <CardContent className="p-6">
                {currentTab === "profile" && <UserProfile />}
                {currentTab === "titles" && <Titles />}
                {currentTab === "discounts" && <Discounts />}
              </CardContent>
            </Card>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default UserProfilePage;
