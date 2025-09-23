import React from 'react';
import withErrorBoundary from "@/components/shared/WithErrorBoundary";
import DisputesList from './DisputesList';
import DisputesEmptyState from './DisputesEmptyState';
import StartDisputeButton from './StartDisputeButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dispute } from '@/types/dispute';


type DisputesDashboardProps = {
  disputes: Dispute[]
}
const DisputesDashboard = ({disputes}: DisputesDashboardProps ) => {
 
  return (
     <main className="size-full flex flex-col gap-9">
        <header className="bg-white h-16 flex justify-center items-center px-12 py-[10px] text-center font-bold text-base text-primary border-b-[0.2px] border-primary">
          Manage Project
        </header>
        <main className="w-[714px] h-auto bg-white py-8 px-8 flex flex-col gap-6 rounded-xl mx-auto">
          <Tabs defaultValue="archived" className="w-full flex flex-col gap-8">
            <TabsList className="grid w-full grid-cols-4 bg-[#002333] h-[58px] p-1 rounded-lg">
              <TabsTrigger
                value="all"
                className="text-sm font-medium text-white data-[state=active]:bg-[#149A9B] data-[state=active]:text-white data-[state=active]:rounded-md py-2.5 transition-all duration-300 ease-in-out hover:bg-[#149A9B]/20 hover:scale-105"
              >
                Active project
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="text-sm font-medium text-white data-[state=active]:bg-[#149A9B] data-[state=active]:text-white data-[state=active]:rounded-md py-2.5 transition-all duration-300 ease-in-out hover:bg-[#149A9B]/20 hover:scale-105"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="closed"
                className="text-sm font-medium text-white data-[state=active]:bg-[#149A9B] data-[state=active]:text-white data-[state=active]:rounded-md py-2.5 transition-all duration-300 ease-in-out hover:bg-[#149A9B]/20 hover:scale-105"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="text-sm font-medium text-white data-[state=active]:bg-[#149A9B] data-[state=active]:text-white data-[state=active]:rounded-md py-2.5 transition-all duration-300 ease-in-out hover:bg-[#149A9B]/20 hover:scale-105"
              >
                Dispute
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="animate-in slide-in-from-bottom fade-in duration-700 ease-out">
              {/* Content for All tab */}
            </TabsContent>
            <TabsContent value="active" className="animate-in slide-in-from-bottom fade-in duration-700 ease-out">
              {/* Content for Active tab */}
            </TabsContent>
            <TabsContent value="closed" className="animate-in slide-in-from-bottom fade-in duration-700 ease-out">
              {/* Content for Closed tab */}
            </TabsContent>
            <TabsContent value="archived" className="animate-in slide-in-from-bottom fade-in duration-700 ease-out">
              <main className="flex flex-col gap-5 animate-in slide-in-from-bottom fade-in duration-500 delay-100">
                <div className="animate-in slide-in-from-bottom fade-in duration-500 delay-200">
                  <StartDisputeButton />
                </div>
                <div className="animate-in slide-in-from-bottom fade-in duration-500 delay-300">
                  {disputes && disputes.length > 0 ? <DisputesList disputes={disputes} /> : <DisputesEmptyState />}
                </div>
              </main>
            </TabsContent>
          </Tabs>
        </main>
      </main>
  );
};

export default withErrorBoundary(DisputesDashboard);
