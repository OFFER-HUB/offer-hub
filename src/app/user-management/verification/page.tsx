"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserVerificationTable from "@/components/user-management/UserVerificationTable";

export default function UserVerificationPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Tabs header without container constraint for full-width border */}
      <div>
        <Tabs defaultValue="verification" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="w-full justify-start rounded-none bg-white h-auto p-2 md:p-3 min-w-max">
              <TabsTrigger 
                value="verification"
                className="rounded-none text-black rounded-full px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm border-b-2 border-transparent data-[state=active]:border-[#002333] data-[state=active]:bg-[#002333] data-[state=active]:text-white"
              >
                User Verification
              </TabsTrigger>
              <TabsTrigger 
                value="account"
                className="rounded-none text-black rounded-full px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm border-b-2 border-transparent data-[state=active]:border-[#002333] data-[state=active]:bg-[#002333] data-[state=active]:text-white"
              >
                Account management
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="rounded-none text-black rounded-full px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm border-b-2 border-transparent data-[state=active]:border-[#002333] data-[state=active]:bg-[#002333] data-[state=active]:text-white"
              >
                User analytics
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="w-full px-2 md:container md:mx-auto md:px-4 py-3 md:py-6">
            <TabsContent value="verification" className="m-0 p-2 md:p-6">
              <UserVerificationTable />
            </TabsContent>
            
            <TabsContent value="account" className="m-0">
              <div className="py-6 md:py-10 text-center">
                <h3 className="text-lg font-medium">Account Management</h3>
                <p className="text-sm text-muted-foreground">
                  This tab is not implemented yet
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="m-0">
              <div className="py-6 md:py-10 text-center">
                <h3 className="text-lg font-medium">User Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  This tab is not implemented yet
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}