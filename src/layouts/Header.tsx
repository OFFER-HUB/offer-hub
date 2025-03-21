import Image from "next/image";

export default function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-base font-bold text-gray-900 flex items-center">
            <div className="w-7 h-7  rounded-full mr-2 flex items-center justify-center overflow-hidden">
              <Image
                src="/oh-logo.png"
                alt="OH Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            OFFER HUB
          </div>
        </div>
        <a
          href="#"
          className="flex items-center text-sm text-gray-700 hover:text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Home
        </a>
      </div>
    </header>
  );
}
