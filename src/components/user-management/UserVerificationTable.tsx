"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  MoreHorizontal,
  Search,
  Calendar as CalendarIcon,
} from "lucide-react";
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
import NotificationModal from "./notify";

interface User {
  id: number;
  name: string;
  email: string;
  emailValidated: boolean;
  identityCard: string;
  status: "Pending" | "Approved";
  submissionDate: string;
}

export default function UserVerificationTable() {
  const [userType, setUserType] = useState<"Freelancer" | "Customer">(
    "Freelancer"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock data based on the image
  const mockData = [
    {
      id: 1,
      name: "Darlene Robertson",
      email: "darlene@example.com",
      emailValidated: true,
      identityCard: "id_card_1.pdf",
      status: "Pending",
      submissionDate: "2016-03-04",
    },
    {
      id: 2,
      name: "Guy Hawkins",
      email: "guy@example.com",
      emailValidated: true,
      identityCard: "id_card_2.pdf",
      status: "Approved",
      submissionDate: "2019-07-11",
    },
    {
      id: 3,
      name: "Esther Howard",
      email: "esther@example.com",
      emailValidated: true,
      identityCard: "id_card_3.pdf",
      status: "Pending",
      submissionDate: "2012-10-28",
    },
    {
      id: 4,
      name: "Wade Warren",
      email: "wade@example.com",
      emailValidated: true,
      identityCard: "id_card_4.pdf",
      status: "Approved",
      submissionDate: "2012-05-19",
    },
    {
      id: 5,
      name: "Devon Lane",
      email: "devon@example.com",
      emailValidated: true,
      identityCard: "id_card_5.pdf",
      status: "Pending",
      submissionDate: "2012-04-21",
    },
    {
      id: 6,
      name: "Kathryn Murphy",
      email: "kathryn@example.com",
      emailValidated: true,
      identityCard: "id_card_6.pdf",
      status: "Approved",
      submissionDate: "2015-05-27",
    },
    {
      id: 7,
      name: "Cameron Williamson",
      email: "cameron@example.com",
      emailValidated: true,
      identityCard: "id_card_7.pdf",
      status: "Approved",
      submissionDate: "2012-02-11",
    },
    {
      id: 8,
      name: "Floyd Miles",
      email: "floyd@example.com",
      emailValidated: true,
      identityCard: "id_card_8.pdf",
      status: "Pending",
      submissionDate: "2014-08-30",
    },
    {
      id: 9,
      name: "Ronald Richards",
      email: "ronald@example.com",
      emailValidated: true,
      identityCard: "id_card_9.pdf",
      status: "Pending",
      submissionDate: "2014-06-19",
    },
    {
      id: 10,
      name: "Annette Black",
      email: "annette@example.com",
      emailValidated: true,
      identityCard: "id_card_10.pdf",
      status: "Pending",
      submissionDate: "2017-07-18",
    },
    {
      id: 11,
      name: "Dianne Russell",
      email: "dianne@example.com",
      emailValidated: true,
      identityCard: "id_card_11.pdf",
      status: "Pending",
      submissionDate: "2016-11-07",
    },
    {
      id: 12,
      name: "Theresa Webb",
      email: "theresa@example.com",
      emailValidated: true,
      identityCard: "id_card_12.pdf",
      status: "Pending",
      submissionDate: "2015-05-27",
    },
  ];

  const filteredData = mockData.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    console.log("Exporting report...");
    // Stub for export functionality
    alert("Report export initiated. This feature is currently stubbed.");
  };

  const handleViewFile = (userId: number) => {
    console.log(`Viewing file for user ID: ${userId}`);
  };

  const handleNotify = (user: any) => {
    console.log(`Notifying user ID: ${user.id}`);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleOverflowAction = (action: string, userId: number) => {
    console.log(`Action ${action} for user ID: ${userId}`);
  };

  return (
    <div className="space-y-4 md:space-y-6 mb-3">
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

      {/* Table view (hidden on mobile) */}
      <div className="hidden md:block rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#F9FAFB]">
              <tr className="border-b border-[#f9fbfa] bg-[#F9FAFB] mb-2 p-3">
                <th className="text-left py-3 px-4 font-medium text-black text-sm">
                  Customer Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-black text-sm">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-black text-sm">
                  Identity Card
                </th>
                <th className="text-left py-3 px-4 font-medium text-black text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-black text-sm">
                  Submission
                </th>
                <th className="text-left py-3 px-4 font-medium text-black text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#fffefe]">
              {filteredData.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{user.name}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-blue-600 flex items-center gap-1">
                        Validated
                        <span className="bg-[#52C41A] rounded-full text-white">
                          <Check size={12} className="text-white" />
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <button
                      className="text-blue-600 hover:underline flex items-center"
                      onClick={() => handleViewFile(user.id)}
                    >
                      <span>View file</span>
                      <span className="ml-1 border-[#e4e4e5] border-2 rounded-full">
                        <Check size={12} className="text-[#e4e4e5]" />
                      </span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 text-xs ${
                        user.status === "Approved"
                          ? "border border-[#B7EB8F] bg-[#F6FFED] text-[#52C41A]"
                          : "border border-[#FFC000] bg-[#FFF7E6] text-[#FA8C16]"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap">
                    {new Date(user.submissionDate).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-4">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleNotify(user)}
                      >
                        Notify
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="focus:outline-none">
                            <MoreHorizontal size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              handleOverflowAction("view", user.id)
                            }
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleOverflowAction("approve", user.id)
                            }
                          >
                            Approve User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleOverflowAction("reject", user.id)
                            }
                          >
                            Reject User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card view (visible only on mobile) */}
      <div className="md:hidden space-y-4">
        {filteredData.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow p-4 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium">{user.name}</h3>
              <span
                className={`px-2 py-1 text-xs ${
                  user.status === "Approved"
                    ? "border border-[#B7EB8F] bg-[#F6FFED] text-[#52C41A]"
                    : "border border-[#FFC000] bg-[#FFF7E6] text-[#FA8C16]"
                }`}
              >
                {user.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <div className="flex items-center gap-1">
                  <span className="text-blue-600 flex items-center gap-1">
                    Validated
                    <span className="bg-[#52C41A] rounded-full text-white">
                      <Check size={12} className="text-white" />
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Identity Card:</span>
                <button
                  className="text-blue-600 hover:underline flex items-center"
                  onClick={() => handleViewFile(user.id)}
                >
                  <span>View file</span>
                  <span className="ml-1 border-[#e4e4e5] border-2 rounded-full">
                    <Check size={12} className="text-[#e4e4e5]" />
                  </span>
                </button>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Submission:</span>
                <span>
                  {new Date(user.submissionDate).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={() => handleNotify(user)}
              >
                Notify
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <MoreHorizontal size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleOverflowAction("view", user.id)}
                  >
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleOverflowAction("approve", user.id)}
                  >
                    Approve User
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleOverflowAction("reject", user.id)}
                  >
                    Reject User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
