import { User } from "@/types/user.types";

interface ProfileHeaderProps {
  user: User | null;
  isLoading?: boolean;
}

export default function ProfileHeader({ user, isLoading }: ProfileHeaderProps) {
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center mb-4 animate-pulse">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-gray-200"></div>
          <div className="absolute bottom-0 right-0 bg-gray-300 rounded-full h-6 w-6"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mb-4">
      <div className="relative mb-3">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(user?.name || user?.username)}
          </div>
        </div>
        <button className="absolute bottom-0 right-0 bg-teal-500 text-white p-1 rounded-full h-6 w-6 flex items-center justify-center hover:bg-teal-600 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>
      </div>
      <h2 className="text-base font-semibold text-gray-800">
        {user?.name || user?.username || "Unknown User"}
      </h2>
      <p className="text-sm text-gray-600 mb-0.5">
        {user?.is_freelancer ? "Freelancer" : "Client"}
      </p>
      <p className="text-xs text-gray-500">
        Member since {formatDate(user?.created_at)}
      </p>
    </div>
  );
}
