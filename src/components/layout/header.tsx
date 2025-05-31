"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center">
            <Image
              src="/oh-logo.png"
              alt="Offer Hub Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <span className="text-[#002333] font-bold text-xl">OFFER HUB</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-[#002333] font-medium bg-[#15949C]/10 px-4 py-2 rounded-md"
            >
              Home
            </Link>
            <Link
              href="/find-workers"
              className="text-[#002333] hover:text-[#15949C] transition-colors"
            >
              Find workers
            </Link>
            <Link href="/messages" className="text-gray-700 hover:text-gray-900">
                My Chats
              </Link>
            <Link
              href="/my-account"
              className="text-[#002333] hover:text-[#15949C] transition-colors"
            >
              My Account
            </Link>
            <Link
              href="/faq"
              className="text-[#002333] hover:text-[#15949C] transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/help"
              className="text-[#002333] hover:text-[#15949C] transition-colors"
            >
              Help
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/test-404"></Link>
        </div>
      </div>
    </header>
  );
}
