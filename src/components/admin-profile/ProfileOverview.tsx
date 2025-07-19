import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaUserEdit, FaLock } from "react-icons/fa";

interface ProfileOverviewProps {
  admin: {
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  onEditProfile: () => void;
  onSecurity: () => void;
}

export default function ProfileOverview({
  admin,
  onEditProfile,
  onSecurity,
}: ProfileOverviewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full pt-16">
      <Image
        src={admin.avatar}
        alt="Admin Avatar"
        width={120}
        height={120}
        className="rounded-full border-4 border-white shadow-md"
      />
      <h2 className="mt-6 text-2xl font-semibold text-gray-900">
        {admin.firstName} {admin.lastName.charAt(0)}.
      </h2>
      <p className="text-gray-500 mb-8">{admin.email}</p>
      <Card className="w-full max-w-md p-0 flex flex-col gap-0 rounded-xl border border-gray-200 shadow-sm">
        <button
          className="flex items-center gap-3 px-6 py-5 text-gray-800 hover:bg-gray-50 border-b border-gray-200 text-base font-medium rounded-t-xl focus:outline-none"
          onClick={onEditProfile}
        >
          <FaUserEdit className="h-5 w-5" /> Edit profile information
        </button>
        <button
          className="flex items-center gap-3 px-6 py-5 text-gray-800 hover:bg-gray-50 text-base font-medium rounded-b-xl focus:outline-none"
          onClick={onSecurity}
        >
          <FaLock className="h-5 w-5" /> Security
        </button>
      </Card>
    </div>
  );
}
