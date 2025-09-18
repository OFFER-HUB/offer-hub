import { Check, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/interfaces/user.interface";

type UserCardsProps = {
  filteredData: User[];
  handleViewFile: (userId: number) => void;
  handleNotify: (user: User) => void;
  handleOverflowAction: (action: string, userId: number) => void;
};

export function UserCards({
  filteredData,
  handleViewFile,
  handleNotify,
  handleOverflowAction,
}: UserCardsProps) {
  return (
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
                  : user.status === "Rejected"
                  ? "border border-[#FFA39E] bg-[#FFF1F0] text-[#FF4D4F]"
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
                  onClick={() => handleOverflowAction("modify", user.id)}
                >
                  Modify User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
