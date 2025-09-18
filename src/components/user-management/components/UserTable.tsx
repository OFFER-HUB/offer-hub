import { Check, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/interfaces/user.interface";

type UserTableProps = {
  filteredData: User[];
  handleViewFile: (userId: number) => void;
  handleNotify: (user: User) => void;
  handleOverflowAction: (action: string, userId: number) => void;
};

export function UserTable({
  filteredData,
  handleViewFile,
  handleNotify,
  handleOverflowAction,
}: UserTableProps) {
  return (
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
                        ? "border border-[#B7EB8F] rounded-sm bg-[#F6FFED] text-[#52C41A]"
                        : user.status === "Rejected"
                        ? "border border-[#FFA39E] rounded-sm bg-[#FFF1F0] text-[#FF4D4F]"
                        : "border border-[#FFC000] rounded-sm bg-[#FFF7E6] text-[#FA8C16]"
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
                          onClick={() => handleOverflowAction("view", user.id)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleOverflowAction("modify", user.id)
                          }
                        >
                          Modify User
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
  );
}
