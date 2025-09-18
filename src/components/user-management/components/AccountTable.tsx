import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { User } from "@/interfaces/user.interface";
import { CircleCheck, Copy, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserTableProps {
  users: User[];
  onViewProfile: (id: number) => void;
}

export function AccountTable({ users, onViewProfile }: UserTableProps) {
  return (
    <Table>
      <TableHeader className="bg-[#F9FAFB] rounded-t-2xl">
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>User Type</TableHead>
          <TableHead>Wallet Address</TableHead>
          <TableHead>Date joined</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-white">
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
            <TableCell>
              <div className="flex items-center">
                {user.email ? (
                  <>
                    <span className="text-blue-500">{user.email}</span>
                    <CircleCheck className="ml-1 h-4 w-4 text-white fill-[#52C41A]" />
                  </>
                ) : (
                  <span className="text-gray-400">No email</span>
                )}
              </div>
            </TableCell>
            <TableCell className="font-mono text-sm">
              @{user.name?.toLowerCase().replace(/\s+/g, "") || "username"}
            </TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === "Freelancer"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user.role}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Wallet className="mr-1 h-4 w-4 text-gray-400" />
                <span className="text-gray-600 font-mono text-xs">
                  {user.id
                    ? `${user.id.toString().substring(0, 6)}...${user.id
                        .toString()
                        .substring(-4)}`
                    : "N/A"}
                </span>
                <Copy className="ml-1 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </TableCell>
            <TableCell>{user.submissionDate || "N/A"}</TableCell>
            <TableCell>
              <Button
                className="text-blue-500 shadow-none p-0"
                onClick={() => onViewProfile(user.id)}
              >
                View profile
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
