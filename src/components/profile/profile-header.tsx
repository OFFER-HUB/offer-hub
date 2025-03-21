import Image from "next/image";

export default function ProfileHeader() {
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="relative mb-3">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <Image
            src="/placeholder.svg?height=80&width=80"
            alt="Profile picture"
            width={80}
            height={80}
            className="object-cover"
          />
        </div>
        <button className="absolute bottom-0 right-0 bg-teal-500 text-white p-1 rounded-full h-6 w-6 flex items-center justify-center">
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
        Carlos Rodriguez
      </h2>
      <p className="text-sm text-gray-600 mb-0.5">Client</p>
      <p className="text-xs text-gray-500">Member since January 2023</p>
    </div>
  );
}
