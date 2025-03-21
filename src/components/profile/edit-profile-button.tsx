export default function EditProfileButton() {
  return (
    <button className="inline-flex items-center justify-center h-9 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-md transition-colors">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 mr-1.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
      Edit Profile
    </button>
  );
}
