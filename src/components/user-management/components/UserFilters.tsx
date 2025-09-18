import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ChangeEvent } from "react";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserFiltersProps = {
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  handleExport: () => void;
  userType: "Freelancer" | "Customer" | "User" | "All";
};

export function UserFilters({
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  date,
  setDate,
  handleExport,
  userType,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4 bg-white p-3 rounded border-b">
      <div className="flex flex-col sm:flex-row w-full md:w-auto flex-wrap items-start sm:items-center gap-3 md:gap-4">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[140px] rounded-sm h-10 border-[#B4B9C9]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Customer">Customer</SelectItem>
            <SelectItem value="Freelancer">Freelancer</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button className="bg-[#149A9B] hover:bg-[#108080] text-white h-10 px-4 w-full sm:w-auto">
            View {userType.toLowerCase()}
          </Button>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px] rounded-sm h-10 border-[#B4B9C9]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-full sm:w-[250px]">
          <Input
            placeholder="Search by customer name"
            className="pl-9 h-10 border-[#B4B9C9] focus-visible:ring-offset-0 w-full rounded-sm"
            value={searchQuery}


            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B4B9C9]"
            size={16}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end mt-3 md:mt-0">
        <div className="flex flex-wrap items-cente rounded-sm gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-3 border-[#B4B9C9] text-[#6D758F] rounded-sm hover:bg-gray-50 gap-2 w-full sm:w-auto"
              >
                <CalendarIcon className="h-4 w-4 text-[#6D758F]" />
                {date ? format(date, "MM/dd/yy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            className="h-10 px-4 border-[#B4B9C9] text-[#6D758F] rounded-sm hover:bg-gray-50 w-full sm:w-auto"
          >
            Filter
          </Button>
        </div>

        <Button
          className="h-10 px-4 bg-[#002333] hover:bg-[#001a26] text-white rounded-full w-full sm:w-auto"
          onClick={handleExport}
        >
          Export Report
        </Button>
      </div>
    </div>
  );
}
