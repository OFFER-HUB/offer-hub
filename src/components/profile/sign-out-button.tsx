export default function SignOutButton() {
  return (
    <button className="w-full flex items-center justify-center h-9 px-3 py-1.5 border border-red-500 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 mr-1.5 rotate-180 text-red-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      <p className="text-red-500">Sign Out</p>
    </button>
  );
}
