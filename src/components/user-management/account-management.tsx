import { CalendarIcon, CircleCheck, Copy, Search } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { users } from "@/data/landing-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { UserChat } from "./user-chat";
import { RestrictAccountDialog } from "./restrict-account-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import UserProfile from "./user-profile";

export default function AccountManagementTable() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [userType, setUserType] = useState<"Freelancer" | "Customer">(
    "Freelancer"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [restrictDialogOpen, setRestrictDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  const handleViewProfile = (userId: number) => {
    setSelectedUser(userId);
  };
  const handleExport = () => {
    console.log("Exporting report...");
    // Stub for export functionality
    alert("Report export initiated. This feature is currently stubbed.");
  };

  const handleBack = () => {
    setSelectedUser(null);
    setShowChat(false);
  };

  const handleMessage = () => {
    setShowChat(true);
  };

  const handleRestrictAccount = () => {
    setRestrictDialogOpen(true);
  };

  if (selectedUser) {
    if (showChat) {
      return <UserChat onBack={handleBack} />;
    } else {
      return (
        <div className="p-6">
          <UserProfile
            onBack={handleBack}
            onMessage={handleMessage}
            onRestrictAccount={handleRestrictAccount}
          />
          <RestrictAccountDialog
            open={restrictDialogOpen}
            onOpenChange={setRestrictDialogOpen}
          />
        </div>
      );
    }
  }
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4 bg-white p-3 rounded border-b">
        {/* Left side controls - stack on mobile */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto flex-wrap items-start sm:items-center gap-3 md:gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select
              value={userType}
              onValueChange={(value) =>
                setUserType(value as "Freelancer" | "Customer")
              }
            >
              <SelectTrigger className="w-full sm:w-[140px] h-10 border-[#B4B9C9]">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="Customer">user</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#149A9B] hover:bg-[#108080] text-white h-10 px-4 w-full sm:w-auto">
              View {userType.toLowerCase()}
            </Button>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-[240px]">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B4B9C9]"
              size={16}
            />
            <Input
              placeholder="Search by customer name"
              className="pl-9 h-10 border-[#B4B9C9] focus-visible:ring-offset-0 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end mt-3 md:mt-0">
          {/* Date filter */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-3 border-[#B4B9C9] text-[#6D758F] hover:bg-gray-50 gap-2 w-full sm:w-auto"
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
              className="h-10 px-4 border-[#B4B9C9] text-[#6D758F] hover:bg-gray-50 w-full sm:w-auto"
            >
              Filter
            </Button>
          </div>

          {/* Export button */}
          <Button
            className="h-10 px-4 bg-[#002333] hover:bg-[#001a26] text-white rounded-full w-full sm:w-auto"
            onClick={handleExport}
          >
            Export Report
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-[#F9FAFB] rounded-t-2xl">
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Email address</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Date joined</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="text-blue-500">Validated</span>
                    <CircleCheck className="ml-1 h-4 w-4 text-white fill-[#52C41A]" />
                  </div>
                </TableCell>
                <TableCell>{user.location}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="text-blue-500">{user.userId}</span>
                    <Copy className="ml-1 h-4 w-4 text-gray-400" />
                  </div>
                </TableCell>
                <TableCell>{user.dateJoined}</TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="text-blue-500 p-0"
                    onClick={() => handleViewProfile(user.id)}
                  >
                    View profile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
